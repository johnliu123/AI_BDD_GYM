# 研究：點餐系統第六迭代－進階功能與系統驗證

- **來源規格**：[spec.md](./spec.md)

## 決策摘要

### 菜單資料持久化（由 menuData 遷移至 MSSQL）

- **決策**（**Decision**）：新增 migration **`006_menu_catalog.mssql.sql`**，建立 **`categories`**、**`menu_items`**、**`menu_item_option_groups`**、**`menu_item_options`**（對齊第一迭代 [data-model.dbml](../001-food-browsing-categories/data-model.dbml)）。首次 migration 以現有 **`backend/src/data/menuData.js`** 種子寫入。`menuRepository` 改為讀寫 MSSQL；**`USE_MEMORY_DB=1`** 時由 **`memoryDatabase.js`** 模擬相同表與 CRUD SQL。顧客 **`GET /api/categories`**、**`GET /api/menu-items`** 行為不變，資料來源改為 DB。
- **理由**（**Rationale**）：spec FR-001–FR-006 要求店家持久化維護分類、餐點、價格與 `is_active`；現況菜單僅記憶體 JS，無法驗收 SC-001／SC-002。
- **考慮過的替代方案**（**Alternatives considered**）：繼續改寫 `menuData.js` 檔案 — 多實例部署不一致、無 transaction；獨立 CMS 超出 spec。
- **失敗處理**（**Failure handling**）：違反 FK／唯一約束回 **409**／**400**；migration 失敗阻止啟動（沿用 `ensureDatabaseReady`）。

### 分類刪除策略

- **決策**（**Decision**）：**`DELETE /api/merchant/categories/{id}`** 僅在該分類下 **零筆** `menu_items` 時允許；否則 **409** `CATEGORY_IN_USE`。不提供 cascade 刪除餐點。
- **理由**（**Rationale**）：spec FR-001 要求刪除策略在 API 固定；避免誤刪仍掛在菜單上的餐點。
- **考慮過的替代方案**（**Alternatives considered**）：軟刪除分類 — 增加顧客篩選複雜度，本迭代以硬刪＋引用檢查即可。
- **失敗處理**（**Failure handling**）：不存在 → **404** `CATEGORY_NOT_FOUND`。

### 售完／供應狀態 API

- **決策**（**Decision**）：提供 **`PATCH /api/merchant/menu-items/{id}/availability`**（body `{ "is_active": boolean }`）與 **`PATCH /api/merchant/menu-items/{id}/options/{option_id}/availability`**；亦允許 **`PATCH /api/merchant/menu-items/{id}`** 含 `is_active`（FR-006 等價）。停供後 cart／建單沿用 **`cartPricing.isItemAvailable`** 與 **`orderService.validateCartForOrder`**，新增錯誤碼 **`MENU_ITEM_UNAVAILABLE`**（加購物車 **409**）。
- **理由**（**Rationale**）：FR-004–FR-006、BR-001；第二、三迭代已有 availability 語意，本迭代補寫入端。
- **考慮過的替代方案**（**Alternatives considered**）：獨立 `sold_out` 旗標與 `is_active` 並存 — 與既有模型重複。
- **失敗處理**（**Failure handling**）：停供時加購 **409**；建單 **409** `CART_ITEM_UNAVAILABLE`（沿用第三迭代）。

### 店家 RBAC（設定層 token → roles）

- **決策**（**Decision**）：以環境變數 **`MERCHANT_CREDENTIALS`** 設定 JSON 陣列，元素 `{ "token": "<secret>", "roles": ["orders"|"menu"|"admin"] }`。若仍設定 legacy **`MERCHANT_TOKEN`**，視為額外一筆 **`roles: ["admin"]`**（向後相容第四、五迭代測試）。中介層 **`requireMerchantRole(...allowedRoles)`** 包裝既有 **`requireMerchantAuth`**：驗證 token 後檢查交集；不符 → **403** `MERCHANT_FORBIDDEN`。若 **無任何** 有效 token 設定 → **503** `MERCHANT_NOT_CONFIGURED`（與 004 一致）。**禁止** `X-Merchant-Role` 客戶端 header（FR-015）。
- **理由**（**Rationale**）：FR-009、FR-010、FR-014、spec 邊界「不實作帳號 UI」；JSON 陣列可測多角色且單行 env 易於 CI。
- **考慮過的替代方案**（**Alternatives considered**）：JWT＋登入 — spec 排除；`MERCHANT_MENU_TOKEN`／`MERCHANT_ORDERS_TOKEN` 雙變數 — 角色擴充時 env 爆炸。
- **失敗處理**（**Failure handling**）：缺 token **401**；錯 token **401**；token 有效但角色不足 **403**。

### 集中式 HTTP 例外處理

- **決策**（**Decision**）：新增 **`middleware/errorMiddleware.js`**（或拆分 **`notFoundHandler.js`**）：未知路由 **404** `{ error: { code: 'NOT_FOUND', message: '…' } }`；可預期業務錯誤以 **`throw Object.assign(new Error(msg), { status, code })`** 或 **`createHttpError(code, status)`** 統一；最終 handler 記錄 **`logServerError`** 並回 **500** `INTERNAL_ERROR`（無 stack body，**NFR-010**）。既有 route 內 **`res.status().json()`** 可漸進保留，新 merchant menu 路由優先 throw 模式。
- **理由**（**Rationale**）：FR-016–FR-017、SC-006；`server.js` 已有 500 handler，缺 404 JSON 與業務錯誤統一入口。
- **考慮過的替代方案**（**Alternatives considered**）：全專案一次重構所有 routes — 範圍過大，tasks 以新路由＋關鍵路徑為主。
- **失敗處理**（**Failure handling**）：`headersSent` 時 delegate `next(error)`（沿用 Express 慣例）。

### 整合測試與 smoke

- **決策**（**Decision**）：新增 **`backend/src/__tests__/integration/system-e2e.test.js`**（`USE_MEMORY_DB=1`）：涵蓋瀏覽菜單 → 加購 → 建單 → 查詢 → pay stub → merchant accept → complete；分支案例：冪等建單、body 竄改 `total_amount`、停供後建單失敗、RBAC **403**。另增 **`scripts/smoke-006-advanced.mjs`** 供本機一鍵 smoke。更新 **`verify-migrations.mjs`** 檢查 **006** DDL 錨點。
- **理由**（**Rationale**）：FR-018–FR-019、SC-003–SC-007、NFR-012；對齊 005 `smoke:005` 模式。
- **考慮過的替代方案**（**Alternatives considered**）：Playwright — spec 邊界不阻擋 HTTP 整合驗收。
- **失敗處理**（**Failure handling**）：整合測試失敗即 CI 失敗；不引入外部服務。

### 前端店家菜單管理

- **決策**（**Decision**）：新增 **`MerchantMenuPage.jsx`**（或 `MenuPage` 內 `#/merchant/menu` 子視圖）與 **`merchantMenuApi.js`**：分類／餐點表單、售完 toggle；顧客 **`MenuPage`**／**`MenuCard`** 對 `is_active === false` 顯示售完並禁用加購。Merchant token 解析沿用 **`resolveMerchantToken()`**；可選 localStorage 鍵區分 menu／orders token 僅供 dev demo（正式仍靠 env 注入之 admin token）。
- **理由**（**Rationale**）：SC-001、SC-002、ui-plan；與 004 店家看板同一 hash 導覽模式。
- **考慮過的替代方案**（**Alternatives considered**）：僅 API 無 UI — spec 假設允許 ui-plan 定案，仍交付最小管理 UI 以驗收售完操作。

## 技術參考

- Microsoft, [JSON data type (SQL Server)](https://learn.microsoft.com/en-us/sql/t-sql/data-types/json-data-type) — 本迭代 **不** 採 JSON 欄位存菜單，僅 env 解析用 Node `JSON.parse`
- Express, [Error handling](https://expressjs.com/en/guide/error-handling.html)
- 第一迭代：[data-model.dbml](../001-food-browsing-categories/data-model.dbml)（菜單表形狀）
- 第四迭代：[research.md](../004-merchant-serving-workflow/research.md)（`X-Merchant-Token`）

## 已確認需求

- **US1–US2、FR-001–FR-006、FR-010、SC-001–SC-002**：菜單 CRUD 與售完。規格依據：[spec.md](./spec.md)。
- **US3、FR-007–FR-008、FR-011–FR-013**：顧客供應護欄。規格依據：US3。
- **US4、FR-009、FR-014–FR-015、SC-004**：RBAC。規格依據：US4。
- **US5、FR-016–FR-017、NFR-010–NFR-011、SC-006**：例外處理。規格依據：US5。
- **US6、FR-018–FR-019、NFR-012、SC-003、SC-005、SC-007**：整合測試。規格依據：US6。

## 尚未決定與證據限制

- **`MERCHANT_CREDENTIALS` 最大筆數** — 建議 ≤20，實作時硬限制防 env 過大；非 spec 硬性要求。
- 餐點 **硬刪** — 本迭代 **不** 提供 DELETE menu-item（僅停供）；若未來需刪除另開 spec。
- 多店 tenant — spec 排除。

<!-- Constitution self-check: pass -->
