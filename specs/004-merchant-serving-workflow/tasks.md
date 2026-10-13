# 任務：點餐系統第四迭代－店家管理與出餐流程

**輸入**：設計文件位於 `specs/004-merchant-serving-workflow/`

**Spec 套件索引**（按需 READ；執行到對應 Phase／小節再載入，勿一次讀完）：

| 文件 | 用途 |
|---|---|
| `spec.md` | 功能需求、User Story、商業規則與成功標準 |
| `research.md` | 店家 token、狀態機、列表與並發 UPDATE |
| `plan.md` | 專案結構、端點盤點、設計決策 |
| `techstack.md` | Merchant API、migration、前端頁面 |
| `ui-plan.md` · `prototype/` | 店家看板與顧客查詢示意 |
| `data-model.dbml` | orders.status、status_updated_at |
| `contracts/http-api.yaml` | merchant 與 getOrder 擴充 |

**組織方式**：階段 3 起依使用者故事分組；故事內以 **#### 前端／後端** 作為第二層。

## 階段 1：前置作業

**目的**：確認第三迭代訂單讀取與快照組裝可作為 004 基礎；核對契約與 research。

**執行本階段時讀取**：`research.md`、`techstack.md`、`plan.md`。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `spec.md` | 假設、邊界狀態機、FR-010 | `spec:FR-010`; `spec:FR-011` | 003 訂單已存在 |
| `research.md` | 延續堆疊、狀態機 | `research:延續既有堆疊與訂單持久化`; `research:訂單狀態機與並發安全` | 擴充非重寫 |
| `techstack.md` | API 後端、資料庫 | `techstack:API 後端`; `techstack:資料庫` | migration 004 |
| `plan.md` | 端點盤點 | `plan:端點盤點`; `plan:設計決策·訂單狀態` | merchant 邊界 |
| `contracts/http-api.yaml` | getOrder 擴充、OrderStatus | `openapi:getOrder`; `openapi:components.schemas.Order`; `openapi:components.schemas.OrderStatus` | 004 契約為 implement 權威 |

- [x] T001 在 `backend/src/__tests__/orders/order-prerequisites.test.js` 或新建 `merchant-order-prerequisites.test.js` 確認既有 `orderRepository` 可讀取訂單標頭與明細；將 004 依賴 003 摘要寫入 `techstack.md`（新小節「004 前置」）← `research:延續既有堆疊與訂單持久化`; `techstack:API 後端`; `plan:端點盤點`; `openapi:getOrder`; `spec:FR-011`
- [x] T002 對照 `contracts/http-api.yaml` 與 `data-model.dbml`，確認 `OrderStatus` 四值、`status_updated_at`、錯誤碼一致；**同步更新** `../003-order-creation-inquiry/contracts/http-api.yaml` 之 `Order.status` enum 與 004 一致（004 契約為本迭代權威）； discrepancies 修正並記錄於 `plan.md`「T002 契約對齊紀錄」← `openapi:listMerchantOrders`; `openapi:getMerchantOrder`; `openapi:acceptMerchantOrder`; `openapi:startPreparingMerchantOrder`; `openapi:completeMerchantOrder`; `openapi:getOrder`; `openapi:components.schemas.OrderStatus`; `openapi:components.schemas.Order`; `dbml:Table orders`; `research:訂單狀態機與並發安全`; `spec:FR-010`

**Checkpoint**：T001 通過後才開始 migration 與 merchant 路由。

---

## 階段 2：共用基礎

**目的**：schema、status 映射、merchant 中介層、repository／service／路由骨架、前端 merchant client。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `data-model.dbml` | Project Note、`orders` | `dbml:Project`; `dbml:Table orders` | status 與 status_updated_at |
| `contracts/http-api.yaml` | MerchantOrders tag、ErrorBody | `openapi:components.schemas.ErrorBody`; `openapi:components.responses.MerchantUnauthorized` | 401／409 |
| `research.md` | 店家憑證、狀態機 | `research:店家憑證驗證`; `research:訂單狀態機與並發安全` | MERCHANT_TOKEN |
| `techstack.md` | 店家驗證、狀態機 | `techstack:店家驗證`; `techstack:狀態機` | header 名稱 |

- [x] T003 新增 `backend/src/data/migrations/004_order_status.mssql.sql`（`status_updated_at`；必要時 backfill `created` 訂單）並更新 `memoryDatabase.js` 支援條件 UPDATE ← `dbml:Table orders`; `dbml:Project`; `techstack:資料庫`
- [x] T004 新增 `backend/src/lib/orderStatus.js`：`ORDER_STATUSES`、`statusLabelFor(status)`、`assertTransition(from,to)` ← `plan:設計決策·訂單狀態`; `openapi:components.schemas.OrderStatus`; `spec:FR-011`
- [x] T005 新增 `backend/src/middleware/merchantAuth.js`：比對 `X-Merchant-Token` 與 `process.env.MERCHANT_TOKEN`；未設定 → 503 `MERCHANT_NOT_CONFIGURED` ← `research:店家憑證驗證`; `openapi:components.responses.MerchantUnauthorized`; `openapi:components.responses.MerchantNotConfigured`; `spec:FR-010`
- [x] T006 擴充 `orderRepository.js`：`listOrdersForMerchant({ status, limit })`、`transitionOrderStatus(orderNumber, expectedStatus, nextStatus)`（條件 UPDATE）、`loadOrderByOrderNumber` 回傳動態 `status_label` ← `dbml:Table orders`; `research:訂單狀態機與並發安全`; `research:店家訂單列表與詳情`
- [x] T007 新增 `merchantOrderService.js` 與 `routes/merchantOrders.js`：掛載 `GET/POST` 契約五端點；於 `server.js` 註冊 `/api/merchant/orders` ← `openapi:listMerchantOrders`; `openapi:getMerchantOrder`; `openapi:acceptMerchantOrder`; `openapi:startPreparingMerchantOrder`; `openapi:completeMerchantOrder`; `techstack:API 後端`
- [x] T008 更新 `orderRepository`／`getOrderForSession` 使用 `statusLabelFor`（修正硬編碼「已建立」）← `openapi:getOrder`; `spec:FR-014`; `research:顧客查詢同步`
- [x] T009 新增 `frontend/src/merchantOrderApi.js` 與 `merchantOrderApi.test.js`（header mapping、401 處理）← `openapi:listMerchantOrders`; `openapi:acceptMerchantOrder`; `techstack:前端（店家）`

**Checkpoint**：T006–T008 完成後才執行 US 端對端測試。

---

## 階段 3：使用者故事 1－店家檢視訂單佇列與明細（P1）

**目標**：有效 token 可列表／詳情；status 篩選；快照金額；無 token 401。

**端點**：店家前端 UI、Merchant Orders API、MSSQL。

### 使用者故事 1 測試

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節須對齊 |
|---|---|---|---|
| `spec.md` | US1 情境 1–4、SC-001 | `spec:US1`; `spec:US1·情境1`; `spec:US1·情境3`; `spec:US1·情境4`; `spec:SC-001`; `spec:FR-012` | 列表、401、快照 |
| `contracts/http-api.yaml` | list、get merchant、INVALID_STATUS_FILTER、503 | `openapi:listMerchantOrders`; `openapi:getMerchantOrder`; `openapi:components.schemas.MerchantOrderSummary`; `openapi:components.responses.MerchantNotConfigured` | 200 形狀 |

- [x] T010 [US1] 在 `backend/src/__tests__/orders/merchant-list-detail.test.js` 驗證：有 token 列表含 created 訂單、合法 `status` 篩選、非法 `status` query → **400** `INVALID_STATUS_FILTER`；詳情明細與 total 不變；list/get **無 token** → **401** `MERCHANT_UNAUTHORIZED`；**`MERCHANT_TOKEN` 未設定時 list → 503** `MERCHANT_NOT_CONFIGURED`；不存在 → **404** `ORDER_NOT_FOUND` ← `spec:US1·情境1`; `spec:US1·情境2`; `spec:US1·情境3`; `spec:US1·情境4`; `spec:FR-001`; `spec:FR-002`; `spec:FR-003`; `spec:FR-010`; `spec:FR-012`; `spec:SC-001`; `spec:SC-005`; `spec:SC-006`; `spec:BR-001`; `openapi:listMerchantOrders`; `openapi:getMerchantOrder`; `openapi:components.responses.MerchantUnauthorized`; `openapi:components.responses.MerchantNotConfigured`; `dbml:Table orders`; `dbml:Table order_items`

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節須對齊 |
|---|---|---|---|
| `ui-plan.md` | 看板、篩選、詳情 | `ui-plan:§畫面與流程→店家訂單看板`; `ui-plan:§畫面與流程→狀態篩選`; `ui-plan:§畫面與流程→訂單詳情與快照金額` | 列表 UI |
| `prototype/` | index、app.js | `prototype:index.html`; `prototype:assets/app.js` | 雛形參照 |

- [x] T011 [US1] 新增 `MerchantOrdersPage.jsx`：列表、status 篩選、詳情面板顯示快照明細；401 顯示憑證錯誤 ← `spec:US1`; `spec:FR-001`; `spec:FR-002`; `spec:FR-003`; `ui-plan:§畫面與流程→店家訂單看板`; `ui-plan:§畫面與流程→狀態篩選`; `ui-plan:§畫面與流程→訂單詳情與快照金額`; `ui-plan:§畫面與流程→店家憑證錯誤`; `prototype:index.html`; `openapi:listMerchantOrders`; `openapi:getMerchantOrder`

### 使用者故事 1 實作

#### 前端

- [x] T012 [US1] 在 `App.jsx`（或 `MenuPage`）加入進入店家看板入口（hash `#/merchant` 或等價）；`.env.example` 文件化 `VITE_MERCHANT_TOKEN` ← `techstack:前端（店家）`; `ui-plan:§實作`

**Checkpoint US1**：T010、T011 通過。

---

## 階段 4：使用者故事 2－店家接受訂單（P1）

**目標**：created→accepted；重複接單 409；body 含金額不影響持久化。

### 使用者故事 2 測試

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節須對齊 |
|---|---|---|---|
| `spec.md` | US2、FR-004–FR-006、FR-013 | `spec:US2`; `spec:US2·情境1`; `spec:US2·情境2`; `spec:US2·情境3`; `spec:US2·情境4`; `spec:FR-004`; `spec:FR-006`; `spec:FR-013`; `spec:SC-002` | 接單與拒絕 |

- [x] T013 [US2] 在 `backend/src/__tests__/orders/merchant-accept.test.js` 驗證：accept 成功；**POST accept 無 `X-Merchant-Token` → 401、狀態不變**（US2·情境3）；非 created → **409**；body 含金額欄位時 total／items 不變；重複 accept（並發／已 accepted）→ **409** `ORDER_STATUS_CONFLICT` ← `spec:US2·情境1`; `spec:US2·情境2`; `spec:US2·情境3`; `spec:US2·情境4`; `spec:FR-004`; `spec:FR-005`; `spec:FR-006`; `spec:FR-013`; `spec:SC-002`; `spec:SC-006`; `spec:BR-001`; `openapi:acceptMerchantOrder`; `openapi:components.responses.MerchantUnauthorized`; `openapi:components.responses.OrderStatusConflict`; `dbml:Table orders`

### 使用者故事 2 實作

#### 前端

- [x] T014 [US2] 在 `MerchantOrdersPage.jsx` 對 `created` 訂單顯示「接單」並呼叫 `acceptMerchantOrder`；409 toast 提示重新整理 ← `spec:US2`; `ui-plan:§畫面與流程→接單`; `openapi:acceptMerchantOrder`; `prototype:assets/app.js`

**Checkpoint US2**：T013、T014 通過。

---

## 階段 5：使用者故事 3－店家更新出餐狀態並完成訂單（P1）

**目標**：accepted→preparing→completed；跳步／逆向 409。

### 使用者故事 3 測試

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節須對齊 |
|---|---|---|---|
| `spec.md` | US3 全情境、SC-003 | `spec:US3`; `spec:US3·情境1`; `spec:US3·情境2`; `spec:US3·情境3`; `spec:US3·情境4`; `spec:US3·情境5`; `spec:FR-007`; `spec:FR-008`; `spec:FR-009`; `spec:FR-015`; `spec:SC-003` | 狀態機 |

- [x] T015 [US3] 在 `backend/src/__tests__/orders/merchant-transitions.test.js` 驗證：start-preparing、complete 合法序列；**start-preparing／complete 無 token → 401**（US3·情境5）；跳步／逆向 → **409**；**start-preparing／complete 含 junk 金額 body 時明細與 total 不變**（FR-013）；並發雙重 complete → **409** ← `spec:US3·情境1`; `spec:US3·情境2`; `spec:US3·情境3`; `spec:US3·情境4`; `spec:US3·情境5`; `spec:FR-007`; `spec:FR-008`; `spec:FR-009`; `spec:FR-012`; `spec:FR-013`; `spec:FR-015`; `spec:SC-003`; `spec:SC-006`; `spec:BR-002`; `openapi:startPreparingMerchantOrder`; `openapi:completeMerchantOrder`; `openapi:components.responses.MerchantUnauthorized`; `openapi:components.responses.OrderStatusConflict`; `research:訂單狀態機與並發安全`; `dbml:Table orders`

### 使用者故事 3 實作

#### 前端

- [x] T016 [US3] 在 `MerchantOrdersPage.jsx` 依狀態顯示「開始出餐」「完成訂單」；completed 無操作按鈕 ← `spec:US3`; `ui-plan:§畫面與流程→開始出餐`; `ui-plan:§畫面與流程→完成訂單`; `ui-plan:§畫面與流程→狀態與邊界（雛形須可見）`; `openapi:startPreparingMerchantOrder`; `openapi:completeMerchantOrder`

**Checkpoint US3**：T015、T016 通過。

---

## 階段 6：使用者故事 4－顧客查詢反映店家更新後的訂單狀態（P1）

**目標**：同 session getOrder 回傳更新後 status_label；金額不變。

### 使用者故事 4 測試

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節須對齊 |
|---|---|---|---|
| `spec.md` | US4、SC-004 | `spec:US4`; `spec:US4·情境1`; `spec:US4·情境2`; `spec:US4·情境3`; `spec:FR-014`; `spec:FR-011`; `spec:SC-004` | 顧客讀取 |

- [x] T017 [US4] 在 `backend/src/__tests__/orders/customer-status-sync.test.js`：session A 建單 → merchant 全流程 → session A **getOrder** 各步 `status`／`status_label` 與店家一致且 **total 不變**；訂單 **completed** 後 session A 仍可查詢；**session B 以相同 order_number 查詢 → 404**（US4·情境3）← `spec:US4·情境1`; `spec:US4·情境2`; `spec:US4·情境3`; `spec:FR-014`; `spec:FR-011`; `spec:SC-004`; `spec:BR-003`; `openapi:getOrder`; `openapi:components.schemas.Order`; `openapi:components.responses.OrderNotFound`

#### 前端

- [x] T018 [US4] 更新 `OrderLookupPage.jsx`（或訂單成功頁）：顯示 API `status_label`；可选手動「重新查詢」刷新狀態 ← `spec:US4`; `ui-plan:§畫面與流程→顧客查詢狀態同步`; `prototype:assets/app.js`; `openapi:getOrder`

**Checkpoint US4**：T017、T018 通過。

---

## 階段 7：收尾

- [x] T019 更新 `backend/.env.example` 加入 `MERCHANT_TOKEN`；README 或 techstack 補本機店家頁 smoke 步驟 ← `research:店家憑證驗證`; `techstack:架構與部署限制`
- [x] T020 執行 backend／frontend **全 suite** 測試全綠；確認 003 建單／查詢與 004 merchant／customer-status 測試通過，覆蓋成功標準 **SC-001–SC-006** ← `spec:SC-001`; `spec:SC-002`; `spec:SC-003`; `spec:SC-004`; `spec:SC-005`; `spec:SC-006`

## Format Validation

- [x] 每 User Story 含前端／後端小節與必讀對照表
- [x] 每任務行尾含 `←` 錨點
- [x] 對照表列均被至少一任務引用
- [x] openapi operationId 與 dbml Table 錨點覆蓋 merchant 與 getOrder 擴充

<!-- Constitution self-check: pass -->
