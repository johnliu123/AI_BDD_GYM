# 研究：點餐系統第五迭代－付款與取消訂單

- **來源規格**：[spec.md](./spec.md)

## 決策摘要

### 延續既有堆疊與訂單持久化

- **決策**（**Decision**）：延續 React + Vite 前端、Node.js + Express REST JSON、Microsoft SQL Server（`mssql`）、既有 `orders`／明細表與 `orderRepository`／`orderService`。本迭代**擴充** `orders.payment_status` 與相關時間戳、出餐狀態新增 `cancelled`；新增 **`payment_idempotency_keys`** 表；新增顧客 **`POST /api/orders/{order_number}/pay`** 與 **`POST /api/orders/{order_number}/cancel`**；擴充店家列表／詳情與顧客 `getOrder` 的付款欄位。
- **理由**（**Rationale**）：spec 假設第一至四迭代已落地；FR-015 要求出餐與付款正交且單一持久化來源；BR-001 要求金額仍僅來自建立快照。
- **考慮過的替代方案**（**Alternatives considered**）：獨立 `payments` 表可支援多次部分付款，但 spec 排除分次付款；外部金流 webhook 非同步回調增加本迭代複雜度且 spec 採模擬金流。
- **失敗處理**（**Failure handling**）：DB 交易失敗回 500；非法狀態轉換回 409；授權失敗回 403／404（維持 003 語意）。

### 模擬金流（stub）

- **決策**（**Decision**）：不整合真實金流閘道。以 **`paymentStub.js`** 在伺服器程序內同步決定成功／失敗：預設成功；可經環境變數 **`PAYMENT_SIMULATE_OUTCOME=success|failure`** 覆寫；在 **`NODE_ENV !== 'production'`** 且 **`ALLOW_PAYMENT_SIMULATE_BODY=true`** 時，允許 `PayOrderRequest.simulate_outcome`（`success`／`failure`）供測試與 demo，production 忽略該欄位。
- **理由**（**Rationale**）：對齊 spec 假設「伺服器可控的模擬／stub」；滿足 SC-002 失敗情境與 SC-001 成功情境；無 PCI 範圍。
- **考慮過的替代方案**（**Alternatives considered**）：Stripe test mode 需 API key 與 webhook，超出 spec 邊界；永遠成功無法驗收失敗重試。
- **失敗處理**（**Failure handling**）：stub 回 failure 時設 `payment_status=failed`、`payment_failure_reason` 為固定對外摘要（如「模擬付款失敗」），不暴露 env 細節。

### 付款狀態機與並發

- **決策**（**Decision**）：持久化 **`payment_status`**：`unpaid` → `pending` → `paid` 或 `failed`；取消已付款訂單時 **`paid` → `refunded`**（同一 DB 交易內與 `status=cancelled`）。轉換以條件 **`UPDATE … WHERE payment_status IN (…)`** 與 **`status <> 'cancelled'`** 實作；`rowCount === 0` 時回 **409**（`ORDER_ALREADY_PAID`、`PAYMENT_IN_PROGRESS`、`ORDER_CANCELLED` 等依當下狀態選 code）。**`payment_status_updated_at`**、**`paid_at`**、**`payment_failed_at`**、**`cancelled_at`**、**`refunded_at`** 依轉換寫入。
- **理由**（**Rationale**）：FR-002、FR-004、FR-015、spec 邊界並發；與第四迭代出餐條件 UPDATE 模式一致。來源：[UPDATE (Transact-SQL)](https://learn.microsoft.com/en-us/sql/t-sql/queries/update-transact-sql)。
- **考慮過的替代方案**（**Alternatives considered**）：非同步 pending 需輪詢端點，spec 驗收情境假設同一請求可觀察 `pending`→`paid`／`failed`。
- **失敗處理**（**Failure handling**）：5xx 在寫入 `pending` 後、完成 stub 前：若交易 rollback 則可重試；若已 commit `pending` 而程序崩潰，允許同一 session 以新請求將 stuck `pending` 逾時復原（本迭代以 **POST pay 對 `pending` 逾過 120 秒** 視為可重入 stub，見 `paymentService`；未逾時回 **409** `PAYMENT_IN_PROGRESS`）。

### 付款冪等

- **決策**（**Decision**）：`POST pay` 支援 header **`Idempotency-Key`**（1–128 字元）。表 **`payment_idempotency_keys`**：PK `(guest_session_id, idempotency_key)`、`order_id`、`result_payment_status`（固定 **`paid`**）、`created_at`、`expires_at`（預設 **24h**，env **`IDEMPOTENCY_TTL_MS`** 可覆寫，對齊第三迭代建單）。**僅** HTTP **200** 且該次請求持久化為 **`paid`** 時寫入映射（**spec FR-012 澄清 Session 2026-10-14**）。**`failed`**、**4xx**、**5xx** 未決均不寫入；重送命中未過期映射時回 **200** 與相同 `OrderResponse`。
- **理由**（**Rationale**）：FR-012、SC-006、spec 假設 TTL 24h。
- **考慮過的替代方案**（**Alternatives considered**）：與建單共用 `order_idempotency_keys` 會混淆資源語意。
- **失敗處理**（**Failure handling**）：缺 key 時每次 pay 為獨立嘗試（仍受 `pending`／`paid` 狀態拒絕）。

### 顧客取消與 pending 競態

- **決策**（**Decision**）：**FR-013 定案**：僅 **`status = created`** 可取消。若 **`payment_status = pending`** 且 **未逾時**（`payment_status_updated_at` 距今未滿 **`PAYMENT_PENDING_STALE_SEC`**，預設 120s），**拒絕取消** **409** `PAYMENT_IN_PROGRESS`。若 **`pending` 已 stale**，允許取消：同一交易內先將付款標為 **`failed`**（中止卡住之 pending，寫入 `payment_failed_at`／可顯示原因），再 **`status → cancelled`**，**不得**留下 `pending` 與 `cancelled` 並存。若 **`paid`**，同一交易：`status → cancelled`、`payment_status → refunded`、寫入 `cancelled_at`／**`refunded_at`**。若 **`unpaid`／`failed`**，僅更新出餐狀態為 `cancelled`（付款欄位不變）。取消 **`POST`** 須 **CSRF + Origin**（同建單）。
- **理由**（**Rationale**）：與 pay 之 stale pending 重入對稱；非 stale 仍拒絕以免與 stub 競態；paid 同步模擬退款滿足 spec。
- **考慮過的替代方案**（**Alternatives considered**）：pending 一律拒絕取消會使 stuck pending 只能等 pay 重試；允許 accepted 取消違反 spec（僅 created）。
- **失敗處理**（**Failure handling**）：非 created → **409** `ORDER_NOT_CANCELLABLE`；已 cancelled → **409** `ORDER_CANCELLED`。

### 出餐狀態擴充 cancelled

- **決策**（**Decision**）：`OrderStatus` 新增 **`cancelled`**（中文「已取消」）。第四迭代 POST accept／start-preparing／complete 在 service 層若 `status === cancelled` 直接 **409** `ORDER_STATUS_CONFLICT`（FR-019）。合法出餐序列不變；`cancelled` 僅由顧客取消進入。
- **理由**（**Rationale**）：BR-003、US5 情境 3、spec 邊界。
- **考慮過的替代方案**（**Alternatives considered**）：獨立 `is_cancelled` 旗標與 spec「出餐狀態 cancelled」不一致。

### 顧客／店家 API 擴充

- **決策**（**Decision**）：`GET /api/orders/{order_number}` 與店家 list／detail 的 `Order`／`MerchantOrderSummary` 新增 **`payment_status`**、**`payment_status_label`**、可選 **`payment_failure_reason`**、**`paid_at`**、**`cancelled_at`**、可選 **`refunded_at`**（`payment_status=refunded` 時）。店家 **`GET /api/merchant/orders`** 新增 query **`payment_status`**（非法值 **400** `INVALID_PAYMENT_STATUS_FILTER`）。`PayOrderRequest`：`additionalProperties: false`；可選 `simulate_outcome`（僅非 production 政策）；**不得**含 `total` 欄位。`CancelOrderRequest`：空物件。
- **理由**（**Rationale**）：FR-016–FR-018、US4–US5；FR-010 忽略 body 金額。
- **考慮過的替代方案**（**Alternatives considered**）：獨立 GET payment 資源增加往返，spec 已要求查詢訂單含付款欄位。

### 前端

- **決策**（**Decision**）：擴充 **`orderApi.js`**（`payOrder`、`cancelOrder`）；**`OrderLookupPage`**／訂單成功區塊顯示付款狀態、失敗原因、「付款」「取消訂單」按鈕（依狀態 disabled）。**`MerchantOrdersPage`** 列表／詳情顯示付款欄位、付款狀態篩選；對 `cancelled` 隱藏接單／出餐按鈕。
- **理由**（**Rationale**）：ui-plan 流程；與 004 頁面擴充而非新 app。
- **考慮過的替代方案**（**Alternatives considered**）：獨立 Checkout 頁 spec 未要求，查詢頁即可驗收。

## 技術參考

- Microsoft, [UPDATE (Transact-SQL)](https://learn.microsoft.com/en-us/sql/t-sql/queries/update-transact-sql)
- 第三迭代：[research.md](../003-order-creation-inquiry/research.md)（冪等 TTL）
- 第四迭代：[research.md](../004-merchant-serving-workflow/research.md)（條件 UPDATE、merchant token）

## 已確認需求

- **US1–US2、FR-001–FR-006、FR-010–FR-012、SC-001–SC-002、SC-005–SC-006**：付款發起、失敗、冪等、快照金額。規格依據：[spec.md](./spec.md)。
- **US3、FR-007–FR-009、FR-013、SC-003–SC-004**：取消規則。規格依據：US3。
- **US4、FR-016、FR-015**：顧客查詢付款欄位。規格依據：US4。
- **US5、FR-017–FR-020、FR-019**：店家檢視與拒絕已取消訂單接單。規格依據：US5。

## 尚未決定與證據限制

- 正式環境若接入真實金流，須另開 spec 修訂 stub 與 `simulate_outcome` 政策。
- `pending` 逾時秒數（本迭代建議 **120**）可經 env `PAYMENT_PENDING_STALE_SEC` 調整，寫入 techstack 與 plan。
- 是否持久化完整付款事件歷史：本迭代 **不採用**（僅最後失敗原因欄位）。

<!-- Constitution self-check: pass -->
