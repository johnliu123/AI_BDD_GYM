# 任務：點餐系統第三迭代－訂單建立與查詢

**輸入**：設計文件位於 `specs/003-order-creation-inquiry/`

**Spec 套件索引**（按需 READ；執行到對應 Phase／小節再載入，勿一次讀完）：

| 文件 | 用途 |
|---|---|
| `spec.md` | 功能需求、User Story、驗收情境、商業規則與成功標準 |
| `research.md` | 訂單交易、快照、冪等、訂單編號與查詢授權 |
| `plan.md` | 專案結構、端點盤點、設計決策 |
| `techstack.md` | MSSQL 訂單表、API 端點、session 延續 |
| `ui-plan.md` · `prototype/` | 確認送單、成功頁、查詢流程 |
| `data-model.dbml` | orders、明細、冪等鍵 |
| `contracts/http-api.yaml` | `createOrder`、`getOrder` |

**組織方式**：階段 3 起依使用者故事分組；故事內以 **#### 前端／後端** 作為第二層。

## 階段 1：前置作業

**目的**：確認 002 購物車／session／計價能力可作為訂單建立基礎；核對本迭代契約與研究決策。

**執行本階段時讀取**：`research.md`、`techstack.md`、`plan.md`。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `spec.md` | 全域 FR-010、FR-011 | `spec:FR-010`; `spec:FR-011` | session 綁定與伺服器快照計價 |
| `research.md` | 延續既有前後端、訂單金額快照 | `research:延續既有前後端與訪客工作階段`; `research:訂單金額快照與查詢權威` | 重用 cart／money 路徑 |
| `techstack.md` | API 後端、資料庫 | `techstack:API 後端`; `techstack:資料庫` | MSSQL + Express 延續 |
| `plan.md` | 端點盤點、設計決策 | `plan:端點盤點`; `plan:設計決策·訂單編號` | 訂單 API 邊界 |
| `../002-shopping-cart-total-calculation/contracts/http-api.yaml` | cart CSRF bootstrap | `openapi:getCart`; `openapi:components.schemas.ErrorBody` | 寫入訂單沿用 CSRF |

- [x] T001 在 `backend/src/__tests__/orders/order-prerequisites.test.js` 驗證既有 guest session middleware、`cartService.readCart` 可用性判定與 `money.js` 可產生十進位字串；將 003 依賴 002 的證據摘要寫入 `techstack.md`（新小節「003 前置」）← `spec:FR-010`; `spec:FR-011`; `research:延續既有前後端與訪客工作階段`; `research:訂單金額快照與查詢權威`; `techstack:API 後端`; `techstack:資料庫`; `plan:端點盤點`; `plan:設計決策·訂單編號`; `openapi:getCart`; `openapi:components.schemas.ErrorBody`
- [x] T002 對照 `contracts/http-api.yaml` 與 `data-model.dbml`，確認 `order_number` 格式、錯誤碼 `CART_EMPTY`／`CART_HAS_UNAVAILABLE_ITEMS`／`ORDER_NOT_FOUND` 與 research 冪等 header 一致； discrepancies 修正契約或 dbml 並記錄於 `plan.md`「T002 契約對齊紀錄」← `openapi:createOrder`; `openapi:getOrder`; `openapi:components.schemas.Order`; `openapi:components.schemas.CreateOrderRequest`; `openapi:components.schemas.ErrorBody`; `dbml:Table orders`; `dbml:Table order_idempotency_keys`; `research:冪等鍵與避免重複送單`; `techstack:冪等`; `plan:設計決策·訂單編號`; `spec:US1·情境4`

**Checkpoint**：T001 通過後才開始訂單 migration 與 API；不得以假 cart 或前端金額建單。

---

## 階段 2：共用基礎

**目的**：訂單 schema、repository、service、路由骨架與前端 order client。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `data-model.dbml` | Project Note、`orders`、`order_items`、`order_item_options`、`order_idempotency_keys` | `dbml:Project`; `dbml:Table orders`; `dbml:Table order_items`; `dbml:Table order_item_options`; `dbml:Table order_idempotency_keys` | 交易邊界與 UNIQUE |
| `contracts/http-api.yaml` | `createOrder`、`getOrder`、`Order` schema | `openapi:createOrder`; `openapi:getOrder`; `openapi:components.schemas.OrderResponse`; `openapi:components.schemas.ErrorBody` | 201／200／404 語意 |
| `research.md` | 訂單建立交易、冪等、訂單編號 | `research:訂單建立交易與購物車清空`; `research:冪等鍵與避免重複送單`; `research:訂單編號產生` | 單交易建單＋清 cart |
| `techstack.md` | 資料庫、金額表示 | `techstack:資料庫`; `techstack:金額表示` | DECIMAL + 字串 API |

- [x] T003 新增 `backend/src/data/migrations/003_orders.mssql.sql` 及 memory-sql 對應表結構（`memoryDatabase.js`），涵蓋 orders、order_items、order_item_options、order_idempotency_keys ← `dbml:Project`; `dbml:Table orders`; `dbml:Table order_items`; `dbml:Table order_item_options`; `dbml:Table order_idempotency_keys`; `techstack:資料庫`
- [x] T004 在 `backend/src/repositories/orderRepository.js` 實作依 session 查詢、冪等鍵讀寫、交易內 insert 訂單與刪除 cart 項目 ← `dbml:Project`; `dbml:Table orders`; `dbml:Table order_idempotency_keys`; `research:訂單建立交易與購物車清空`
- [x] T005 在 `backend/src/services/orderService.js` 實作 `createOrderFromCart(sessionId, idempotencyKey)` 與 `getOrderForSession(sessionId, orderNumber)`：重用 cart 計價、快照名稱／規格、產生 `ORD-*` 編號、拒絕空車／不可用 cart ← `spec:FR-001`; `spec:FR-002`; `spec:FR-003`; `spec:FR-004`; `spec:FR-005`; `spec:FR-006`; `spec:FR-007`; `research:訂單金額快照與查詢權威`; `research:訂單編號產生`; `openapi:createOrder`; `techstack:金額表示`; `dbml:Project`
- [x] T006 在 `backend/src/routes/orders.js` 註冊 `POST /api/orders`、`GET /api/orders/:order_number`，共用 guest session、Origin、CSRF（POST）；於 `server.js` 掛載 ← `openapi:createOrder`; `openapi:getOrder`; `openapi:getCart`; `techstack:API 後端`; `openapi:components.schemas.ErrorBody`
- [x] T007 在 `frontend/src/orderApi.js` 實作 create／get mapping（含 `Idempotency-Key`、`X-CSRF-Token`、credentials）；於 `orderApi.test.js` 驗證 request 形狀 ← `openapi:createOrder`; `openapi:getOrder`; `openapi:components.schemas.OrderResponse`; `techstack:前端`
- [x] T008 在 `sessionMaintenance.js` 或同等 job 新增過期 `order_idempotency_keys` 清理（預設 24h，可 env 覆寫）← `dbml:Table order_idempotency_keys`; `techstack:冪等`; `research:冪等鍵與避免重複送單`

**Checkpoint**：T005–T006 完成後才執行 US1／US2 端對端測試。

---

## 階段 3：使用者故事 1－從購物車確認並建立訂單（P1）

**目標**：有效 session 由可用 cart 建單、冪等、拒絕不可用／空 cart、成功後 cart 空。

**端點**：前端 UI、訂單 API、MSSQL、session／CSRF。

### 使用者故事 1 測試

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節須對齊 |
|---|---|---|---|
| `spec.md` | US1 情境 1–6、FR-001–FR-007 | `spec:US1`; `spec:US1·情境1`; `spec:US1·情境2`; `spec:US1·情境4`; `spec:FR-001`; `spec:FR-006`; `spec:FR-007` | 成功、拒絕、冪等、清 cart |
| `ui-plan.md` | §畫面與流程 → 確認送單、拒絕不可用、訂單建立成功 | `ui-plan:§畫面與流程→確認送單`; `ui-plan:§畫面與流程→拒絕不可用購物車送單`; `ui-plan:§畫面與流程→訂單建立成功` | 按鈕與錯誤態 |
| `prototype/` | `index.html`、`assets/app.js` | `prototype:index.html`; `prototype:assets/app.js` | 雛形流程參照 |

- [x] T009 [US1] 在 `frontend/src/orderApi.test.js` 擴充或新建案例：建單 request 含 CSRF／可選 Idempotency-Key；body 為空物件且不含額外金額欄位 ← `spec:US1`; `spec:FR-007`; `spec:FR-011`; `openapi:createOrder`; `openapi:components.schemas.CreateOrderRequest`; `ui-plan:§畫面與流程→確認送單`

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節須對齊 |
|---|---|---|---|
| `spec.md` | US1 全情境、BR-001–BR-003、SC-001–SC-004、SC-006 | `spec:US1`; `spec:US1·情境5`; `spec:BR-001`; `spec:BR-002`; `spec:BR-003`; `spec:SC-001`; `spec:SC-002`; `spec:SC-003`; `spec:SC-004`; `spec:SC-006` | 快照、冪等、清 cart |
| `contracts/http-api.yaml` | `createOrder`、`Order`／`OrderResponse` | `openapi:createOrder`; `openapi:components.schemas.Order`; `openapi:components.schemas.OrderResponse`; `openapi:components.schemas.CreateOrderRequest` | 201 vs 200 冪等；空 body |
| `data-model.dbml` | orders、明細 | `dbml:Table orders`; `dbml:Table order_items` | 持久化快照 |

- [x] T010 [US1] 在 `backend/src/__tests__/orders/create-order.test.js` 驗證：多項可用 cart → 201 與 `Order`／`OrderResponse` 符合契約（唯一 order_number、快照明細與總額）、cart 清空；不可用項目 → 409 `CART_HAS_UNAVAILABLE_ITEMS`；空車 → 400 `CART_EMPTY`；含額外 body 欄位（違反 `CreateOrderRequest`）→ **400 拒絕**，不得採信金額；相同 Idempotency-Key 重送 → 200 且僅一筆 order 列；5xx 未建單後同 key 可再建單 ← `spec:US1·情境1`; `spec:US1·情境2`; `spec:US1·情境3`; `spec:US1·情境4`; `spec:US1·情境5`; `spec:US1·情境6`; `spec:FR-001`; `spec:FR-004`; `spec:FR-005`; `spec:FR-006`; `spec:FR-007`; `spec:BR-001`; `spec:BR-002`; `spec:BR-003`; `spec:SC-001`; `spec:SC-002`; `spec:SC-003`; `spec:SC-004`; `spec:SC-006`; `openapi:createOrder`; `openapi:components.schemas.Order`; `openapi:components.schemas.OrderResponse`; `openapi:components.schemas.CreateOrderRequest`; `openapi:components.schemas.ErrorBody`; `dbml:Table orders`; `dbml:Table order_items`

### 使用者故事 1 實作

#### 前端

- [x] T011 [US1] 在 `CartPage.jsx`（或 `CheckoutPage.jsx`）加入「確認送單」：先 `GET /api/cart` 確保 CSRF，呼叫 `orderApi.createOrder`（空 body）；成功導向訂單結果並顯示 `order_number`、狀態「已建立」、API 回傳快照金額；不可用或空 cart 顯示後端錯誤 ← `spec:US1`; `spec:FR-002`; `spec:FR-003`; `ui-plan:§畫面與流程→確認送單`; `ui-plan:§畫面與流程→拒絕不可用購物車送單`; `ui-plan:§畫面與流程→訂單建立成功`; `prototype:index.html`; `prototype:assets/app.js`; `openapi:createOrder`; `openapi:getCart`; `openapi:components.schemas.OrderResponse`

#### 後端

- [x] T012 [US1] 完成路由與 T005 `orderService` 的 **wiring**（不重複 T005 業務邏輯）：確認建單交易與 `cartRepository` 刪除在同一 transaction；補齊 `clientError` 映射 `CART_EMPTY`、`CART_HAS_UNAVAILABLE_ITEMS`；非法 body 回 400（`additionalProperties: false`）；僅 201/200 寫入冪等 ← `research:訂單建立交易與購物車清空`; `openapi:createOrder`; `openapi:components.schemas.CreateOrderRequest`; `openapi:components.schemas.ErrorBody`; `dbml:Project`

**Checkpoint US1**：T010、T011 通過；建單後 `GET /api/cart` 為空車。

---

## 階段 4：使用者故事 2－查詢訂單狀態與明細（P1）

**目標**：同 session 以編號查詢；快照不受菜單漲價影響；跨 session 404。

### 使用者故事 2 測試

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節須對齊 |
|---|---|---|---|
| `spec.md` | US2 情境 1–4、FR-008、FR-009、SC-005 | `spec:US2`; `spec:US2·情境1`; `spec:US2·情境2`; `spec:US2·情境3`; `spec:US2·情境4`; `spec:FR-008`; `spec:FR-009`; `spec:SC-005` | 快照查詢、404 |
| `research.md` | 訂單查詢授權 | `research:訂單查詢授權` | session 雙條件 |
| `openapi` | `getOrder` | `openapi:getOrder` | ORDER_NOT_FOUND |

- [x] T013 [US2] 在 `backend/src/__tests__/orders/get-order.test.js` 驗證：建單後同 session GET 200 且回傳狀態、明細與快照金額（FR-009）；修改 menu 價格後 GET 仍為快照；不同 session 或不存在編號 GET 404 `ORDER_NOT_FOUND`（FR-008）← `spec:US2·情境1`; `spec:US2·情境2`; `spec:US2·情境3`; `spec:US2·情境4`; `spec:FR-008`; `spec:FR-009`; `spec:FR-010`; `spec:FR-011`; `spec:SC-005`; `research:訂單查詢授權`; `openapi:getOrder`; `openapi:components.schemas.Order`; `openapi:components.schemas.OrderResponse`; `openapi:components.schemas.ErrorBody`

#### 前端

- [x] T014 [US2] 在 `orderApi.test.js` 驗證 getOrder path mapping 與 404 處理 ← `openapi:getOrder`; `ui-plan:§畫面與流程→查詢訂單狀態`

### 使用者故事 2 實作

#### 前端

- [x] T015 [US2] 新增 `OrderLookupPage.jsx`（或 cart 成功頁內嵌查詢）：輸入 order_number 呼叫 `getOrder`；呈現 status_label、明細與快照金額；404 顯示查無 ← `spec:US2`; `spec:FR-008`; `spec:FR-009`; `ui-plan:§畫面與流程→查詢訂單狀態`; `ui-plan:§畫面與流程→查無訂單`; `prototype:index.html`; `openapi:getOrder`; `openapi:components.schemas.OrderResponse`

#### 後端

- [x] T016 [US2] 確認 `getOrderForSession` 不回傳其他 session 資料；回應欄位對齊 `Order` schema，滿足 FR-009 快照欄位 ← `spec:FR-008`; `spec:FR-009`; `openapi:getOrder`; `openapi:components.schemas.Order`; `openapi:components.schemas.OrderResponse`; `research:訂單查詢授權`

---

## 階段 5：整合與驗收

**必讀對照**

| 文件 | 必讀部位 | 機器錨點 | 本節須對齊 |
|---|---|---|---|
| `spec.md` | SC-001–SC-006、US1、US2 獨立測試 | `spec:SC-001`; `spec:SC-002`; `spec:SC-003`; `spec:SC-004`; `spec:SC-005`; `spec:SC-006`; `spec:US1`; `spec:US2` | 端到端 |
| `ui-plan.md` | §驗證、狀態與邊界 | `ui-plan:§驗證`; `ui-plan:§畫面與流程→狀態與邊界（雛形須可見）` | 瀏覽器走查 |

- [x] T017 執行 backend／frontend `npm test`；瀏覽器走查：加 cart → 送單 → 查詢 → 切 session 查無；記錄結果 ← `spec:SC-001`; `spec:SC-002`; `spec:SC-003`; `spec:SC-004`; `spec:SC-005`; `spec:SC-006`; `ui-plan:§驗證`; `ui-plan:§畫面與流程→狀態與邊界（雛形須可見）`; `prototype:assets/app.js`

---

## Format Validation

- [x] 每 User Story 含前端／後端 Tests 與 Implementation 小節
- [x] 每小節必讀對照表列均有任務 `←` 引用（2026-10-13 複驗後補錨點）
- [x] 後端 API 任務引用 `openapi:createOrder`／`getOrder`；持久化任務引用 `dbml:Table orders` 等
- [x] 未新增 spec 外 FR／NFR

## 依賴與執行順序

- 階段 1 → 2 → 3 → 4 → 5；階段 3 與 4 後端測試可並行開發但須 T005 完成。
- US2 前端依 US1 建單流程可取得 order_number。

<!-- Constitution self-check: pass -->
