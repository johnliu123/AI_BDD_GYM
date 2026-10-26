# Tasks: 點餐系統第四迭代－店家管理與出餐流程

**Plan directory (PLAN_DIR)**: `specs/plans/004-merchant-serving-workflow/`

**Truth root (TRUTH_ROOT)**: `specs/truth/`

**測試工作模式**：BDD（來源為 `specs/truth/features/**` 介面 Feature／DSL 與 `traceability.md`）

**Retroactive mapping note**：既有實作均已完成。本次將 Phase 3 起由 legacy「User Story ＋ testplan TP」改編為「介面 Feature 檔 ＋ Example」；`[x]` 保留完成狀態，任務敘述對齊 Truth Feature 與 DSL。標籤為回溯性 BDD 分類，不代表本文件證明了歷史 RED 先於 GREEN。原 TP 專屬案例（無效 status filter、503 未設定、並行 accept、action body 契約等）併入對應 Example 或 `[NON-TDD]`／`[BDD:REFACTOR]` 核對任務。

**Spec 套件索引**（按需 READ）：

| 文件 | 位置 | 用途 |
|---|---|---|
| `spec.md` | PLAN_DIR | US1–US4、FR／BR／SC 與狀態機 |
| `truth-delta.md` | PLAN_DIR | 本 plan Truth 變更紀錄（legacy；見檔首註記） |
| `traceability.md` | PLAN_DIR | acceptance Example → 介面 Feature 覆蓋 |
| `scenario-index.md` | PLAN_DIR | 業務情境 ↔ 前後端 Feature Example |
| `features/acceptance/*.feature` | PLAN_DIR | 總驗收 Journey |
| `specs/truth/features/backend/訂單/店家訂單與出餐.feature` | TRUTH_ROOT | 店家 API 讀取與狀態轉換 |
| `specs/truth/features/backend/訂單/dsl.md` | TRUTH_ROOT | 004 店家訂單 Given/When/Then 契約 |
| `specs/truth/features/frontend/店家訂單/訂單看板.feature` | TRUTH_ROOT | 店家看板 UI 行為 |
| `specs/truth/features/frontend/店家訂單/dsl.md` | TRUTH_ROOT | 004 訂單看板 step 契約 |
| `specs/truth/features/frontend/顧客訂單/查詢狀態.feature` | TRUTH_ROOT | 顧客查詢同步出餐狀態 |
| `specs/truth/features/frontend/顧客訂單/dsl.md` | TRUTH_ROOT | 顧客查詢狀態 Then 契約 |
| `testplan.md` | PLAN_DIR | 歷史 TP 對照（本 tasks 不以 TP 切片） |
| `research.md` | PLAN_DIR | token、狀態機、並發、顧客同步 |
| `specs/truth/techstack.md` | TRUTH_ROOT | stack 與 test commands |
| `plan.md` | PLAN_DIR | 004 merchant endpoints、T002 契約對齊 |
| `ui/ui-plan.md`、`ui/prototype/` | PLAN_DIR | merchant board、顧客查詢 walkthrough |
| `specs/truth/data/data-model.dbml` | TRUTH_ROOT | orders.status、status_updated_at、snapshot |
| `specs/truth/contracts/http-api.yaml` | TRUTH_ROOT | 004 merchant endpoints；003 getOrder |

## 情境進度（人 Review）

| 業務情境 | 後端 RED | 後端 GREEN | 前端 RED | 前端 GREEN | 備註 |
| --- | --- | --- | --- | --- | --- |
| 店家查看待處理訂單及其明細 | T004、T006、T008 | T005、T007、T009 | T026、T028 | T027、T029 | 回溯完成 `[x]` |
| 未獲授權的人員無法查看訂單 | T010 | T011 | T030 | T031 | 回溯完成 `[x]` |
| 店家接單、開始出餐並完成訂單 | T013、T015、T017、T024 | T014、T016、T018、T025 | T032、T034、T036、T041、T043 | T033、T035、T037、T042、T044 | 含顧客查詢同步；回溯完成 `[x]` |
| 店家無法跳過流程或倒退已完成訂單 | T019 | T020 | T038 | T039 | 回溯完成 `[x]` |

**Organization**：Phase 3 起每個納入範圍的介面 Feature 檔一 Phase；各 Example 拆 `[BDD:RED]`、`[BDD:GREEN]`。全部 Feature Phase 完成後執行 **NFR 重構** Phase。非行為準備標 `[NON-TDD]` 並說明原因。

## Phase 1: Setup

**Purpose**：核對 003 前置、merchant token 與 memory DB test harness；不改產品行為。

**Read when executing this phase**：`truth-delta.md`（全文）、`research.md`、`specs/truth/techstack.md`、`plan.md`、`traceability.md`（Coverage Summary）。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `specs/truth/techstack.md` | 004 前置與 Node/MSSQL constraints | `techstack:API 後端`; `techstack:資料庫` | 沿用既有 stack |
| `plan.md` | 設計決策、端點盤點 | `plan:端點盤點`; `plan:T002 契約對齊紀錄` | contract source of truth |

- [x] T001 [NON-TDD] 核對既有 003 order repository、memory DB、merchant test token 與 `USE_MEMORY_DB=1 npm test` 入口；僅為前置環境整理 ← `plan:端點盤點`; `techstack:API 後端`; `research:延續既有前後端與訪客工作階段`

## Phase 2: Foundational

**Purpose**：保留 migration、狀態映射、merchant auth 與共用 repository/API 基礎；不含尚未有 RED Example 的產品行為。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `specs/truth/data/data-model.dbml` | orders/status fields | `dbml:Table orders` | status timestamp 與 snapshot |
| `specs/truth/contracts/http-api.yaml` | merchant auth／status operations | `openapi:components.schemas.ErrorBody`; `openapi:components.responses.OrderStatusConflict`; `openapi:components.responses.MerchantNotConfigured` | 401／409／503 response |
| `research.md` | token／狀態機／並發 | `research:店家憑證驗證`; `research:訂單狀態機與並發安全` | token guard、conditional update |

- [x] T002 [NON-TDD] 核對 004／003 contracts、`orders.status` 與 `status_updated_at` 一致；保留既有 T002 alignment record ← `plan:T002 契約對齊紀錄`; `openapi:components.schemas.OrderStatus`; `dbml:Table orders`
- [x] T003 [NON-TDD] 核對已完成的 migration、memory DB、status mapping、merchantAuth 與 routes wiring；既有基礎狀態摘要，不新增行為 ← `plan:端點盤點`; `dbml:Table orders`; `research:訂單狀態機與並發安全`

**Checkpoint**：後端測試 harness 可載入；契約與 DBML 對齊。

---

## Phase 3: `specs/truth/features/backend/訂單/店家訂單與出餐.feature` 🎯 MVP

**Goal**：完成此 Feature 檔內所有 Example 的 BDD 循環（列表／詳情／授權、狀態機轉換、顧客查詢同步）。

**端點（對齊 plan.md）**：Merchant Orders API、003 `getOrder`、relational data.

**追溯（acceptance traceability）**：`features/acceptance/店家出餐與顧客同步總驗收旅程.feature` → `spec:US1`–`US4`; `traceability.md` Coverage Matrix

**Read when executing this phase**：`traceability.md`（本檔相關列）、`specs/truth/features/backend/訂單/店家訂單與出餐.feature`、`specs/truth/features/backend/訂單/dsl.md`。

### 店家訂單與出餐.feature 任務

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `traceability.md` | 004 acceptance → backend 訂單 | `acceptance:features/acceptance/店家出餐與顧客同步總驗收旅程.feature#店家查看待處理訂單及其明細`; `acceptance:features/acceptance/店家出餐與顧客同步總驗收旅程.feature#未獲授權的人員無法查看訂單`; `acceptance:features/acceptance/店家出餐與顧客同步總驗收旅程.feature#店家接單、開始出餐並完成訂單`; `acceptance:features/acceptance/店家出餐與顧客同步總驗收旅程.feature#店家無法跳過流程或倒退已完成訂單` | 承接 acceptance 不變量 |
| `specs/truth/features/backend/訂單/店家訂單與出餐.feature` | 全部 Example | `feature:specs/truth/features/backend/訂單/店家訂單與出餐.feature#店家依狀態篩選訂單列表`; `feature:specs/truth/features/backend/訂單/店家訂單與出餐.feature#店家讀取單筆訂單快照`; `feature:specs/truth/features/backend/訂單/店家訂單與出餐.feature#未授權請求無法讀取訂單`; `feature:specs/truth/features/backend/訂單/店家訂單與出餐.feature#created 訂單接受後持久化為 accepted`; `feature:specs/truth/features/backend/訂單/店家訂單與出餐.feature#accepted 訂單開始出餐後持久化為 preparing`; `feature:specs/truth/features/backend/訂單/店家訂單與出餐.feature#preparing 訂單完成後持久化為 completed`; `feature:specs/truth/features/backend/訂單/店家訂單與出餐.feature#非法狀態轉換被拒絕且持久化狀態不變`; `feature:specs/truth/features/backend/訂單/店家訂單與出餐.feature#顧客查詢反映店家已更新的狀態` | 各 Example Then 断言 |
| `specs/truth/features/backend/訂單/dsl.md` | 004 Given/When/Then | `dsl:specs/truth/features/backend/訂單/dsl.md#訂單資料有多筆不同狀態的訂單`; `dsl:specs/truth/features/backend/訂單/dsl.md#店家依狀態讀取訂單列表`; `dsl:specs/truth/features/backend/訂單/dsl.md#回傳金額不受目前菜單價格影響`; `dsl:specs/truth/features/backend/訂單/dsl.md#請求讀取訂單列表`; `dsl:specs/truth/features/backend/訂單/dsl.md#店家接受該訂單`; `dsl:specs/truth/features/backend/訂單/dsl.md#店家開始準備該訂單`; `dsl:specs/truth/features/backend/訂單/dsl.md#店家嘗試執行不符合狀態機的操作`; `dsl:specs/truth/features/backend/訂單/dsl.md#顧客以原訪客工作階段查詢該訂單` | API 語意 |
| `specs/truth/contracts/http-api.yaml` | list/detail/accept/start/complete | `openapi:listMerchantOrders`; `openapi:getMerchantOrder`; `openapi:acceptMerchantOrder`; `openapi:startPreparingMerchantOrder`; `openapi:completeMerchantOrder`; `003-openapi:getOrder` | response/status/errors |
| `specs/truth/data/data-model.dbml` | orders and order items | `dbml:Table orders`; `dbml:Table order_items` | snapshot-only reads |

- [x] T004 [US1] [BDD:RED] 接通 Example「店家依狀態篩選訂單列表」（含摘要欄位、降序與 list cap=200） ← `acceptance:features/acceptance/店家出餐與顧客同步總驗收旅程.feature#店家查看待處理訂單及其明細`; `feature:specs/truth/features/backend/訂單/店家訂單與出餐.feature#店家依狀態篩選訂單列表`; `dsl:specs/truth/features/backend/訂單/dsl.md#訂單資料有多筆不同狀態的訂單`; `dsl:specs/truth/features/backend/訂單/dsl.md#店家依狀態讀取訂單列表`; `dsl:specs/truth/features/backend/訂單/dsl.md#摘要包含訂單編號、狀態、建立時間與總金額`; `spec:FR-001`; `spec:FR-003`; `openapi:listMerchantOrders`; `dbml:Table orders`
  完成條件：Example 因列表未依 status 篩選、欄位缺漏或超過 200 筆政策不符 Then 而失敗
- [x] T005 [US1] [BDD:GREEN] 實作／維持 merchant list：status filter、summary fields、created_at descending、limit=200 ← `feature:specs/truth/features/backend/訂單/店家訂單與出餐.feature#店家依狀態篩選訂單列表`; `spec:FR-001`; `spec:FR-003`; `openapi:listMerchantOrders`
- [x] T006 [US1] [BDD:RED] 接通 Example「店家讀取單筆訂單快照」 ← `acceptance:features/acceptance/店家出餐與顧客同步總驗收旅程.feature#店家查看待處理訂單及其明細`; `feature:specs/truth/features/backend/訂單/店家訂單與出餐.feature#店家讀取單筆訂單快照`; `dsl:specs/truth/features/backend/訂單/dsl.md#訂單資料有一筆含餐點明細與金額快照的訂單`; `dsl:specs/truth/features/backend/訂單/dsl.md#回傳訂單狀態、建立時間及完整明細快照`; `dsl:specs/truth/features/backend/訂單/dsl.md#回傳金額不受目前菜單價格影響`; `spec:FR-002`; `spec:FR-012`; `spec:BR-001`; `openapi:getMerchantOrder`; `dbml:Table order_items`
  完成條件：Example 因 detail 重算菜單價或缺 snapshot 明細而失敗
- [x] T007 [US1] [BDD:GREEN] 實作／維持 merchant detail 返回 persisted item/total snapshot ← `feature:specs/truth/features/backend/訂單/店家訂單與出餐.feature#店家讀取單筆訂單快照`; `spec:FR-002`; `spec:BR-001`; `openapi:getMerchantOrder`
- [x] T008 [US1] [BDD:RED] 接通 invalid status filter 回 `INVALID_STATUS_FILTER`（對齊 FR-003 邊界；併入列表 Example 契約） ← `feature:specs/truth/features/backend/訂單/店家訂單與出餐.feature#店家依狀態篩選訂單列表`; `spec:FR-003`; `openapi:listMerchantOrders`; `openapi:components.schemas.ErrorBody`
  完成條件：Example 因非法 filter 仍回 200 或非 400 錯誤碼而失敗
- [x] T009 [US1] [BDD:GREEN] 實作／維持非法 status filter 回 400 且不洩漏訂單列 ← `spec:FR-003`; `openapi:listMerchantOrders`; `openapi:components.schemas.ErrorBody`
- [x] T010 [US1] [BDD:RED] 接通 Example「未授權請求無法讀取訂單」 ← `acceptance:features/acceptance/店家出餐與顧客同步總驗收旅程.feature#未獲授權的人員無法查看訂單`; `feature:specs/truth/features/backend/訂單/店家訂單與出餐.feature#未授權請求無法讀取訂單`; `dsl:specs/truth/features/backend/訂單/dsl.md#請求讀取訂單列表`; `dsl:specs/truth/features/backend/訂單/dsl.md#系統拒絕讀取`; `dsl:specs/truth/features/backend/訂單/dsl.md#訂單資料不會洩漏`; `spec:FR-010`; `openapi:listMerchantOrders`; `openapi:getMerchantOrder`; `openapi:components.responses.MerchantUnauthorized`
  完成條件：Example 因 missing/invalid token 仍回 order 資料而失敗
- [x] T011 [US1] [BDD:GREEN] 實作／維持 merchant token authentication 與列表／詳情拒絕 ← `feature:specs/truth/features/backend/訂單/店家訂單與出餐.feature#未授權請求無法讀取訂單`; `spec:FR-010`; `research:店家憑證驗證`
- [x] T012 [US1] [NON-TDD] 核對 credentials 未設定時 list/detail 回 `MERCHANT_NOT_CONFIGURED`（503）；屬部署邊界契約，Truth Example 未單列 ← `spec:FR-010`; `openapi:components.responses.MerchantNotConfigured`; `research:店家憑證驗證`
- [x] T013 [US2] [BDD:RED] 接通 Example「created 訂單接受後持久化為 accepted」 ← `acceptance:features/acceptance/店家出餐與顧客同步總驗收旅程.feature#店家接單、開始出餐並完成訂單`; `feature:specs/truth/features/backend/訂單/店家訂單與出餐.feature#created 訂單接受後持久化為 accepted`; `dsl:specs/truth/features/backend/訂單/dsl.md#一筆目前狀態為「已建立」的訂單`; `dsl:specs/truth/features/backend/訂單/dsl.md#店家接受該訂單`; `dsl:specs/truth/features/backend/訂單/dsl.md#訂單明細與總金額快照維持不變`; `spec:FR-004`; `spec:FR-005`; `spec:FR-012`; `openapi:acceptMerchantOrder`
  完成條件：Example 因 accept 未更新 status/timestamp 或改寫 snapshot 而失敗
- [x] T014 [US2] [BDD:GREEN] 實作／維持 created→accepted conditional transition ← `feature:specs/truth/features/backend/訂單/店家訂單與出餐.feature#created 訂單接受後持久化為 accepted`; `spec:FR-004`; `spec:FR-005`; `research:訂單狀態機與並發安全`; `dbml:Table orders`
- [x] T015 [US3] [BDD:RED] 接通 Example「accepted 訂單開始出餐後持久化為 preparing」 ← `acceptance:features/acceptance/店家出餐與顧客同步總驗收旅程.feature#店家接單、開始出餐並完成訂單`; `feature:specs/truth/features/backend/訂單/店家訂單與出餐.feature#accepted 訂單開始出餐後持久化為 preparing`; `dsl:specs/truth/features/backend/訂單/dsl.md#一筆目前狀態為「已接單」的訂單`; `dsl:specs/truth/features/backend/訂單/dsl.md#店家開始準備該訂單`; `spec:FR-007`; `openapi:startPreparingMerchantOrder`
  完成條件：Example 因 accepted 訂單無法進入 preparing 或 snapshot 改變而失敗
- [x] T016 [US3] [BDD:GREEN] 實作／維持 start-preparing conditional transition ← `feature:specs/truth/features/backend/訂單/店家訂單與出餐.feature#accepted 訂單開始出餐後持久化為 preparing`; `spec:FR-007`; `research:訂單狀態機與並發安全`
- [x] T017 [US3] [BDD:RED] 接通 Example「preparing 訂單完成後持久化為 completed」 ← `acceptance:features/acceptance/店家出餐與顧客同步總驗收旅程.feature#店家接單、開始出餐並完成訂單`; `feature:specs/truth/features/backend/訂單/店家訂單與出餐.feature#preparing 訂單完成後持久化為 completed`; `dsl:specs/truth/features/backend/訂單/dsl.md#一筆目前狀態為「出餐中」的訂單`; `spec:FR-008`; `spec:FR-015`; `openapi:completeMerchantOrder`
  完成條件：Example 因 complete 未持久化 completed 或改寫明細／金額而失敗
- [x] T018 [US3] [BDD:GREEN] 實作／維持 complete transition 並保留明細／金額 ← `feature:specs/truth/features/backend/訂單/店家訂單與出餐.feature#preparing 訂單完成後持久化為 completed`; `spec:FR-008`; `spec:FR-012`; `dbml:Table orders`
- [x] T019 [US2] [BDD:RED] 接通 Example「非法狀態轉換被拒絕且持久化狀態不變」（含跳步、倒退、重複 accept） ← `acceptance:features/acceptance/店家出餐與顧客同步總驗收旅程.feature#店家無法跳過流程或倒退已完成訂單`; `feature:specs/truth/features/backend/訂單/店家訂單與出餐.feature#非法狀態轉換被拒絕且持久化狀態不變`; `dsl:specs/truth/features/backend/訂單/dsl.md#一筆目前狀態不允許指定操作的訂單`; `dsl:specs/truth/features/backend/訂單/dsl.md#店家嘗試執行不符合狀態機的操作`; `dsl:specs/truth/features/backend/訂單/dsl.md#系統拒絕狀態轉換`; `dsl:specs/truth/features/backend/訂單/dsl.md#訂單持久化狀態及金額快照維持不變`; `spec:FR-006`; `spec:FR-009`; `spec:BR-002`; `openapi:components.responses.OrderStatusConflict`
  完成條件：Example 因非法 transition 仍寫入新 status 或未回 409 而失敗
- [x] T020 [US2] [BDD:GREEN] 實作／維持僅允許狀態機合法相鄰轉換 ← `feature:specs/truth/features/backend/訂單/店家訂單與出餐.feature#非法狀態轉換被拒絕且持久化狀態不變`; `spec:BR-002`; `research:訂單狀態機與並發安全`
- [x] T021 [US3] [BDD:REFACTOR] 核對並行 accept 僅一筆成功、另一筆 `ORDER_STATUS_CONFLICT`（conditional UPDATE） ← `research:訂單狀態機與並發安全`; `feature:specs/truth/features/backend/訂單/店家訂單與出餐.feature#created 訂單接受後持久化為 accepted`; `spec:FR-009`; `dbml:Table orders`
- [x] T022 [US2] [BDD:REFACTOR] 核對 accept／start-preparing／complete 在未授權時不改持久化 status ← `feature:specs/truth/features/backend/訂單/店家訂單與出餐.feature#未授權請求無法讀取訂單`; `spec:FR-010`; `openapi:components.responses.MerchantUnauthorized`; `research:店家憑證驗證`
- [x] T023 [US3] [NON-TDD] 完成 action body 契約對齊：明列相容金額／明細欄位並忽略，未知欄位拒絕；整合測試驗證合法轉換不改 snapshot ← `spec:FR-012`; `spec:FR-013`; `openapi:MerchantOrderActionRequest`; `plan:T002 契約對齊紀錄`
- [x] T024 [US4] [BDD:RED] 接通 Example「顧客查詢反映店家已更新的狀態」 ← `acceptance:features/acceptance/店家出餐與顧客同步總驗收旅程.feature#店家接單、開始出餐並完成訂單`; `feature:specs/truth/features/backend/訂單/店家訂單與出餐.feature#顧客查詢反映店家已更新的狀態`; `dsl:specs/truth/features/backend/訂單/dsl.md#訂單屬於目前訪客工作階段且店家已將狀態更新為「已接單」`; `dsl:specs/truth/features/backend/訂單/dsl.md#顧客以原訪客工作階段查詢該訂單`; `dsl:specs/truth/features/backend/訂單/dsl.md#查詢回傳「已接單」狀態及對應標籤`; `dsl:specs/truth/features/backend/訂單/dsl.md#查詢結果的狀態與店家持久化狀態一致`; `spec:FR-011`; `spec:FR-014`; `spec:BR-003`; `003-openapi:getOrder`
  完成條件：Example 因 guest getOrder 與 merchant 持久化 status 不一致或 snapshot 被重算而失敗
- [x] T025 [US4] [BDD:GREEN] 實作／維持 customer query 從同一 persisted order state 組裝動態 label ← `feature:specs/truth/features/backend/訂單/店家訂單與出餐.feature#顧客查詢反映店家已更新的狀態`; `spec:BR-003`; `research:顧客查詢同步`; `003-openapi:getOrder`

**Checkpoint**：`店家訂單與出餐.feature` 後端 Example 全綠。

---

## Phase 4: `specs/truth/features/frontend/店家訂單/訂單看板.feature`

**Goal**：店家看板依狀態列表／詳情、授權錯誤呈現，以及三個前進 transition 與非法操作拒絕。

**端點（對齊 plan.md）**：Frontend merchant board.

**追溯**：acceptance Examples「店家查看待處理訂單及其明細」「未獲授權的人員無法查看訂單」「店家接單、開始出餐並完成訂單」「店家無法跳過流程或倒退已完成訂單」

**Read when executing this phase**：`specs/truth/features/frontend/店家訂單/訂單看板.feature`、`specs/truth/features/frontend/店家訂單/dsl.md`、`ui/ui-plan.md`。

### 訂單看板.feature 任務

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `traceability.md` | frontend 店家訂單列 | `acceptance:features/acceptance/店家出餐與顧客同步總驗收旅程.feature#店家查看待處理訂單及其明細`; `acceptance:features/acceptance/店家出餐與顧客同步總驗收旅程.feature#未獲授權的人員無法查看訂單`; `acceptance:features/acceptance/店家出餐與顧客同步總驗收旅程.feature#店家接單、開始出餐並完成訂單`; `acceptance:features/acceptance/店家出餐與顧客同步總驗收旅程.feature#店家無法跳過流程或倒退已完成訂單` | UI 不變量 |
| `specs/truth/features/frontend/店家訂單/訂單看板.feature` | 全部 Example | `feature:specs/truth/features/frontend/店家訂單/訂單看板.feature#店家查看待處理訂單列表`; `feature:specs/truth/features/frontend/店家訂單/訂單看板.feature#店家查看單筆訂單明細`; `feature:specs/truth/features/frontend/店家訂單/訂單看板.feature#未授權店家看不到訂單`; `feature:specs/truth/features/frontend/店家訂單/訂單看板.feature#店家接受已建立訂單`; `feature:specs/truth/features/frontend/店家訂單/訂單看板.feature#店家開始準備已接單訂單`; `feature:specs/truth/features/frontend/店家訂單/訂單看板.feature#店家完成出餐中的訂單`; `feature:specs/truth/features/frontend/店家訂單/訂單看板.feature#非法狀態操作遭拒且畫面維持原狀` | 看板断言 |
| `specs/truth/features/frontend/店家訂單/dsl.md` | 004 訂單看板句型 | `dsl:specs/truth/features/frontend/店家訂單/dsl.md#店家看板有多筆不同狀態的訂單`; `dsl:specs/truth/features/frontend/店家訂單/dsl.md#店家管理人員依狀態檢視訂單列表`; `dsl:specs/truth/features/frontend/店家訂單/dsl.md#店家看到餐點名稱、規格、數量及金額快照`; `dsl:specs/truth/features/frontend/店家訂單/dsl.md#看板顯示憑證或權限錯誤`; `dsl:specs/truth/features/frontend/店家訂單/dsl.md#看板顯示該訂單狀態為「已接單」`; `dsl:specs/truth/features/frontend/店家訂單/dsl.md#看板顯示狀態操作遭拒` | Playwright／整合語意 |
| `ui/ui-plan.md` | merchant board | `ui-plan:§畫面與流程→店家訂單看板`; `prototype:index.html` | walkthrough |

- [x] T026 [US1] [BDD:RED] 接通 Example「店家查看待處理訂單列表」 ← `acceptance:features/acceptance/店家出餐與顧客同步總驗收旅程.feature#店家查看待處理訂單及其明細`; `feature:specs/truth/features/frontend/店家訂單/訂單看板.feature#店家查看待處理訂單列表`; `dsl:specs/truth/features/frontend/店家訂單/dsl.md#店家看板有多筆不同狀態的訂單`; `dsl:specs/truth/features/frontend/店家訂單/dsl.md#店家管理人員依狀態檢視訂單列表`; `dsl:specs/truth/features/frontend/店家訂單/dsl.md#店家看見符合狀態的訂單編號、狀態、建立時間與金額`; `spec:US1`; `ui-plan:§畫面與流程→店家訂單看板`
  完成條件：Example 因列表未依狀態篩選或摘要欄位錯配而失敗
- [x] T027 [US1] [BDD:GREEN] 實作／維持看板列表 status filter 與摘要欄位 ← `feature:specs/truth/features/frontend/店家訂單/訂單看板.feature#店家查看待處理訂單列表`; `spec:FR-001`; `spec:FR-003`
- [x] T028 [US1] [BDD:RED] 接通 Example「店家查看單筆訂單明細」 ← `acceptance:features/acceptance/店家出餐與顧客同步總驗收旅程.feature#店家查看待處理訂單及其明細`; `feature:specs/truth/features/frontend/店家訂單/訂單看板.feature#店家查看單筆訂單明細`; `dsl:specs/truth/features/frontend/店家訂單/dsl.md#店家管理人員開啟該訂單詳情`; `dsl:specs/truth/features/frontend/店家訂單/dsl.md#店家看到餐點名稱、規格、數量及金額快照`; `spec:FR-002`; `spec:FR-012`
  完成條件：Example 因詳情顯示最新菜單價或缺 snapshot 明細而失敗
- [x] T029 [US1] [BDD:GREEN] 實作／維持看板詳情呈現建單 snapshot ← `feature:specs/truth/features/frontend/店家訂單/訂單看板.feature#店家查看單筆訂單明細`; `spec:FR-002`; `spec:BR-001`
- [x] T030 [US1] [BDD:RED] 接通 Example「未授權店家看不到訂單」 ← `acceptance:features/acceptance/店家出餐與顧客同步總驗收旅程.feature#未獲授權的人員無法查看訂單`; `feature:specs/truth/features/frontend/店家訂單/訂單看板.feature#未授權店家看不到訂單`; `dsl:specs/truth/features/frontend/店家訂單/dsl.md#店家管理人員沒有有效的訂單檢視權限`; `dsl:specs/truth/features/frontend/店家訂單/dsl.md#該人員嘗試開啟店家訂單看板`; `dsl:specs/truth/features/frontend/店家訂單/dsl.md#看板顯示憑證或權限錯誤`; `spec:FR-010`
  完成條件：Example 因無權限仍顯示訂單列或明細而失敗
- [x] T031 [US1] [BDD:GREEN] 實作／維持看板授權錯誤呈現且不洩漏訂單內容 ← `feature:specs/truth/features/frontend/店家訂單/訂單看板.feature#未授權店家看不到訂單`; `spec:FR-010`; `research:店家憑證驗證`
- [x] T032 [US2] [BDD:RED] 接通 Example「店家接受已建立訂單」 ← `acceptance:features/acceptance/店家出餐與顧客同步總驗收旅程.feature#店家接單、開始出餐並完成訂單`; `feature:specs/truth/features/frontend/店家訂單/訂單看板.feature#店家接受已建立訂單`; `dsl:specs/truth/features/frontend/店家訂單/dsl.md#店家看板有一筆狀態為「已建立」的訂單`; `dsl:specs/truth/features/frontend/店家訂單/dsl.md#店家管理人員接受該訂單`; `dsl:specs/truth/features/frontend/店家訂單/dsl.md#看板顯示該訂單狀態為「已接單」`; `spec:FR-004`
  完成條件：Example 因接單後看板 label 未更新為已接單而失敗
- [x] T033 [US2] [BDD:GREEN] 實作／維持看板 accept 操作與狀態呈現 ← `feature:specs/truth/features/frontend/店家訂單/訂單看板.feature#店家接受已建立訂單`; `spec:FR-004`; `spec:FR-005`
- [x] T034 [US3] [BDD:RED] 接通 Example「店家開始準備已接單訂單」 ← `acceptance:features/acceptance/店家出餐與顧客同步總驗收旅程.feature#店家接單、開始出餐並完成訂單`; `feature:specs/truth/features/frontend/店家訂單/訂單看板.feature#店家開始準備已接單訂單`; `dsl:specs/truth/features/frontend/店家訂單/dsl.md#店家看板有一筆狀態為「已接單」的訂單`; `dsl:specs/truth/features/frontend/店家訂單/dsl.md#店家管理人員開始準備該訂單`; `dsl:specs/truth/features/frontend/店家訂單/dsl.md#看板顯示該訂單狀態為「出餐中」`; `spec:FR-007`
  完成條件：Example 因 start-preparing 後 UI 仍顯示已接單而失敗
- [x] T035 [US3] [BDD:GREEN] 實作／維持看板 start-preparing 狀態呈現 ← `feature:specs/truth/features/frontend/店家訂單/訂單看板.feature#店家開始準備已接單訂單`; `spec:FR-007`
- [x] T036 [US3] [BDD:RED] 接通 Example「店家完成出餐中的訂單」 ← `acceptance:features/acceptance/店家出餐與顧客同步總驗收旅程.feature#店家接單、開始出餐並完成訂單`; `feature:specs/truth/features/frontend/店家訂單/訂單看板.feature#店家完成出餐中的訂單`; `dsl:specs/truth/features/frontend/店家訂單/dsl.md#店家看板有一筆狀態為「出餐中」的訂單`; `dsl:specs/truth/features/frontend/店家訂單/dsl.md#店家管理人員完成該訂單`; `dsl:specs/truth/features/frontend/店家訂單/dsl.md#看板顯示該訂單狀態為「已完成」`; `spec:FR-008`
  完成條件：Example 因 complete 後 UI 未顯示已完成而失敗
- [x] T037 [US3] [BDD:GREEN] 實作／維持看板 complete 狀態呈現 ← `feature:specs/truth/features/frontend/店家訂單/訂單看板.feature#店家完成出餐中的訂單`; `spec:FR-008`
- [x] T038 [US2] [BDD:RED] 接通 Example「非法狀態操作遭拒且畫面維持原狀」 ← `acceptance:features/acceptance/店家出餐與顧客同步總驗收旅程.feature#店家無法跳過流程或倒退已完成訂單`; `feature:specs/truth/features/frontend/店家訂單/訂單看板.feature#非法狀態操作遭拒且畫面維持原狀`; `dsl:specs/truth/features/frontend/店家訂單/dsl.md#店家看板有一筆不能執行指定轉換的訂單`; `dsl:specs/truth/features/frontend/店家訂單/dsl.md#店家管理人員嘗試非法狀態操作`; `dsl:specs/truth/features/frontend/店家訂單/dsl.md#看板顯示狀態操作遭拒`; `spec:FR-006`; `spec:FR-009`
  完成條件：Example 因非法操作後看板狀態仍被更新或未顯示拒絕回饋而失敗
- [x] T039 [US2] [BDD:GREEN] 實作／維持看板非法 transition 錯誤與原狀態保留 ← `feature:specs/truth/features/frontend/店家訂單/訂單看板.feature#非法狀態操作遭拒且畫面維持原狀`; `spec:BR-002`
- [x] T040 [US1] [NON-TDD] 手動走查：prototype／正式看板確認列表、詳情 snapshot 與狀態操作；屬 UI walkthrough，不修改產品行為 ← `acceptance:features/acceptance/店家出餐與顧客同步總驗收旅程.feature#店家查看待處理訂單及其明細`; `ui-plan:§畫面與流程→店家訂單看板`; `prototype:index.html`

**Checkpoint**：`訂單看板.feature` Example 全綠；看板 walkthrough 完成。

---

## Phase 5: `specs/truth/features/frontend/顧客訂單/查詢狀態.feature`

**Goal**：顧客查詢頁反映店家寫入的持久化出餐狀態，且 snapshot 不變。

**端點（對齊 plan.md）**：Frontend customer order lookup.

**追溯**：acceptance Example「店家接單、開始出餐並完成訂單」→ 顧客手動查詢同步

**Read when executing this phase**：`specs/truth/features/frontend/顧客訂單/查詢狀態.feature`、`specs/truth/features/frontend/顧客訂單/dsl.md`、`ui/ui-plan.md`。

### 查詢狀態.feature 任務

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `traceability.md` | frontend 顧客訂單列 | `acceptance:features/acceptance/店家出餐與顧客同步總驗收旅程.feature#店家接單、開始出餐並完成訂單` | 顧客 query 不變量 |
| `specs/truth/features/frontend/顧客訂單/查詢狀態.feature` | 兩個 Example | `feature:specs/truth/features/frontend/顧客訂單/查詢狀態.feature#顧客看到店家接單後的狀態`; `feature:specs/truth/features/frontend/顧客訂單/查詢狀態.feature#顧客看到店家完成出餐後的狀態` | 狀態 label 與 snapshot |
| `specs/truth/features/frontend/顧客訂單/dsl.md` | 004 Then 句型 | `dsl:specs/truth/features/frontend/顧客訂單/dsl.md#顧客在目前工作階段建立一筆訂單且店家已接單`; `dsl:specs/truth/features/frontend/顧客訂單/dsl.md#顧客看到狀態「已接單」`; `dsl:specs/truth/features/frontend/顧客訂單/dsl.md#訂單明細與金額快照維持建立時內容`; `dsl:specs/truth/features/frontend/顧客訂單/dsl.md#顧客看到狀態「已完成」`; `dsl:specs/truth/features/frontend/顧客訂單/dsl.md#顯示狀態與店家持久化狀態一致` | UI 断言 |
| `ui/ui-plan.md` | 顧客查詢狀態同步 | `ui-plan:§畫面與流程→顧客查詢狀態同步`; `003-openapi:getOrder` | walkthrough |

- [x] T041 [US4] [BDD:RED] 接通 Example「顧客看到店家接單後的狀態」 ← `acceptance:features/acceptance/店家出餐與顧客同步總驗收旅程.feature#店家接單、開始出餐並完成訂單`; `feature:specs/truth/features/frontend/顧客訂單/查詢狀態.feature#顧客看到店家接單後的狀態`; `dsl:specs/truth/features/frontend/顧客訂單/dsl.md#顧客在目前工作階段建立一筆訂單且店家已接單`; `dsl:specs/truth/features/frontend/顧客訂單/dsl.md#顧客看到狀態「已接單」`; `dsl:specs/truth/features/frontend/顧客訂單/dsl.md#訂單明細與金額快照維持建立時內容`; `spec:FR-011`; `spec:US4`; `ui-plan:§畫面與流程→顧客查詢狀態同步`
  完成條件：Example 因查詢頁未顯示已接單或 snapshot 被改寫而失敗
- [x] T042 [US4] [BDD:GREEN] 實作／維持顧客查詢 accepted label 與建單 snapshot 呈現 ← `feature:specs/truth/features/frontend/顧客訂單/查詢狀態.feature#顧客看到店家接單後的狀態`; `spec:FR-011`; `spec:FR-014`
- [x] T043 [US4] [BDD:RED] 接通 Example「顧客看到店家完成出餐後的狀態」 ← `acceptance:features/acceptance/店家出餐與顧客同步總驗收旅程.feature#店家接單、開始出餐並完成訂單`; `feature:specs/truth/features/frontend/顧客訂單/查詢狀態.feature#顧客看到店家完成出餐後的狀態`; `dsl:specs/truth/features/frontend/顧客訂單/dsl.md#顧客在目前工作階段建立一筆已完成的訂單`; `dsl:specs/truth/features/frontend/顧客訂單/dsl.md#顧客看到狀態「已完成」`; `dsl:specs/truth/features/frontend/顧客訂單/dsl.md#顯示狀態與店家持久化狀態一致`; `spec:SC-004`
  完成條件：Example 因 completed label 與店家持久化狀態不一致而失敗
- [x] T044 [US4] [BDD:GREEN] 實作／維持顧客查詢 completed 狀態與權威 status 一致 ← `feature:specs/truth/features/frontend/顧客訂單/查詢狀態.feature#顧客看到店家完成出餐後的狀態`; `spec:BR-003`; `research:顧客查詢同步`
- [x] T045 [US4] [NON-TDD] 手動走查：customer lookup 顯示店家更新後 status label 與原 snapshot；屬 UI acceptance walkthrough ← `acceptance:features/acceptance/店家出餐與顧客同步總驗收旅程.feature#店家接單、開始出餐並完成訂單`; `ui-plan:§畫面與流程→顧客查詢狀態同步`; `003-openapi:getOrder`

**Checkpoint**：`查詢狀態.feature` Example 全綠；顧客查詢 walkthrough 完成。

---

## Phase 6: NFR 重構

**Purpose**：檢視本 scope 是否另有專屬 NFR 任務；若無，確認 token／狀態權威與 snapshot 相關 FR 已由 Feature Example 覆蓋。

> 針對所有 User Story 的 NFR 去思考，是否有必要多列一些任務，來重構既有程式，達到 NFR

**Read when executing this phase**：`spec.md`（SC）、`traceability.md`（Coverage Summary）。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `spec.md` | SC-003／SC-004／SC-005 | `spec:SC-003`; `spec:SC-004`; `spec:SC-005` | 可衡量成果 |
| `traceability.md` | Coverage Summary | `traceability.md` | 17 derived Examples 覆蓋 |

- [x] T046 [NON-TDD] 核對：本迭代 spec 無專屬 NFR ID；店家憑證、狀態機、快照不變性與顧客同步已由介面 Feature Example 及 T021／T022 覆蓋，無額外跨 Feature NFR 重構任務 ← `spec:SC-003`; `spec:SC-004`; `traceability.md`

**Checkpoint**：已檢視 NFR／SC；無額外 NFR 任務。

---

## Format Validation

- Phase 1 必讀含 **`truth-delta.md` 全文**；Phase 3+ 標題為 **`specs/truth/features/…`**；`feature:`／`dsl:` 錨點使用 `specs/truth/features/…`。
- 每個 `####` 小節（含 Setup／Foundational）必有 **必讀對照** 四欄表格。
- 每個 `- [ ] Tnnn` 行尾必有 **`←`** 與至少一個機器錨點；對照表每列至少被一個任務 `←` 引用。
- Phase 3 起以介面 Feature 檔為單位；行為任務帶 `[USn]`；依端點分前端／後端小節。
- 全部 Feature File Phase 之後有 **NFR 重構** Phase；Checkpoint 註明「無額外 NFR 任務」。
- 同一 Example 的 RED→GREEN 順序可由 T 編號判定；不可集中所有 RED 後再安排 GREEN。
- 每個納入範圍的 Feature Example 至少有一項 RED 與 GREEN；BDD 行為任務引用 `acceptance:`、`feature:`、`dsl:` 與 `spec:` 錨點，**不得**以 `testplan:TP-*` 驅動。
- 同一份 tasks 不混用 BDD 與 legacy `[TDD:*]` 行為標籤。
- 每個 RED 任務下方有「完成條件：…」；GREEN 不需此行。
- 純文件／環境／walkthrough 標 `[NON-TDD]` 並寫明原因。

Constitution self-check: pass
