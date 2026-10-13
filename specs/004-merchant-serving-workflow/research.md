# 研究：點餐系統第四迭代－店家管理與出餐流程

- **來源規格**：[spec.md](./spec.md)

## 決策摘要

### 延續既有堆疊與訂單持久化

- **決策**（**Decision**）：延續第三迭代 React + Vite 前端、Node.js + Express REST JSON、Microsoft SQL Server（`mssql`）、既有 `orders`／`order_items`／`order_item_options` 表與 `orderService`／`orderRepository` 讀取快照邏輯。本迭代**擴充**訂單 `status` 狀態機與 `status_updated_at`，新增店家專用 REST 路由群組（`/api/merchant/orders`），不新增微服務。
- **理由**（**Rationale**）：spec 假設第一至三迭代已落地；FR-011 要求顧客查詢與店家檢視同一持久化狀態；BR-001 要求明細與金額快照不可變。在同一程序內更新 `orders.status` 最簡且與既有 `getOrder` 一致。
- **考慮過的替代方案**（**Alternatives considered**）：獨立 `order_status_history` 事件表可支援稽核，但 spec 未要求歷史軌跡，本迭代僅更新標頭狀態欄位；WebSocket 推播給顧客超出 spec 驗收（顧客以輪詢／重新查詢即可）。
- **失敗處理**（**Failure handling**）：資料庫更新失敗回 500，狀態不變；非法轉換回 409，不部分寫入。

### 店家憑證驗證

- **決策**（**Decision**）：店家 API 以 HTTP header **`X-Merchant-Token`** 驗證；伺服器以環境變數 **`MERCHANT_TOKEN`**（部署時設定）做常數時間比對。未附或不符回 **401**、`error.code` **`MERCHANT_UNAUTHORIZED`**。店家路由**不**使用訪客 `guest_session` cookie，亦**不**要求 CSRF（與顧客 cart／建單寫入分離；token 視同 bearer 秘密，僅管理介面持有）。
- **理由**（**Rationale**）：落實 FR-010 與 spec 澄清 Session 2026-10-14；本迭代無帳號系統，共享秘密符合單店 MVP。OWASP 建議伺服器端驗證授權。來源：[OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)。
- **考慮過的替代方案**（**Alternatives considered**）：JWT 登入、多角色 RBAC 超出本迭代；將店家操作綁定 guest session 違反 spec 邊界（顧客 session 不得接單）。
- **失敗處理**（**Failure handling**）：`MERCHANT_TOKEN` 未設定時店家 API 回 **503** `MERCHANT_NOT_CONFIGURED`（避免 silent open）。

### 訂單狀態機與並發安全

- **決策**（**Decision**）：持久化 `status` 列舉 **`created` → `accepted` → `preparing` → `completed`**；API 同時回傳中文 **`status_label`**（已建立／已接單／出餐中／已完成）。轉換以**明確 POST 動作**實作：`accept`（created→accepted）、`start-preparing`（accepted→preparing）、`complete`（preparing→completed）。每次成功更新寫入 **`status_updated_at`**（UTC）。更新 SQL 使用 **`WHERE order_number = @n AND status = @expected`**；`rowCount === 0` 時回 **409** `ORDER_STATUS_CONFLICT`（涵蓋非法轉換與並發競態，spec 邊界「以持久化當下狀態驗證」）。
- **理由**（**Rationale**）：對應 BR-002、FR-004–FR-009、FR-015、SC-002–SC-003；拒絕跳步與逆向；樂觀鎖避免雙擊接單。Microsoft SQL Server `UPDATE … WHERE` 語意支援條件更新。來源：[UPDATE (Transact-SQL)](https://learn.microsoft.com/en-us/sql/t-sql/queries/update-transact-sql)。
- **考慮過的替代方案**（**Alternatives considered**）：PATCH body 帶 `target_status` 易遭竄改任意狀態，違反 spec 假設；`accepted` 直接 `complete` 跳過 `preparing` 違反 BR-002。
- **失敗處理**（**Failure handling**）：不存在訂單回 **404** `ORDER_NOT_FOUND`（與查詢一致，不洩漏額外資訊）。

### 店家訂單列表與詳情

- **決策**（**Decision**）：`GET /api/merchant/orders` 回傳訂單摘要列表（`order_number`、`status`、`status_label`、`created_at`、`status_updated_at`、`total` 快照）；支援 query **`status`** 篩選（可選值同列舉）。預設依 **`created_at` DESC** 排序。`GET /api/merchant/orders/{order_number}` 回傳與顧客 `Order` 相同形狀之快照明細，外加 `status_updated_at`。
- **理由**（**Rationale**）：FR-001–FR-003、SC-001；列表不含完整明細以減輕廚房看板負載；詳情滿足 US1 情境 2。
- **考慮過的替代方案**（**Alternatives considered**）：僅詳情、無列表迫使店家逐編號查詢，不符 US1。
- **失敗處理**（**Failure handling**）：非法 `status` query 回 **400** `INVALID_STATUS_FILTER`。

### 顧客查詢同步

- **決策**（**Decision**）：沿用 `GET /api/orders/{order_number}`（第三迭代）；擴充 `Order.status` 列舉與 **`statusLabelFor(status)`** 映射；`orderRepository` 組裝回應時依持久化 `status` 回傳標籤，不再固定「已建立」。FR-014 不要求新端點。
- **理由**（**Rationale**）：FR-011、FR-014、SC-004；單一持久化來源。
- **考慮過的替代方案**（**Alternatives considered**）：顧客專用 SSE 超出 spec。
- **失敗處理**（**Failure handling**）：授權與 404 語意不變（FR-010）。

### 店家管理介面（前端）

- **決策**（**Decision**）：新增 **`MerchantOrdersPage.jsx`**（或 `/merchant` 路由）與 **`merchantOrderApi.js`**；開發環境以 **`VITE_MERCHANT_TOKEN`** 注入 header（`.env.local`，不提交 git）。列表＋詳情抽屜／面板；依狀態顯示「接單」「開始出餐」「完成訂單」按鈕。顧客 `OrderLookupPage` 查詢結果顯示動態 `status_label`（US4）。
- **理由**（**Rationale**）：對齊 ui-plan 流程；與 spec 邊界「不接 menu CRUD」一致。
- **考慮過的替代方案**（**Alternatives considered**）：僅 Postman 無 UI 無法驗收 SC-001 管理介面情境。
- **失敗處理**（**Failure handling**）：401 顯示「店家憑證無效」；409 提示重新整理列表。

## 技術參考

- Microsoft, [UPDATE (Transact-SQL)](https://learn.microsoft.com/en-us/sql/t-sql/queries/update-transact-sql)
- OWASP, [Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- 第三迭代：[research.md](../003-order-creation-inquiry/research.md)、[contracts/http-api.yaml](../003-order-creation-inquiry/contracts/http-api.yaml)

## 已確認需求

- **US1、FR-001–FR-003、FR-010–FR-012、SC-001、SC-005–SC-006**：店家列表／詳情、憑證、快照唯讀。規格依據：[spec.md](./spec.md)。
- **US2、FR-004–FR-006、SC-002**：接單。規格依據：US2。
- **US3、FR-007–FR-009、FR-015、SC-003**：出餐與完成、狀態機。規格依據：US3。
- **US4、FR-011、FR-014、SC-004**：顧客查詢同步。規格依據：US4。

## 尚未決定與證據限制

- 正式部署是否改為 OAuth／JWT 須另開 spec 修訂（本迭代已確認共享 token，見 spec 澄清 Session 2026-10-14）。
- 列表分頁（cursor／offset）spec 未要求；首版可回傳合理上限（如 200 筆）並在 API 契約註記，若資料量成長再澄清。
- 是否持久化 `order_status_events` 稽核表：本迭代 **不採用**。

<!-- Constitution self-check: pass -->
