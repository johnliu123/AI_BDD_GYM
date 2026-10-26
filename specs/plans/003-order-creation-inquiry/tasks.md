# Tasks: 點餐系統第三迭代－訂單建立與查詢

**Plan directory (PLAN_DIR)**: `specs/plans/003-order-creation-inquiry/`

**Truth root (TRUTH_ROOT)**: `specs/truth/`

**測試工作模式**：BDD（來源為 interface Feature／DSL 與 `traceability.md`）

**Retroactive mapping note**：既有實作均已完成。本次將 Phase 3 起由 legacy「User Story ＋ testplan TP」改編為「介面 Feature 檔 ＋ Example」；`[x]` 保留完成狀態，任務敘述對齊 `specs/truth/features/**/訂單/*.feature` 與 DSL。標籤為回溯性 BDD 分類，不代表本文件證明了歷史 RED 先於 GREEN。原 TP 建單安全、冪等邊界與相容金額欄位政策併入對應 Example 的 RED／GREEN 或 Foundational 核對。

**Spec 套件索引**（按需 READ）：

| 文件 | 位置 | 用途 |
|---|---|---|
| `spec.md` | PLAN_DIR | US1–US2、FR／BR／SC、冪等澄清 |
| `truth-delta.md` | PLAN_DIR | 本 plan Truth 變更紀錄（legacy plan 見檔首註記） |
| `traceability.md` | PLAN_DIR | acceptance Example → 介面 Feature 覆蓋 |
| `features/acceptance/*.feature` | PLAN_DIR | 整體驗收 Journey |
| `specs/truth/features/backend/訂單/建立與查詢訂單.feature` | TRUTH_ROOT | 建單／查詢原子 Example |
| `specs/truth/features/backend/訂單/dsl.md` | TRUTH_ROOT | 003 建單／查詢 step 契約 |
| `specs/truth/features/frontend/訂單/確認與查詢訂單.feature` | TRUTH_ROOT | 確認送單與查詢 UI Example |
| `specs/truth/features/frontend/訂單/dsl.md` | TRUTH_ROOT | 前端確認／查詢 step 契約 |
| `testplan.md` | PLAN_DIR | 歷史 TP 對照（本 tasks 不以 TP 切片） |
| `research.md` | PLAN_DIR | transaction、快照、session、冪等決策 |
| `specs/truth/techstack.md` | TRUTH_ROOT | stack 與 test commands |
| `plan.md` | PLAN_DIR | 端點盤點、transaction boundary、order number policy |
| `ui/ui-plan.md`、`ui/prototype/` | PLAN_DIR | checkout、order success、lookup flow |
| `specs/truth/data/data-model.dbml` | TRUTH_ROOT | orders、order items/options、idempotency keys |
| `specs/truth/contracts/http-api.yaml` | TRUTH_ROOT | `createOrder`／`getOrder`；002 cart contract 為前置 |

## 情境進度（人 Review）

| 業務情境 | 後端 RED | 後端 GREEN | 前端 RED | 前端 GREEN | 備註 |
| --- | --- | --- | --- | --- | --- |
| 顧客確認購物車後取得訂單紀錄 | T003 | T004 | T025 | T026 | 回溯完成 `[x]` |
| 顧客端金額不會覆寫訂單快照 | T013 | T014 | — | — | 回溯完成 `[x]` |
| 空購物車或含不可用項目時建立訂單被拒絕 | T005、T007 | T006、T008 | T027 | T028 | 回溯完成 `[x]` |
| 顧客因未收到首次結果而再次送出同一筆訂單 | T009、T011、T015、T019 | T010、T012、T016、T020 | — | — | 回溯完成 `[x]` |
| 顧客使用訂單編號查詢自己的訂單 | T021 | T022 | T030 | T031 | 回溯完成 `[x]` |
| 其他訪客無法查詢該訂單 | T023 | T024 | T032 | T033 | 回溯完成 `[x]` |

**Organization**：Phase 3 起每個納入範圍的介面 Feature 檔一 Phase；各 Example 拆 `[BDD:RED]`、`[BDD:GREEN]`。全部 Feature Phase 完成後執行 **NFR 重構** Phase。非行為準備標 `[NON-TDD]` 並說明原因。

## Phase 1: Setup

**Purpose**：核對 002 cart／session／money 前置；不新增訂單行為。

**Read when executing this phase**：`truth-delta.md`（全文）、`research.md`、`specs/truth/techstack.md`、`plan.md`、`traceability.md`（Coverage Summary）。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `research.md` | 延續訪客 session、建單 harness | `research:延續既有前後端與訪客工作階段` | guest session／CSRF 前置 |
| `specs/truth/techstack.md` | API 後端、資料庫、test command | `techstack:API 後端`; `techstack:資料庫` | `USE_MEMORY_DB=1 npm test` |
| `plan.md` | 端點盤點 | `plan:端點盤點` | order scope 與 002 銜接 |

- [x] T001 [NON-TDD] 核對既有 guest session、cart read、money helper 與 backend／frontend `npm test` 入口；本任務只記錄環境，不改產品行為 ← `plan:端點盤點`; `research:延續既有前後端與訪客工作階段`; `techstack:API 後端`; `techstack:資料庫`

## Phase 2: Foundational

**Purpose**：保留 order、detail、idempotency persistence 與 transaction foundation；不含尚未有 RED Example 的產品行為。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `specs/truth/data/data-model.dbml` | orders、order_items/options、order_idempotency_keys | `dbml:Table orders`; `dbml:Table order_items`; `dbml:Table order_idempotency_keys` | snapshot 及冪等 mapping |
| `research.md` | 建單 transaction、冪等、查詢授權 | `research:訂單建立交易與購物車清空`; `research:冪等鍵與避免重複送單`; `research:訂單查詢授權` | 單 transaction／owner-session 查詢 |
| `specs/truth/contracts/http-api.yaml` | `createOrder`／`getOrder` schemas | `openapi:createOrder`; `openapi:getOrder`; `openapi:components.schemas.Order` | 既有 API contract |
| `plan.md` | T002 契約對齊紀錄 | `plan:T002 契約對齊紀錄` | order number／error code 已落地 |

- [x] T002 [NON-TDD] 核對已完成的 003 schema／migration、memory DB table 與 OpenAPI order number／error code；含 `CreateOrderRequest` 相容金額欄位政策（伺服器忽略計價）；不改產品行為 ← `plan:T002 契約對齊紀錄`; `dbml:Table orders`; `dbml:Table order_idempotency_keys`; `openapi:createOrder`; `openapi:getOrder`; `openapi:components.schemas.CreateOrderRequest`

**Checkpoint**：後端／前端測試 harness 可載入；契約、DBML 與 002 cart 前置對齊。

---

## Phase 3: `specs/truth/features/backend/訂單/建立與查詢訂單.feature` 🎯 MVP

**Goal**：完成此 Feature 檔內所有 Example 的 BDD 循環（建單、拒絕、冪等、快照金額、session 查詢）。

**端點（對齊 plan.md）**：Orders API、MSSQL／memory DB、guest session／CSRF、既有 cart service。

**追溯（acceptance traceability）**：`features/acceptance/訪客建立與查詢訂單總驗收旅程.feature` 全 Rule → `spec:US1`; `spec:US2`; 對應 FR／BR

**Read when executing this phase**：`traceability.md`（本檔相關列）、`specs/truth/features/backend/訂單/建立與查詢訂單.feature`、`specs/truth/features/backend/訂單/dsl.md`（§003 建立與查詢訂單）。

### 建立與查詢訂單.feature 任務

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `traceability.md` | 建單／查詢 acceptance → 後端 derived Feature | `acceptance:features/acceptance/訪客建立與查詢訂單總驗收旅程.feature#顧客確認購物車後取得訂單紀錄`; `acceptance:features/acceptance/訪客建立與查詢訂單總驗收旅程.feature#顧客因未收到首次結果而再次送出同一筆訂單` | 承接已確認 acceptance 行為 |
| `specs/truth/features/backend/訂單/建立與查詢訂單.feature` | 建單與查詢 Example | `feature:specs/truth/features/backend/訂單/建立與查詢訂單.feature#可用購物車建立一筆訂單並清空購物車`; `feature:specs/truth/features/backend/訂單/建立與查詢訂單.feature#購物車沒有可用項目時拒絕且保留購物車`; `feature:specs/truth/features/backend/訂單/建立與查詢訂單.feature#相同冪等請求重送回傳原訂單`; `feature:specs/truth/features/backend/訂單/建立與查詢訂單.feature#顧客端金額不會覆寫訂單快照`; `feature:specs/truth/features/backend/訂單/建立與查詢訂單.feature#同一工作階段查詢訂單回傳保存的快照`; `feature:specs/truth/features/backend/訂單/建立與查詢訂單.feature#不同工作階段查詢訂單不洩漏存在性` | 各 Example 的 Then 断言 |
| `specs/truth/features/backend/訂單/dsl.md` | 003 Given／When／Then | `dsl:specs/truth/features/backend/訂單/dsl.md#目前訪客工作階段購物車有多項可用餐點與規格`; `dsl:specs/truth/features/backend/訂單/dsl.md#顧客以相同工作階段及冪等鍵再次送出建立訂單`; `dsl:specs/truth/features/backend/訂單/dsl.md#目前訪客工作階段以訂單編號查詢` | 持久化與 API 語意 |
| `specs/truth/contracts/http-api.yaml` | `createOrder`、`getOrder` | `openapi:createOrder`; `openapi:getOrder`; `openapi:components.schemas.ErrorBody` | 201／200／400／409／403／404 |
| `specs/truth/data/data-model.dbml` | orders／details／idempotency | `dbml:Table orders`; `dbml:Table order_items`; `dbml:Table order_idempotency_keys` | transaction、snapshot |

- [x] T003 [US1] [BDD:RED] 在 `backend/src/__tests__/orders/create-order.test.js` 接通 Example「可用購物車建立一筆訂單並清空購物車」（唯一 order number、快照、清 cart） ← `acceptance:features/acceptance/訪客建立與查詢訂單總驗收旅程.feature#顧客確認購物車後取得訂單紀錄`; `feature:specs/truth/features/backend/訂單/建立與查詢訂單.feature#可用購物車建立一筆訂單並清空購物車`; `dsl:specs/truth/features/backend/訂單/dsl.md#目前訪客工作階段購物車有多項可用餐點與規格`; `dsl:specs/truth/features/backend/訂單/dsl.md#系統建立一筆唯一訂單並回傳訂單編號`; `spec:US1`; `spec:FR-001`; `spec:FR-002`; `spec:FR-003`; `spec:FR-006`; `openapi:createOrder`; `dbml:Table orders`; `dbml:Table order_items`
  完成條件：Example 因建單未寫入完整 snapshot、未清 cart 或 order number 不符合 Then 而失敗
- [x] T004 [US1] [BDD:GREEN] 實作／維持 transaction 建單、快照寫入及成功後清 cart 的最小行為 ← `acceptance:features/acceptance/訪客建立與查詢訂單總驗收旅程.feature#顧客確認購物車後取得訂單紀錄`; `feature:specs/truth/features/backend/訂單/建立與查詢訂單.feature#可用購物車建立一筆訂單並清空購物車`; `spec:FR-001`; `spec:FR-003`; `spec:FR-006`; `research:訂單建立交易與購物車清空`; `openapi:createOrder`
- [x] T005 [US1] [BDD:RED] 接通 Example「購物車沒有可用項目時拒絕且保留購物車」之 mixed unavailable cart（409）断言 ← `acceptance:features/acceptance/訪客建立與查詢訂單總驗收旅程.feature#空購物車或含不可用項目時建立訂單被拒絕`; `feature:specs/truth/features/backend/訂單/建立與查詢訂單.feature#購物車沒有可用項目時拒絕且保留購物車`; `dsl:specs/truth/features/backend/訂單/dsl.md#目前訪客工作階段購物車為空或只含不可用項目`; `dsl:specs/truth/features/backend/訂單/dsl.md#系統拒絕建立訂單且不寫入訂單資料`; `spec:FR-004`; `spec:BR-002`; `openapi:createOrder`
  完成條件：Example 因含不可用項目仍建單成功或 cart 被清空而失敗
- [x] T006 [US1] [BDD:GREEN] 實作／維持建單前 availability revalidation 與 409 error mapping ← `feature:specs/truth/features/backend/訂單/建立與查詢訂單.feature#購物車沒有可用項目時拒絕且保留購物車`; `spec:FR-004`; `spec:BR-002`; `openapi:createOrder`; `openapi:components.schemas.ErrorBody`
- [x] T007 [US1] [BDD:RED] 接通同一 Example 之 empty／only-unavailable cart（400 CART_EMPTY）断言 ← `acceptance:features/acceptance/訪客建立與查詢訂單總驗收旅程.feature#空購物車或含不可用項目時建立訂單被拒絕`; `feature:specs/truth/features/backend/訂單/建立與查詢訂單.feature#購物車沒有可用項目時拒絕且保留購物車`; `spec:FR-005`; `openapi:createOrder`
  完成條件：Example 因空車或全不可用仍寫入 order row 而失敗
- [x] T008 [US1] [BDD:GREEN] 實作／維持 `CART_EMPTY` refusal 且不寫入 order ← `feature:specs/truth/features/backend/訂單/建立與查詢訂單.feature#購物車沒有可用項目時拒絕且保留購物車`; `spec:FR-005`; `openapi:createOrder`; `openapi:components.schemas.ErrorBody`
- [x] T009 [US1] [BDD:RED] 接通 Example「相同冪等請求重送回傳原訂單」← `acceptance:features/acceptance/訪客建立與查詢訂單總驗收旅程.feature#顧客因未收到首次結果而再次送出同一筆訂單`; `feature:specs/truth/features/backend/訂單/建立與查詢訂單.feature#相同冪等請求重送回傳原訂單`; `dsl:specs/truth/features/backend/訂單/dsl.md#目前工作階段已以某冪等鍵成功建立一筆訂單`; `dsl:specs/truth/features/backend/訂單/dsl.md#顧客以相同工作階段及冪等鍵再次送出建立訂單`; `spec:FR-007`; `spec:BR-003`; `openapi:createOrder`
  完成條件：Example 因相同 key 重送仍建立第二筆 order 而失敗
- [x] T010 [US1] [BDD:GREEN] 實作／維持 order idempotency replay：mapping 唯一且 replay 回 200 ← `feature:specs/truth/features/backend/訂單/建立與查詢訂單.feature#相同冪等請求重送回傳原訂單`; `spec:FR-007`; `research:冪等鍵與避免重複送單`; `dbml:Table order_idempotency_keys`
- [x] T011 [US1] [BDD:RED] 接通 acceptance「冪等結果保留 24 小時後以相同 key 再送視為新訂單」之 expired key 断言 ← `acceptance:features/acceptance/訪客建立與查詢訂單總驗收旅程.feature#顧客因未收到首次結果而再次送出同一筆訂單`; `feature:specs/truth/features/backend/訂單/建立與查詢訂單.feature#相同冪等請求重送回傳原訂單`; `spec:FR-007`; `research:冪等鍵與避免重複送單`; `openapi:createOrder`
  完成條件：Example 因過期 key 仍 replay 原 order 而失敗
- [x] T012 [US1] [BDD:GREEN] 實作／維持 24h expiry 判斷並允許相同過期 key 新建 order ← `acceptance:features/acceptance/訪客建立與查詢訂單總驗收旅程.feature#顧客因未收到首次結果而再次送出同一筆訂單`; `spec:FR-007`; `research:冪等鍵與避免重複送單`; `dbml:Table order_idempotency_keys`
- [x] T013 [US1] [BDD:RED] 接通 Example「顧客端金額不會覆寫訂單快照」← `acceptance:features/acceptance/訪客建立與查詢訂單總驗收旅程.feature#顧客端金額不會覆寫訂單快照`; `feature:specs/truth/features/backend/訂單/建立與查詢訂單.feature#顧客端金額不會覆寫訂單快照`; `dsl:specs/truth/features/backend/訂單/dsl.md#顧客以請求附帶的不同總額送出建立訂單`; `dsl:specs/truth/features/backend/訂單/dsl.md#訂單仍依目前菜單與規格資料計算建立時快照`; `spec:FR-011`; `spec:BR-001`; `openapi:components.schemas.CreateOrderRequest`
  完成條件：Example 因 client total／unit_price 覆寫持久化 snapshot 而失敗
- [x] T014 [US1] [BDD:GREEN] 實作／維持忽略相容 client 金額欄位、只持久化 cart 快照計價 ← `feature:specs/truth/features/backend/訂單/建立與查詢訂單.feature#顧客端金額不會覆寫訂單快照`; `spec:FR-011`; `spec:BR-001`; `openapi:createOrder`; `plan:T002 契約對齊紀錄`
- [x] T015 [US1] [BDD:RED] 接通 acceptance 冪等邊界：failed create 不寫成功 idempotency mapping、cart 修正後同 key 可成功 ← `acceptance:features/acceptance/訪客建立與查詢訂單總驗收旅程.feature#顧客因未收到首次結果而再次送出同一筆訂單`; `feature:specs/truth/features/backend/訂單/建立與查詢訂單.feature#相同冪等請求重送回傳原訂單`; `dsl:specs/truth/features/backend/訂單/dsl.md#系統不建立第二筆訂單`; `spec:FR-007`; `research:冪等鍵與避免重複送單`; `openapi:createOrder`
  完成條件：Example 因空 cart 失敗仍占用 idempotency mapping 而失敗
- [x] T016 [US1] [BDD:GREEN] 實作／維持僅在建單成功後持久化 idempotency mapping ← `spec:FR-007`; `research:冪等鍵與避免重複送單`; `dbml:Table order_idempotency_keys`
- [x] T017 [US1] [BDD:RED] 接通建單 session-bound Origin／CSRF guard：invalid 請求不寫 order、不清 cart ← `acceptance:features/acceptance/訪客建立與查詢訂單總驗收旅程.feature#顧客確認購物車後取得訂單紀錄`; `spec:FR-010`; `spec:FR-001`; `002-openapi:components.parameters.OriginHeader`; `002-openapi:components.parameters.CsrfTokenHeader`; `openapi:createOrder`
  完成條件：Example 因缺 Origin 或 invalid CSRF 仍建單或清空 cart 而失敗
- [x] T018 [US1] [BDD:GREEN] 實作／維持建單沿用 002 session-bound Origin／CSRF guard ← `spec:FR-010`; `research:延續既有前後端與訪客工作階段`; `openapi:createOrder`
- [x] T019 [US1] [BDD:RED] 接通 acceptance「全系統仍只有一筆對應訂單」之同 key 並行建單断言 ← `acceptance:features/acceptance/訪客建立與查詢訂單總驗收旅程.feature#顧客因未收到首次結果而再次送出同一筆訂單`; `feature:specs/truth/features/backend/訂單/建立與查詢訂單.feature#相同冪等請求重送回傳原訂單`; `spec:FR-007`; `spec:BR-003`; `openapi:createOrder`
  完成條件：Example 因並行同 key 建立兩筆不同 order 而失敗
- [x] T020 [US1] [BDD:GREEN] 實作／維持同 key concurrency serialization／unique mapping，兩回應指向同一 order ← `spec:FR-007`; `research:冪等鍵與避免重複送單`; `dbml:Table order_idempotency_keys`
- [x] T021 [US2] [BDD:RED] 在 `backend/src/__tests__/orders/get-order.test.js` 接通 Example「同一工作階段查詢訂單回傳保存的快照」← `acceptance:features/acceptance/訪客建立與查詢訂單總驗收旅程.feature#顧客使用訂單編號查詢自己的訂單`; `feature:specs/truth/features/backend/訂單/建立與查詢訂單.feature#同一工作階段查詢訂單回傳保存的快照`; `dsl:specs/truth/features/backend/訂單/dsl.md#目前訪客工作階段已建立一筆訂單`; `dsl:specs/truth/features/backend/訂單/dsl.md#訂單建立後菜單價格已變更`; `dsl:specs/truth/features/backend/訂單/dsl.md#目前訪客工作階段以訂單編號查詢`; `spec:FR-008`; `spec:FR-009`; `openapi:getOrder`
  完成條件：Example 因查詢仍依最新菜單價格重算 total 而失敗
- [x] T022 [US2] [BDD:GREEN] 實作／維持 owner session 以 order number 查詢並回傳 persisted snapshot ← `feature:specs/truth/features/backend/訂單/建立與查詢訂單.feature#同一工作階段查詢訂單回傳保存的快照`; `spec:FR-008`; `spec:FR-009`; `spec:BR-001`; `research:訂單查詢授權`; `research:訂單金額快照與查詢權威`; `openapi:getOrder`
- [x] T023 [US2] [BDD:RED] 接通 Example「不同工作階段查詢訂單不洩漏存在性」← `acceptance:features/acceptance/訪客建立與查詢訂單總驗收旅程.feature#其他訪客無法查詢該訂單`; `feature:specs/truth/features/backend/訂單/建立與查詢訂單.feature#不同工作階段查詢訂單不洩漏存在性`; `dsl:specs/truth/features/backend/訂單/dsl.md#第一個訪客工作階段建立了一筆訂單`; `dsl:specs/truth/features/backend/訂單/dsl.md#第二個訪客工作階段以該訂單編號查詢`; `spec:FR-010`; `spec:US2·情境3`; `openapi:getOrder`
  完成條件：Example 因 foreign session 仍回傳 order body 或可區分存在性而失敗
- [x] T024 [US2] [BDD:GREEN] 實作／維持跨 session 查詢不洩漏 order existence（統一 ORDER_NOT_FOUND） ← `feature:specs/truth/features/backend/訂單/建立與查詢訂單.feature#不同工作階段查詢訂單不洩漏存在性`; `spec:FR-010`; `research:訂單查詢授權`; `openapi:getOrder`

**Checkpoint**：`建立與查詢訂單.feature` 後端 Example 全綠。

---

## Phase 4: `specs/truth/features/frontend/訂單/確認與查詢訂單.feature`

**Goal**：顧客確認可用購物車、處理拒絕送單，並查詢／查無自己 session 的訂單快照。

**端點（對齊 plan.md）**：Checkout UI、order lookup UI、`frontend/src/orderApi.js`。

**追溯**：acceptance Examples「顧客確認購物車後取得訂單紀錄」「空購物車或含不可用項目…」「顧客使用訂單編號查詢…」「其他訪客無法查詢該訂單」

**Read when executing this phase**：`specs/truth/features/frontend/訂單/確認與查詢訂單.feature`、`specs/truth/features/frontend/訂單/dsl.md`、`ui/ui-plan.md`。

### 確認與查詢訂單.feature 任務

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `traceability.md` | 建單／查詢 acceptance → 前端 derived Feature | `acceptance:features/acceptance/訪客建立與查詢訂單總驗收旅程.feature#顧客確認購物車後取得訂單紀錄`; `acceptance:features/acceptance/訪客建立與查詢訂單總驗收旅程.feature#顧客使用訂單編號查詢自己的訂單` | UI 呈現伺服器結果 |
| `specs/truth/features/frontend/訂單/確認與查詢訂單.feature` | 四個 Example | `feature:specs/truth/features/frontend/訂單/確認與查詢訂單.feature#顧客確認購物車並看到訂單明細`; `feature:specs/truth/features/frontend/訂單/確認與查詢訂單.feature#購物車沒有可用項目時無法送單`; `feature:specs/truth/features/frontend/訂單/確認與查詢訂單.feature#顧客查詢自己建立的訂單`; `feature:specs/truth/features/frontend/訂單/確認與查詢訂單.feature#其他工作階段查不到該訂單` | 成功／拒絕／查詢／查無 |
| `specs/truth/features/frontend/訂單/dsl.md` | Given／When／Then | `dsl:specs/truth/features/frontend/訂單/dsl.md#顧客確認並送出購物車`; `dsl:specs/truth/features/frontend/訂單/dsl.md#顧客看到訂單編號、初始狀態與訂單明細`; `dsl:specs/truth/features/frontend/訂單/dsl.md#顧客看到統一的查無訂單結果` | Playwright／API 測試語意 |
| `ui/ui-plan.md` | 確認送單、成功、查詢、查無 | `ui-plan:§畫面與流程→確認送單`; `ui-plan:§畫面與流程→訂單建立成功`; `ui-plan:§畫面與流程→查詢訂單狀態`; `ui-plan:§畫面與流程→查無訂單` | walkthrough 對照 |

- [x] T025 [US1] [BDD:RED] 在 `frontend/src/orderApi.test.js` 等接通 Example「顧客確認購物車並看到訂單明細」（CSRF bootstrap、空 body create、成功 payload） ← `acceptance:features/acceptance/訪客建立與查詢訂單總驗收旅程.feature#顧客確認購物車後取得訂單紀錄`; `feature:specs/truth/features/frontend/訂單/確認與查詢訂單.feature#顧客確認購物車並看到訂單明細`; `dsl:specs/truth/features/frontend/訂單/dsl.md#顧客的購物車有多項可用餐點與所選規格`; `dsl:specs/truth/features/frontend/訂單/dsl.md#顧客確認並送出購物車`; `spec:US1`; `ui-plan:§畫面與流程→確認送單`; `openapi:createOrder`
  完成條件：Example 因 checkout 未 bootstrap CSRF、body 非空或成功頁缺 order number／snapshot 而失敗
- [x] T026 [US1] [BDD:GREEN] 實作／維持 Checkout flow：CSRF bootstrap、空 body create、成功結果顯示與 cart 清空呈現 ← `feature:specs/truth/features/frontend/訂單/確認與查詢訂單.feature#顧客確認購物車並看到訂單明細`; `spec:FR-001`; `spec:FR-006`; `ui-plan:§畫面與流程→訂單建立成功`; `openapi:createOrder`
- [x] T027 [US1] [BDD:RED] 接通 Example「購物車沒有可用項目時無法送單」← `acceptance:features/acceptance/訪客建立與查詢訂單總驗收旅程.feature#空購物車或含不可用項目時建立訂單被拒絕`; `feature:specs/truth/features/frontend/訂單/確認與查詢訂單.feature#購物車沒有可用項目時無法送單`; `dsl:specs/truth/features/frontend/訂單/dsl.md#顧客的購物車沒有任何可用項目`; `dsl:specs/truth/features/frontend/訂單/dsl.md#顧客看到無法建立訂單的提示`; `ui-plan:§畫面與流程→拒絕不可用購物車送單`
  完成條件：Example 因拒絕送單仍顯示 order number 或未保留 cart 而失敗
- [x] T028 [US1] [BDD:GREEN] 實作／維持無可用項目時拒絕提示且不展示新訂單編號 ← `feature:specs/truth/features/frontend/訂單/確認與查詢訂單.feature#購物車沒有可用項目時無法送單`; `spec:FR-004`; `spec:FR-005`; `ui-plan:§畫面與流程→拒絕不可用購物車送單`
- [x] T029 [US1] [NON-TDD] 手動走查：prototype／正式 checkout 確認 order number 可複製、快照與 cart 清空；屬 UI walkthrough，不修改產品行為 ← `acceptance:features/acceptance/訪客建立與查詢訂單總驗收旅程.feature#顧客確認購物車後取得訂單紀錄`; `ui-plan:§畫面與流程→訂單建立成功`; `prototype:index.html`
- [x] T030 [US2] [BDD:RED] 接通 Example「顧客查詢自己建立的訂單」（含菜單漲價後仍顯示建單快照） ← `acceptance:features/acceptance/訪客建立與查詢訂單總驗收旅程.feature#顧客使用訂單編號查詢自己的訂單`; `feature:specs/truth/features/frontend/訂單/確認與查詢訂單.feature#顧客查詢自己建立的訂單`; `dsl:specs/truth/features/frontend/訂單/dsl.md#顧客在目前訪客工作階段建立了一筆訂單`; `dsl:specs/truth/features/frontend/訂單/dsl.md#顧客看到建立當下的金額快照`; `spec:FR-008`; `spec:FR-009`; `openapi:getOrder`
  完成條件：Example 因查詢 UI 顯示最新菜單價格或未顯示 persisted 明細而失敗
- [x] T031 [US2] [BDD:GREEN] 實作／維持 lookup 呈現 status、時間、明細與建單快照金額 ← `feature:specs/truth/features/frontend/訂單/確認與查詢訂單.feature#顧客查詢自己建立的訂單`; `spec:FR-008`; `spec:FR-009`; `ui-plan:§畫面與流程→查詢訂單狀態`
- [x] T032 [US2] [BDD:RED] 接通 Example「其他工作階段查不到該訂單」← `acceptance:features/acceptance/訪客建立與查詢訂單總驗收旅程.feature#其他訪客無法查詢該訂單`; `feature:specs/truth/features/frontend/訂單/確認與查詢訂單.feature#其他工作階段查不到該訂單`; `dsl:specs/truth/features/frontend/訂單/dsl.md#第二個顧客以該訂單編號查詢訂單`; `dsl:specs/truth/features/frontend/訂單/dsl.md#顧客看到統一的查無訂單結果`; `spec:FR-010`
  完成條件：Example 因跨 session 仍顯示他人 order 內容或可推斷存在性而失敗
- [x] T033 [US2] [BDD:GREEN] 實作／維持統一查無結果且不洩漏 order existence ← `feature:specs/truth/features/frontend/訂單/確認與查詢訂單.feature#其他工作階段查不到該訂單`; `spec:FR-010`; `ui-plan:§畫面與流程→查無訂單`
- [x] T034 [US2] [NON-TDD] 手動走查：owner order 顯示 status／snapshot；unknown 或切 session 顯示查無；屬 UI acceptance walkthrough ← `acceptance:features/acceptance/訪客建立與查詢訂單總驗收旅程.feature#顧客使用訂單編號查詢自己的訂單`; `acceptance:features/acceptance/訪客建立與查詢訂單總驗收旅程.feature#其他訪客無法查詢該訂單`; `ui-plan:§畫面與流程→查詢訂單狀態`; `ui-plan:§畫面與流程→查無訂單`

**Checkpoint**：`確認與查詢訂單.feature` 前端 Example 全綠；checkout／lookup walkthrough 完成。

---

## Phase 5: NFR 重構

**Purpose**：檢視 spec 範圍內 NFR 是否在 Feature Phase 後仍不足，必要時列出跨 Feature 的重構或驗證任務。

> 針對所有 User Story 的 NFR 去思考，是否有必要多列一些任務，來重構既有程式，達到 NFR

**Read when executing this phase**：`spec.md`（NFR、SC）、`traceability.md`（Coverage Summary）。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `spec.md` | SC-001–SC-006、session／冪等 FR | `spec:SC-001`; `spec:SC-002`; `spec:SC-004`; `spec:SC-005` | 可衡量成果是否已由 Feature 覆蓋 |
| `traceability.md` | Coverage Summary | `traceability.md` | 6 acceptance Examples 全 assigned |

- [x] T035 [NON-TDD] 核對：本迭代 spec 無專屬 NFR ID；session／CSRF、冪等、伺服器權威快照與跨 session 查詢已由介面 Feature Example 覆蓋，無額外跨 Feature NFR 重構任務 ← `spec:SC-001`; `spec:SC-002`; `spec:SC-004`; `spec:SC-005`; `traceability.md`

**Checkpoint**：已檢視 NFR／SC；無額外 NFR 任務。

---

## Dependencies & Execution Order

- Phase 1–2 完成後再進入 Phase 3；Phase 3 後端建單 Example 宜先於 Phase 4 checkout UI。
- 同一 Example 的 RED→GREEN 由 T 編號順序判定；不可集中所有 RED 後再安排 GREEN。
- 002 cart／session 為硬前置；003 查詢依 Phase 3 已持久化 order snapshot。
- 已完成 checkbox 保留 `[x]`；回溯 BDD 標籤不宣稱歷史 RED→GREEN 時序。

## Format Validation

- Phase 1 必讀含 **`truth-delta.md` 全文**；Phase 3+ 標題為 **`specs/truth/features/…`**；`feature:`／`dsl:` 錨點使用 `specs/truth/features/…`。
- 每個 `####` 小節（含 Setup／Foundational）必有 **必讀對照** 四欄表格。
- 每個 `- [x] Tnnn`（或進行中 `- [ ] Tnnn`）行尾必有 **`←`** 與至少一個機器錨點；行為任務不以 `testplan:TP-*` 錨點；對照表每列至少被一個任務 `←` 引用。本檔為回溯完成態，checkbox 均為 `[x]`。
- Phase 3 起以介面 Feature 檔為單位；行為任務帶 `[US1]` 或 `[US2]`；依端點分前端／後端小節。
- 全部 Feature File Phase 之後有 **NFR 重構** Phase；Checkpoint 註明「無額外 NFR 任務」。
- 每個納入範圍的 Feature Example 至少有一項 RED 與 GREEN（或 walkthrough 標 `[NON-TDD]`）；BDD task 引用 acceptance Example、Feature Example、DSL 與 spec 錨點。
- 同一份 tasks 不混用 BDD 與 legacy `[TDD:*]` 行為標籤。
- 每個 RED 任務下方有「完成條件：…」；GREEN 不需此行。
- 純文件／環境／walkthrough 標 `[NON-TDD]` 並寫明原因。
- `truth-delta.md` 無 dsl-refine 列時不另列 Phase 2.5。

Constitution self-check: pass.
