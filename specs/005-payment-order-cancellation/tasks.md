# 任務：點餐系統第五迭代－付款與取消訂單

**輸入**：設計文件位於 `specs/005-payment-order-cancellation/`

**Spec 套件索引**（按需 READ；執行到對應 Phase／小節再載入，勿一次讀完）：

| 文件 | 用途 |
|---|---|
| `spec.md` | 功能需求、User Story、商業規則與成功標準 |
| `research.md` | stub 金流、payment 狀態機、冪等、pending 取消政策 |
| `plan.md` | 專案結構、端點盤點、設計決策 |
| `techstack.md` | migration、env、前端擴充 |
| `ui-plan.md` · `prototype/` | 付款／取消 UI 示意 |
| `data-model.dbml` | payment 欄位、payment_idempotency_keys |
| `contracts/http-api.yaml` | pay／cancel 與 Order 擴充 |
| `../004-merchant-serving-workflow/contracts/http-api.yaml` | 004 出餐 transition POST（跨迭代） |

**機器錨點慣例（G3）**：本目錄 **`openapi:{operationId}`** 指 **`contracts/http-api.yaml`**（005 權威）。前一迭代契約使用 **`004-openapi:{operationId}`**，檔案路徑見上表；詳見 `plan.md`「T002 契約對齊紀錄·Merchant 出餐 POST」。

**組織方式**：階段 3 起依使用者故事分組；故事內以 **#### 前端／後端** 作為第二層。

## 階段 1：前置作業

**目的**：確認 004 訂單／merchant 路由可作為 005 基礎；核對契約與 research。

**執行本階段時讀取**：`research.md`、`techstack.md`、`plan.md`。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `spec.md` | 假設、邊界 payment 列舉、FR-012 澄清 | `spec:FR-010`; `spec:FR-012`; `spec:FR-015` | 004 已交付 |
| `research.md` | 延續堆疊、stub | `research:延續既有堆疊與訂單持久化`; `research:模擬金流（stub）` | 擴充非重寫 |
| `techstack.md` | API、資料庫 | `techstack:API 後端`; `techstack:資料庫` | migration 005 |
| `plan.md` | 端點盤點、T002 紀錄 | `plan:端點盤點`; `plan:設計決策·出餐 cancelled`; `plan:T002 契約對齊紀錄` | pay/cancel 邊界 |
| `contracts/http-api.yaml` | Order、PaymentStatus | `openapi:components.schemas.Order`; `openapi:components.schemas.PaymentStatus`; `openapi:components.schemas.OrderStatus` | 005 契約為 implement 權威 |
| `../004-merchant-serving-workflow/contracts/http-api.yaml` | 出餐 transition POST | `004-openapi:startPreparingMerchantOrder`; `004-openapi:completeMerchantOrder` | FR-019 護欄（004 契約） |

- [x] T001 在 `backend/src/__tests__/orders/` 新增或擴充前置測試，確認 004 merchant 與 customer getOrder 仍通過；於 `techstack.md` 新增「005 前置」小節摘要 ← `research:延續既有堆疊與訂單持久化`; `techstack:API 後端`; `plan:端點盤點`; `openapi:getOrder`; `spec:FR-015`
- [x] T002 對照 `contracts/http-api.yaml` 與 `data-model.dbml`；**同步更新** `../003-order-creation-inquiry/contracts/http-api.yaml` 與 `../004-merchant-serving-workflow/contracts/http-api.yaml` 之 `Order`／`OrderStatus`／merchant summary 的 payment 欄位與 `cancelled`； discrepancies 記錄於 `plan.md`「T002 契約對齊紀錄」← `openapi:payOrder`; `openapi:cancelOrder`; `openapi:getOrder`; `openapi:listMerchantOrders`; `openapi:components.schemas.PayOrderRequest`; `openapi:components.schemas.PaymentStatus`; `dbml:Table orders`; `dbml:Table payment_idempotency_keys`; `research:付款冪等`; `spec:FR-012`; `spec:FR-016`

**Checkpoint**：T001 通過後才開始 migration 005 與 payment 路由。

---

## 階段 2：共用基礎

**目的**：schema、paymentStatus 映射、stub、repository／service、路由骨架、前端 orderApi 擴充。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `data-model.dbml` | Project Note、`orders`、`payment_idempotency_keys` | `dbml:Project`; `dbml:Table orders`; `dbml:Table payment_idempotency_keys` | payment 欄位 |
| `contracts/http-api.yaml` | pay/cancel、ErrorBody | `openapi:payOrder`; `openapi:cancelOrder`; `openapi:components.schemas.ErrorBody` | 409 語意 |
| `research.md` | 狀態機、冪等、pending | `research:付款狀態機與並發`; `research:付款冪等`; `research:顧客取消與 pending 競態` | 條件 UPDATE |
| `techstack.md` | stub env、pending 逾時 | `techstack:模擬金流`; `techstack:付款狀態`; `plan:設計決策·付款 pending 逾時` | PAYMENT_PENDING_STALE_SEC |

- [x] T003 新增 `backend/src/data/migrations/005_payment_cancel.mssql.sql`（payment 欄位、預設 `unpaid`）並更新 `memoryDatabase.js` ← `dbml:Table orders`; `dbml:Table payment_idempotency_keys`; `techstack:資料庫`
- [x] T004 新增 `backend/src/lib/paymentStatus.js` 與 `backend/src/services/paymentStub.js`；含 **`paymentService` 對 stale `pending`（`PAYMENT_PENDING_STALE_SEC`）可重入 stub** 之單元測試 ← `plan:設計決策·付款 pending 逾時`; `openapi:components.schemas.PaymentStatus`; `research:模擬金流（stub）`; `research:付款狀態機與並發`
- [x] T005 新增 `paymentIdempotencyRepository.js`；擴充 `orderRepository.js` 組裝 payment 欄位（含 `refunded_at`）；pay／cancel 狀態更新在 `paymentService.js` ← `dbml:Table payment_idempotency_keys`; `research:付款冪等`; `research:付款狀態機與並發`; `spec:FR-012`
- [x] T006 新增 `paymentService.js`；於 `routes/orders.js` 註冊 `POST …/pay`、`POST …/cancel`（CSRF）← `openapi:payOrder`; `openapi:cancelOrder`; `spec:FR-010`; `spec:FR-011`; `spec:FR-012`
- [x] T007 擴充 `orderStatus.js`（`cancelled`）；`merchantOrderService.js` 對 **`cancelled` 拒絕 accept／start-preparing／complete**（三 POST）← `plan:設計決策·出餐 cancelled`; `plan:T002 契約對齊紀錄`; `openapi:acceptMerchantOrder`; `004-openapi:startPreparingMerchantOrder`; `004-openapi:completeMerchantOrder`; `spec:FR-019`
- [x] T008 擴充 `listOrdersForMerchant` 支援 `payment_status` 篩選 ← `openapi:listMerchantOrders`; `spec:FR-018`
- [x] T009 擴充 `frontend/src/orderApi.js`（`payOrder`、`cancelOrder`）與 `orderApi.test.js` ← `openapi:payOrder`; `openapi:cancelOrder`; `techstack:前端（顧客）`

**Checkpoint**：T005–T007 完成後才執行 US 端對端測試。

---

## 階段 3：使用者故事 1－顧客對訂單發起付款（P1）

**目標**：unpaid→pending→paid；拒絕 paid 重複；忽略 body 金額；session 不符 404。

**端點**：顧客前端、Orders API pay、MSSQL、paymentStub。

### 使用者故事 1 測試

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節須對齊 |
|---|---|---|---|
| `spec.md` | US1 情境、SC-001 | `spec:US1`; `spec:US1·情境1`; `spec:US1·情境2`; `spec:US1·情境3`; `spec:US1·情境4`; `spec:FR-001`; `spec:FR-002`; `spec:FR-003`; `spec:FR-006`; `spec:SC-001`; `spec:SC-005` | pay 成功與拒絕 |

- [x] T010 [US1] 新增 `backend/src/__tests__/orders/payment-pay.test.js`：pay 成功 `paid` 且 total 等於快照；body 夾帶假 total 不變（**FR-006**）；已 paid → **409** `ORDER_ALREADY_PAID`；pending 中（未逾時）→ **409** `PAYMENT_IN_PROGRESS`；錯誤 session → **404** ← `spec:US1·情境1`; `spec:US1·情境2`; `spec:US1·情境3`; `spec:US1·情境4`; `spec:FR-001`; `spec:FR-002`; `spec:FR-003`; `spec:FR-006`; `spec:FR-010`; `spec:BR-001`; `openapi:payOrder`; `dbml:Table orders`

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節須對齊 |
|---|---|---|---|
| `ui-plan.md` | 顧客付款 | `ui-plan:§畫面與流程→顧客付款`; `prototype:assets/app.js` | 付款按鈕 |

- [x] T011 [US1] 於 `OrderLookupPage.jsx`／`MenuPage.jsx` 成功區：顯示 `payment_status_label`；對 **`unpaid` 或 `failed`** 顯示「付款」並呼叫 `payOrder` ← `spec:US1`; `spec:FR-001`; `spec:FR-005`; `ui-plan:§畫面與流程→顧客付款`; `openapi:payOrder`

**Checkpoint US1**：T010、T011 通過。

---

## 階段 4：使用者故事 2－付款失敗與重試（P1）

**目標**：stub failure→failed；failed 可再 pay；Idempotency-Key 命中 paid；5xx 不寫冪等。

### 使用者故事 2 測試

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節須對齊 |
|---|---|---|---|
| `spec.md` | US2、FR-012 | `spec:US2`; `spec:US2·情境1`; `spec:US2·情境2`; `spec:US2·情境3`; `spec:US2·情境4`; `spec:FR-004`; `spec:FR-005`; `spec:FR-006`; `spec:FR-012`; `spec:SC-002`; `spec:SC-006` | 失敗與冪等 |

- [x] T012 [US2] 新增 `backend/src/__tests__/orders/payment-failure-idempotency.test.js`：`simulate_outcome=failure` 或 env → `failed` 與 reason，且 **`payment_idempotency_keys` 無列**；failed 再 pay → `paid`；相同 Idempotency-Key 於 **paid 成功後**重送回相同 body；**模擬 pay 在持久化 `paid` 前 5xx**（或 transaction rollback）後 **`payment_idempotency_keys` 仍空**、同 key 可重試成功（**US2·情境4／FR-012**）← `spec:US2·情境1`; `spec:US2·情境2`; `spec:US2·情境3`; `spec:US2·情境4`; `spec:FR-012`; `research:模擬金流（stub）`; `research:付款冪等`; `openapi:payOrder`; `dbml:Table payment_idempotency_keys`

#### 前端

- [x] T013 [US2] 顯示 `payment_failure_reason`；failed 時啟用再次付款；409 等錯誤以 **toast + 表單區** 顯示 server message ← `spec:US2`; `ui-plan:§畫面與流程→付款失敗重試`; `openapi:payOrder`

**Checkpoint US2**：T012、T013 通過。

---

## 階段 5：使用者故事 3－顧客取消訂單（P1）

**目標**：created→cancelled；非 created 409；**非 stale** pending 取消 409；**stale pending** → failed+cancelled；paid 取消→refunded。

### 使用者故事 3 測試

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節須對齊 |
|---|---|---|---|
| `spec.md` | US3、FR-013 | `spec:US3`; `spec:US3·情境1`; `spec:US3·情境2`; `spec:US3·情境3`; `spec:US3·情境4`; `spec:US3·情境5`; `spec:FR-007`; `spec:FR-008`; `spec:FR-009`; `spec:FR-013`; `spec:SC-003`; `spec:SC-004` | 取消規則 |

- [x] T014 [US3] 新增 `backend/src/__tests__/orders/order-cancel.test.js`：created 取消成功；accepted 等 → **409** `ORDER_NOT_CANCELLABLE`（**FR-008**）；**非 stale** pending cancel → **409** `PAYMENT_IN_PROGRESS`；**stale pending** cancel → `cancelled`+`failed`（無 pending 殘留）；paid 取消 → `cancelled`+`refunded`+`refunded_at`；取消後 pay → **409** `ORDER_CANCELLED`；明細 total 不變 ← `spec:US3·情境1`; `spec:US3·情境2`; `spec:US3·情境3`; `spec:US3·情境4`; `spec:US3·情境5`; `spec:FR-008`; `spec:FR-009`; `spec:BR-003`; `openapi:cancelOrder`; `dbml:Table orders`

#### 前端

- [x] T015 [US3] 「取消訂單」按鈕（僅 `created`；**非 stale** pending 禁用；**stale pending** 可取消，見 research F1）；成功後更新 UI ← `spec:US3`; `ui-plan:§畫面與流程→顧客取消訂單`; `openapi:cancelOrder`; `prototype:assets/app.js`

**Checkpoint US3**：T014、T015 通過。

---

## 階段 6：使用者故事 4－顧客查詢反映付款與取消狀態（P1）

**目標**：getOrder 含 payment 欄位；cancelled 標籤；他人 session 404。

### 使用者故事 4 測試

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節須對齊 |
|---|---|---|---|
| `spec.md` | US4、FR-015 | `spec:US4`; `spec:US4·情境1`; `spec:US4·情境2`; `spec:US4·情境3`; `spec:FR-016`; `spec:FR-011`; `spec:FR-015`; `spec:SC-001` | 查詢欄位 |

- [x] T016 [US4] 擴充或新增 `customer-payment-query.test.js`：pay／cancel 後 getOrder 欄位一致；`failed` 含 reason；foreign session **404** ← `spec:US4·情境1`; `spec:US4·情境2`; `spec:US4·情境3`; `spec:FR-016`; `spec:FR-011`; `spec:FR-015`; `spec:SC-001`; `openapi:getOrder`; `openapi:components.schemas.Order`

#### 前端

- [x] T017 [US4] 查詢結果顯示出餐與付款雙標籤；取消後顯示「已取消」← `spec:US4`; `ui-plan:§畫面與流程→查詢付款狀態`; `openapi:getOrder`

**Checkpoint US4**：T016、T017 通過。

---

## 階段 7：使用者故事 5－店家檢視訂單付款與取消資訊（P1）

**目標**：merchant list/detail payment 欄位；payment_status 篩選；cancelled 拒絕全部出餐 POST；店家 401／503。

### 使用者故事 5 測試

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節須對齊 |
|---|---|---|---|
| `spec.md` | US5、FR-017–FR-020 | `spec:US5`; `spec:US5·情境1`; `spec:US5·情境3`; `spec:US5·情境4`; `spec:FR-017`; `spec:FR-018`; `spec:FR-019`; `spec:FR-020`; `spec:SC-006` | 店家檢視與護欄 |
| `../004-merchant-serving-workflow/contracts/http-api.yaml` | start-preparing／complete | `004-openapi:startPreparingMerchantOrder`; `004-openapi:completeMerchantOrder` | cancelled 護欄（004 POST） |

- [x] T018 [US5] 新增 `merchant-payment-cancel-guard.test.js`：`listMerchantOrders` 含 payment 欄位、`payment_status` 篩選、非法 query **400** `INVALID_PAYMENT_STATUS_FILTER`；**`getMerchantOrder` 詳情 payment 欄位與顧客 getOrder 一致**；`cancelled` 訂單 **accept／start-preparing／complete** 均 → **409**；list／get **無 token → 401**、**`MERCHANT_TOKEN` 未設定 → 503**（**FR-020**）← `spec:US5·情境1`; `spec:US5·情境2`; `spec:US5·情境3`; `spec:US5·情境4`; `spec:FR-017`; `spec:FR-018`; `spec:FR-019`; `spec:FR-020`; `spec:SC-006`; `openapi:listMerchantOrders`; `openapi:getMerchantOrder`; `openapi:acceptMerchantOrder`; `004-openapi:startPreparingMerchantOrder`; `004-openapi:completeMerchantOrder`; `openapi:components.responses.MerchantUnauthorized`; `openapi:components.responses.MerchantNotConfigured`

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節須對齊 |
|---|---|---|---|
| `ui-plan.md` | 店家付款 UI | `ui-plan:§畫面與流程→店家付款篩選`; `ui-plan:§畫面與流程→店家詳情付款資訊` | 列表與詳情 |

- [x] T019 [US5] 擴充 `MerchantOrdersPage.jsx`：payment badge、付款篩選；詳情呼叫 **`getMerchantOrder`** 顯示 payment／失敗原因；`cancelled` 隱藏接單／出餐 ← `spec:US5`; `spec:FR-017`; `ui-plan:§畫面與流程→店家付款篩選`; `ui-plan:§畫面與流程→店家詳情付款資訊`; `ui-plan:§畫面與流程→已取消不可接單`; `openapi:listMerchantOrders`; `openapi:getMerchantOrder`

**Checkpoint US5**：T018、T019 通過。

---

## 階段 8：收尾

- [x] T020 更新 `backend/.env.example`（`PAYMENT_SIMULATE_OUTCOME`、`ALLOW_PAYMENT_SIMULATE_BODY`、`PAYMENT_PENDING_STALE_SEC`）；techstack 補 smoke 步驟 ← `research:模擬金流（stub）`; `techstack:架構與部署限制`
- [x] T021 執行 backend／frontend 全 suite；003–004 回歸與 005 新測試全綠；**SC-001–SC-006** 由 T010–T014、T016、T018 後端測試與 T011–T019 UI 走查共同驗證 ← `spec:SC-001`; `spec:SC-002`; `spec:SC-003`; `spec:SC-004`; `spec:SC-005`; `spec:SC-006`

## Smoke 驗收紀錄

- **2026-10-14**：`USE_MEMORY_DB=1 npm test`（backend **102**）、`npm run smoke:005`（pass）、`frontend npm test`（**18**）；analyze E1：`verify:migrations`、`smoke:mssql:005`、`.github/workflows/backend-ci.yml` 已補。
- **2026-10-14（/implement 收尾）**：`verify:migrations` pass → backend **102/102** → `smoke:005` pass → frontend **18/18**；T001–T021 均已 `[x]`。

## Format Validation

- [x] 每 User Story 含前端／後端小節與必讀對照表
- [x] 每任務行尾含 `←` 錨點
- [x] 對照表列均被至少一任務引用
- [x] openapi operationId 與 dbml Table 錨點覆蓋 pay／cancel 與 payment 擴充

<!-- Constitution self-check: pass -->
