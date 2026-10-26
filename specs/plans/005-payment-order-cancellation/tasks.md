# Tasks: 點餐系統第五迭代－付款與取消訂單

**Plan directory (PLAN_DIR)**: `specs/plans/005-payment-order-cancellation/`

**Truth root (TRUTH_ROOT)**: `specs/truth/`

**測試工作模式**：BDD（來源為 `dsl-refine` 的 interface Feature／DSL 與 `traceability.md`）

**Acceptance 與 traceability**：`features/acceptance/付款取消與狀態查詢總驗收旅程.feature` 與 `traceability.md`／`scenario-index.md` 為任務切片與 `/implement` 權威；`testplan.md` 僅供歷史 TP 對照。

**Retroactive mapping note**：既有實作均已完成。本次將 Phase 3 起由 legacy「User Story ＋ testplan TP」改編為「介面 Feature 檔 ＋ Example」；`[x]` 保留完成狀態，任務敘述對齊 `specs/truth/features/**` 與 DSL。標籤為回溯性 BDD 分類，不代表本文件證明了歷史 RED 先於 GREEN。PayOrderRequest 相容金額／items 政策已由 T013 契約對齊完成。**TP-027** 已由 T056 與 `testplan.md`（2026-10-22）驗證通過。**TP-010**／US2·情境4 已對齊 `plan.md`「設計決策·付款故障注入」、Truth Example 與 T020／T021 BDD 錨點；行為驗收以 **tasks／Feature** 為準，`testplan.md` 為歷史 TP 對照。

**Spec 套件索引**（按需 READ）：

| 文件 | 位置 | 用途 |
|---|---|---|
| `spec.md` | PLAN_DIR | US1–US5、FR／BR／SC、付款及取消規則 |
| `truth-delta.md` | PLAN_DIR | 本 plan Truth 變更紀錄（legacy plan 見檔首註記） |
| `traceability.md` | PLAN_DIR | acceptance Example → 介面 Feature 覆蓋 |
| `scenario-index.md` | PLAN_DIR | 業務情境 ↔ Feature 位置（人 Review 主入口） |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | PLAN_DIR | 整體驗收 Journey |
| `specs/truth/features/backend/訂單/*.feature` | TRUTH_ROOT | 顧客付款、取消、查詢 Example |
| `specs/truth/features/backend/訂單/dsl.md` | TRUTH_ROOT | 後端 step 契約 |
| `specs/truth/features/backend/店家訂單/*.feature` | TRUTH_ROOT | 店家付款資訊、取消護欄 Example |
| `specs/truth/features/backend/店家訂單/dsl.md` | TRUTH_ROOT | 店家 API step 契約 |
| `specs/truth/features/frontend/顧客訂單/*.feature` | TRUTH_ROOT | 顧客付款、取消、查詢 UI Example |
| `specs/truth/features/frontend/顧客訂單/dsl.md` | TRUTH_ROOT | 顧客 UI step 契約 |
| `specs/truth/features/frontend/店家訂單/*.feature` | TRUTH_ROOT | 店家看板付款／取消護欄 Example |
| `specs/truth/features/frontend/店家訂單/dsl.md` | TRUTH_ROOT | 店家 UI step 契約 |
| `testplan.md` | PLAN_DIR | 歷史 TP 對照（本 tasks 不以 TP 切片） |
| `research.md` | PLAN_DIR | stub、payment state、冪等與 pending timeout |
| `specs/truth/techstack.md` | TRUTH_ROOT | stack 與 test commands |
| `plan.md` | PLAN_DIR | endpoint inventory、T002 contract alignment |
| `ui/ui-plan.md`、`ui/prototype/` | PLAN_DIR | 顧客付款／取消、店家 payment filter |
| `specs/truth/data/data-model.dbml` | TRUTH_ROOT | payment 欄位與 `payment_idempotency_keys` |
| `specs/truth/contracts/http-api.yaml` | TRUTH_ROOT | pay/cancel/customer query/merchant query；004 action contracts |

## 情境進度（人 Review）

| 業務情境 | 後端 RED | 後端 GREEN | 前端 RED | 前端 GREEN | 備註 |
| --- | --- | --- | --- | --- | --- |
| 顧客完成付款並查看付款狀態 | T003 | T004 | — | T042 | 查詢 walkthrough 含付款顯示；回溯 `[x]` |
| 顧客端提交不同金額不會改變應付金額 | — | T013 | — | — | 契約對齊 `[NON-TDD]`；回溯 `[x]` |
| 已付款或付款處理中的訂單不會重複扣款 | T005、T007 | T006、T008 | — | — | 回溯 `[x]` |
| 付款失敗後以同一訂單再次付款成功 | T016 | T017 | — | — | 回溯 `[x]` |
| 付款中斷後以相同冪等鍵安全重試 | T020 | T021 | — | — | Phase 2.5 T002a/b harness；spec US2·情境4；回溯 `[x]` |
| 顧客重送已成功的同一付款請求 | T018 | T019 | — | — | 回溯 `[x]` |
| 顧客取消尚未接單且未付款的訂單 | T022 | T023 | — | — | 回溯 `[x]` |
| 顧客取消已付款但尚未接單的訂單 | T026 | T027 | — | — | 回溯 `[x]` |
| 顧客無法取消已進入出餐流程的訂單 | T028 | T029 | — | — | 回溯 `[x]` |
| 付款仍有效處理中時不得取消，過期處理才可安全取消 | T030、T032 | T031、T033 | — | — | 回溯 `[x]` |
| 顧客查詢付款失敗訂單 | T038 | T039 | — | T042 | 回溯 `[x]` |
| 顧客查詢已取消訂單 | T038 | T039 | — | T042 | 回溯 `[x]` |
| 店家依付款狀態篩選訂單 | T043 | T044 | — | T053 | 回溯 `[x]` |
| 無效店家憑證無法讀取付款資訊 | T051 | T052 | — | T053 | 回溯 `[x]` |
| 店家不能接單已取消訂單 | T049 | T050 | — | T053 | 回溯 `[x]` |
| 店家不能推進已取消訂單 | T049 | T050 | — | T053 | 同取消護欄；回溯 `[x]` |
| 店家查看付款失敗訂單詳情 | T047 | T048 | — | T053 | 回溯 `[x]` |
| 無效店家憑證無法讀取訂單詳情 | T051 | T052 | — | — | 回溯 `[x]` |
| 店家不能完成已取消訂單 | T049 | T050 | — | T053 | 回溯 `[x]` |

**Organization**：Phase 3 起每個納入範圍的介面 Feature 檔一 Phase；各 Example 拆 `[BDD:RED]`、`[BDD:GREEN]`。全部 Feature Phase 完成後執行 **NFR 重構** Phase。非行為準備標 `[NON-TDD]` 並說明原因。

## Phase 1: Setup

**Purpose**：核對 004／003 前置、payment stub 與 memory DB 測試入口；不新增產品行為。

**Read when executing this phase**：`truth-delta.md`（全文）、`research.md`、`specs/truth/techstack.md`、`plan.md`、`traceability.md`（Coverage Summary）。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `specs/truth/techstack.md` | 005 前置及 payment stub | `techstack:API 後端`; `techstack:資料庫`; `techstack:模擬金流` | memory DB、migration／CI commands |
| `plan.md` | T002 contract alignment | `plan:T002 契約對齊紀錄`; `plan:端點盤點` | 005/003/004 API compatibility |
| `scenario-index.md` | 全情境缺口 | `scenario-index.md` | 本 plan 介面 Feature 已對應 |

- [x] T001 [NON-TDD] 核對 004 order state、003 session/CSRF、005 memory DB/payment stub 測試入口；此為已完成前置環境確認 ← `plan:T002 契約對齊紀錄`; `plan:端點盤點`; `techstack:API 後端`; `techstack:資料庫`; `traceability.md`

## Phase 2: Foundational

**Purpose**：保留 payment schema、status mapping、stub 與路由基礎。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `specs/truth/data/data-model.dbml` | orders payment fields、payment_idempotency_keys | `dbml:Table orders`; `dbml:Table payment_idempotency_keys` | status persistence／successful mapping |
| `specs/truth/contracts/http-api.yaml` | Order／PaymentStatus／ErrorBody | `openapi:components.schemas.Order`; `openapi:components.schemas.PaymentStatus`; `openapi:components.schemas.ErrorBody` | response field and errors |
| `research.md` | stub、state machine、idempotency、pending cancellation | `research:模擬金流（stub）`; `research:付款狀態機與並發`; `research:付款冪等`; `research:顧客取消與 pending 競態` | transitions and atomic operations |

- [x] T002 [NON-TDD] 核對已完成 migration、memory DB、payment status/stub、payment idempotency repository 與 order route wiring；不新增產品行為 ← `dbml:Table orders`; `dbml:Table payment_idempotency_keys`; `plan:端點盤點`; `openapi:payOrder`; `openapi:cancelOrder`

**Checkpoint**：後端 payment harness 可載入；DBML 與 OpenAPI 對齊。

---

## Phase 2.5: Harness 對齊 Truth delta

**Purpose**：對齊 `truth-delta` dsl-refine ADD/MOD（US2·情境4 5xx 重試 Example 與 `backend/訂單/dsl.md` 故障注入句型）；確保整合測試與 DSL 拓樸可解析新 step。

**Read when executing this phase**：`truth-delta.md`（§dsl-refine）、`plan.md`「設計決策·付款故障注入」、`specs/truth/features/backend/訂單/dsl.md`、`specs/truth/features/backend/訂單/付款與取消.feature`（5xx Example）。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `truth-delta.md` | §dsl-refine ADD/MOD 列 | `truth-delta:dsl-refine#1`; `truth-delta:dsl-refine#2` | 5xx Example／DSL 已落地 |
| `plan.md` | 付款故障注入 seam | `plan:設計決策·付款故障注入` | `PAYMENT_TEST_ABORT_AFTER_PENDING` 僅測試 |
| `specs/truth/features/backend/訂單/dsl.md` | pending 後 5xx／重試 Then 列 | `dsl:specs/truth/features/backend/訂單/dsl.md#付款服務設定為 pending 後回傳 5xx 中斷` | step 契約可匹配 |
| `specs/truth/techstack.md` | DSL 拓樸稽核 | `techstack:backend`; `techstack:整合測試` | audit 與 payment 整合測試 |

- [x] T002a [BDD:REFACTOR] 核對 `payment-failure-idempotency.test.js` 與 payment step 断言，使「pending 後 5xx 不寫 paid 冪等且同 key 可安全重試」Example 的 Given/When/Then 對齊 `backend/訂單/dsl.md` 新增列 ← `truth-delta:dsl-refine#1`; `truth-delta:dsl-refine#2`; `feature:specs/truth/features/backend/訂單/付款與取消.feature#pending 後 5xx 不寫 paid 冪等且同 key 可安全重試`; `dsl:specs/truth/features/backend/訂單/dsl.md#首次回應為伺服器錯誤且不建立代表付款成功的去重紀錄`; `plan:設計決策·付款故障注入`; `spec:FR-012`
- [x] T002b [NON-TDD] 執行 `audit_feature_dsl_topology.py --root specs/truth/features/backend` 與 `USE_MEMORY_DB=1 node --test src/__tests__/orders/payment-failure-idempotency.test.js`，確認 005 訂單模組 DSL 拓樸與 5xx retry case 全綠 ← `truth-delta:dsl-refine#1`; `techstack:backend`; `traceability.md` §Coverage Summary

**Checkpoint**：backend 介面 DSL audit PASS；5xx 冪等整合測試通過。

---

## Phase 3: `specs/truth/features/backend/訂單/付款與取消.feature` 🎯 MVP

**Goal**：完成此 Feature 內付款、重試、冪等與顧客取消 Example 的 BDD 循環（含 session 邊界、stale pending 重入、失敗態取消、已取消再操作等 legacy 整合覆蓋）。

**端點（對齊 plan.md）**：Orders API、payment stub、relational data.

**追溯（acceptance traceability）**：`features/acceptance/付款取消與狀態查詢總驗收旅程.feature` → `spec:US1`; `spec:US2`; `spec:US3`; `spec:FR-001`–`FR-013`

**Read when executing this phase**：`traceability.md`（backend/訂單 列）、`specs/truth/features/backend/訂單/付款與取消.feature`、`specs/truth/features/backend/訂單/dsl.md`。

### 付款與取消.feature 任務

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `traceability.md` | 付款／取消 acceptance → 後端 derived Feature | `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#顧客完成付款並查看付款狀態`; `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#顧客取消尚未接單且未付款的訂單` | 承接已確認 acceptance 行為 |
| `specs/truth/features/backend/訂單/付款與取消.feature` | 付款成功、衝突、重試、取消 Example | `feature:specs/truth/features/backend/訂單/付款與取消.feature#付款成功後保存 paid 狀態及快照金額`; `feature:specs/truth/features/backend/訂單/付款與取消.feature#已付款訂單拒絕再次扣款`; `feature:specs/truth/features/backend/訂單/付款與取消.feature#非 stale 的 pending 訂單拒絕新付款`; `feature:specs/truth/features/backend/訂單/付款與取消.feature#付款失敗不寫入 paid 冪等記錄`; `feature:specs/truth/features/backend/訂單/付款與取消.feature#尚未接單且未付款的訂單取消後禁止付款及出餐`; `feature:specs/truth/features/backend/訂單/付款與取消.feature#stale pending 訂單同一交易中止付款並取消` | Example Then 断言 |
| `specs/truth/features/backend/訂單/dsl.md` | pay/cancel Given/When/Then | `dsl:specs/truth/features/backend/訂單/dsl.md#顧客發起付款`; `dsl:specs/truth/features/backend/訂單/dsl.md#顧客取消該訂單` | 持久化與 API 語意 |
| `specs/truth/contracts/http-api.yaml` | payOrder、cancelOrder | `openapi:payOrder`; `openapi:cancelOrder`; `openapi:components.schemas.PayOrderRequest` | pay/cancel response/errors |

- [x] T003 [US1] [BDD:RED] 在 `backend/src/__tests__/orders/` 接通 Example「付款成功後保存 paid 狀態及快照金額」← `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#顧客完成付款並查看付款狀態`; `feature:specs/truth/features/backend/訂單/付款與取消.feature#付款成功後保存 paid 狀態及快照金額`; `dsl:specs/truth/features/backend/訂單/dsl.md#一筆出餐狀態為「已建立」且付款狀態為「未付款」的訂單`; `spec:FR-001`; `spec:FR-002`; `spec:FR-010`; `openapi:payOrder`; `dbml:Table orders`
  完成條件：Example 因未 persisted paid、快照金額不符或出餐狀態被改寫而失敗
- [x] T004 [US1] [BDD:GREEN] 實作／維持 pay 以 persisted total snapshot 付款並記錄 paid_at ← `feature:specs/truth/features/backend/訂單/付款與取消.feature#付款成功後保存 paid 狀態及快照金額`; `spec:BR-001`; `openapi:payOrder`; `dbml:Table orders`
- [x] T005 [US1] [BDD:RED] 接通 Example「已付款訂單拒絕再次扣款」← `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#已付款或付款處理中的訂單不會重複扣款`; `feature:specs/truth/features/backend/訂單/付款與取消.feature#已付款訂單拒絕再次扣款`; `spec:FR-003`; `openapi:payOrder`
  完成條件：Example 因已 paid 訂單仍接受第二次 pay 或狀態被覆寫而失敗
- [x] T006 [US1] [BDD:GREEN] 實作／維持 `ORDER_ALREADY_PAID` guard ← `feature:specs/truth/features/backend/訂單/付款與取消.feature#已付款訂單拒絕再次扣款`; `spec:FR-003`; `openapi:payOrder`
- [x] T007 [US1] [BDD:RED] 接通 Example「非 stale 的 pending 訂單拒絕新付款」← `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#已付款或付款處理中的訂單不會重複扣款`; `feature:specs/truth/features/backend/訂單/付款與取消.feature#非 stale 的 pending 訂單拒絕新付款`; `spec:FR-003`; `research:付款狀態機與並發`; `openapi:payOrder`
  完成條件：Example 因 fresh pending 仍被第二個 pay attempt 改寫而失敗
- [x] T008 [US1] [BDD:GREEN] 實作／維持 `PAYMENT_IN_PROGRESS` 與 pending 不變 ← `feature:specs/truth/features/backend/訂單/付款與取消.feature#非 stale 的 pending 訂單拒絕新付款`; `spec:FR-003`; `openapi:payOrder`
- [x] T009 [US1] [BDD:RED] 接通 acceptance「已付款或付款處理中的訂單不會重複扣款」之 stale pending pay 重入整合測試（對齊 `plan:設計決策·付款 pending 逾時`）← `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#已付款或付款處理中的訂單不會重複扣款`; `research:付款狀態機與並發`; `plan:設計決策·付款 pending 逾時`; `openapi:payOrder`
  完成條件：stale pending 重入後仍形成多筆 paid 結果或 pending 未清理而失敗
- [x] T010 [US1] [BDD:GREEN] 實作／維持 stale pending pay re-entry，成功後只形成一筆 paid 結果 ← `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#已付款或付款處理中的訂單不會重複扣款`; `research:付款狀態機與並發`; `openapi:payOrder`
- [x] T011 [US1] [BDD:RED] 接通 owner-session 邊界：非擁有者 session pay 回 404 且狀態不變 ← `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#顧客完成付款並查看付款狀態`; `spec:FR-001`; `spec:FR-011`; `openapi:payOrder`; `openapi:components.schemas.ErrorBody`
  完成條件：Example 因非 owner 仍可讀寫付款狀態而失敗
- [x] T012 [US1] [BDD:GREEN] 實作／維持 owner-session 查詢限制與 `ORDER_NOT_FOUND` ← `spec:FR-011`; `openapi:payOrder`; `openapi:components.schemas.ErrorBody`
- [x] T013 [NON-TDD] 完成 PayOrderRequest 契約對齊：明列相容金額／items 欄位並由伺服器忽略，應付額仍取 order snapshot；未知欄位仍拒絕，已由 payment／integration tests 驗證 ← `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#顧客端提交不同金額不會改變應付金額`; `feature:specs/truth/features/backend/訂單/付款與取消.feature#付款請求金額不會覆寫訂單快照`; `spec:FR-010`; `spec:US1·情境3`; `openapi:components.schemas.PayOrderRequest`; `plan:T002 契約對齊紀錄`
- [x] T014 [US2] [BDD:RED] 接通 Example「付款失敗不寫入 paid 冪等記錄」← `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#付款失敗後以同一訂單再次付款成功`; `feature:specs/truth/features/backend/訂單/付款與取消.feature#付款失敗不寫入 paid 冪等記錄`; `spec:FR-004`; `spec:FR-012`; `openapi:payOrder`
  完成條件：Example 因 failed 仍寫入 paid mapping 或未持久化 failed/reason 而失敗
- [x] T015 [US2] [BDD:GREEN] 實作／維持 failed result、可顯示原因與無 success mapping ← `feature:specs/truth/features/backend/訂單/付款與取消.feature#付款失敗不寫入 paid 冪等記錄`; `spec:FR-004`; `research:模擬金流（stub）`; `dbml:Table payment_idempotency_keys`
- [x] T016 [US2] [BDD:RED] 接通 Example「付款失敗後重試可更新為 paid」← `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#付款失敗後以同一訂單再次付款成功`; `feature:specs/truth/features/backend/訂單/付款與取消.feature#付款失敗後重試可更新為 paid`; `spec:FR-005`; `spec:BR-001`; `openapi:payOrder`
  完成條件：Example 因 failed 重試後 snapshot 被改寫或未轉 paid 而失敗
- [x] T017 [US2] [BDD:GREEN] 實作／維持 failed→pending→paid retry 與快照保護 ← `feature:specs/truth/features/backend/訂單/付款與取消.feature#付款失敗後重試可更新為 paid`; `spec:FR-005`; `research:付款狀態機與並發`
- [x] T018 [US2] [BDD:RED] 接通 Example「已成功付款請求以相同冪等鍵重送」← `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#顧客重送已成功的同一付款請求`; `feature:specs/truth/features/backend/訂單/付款與取消.feature#已成功付款請求以相同冪等鍵重送`; `spec:FR-012`; `dbml:Table payment_idempotency_keys`
  完成條件：Example 因 replay 仍二次扣款或 mapping 不一致而失敗
- [x] T019 [US2] [BDD:GREEN] 實作／維持 successful paid mapping replay ← `feature:specs/truth/features/backend/訂單/付款與取消.feature#已成功付款請求以相同冪等鍵重送`; `spec:FR-012`; `research:付款冪等`; `dbml:Table payment_idempotency_keys`
- [x] T020 [US2] [BDD:RED] 接通 Example「pending 後 5xx 不寫 paid 冪等且同 key 可安全重試」← `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#付款中斷後以相同冪等鍵安全重試`; `feature:specs/truth/features/backend/訂單/付款與取消.feature#pending 後 5xx 不寫 paid 冪等且同 key 可安全重試`; `spec:US2·情境4`; `spec:FR-012`; `plan:設計決策·付款故障注入`; `openapi:payOrder`
  完成條件：未 paid 的 5xx 仍留下 success mapping 或阻止安全 retry 而失敗
- [x] T021 [US2] [BDD:GREEN] 實作／維持未 paid 的 5xx 無成功 mapping 與同 key 安全 retry（`PAYMENT_TEST_ABORT_AFTER_PENDING` 僅測試）← `feature:specs/truth/features/backend/訂單/付款與取消.feature#pending 後 5xx 不寫 paid 冪等且同 key 可安全重試`; `spec:FR-012`; `plan:設計決策·付款故障注入`; `research:付款冪等`

- [x] T022 [US3] [BDD:RED] 接通 Example「尚未接單且未付款的訂單取消後禁止付款及出餐」← `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#顧客取消尚未接單且未付款的訂單`; `feature:specs/truth/features/backend/訂單/付款與取消.feature#尚未接單且未付款的訂單取消後禁止付款及出餐`; `spec:FR-007`; `spec:FR-009`; `openapi:cancelOrder`
  完成條件：Example 因 created unpaid cancel 未保留 snapshot 或後續 pay 未被拒而失敗
- [x] T023 [US3] [BDD:GREEN] 實作／維持 created→cancelled、cancelled_at、unpaid 維持及 snapshot 保留 ← `feature:specs/truth/features/backend/訂單/付款與取消.feature#尚未接單且未付款的訂單取消後禁止付款及出餐`; `spec:FR-007`; `spec:FR-009`; `dbml:Table orders`
- [x] T024 [US3] [BDD:RED] 接通 failed payment 訂單取消時 payment state 保持 failed 之整合測試 ← `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#顧客取消尚未接單且未付款的訂單`; `spec:FR-013`; `openapi:cancelOrder`
  完成條件：cancelled 後 failed payment 被覆寫為 unpaid/paid 而失敗
- [x] T025 [US3] [BDD:GREEN] 實作／維持 cancelled status 不覆寫 failed payment state ← `spec:FR-013`; `dbml:Table orders`
- [x] T026 [US3] [BDD:RED] 接通 Example「已付款但未接單的訂單取消後同步退款」← `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#顧客取消已付款但尚未接單的訂單`; `feature:specs/truth/features/backend/訂單/付款與取消.feature#已付款但未接單的訂單取消後同步退款`; `spec:FR-013`; `spec:BR-003`; `openapi:cancelOrder`
  完成條件：Example 因 paid cancel 未原子 refunded 或 snapshot 被改而失敗
- [x] T027 [US3] [BDD:GREEN] 實作／維持 paid→refunded 與 cancelled transaction，不呼叫真實金流 ← `feature:specs/truth/features/backend/訂單/付款與取消.feature#已付款但未接單的訂單取消後同步退款`; `spec:FR-013`; `research:顧客取消與 pending 競態`; `dbml:Table orders`
- [x] T028 [US3] [BDD:RED] 接通 Example「已進入出餐流程的訂單拒絕顧客取消」← `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#顧客無法取消已進入出餐流程的訂單`; `feature:specs/truth/features/backend/訂單/付款與取消.feature#已進入出餐流程的訂單拒絕顧客取消`; `spec:FR-008`; `openapi:cancelOrder`
  完成條件：Example 因 accepted/preparing/completed 仍可 cancel 而失敗
- [x] T029 [US3] [BDD:GREEN] 實作／維持非 created order 不可取消 ← `feature:specs/truth/features/backend/訂單/付款與取消.feature#已進入出餐流程的訂單拒絕顧客取消`; `spec:FR-008`; `openapi:cancelOrder`
- [x] T030 [US3] [BDD:RED] 接通 Example「非 stale pending 訂單拒絕取消」← `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#付款仍有效處理中時不得取消，過期處理才可安全取消`; `feature:specs/truth/features/backend/訂單/付款與取消.feature#非 stale pending 訂單拒絕取消`; `spec:FR-013`; `openapi:cancelOrder`
  完成條件：fresh pending cancel 仍變更出餐/付款狀態而失敗
- [x] T031 [US3] [BDD:GREEN] 實作／維持 fresh pending cancel refusal ← `feature:specs/truth/features/backend/訂單/付款與取消.feature#非 stale pending 訂單拒絕取消`; `spec:FR-013`; `research:顧客取消與 pending 競態`
- [x] T032 [US3] [BDD:RED] 接通 Example「stale pending 訂單同一交易中止付款並取消」← `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#付款仍有效處理中時不得取消，過期處理才可安全取消`; `feature:specs/truth/features/backend/訂單/付款與取消.feature#stale pending 訂單同一交易中止付款並取消`; `spec:FR-013`; `spec:BR-003`; `openapi:cancelOrder`
  完成條件：Example 因 stale pending 取消未在同一交易 failed+cancelled 而失敗
- [x] T033 [US3] [BDD:GREEN] 實作／維持 atomic stale pending abort then cancel ← `feature:specs/truth/features/backend/訂單/付款與取消.feature#stale pending 訂單同一交易中止付款並取消`; `spec:FR-013`; `research:顧客取消與 pending 競態`; `dbml:Table orders`
- [x] T034 [US3] [BDD:RED] 接通已取消 order 再 cancel 無非預期 mutation 之整合測試 ← `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#顧客取消尚未接單且未付款的訂單`; `spec:FR-007`; `spec:BR-003`; `openapi:cancelOrder`
  完成條件：already-cancelled replay 仍改寫 timestamps 或 payment 而失敗
- [x] T035 [US3] [BDD:GREEN] 實作／維持 already-cancelled guard ← `spec:BR-003`; `openapi:cancelOrder`
- [x] T036 [US3] [BDD:RED] 接通 non-owner session cancel 回 404 之整合測試 ← `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#顧客取消尚未接單且未付款的訂單`; `spec:FR-011`; `openapi:cancelOrder`
  完成條件：非 owner cancel 洩漏訂單存在或改變狀態而失敗
- [x] T037 [US3] [BDD:GREEN] 實作／維持 guest session ownership 與 no disclosure ← `spec:FR-011`; `openapi:components.schemas.ErrorBody`
- [x] T054 [US3] [BDD:RED] 接通 Example「尚未接單且未付款的訂單取消後禁止付款及出餐」之已取消訂單 pay 409 延伸断言 ← `feature:specs/truth/features/backend/訂單/付款與取消.feature#尚未接單且未付款的訂單取消後禁止付款及出餐`; `spec:BR-003`; `openapi:payOrder`
  完成條件：cancelled order pay 仍成功或狀態被改而失敗
- [x] T055 [US3] [BDD:GREEN] 實作／維持已取消訂單付款拒絕 guard ← `spec:BR-003`; `openapi:payOrder`

**Checkpoint**：`backend/訂單/付款與取消.feature` 後端 Example 與列舉整合護欄全綠。

---

## Phase 4: `specs/truth/features/backend/訂單/付款狀態查詢.feature`

**Goal**：顧客 getOrder 反映 persisted payment/outcome labels 與 snapshot；非 owner 不揭露。

**追溯**：acceptance Examples「顧客查詢付款失敗訂單」「顧客查詢已取消訂單」→ `spec:US4`; `spec:FR-015`; `spec:FR-016`

**Read when executing this phase**：`specs/truth/features/backend/訂單/付款狀態查詢.feature`、`specs/truth/features/backend/訂單/dsl.md`。

### 付款狀態查詢.feature 任務

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `traceability.md` | 查詢 acceptance → 後端 Feature | `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#顧客查詢付款失敗訂單`; `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#顧客查詢已取消訂單` | owner session 查詢 |
| `specs/truth/features/backend/訂單/付款狀態查詢.feature` | 失敗／已取消 Example | `feature:specs/truth/features/backend/訂單/付款狀態查詢.feature#顧客查詢付款失敗訂單`; `feature:specs/truth/features/backend/訂單/付款狀態查詢.feature#顧客查詢已取消訂單` | 狀態欄位與 snapshot |
| `specs/truth/contracts/http-api.yaml` | getOrder／Order schema | `openapi:getOrder`; `openapi:components.schemas.Order` | payment/status labels |

- [x] T038 [US4] [BDD:RED] 接通 Examples「顧客查詢付款失敗訂單」「顧客查詢已取消訂單」之 getOrder 狀態欄位與 snapshot ← `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#顧客查詢付款失敗訂單`; `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#顧客查詢已取消訂單`; `feature:specs/truth/features/backend/訂單/付款狀態查詢.feature#顧客查詢付款失敗訂單`; `feature:specs/truth/features/backend/訂單/付款狀態查詢.feature#顧客查詢已取消訂單`; `spec:FR-016`; `openapi:getOrder`
  完成條件：Example 因 failed/cancelled/refunded 標籤或 snapshot 序列化不符 Then 而失敗
- [x] T039 [US4] [BDD:GREEN] 實作／維持 persisted payment/outcome labels 與 snapshot serialization ← `feature:specs/truth/features/backend/訂單/付款狀態查詢.feature#顧客查詢付款失敗訂單`; `spec:FR-015`; `spec:FR-016`; `openapi:components.schemas.Order`
- [x] T040 [US4] [BDD:RED] 接通 non-owner getOrder 不揭露訂單之 session 邊界測試 ← `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#顧客查詢付款失敗訂單`; `spec:FR-011`; `openapi:getOrder`
  完成條件：不同 session 查詢仍回傳可識別訂單內容而失敗
- [x] T041 [US4] [BDD:GREEN] 實作／維持 session-bound 404 behavior ← `spec:FR-011`; `research:延續既有堆疊與訂單持久化`

**Checkpoint**：`backend/訂單/付款狀態查詢.feature` 後端 Example 全綠。

---

## Phase 5: `specs/truth/features/frontend/顧客訂單/付款與取消.feature` 與 `付款狀態查詢.feature`

**Goal**：顧客 UI 反映 Truth Example 之付款、取消與查詢結果（含手動 walkthrough）。

**Read when executing this phase**：`specs/truth/features/frontend/顧客訂單/付款與取消.feature`、`specs/truth/features/frontend/顧客訂單/付款狀態查詢.feature`、`specs/truth/features/frontend/顧客訂單/dsl.md`、`ui/ui-plan.md`。

### 顧客訂單 UI 任務

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `specs/truth/features/frontend/顧客訂單/付款與取消.feature` | 付款成功、取消、pending 取消 Example | `feature:specs/truth/features/frontend/顧客訂單/付款與取消.feature#顧客成功付款後看到已付款狀態`; `feature:specs/truth/features/frontend/顧客訂單/付款與取消.feature#顧客取消尚未付款且未接單的訂單`; `feature:specs/truth/features/frontend/顧客訂單/付款與取消.feature#付款仍處理中時取消遭拒` | UI 狀態與操作 |
| `specs/truth/features/frontend/顧客訂單/付款狀態查詢.feature` | 查詢失敗／已取消 Example | `feature:specs/truth/features/frontend/顧客訂單/付款狀態查詢.feature#顧客查詢付款失敗訂單`; `feature:specs/truth/features/frontend/顧客訂單/付款狀態查詢.feature#顧客查詢已取消訂單` | 查詢頁 labels |
| `ui/ui-plan.md` | 顧客查詢付款狀態 | `ui-plan:§畫面與流程→查詢付款狀態` | walkthrough |

- [x] T042 [US4] [NON-TDD] 手動走查 owner 查詢頁與付款流程：對齊 `frontend/顧客訂單/付款與取消.feature` 與 `frontend/顧客訂單/付款狀態查詢.feature` 之 payment/status labels、取消狀態與 snapshot；屬 UI acceptance walkthrough ← `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#顧客完成付款並查看付款狀態`; `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#顧客查詢付款失敗訂單`; `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#顧客查詢已取消訂單`; `feature:specs/truth/features/frontend/顧客訂單/付款狀態查詢.feature#顧客查詢付款失敗訂單`; `spec:US4`; `ui-plan:§畫面與流程→查詢付款狀態`

**Checkpoint**：顧客付款／查詢 UI walkthrough 與 Truth Example 一致。

---

## Phase 6: `specs/truth/features/backend/店家訂單/付款資訊.feature`

**Goal**：店家列表 payment filter、detail 失敗摘要、auth guard；invalid filter 400。

**追溯**：acceptance「店家依付款狀態篩選訂單」「店家查看付款失敗訂單詳情」「無效店家憑證…」→ `spec:US5`; `spec:FR-017`–`FR-020`

**Read when executing this phase**：`specs/truth/features/backend/店家訂單/付款資訊.feature`、`specs/truth/features/backend/店家訂單/dsl.md`。

### 付款資訊.feature 任務

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `traceability.md` | 店家付款 acceptance → 後端 Feature | `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#店家依付款狀態篩選訂單`; `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#店家查看付款失敗訂單詳情`; `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#無效店家憑證無法讀取付款資訊` | merchant list/detail |
| `specs/truth/features/backend/店家訂單/付款資訊.feature` | 篩選、詳情、auth Example | `feature:specs/truth/features/backend/店家訂單/付款資訊.feature#店家依付款狀態篩選訂單`; `feature:specs/truth/features/backend/店家訂單/付款資訊.feature#店家讀取付款失敗訂單詳情`; `feature:specs/truth/features/backend/店家訂單/付款資訊.feature#無效店家憑證無法讀取付款資訊`; `feature:specs/truth/features/backend/店家訂單/付款資訊.feature#無效店家憑證無法讀取訂單詳情` | payment fields |
| `specs/truth/contracts/http-api.yaml` | listMerchantOrders、getMerchantOrder | `openapi:listMerchantOrders`; `openapi:getMerchantOrder`; `openapi:components.responses.MerchantUnauthorized`; `openapi:components.responses.MerchantNotConfigured` | filter/errors |

- [x] T043 [US5] [BDD:RED] 接通 Example「店家依付款狀態篩選訂單」← `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#店家依付款狀態篩選訂單`; `feature:specs/truth/features/backend/店家訂單/付款資訊.feature#店家依付款狀態篩選訂單`; `spec:FR-017`; `spec:FR-018`; `openapi:listMerchantOrders`
  完成條件：Example 因 payment_status 篩選或 summary 欄位不符 Then 而失敗
- [x] T044 [US5] [BDD:GREEN] 實作／維持 merchant payment filter and response fields ← `feature:specs/truth/features/backend/店家訂單/付款資訊.feature#店家依付款狀態篩選訂單`; `spec:FR-017`; `spec:FR-018`; `openapi:listMerchantOrders`
- [x] T045 [US5] [BDD:RED] 接通 invalid payment filter 回 400 之整合測試 ← `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#店家依付款狀態篩選訂單`; `spec:FR-018`; `openapi:listMerchantOrders`
  完成條件：非法 payment_status query 仍回 200 或回傳錯誤集合而失敗
- [x] T046 [US5] [BDD:GREEN] 實作／維持 `INVALID_PAYMENT_STATUS_FILTER` ← `spec:FR-018`; `openapi:listMerchantOrders`
- [x] T047 [US5] [BDD:RED] 接通 Example「店家讀取付款失敗訂單詳情」← `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#店家查看付款失敗訂單詳情`; `feature:specs/truth/features/backend/店家訂單/付款資訊.feature#店家讀取付款失敗訂單詳情`; `spec:FR-017`; `openapi:getMerchantOrder`
  完成條件：Example 因 detail 缺 failure reason 或改寫 snapshot 而失敗
- [x] T048 [US5] [BDD:GREEN] 實作／維持 contract-supported payment details without altering snapshot ← `feature:specs/truth/features/backend/店家訂單/付款資訊.feature#店家讀取付款失敗訂單詳情`; `spec:FR-017`; `openapi:getMerchantOrder`
- [x] T051 [US5] [BDD:RED] 接通 Examples「無效店家憑證無法讀取付款資訊」「無效店家憑證無法讀取訂單詳情」及 missing/invalid token 401、未配置 503 ← `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#無效店家憑證無法讀取付款資訊`; `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#無效店家憑證無法讀取訂單詳情`; `feature:specs/truth/features/backend/店家訂單/付款資訊.feature#無效店家憑證無法讀取付款資訊`; `feature:specs/truth/features/backend/店家訂單/付款資訊.feature#無效店家憑證無法讀取訂單詳情`; `spec:FR-020`; `openapi:components.responses.MerchantUnauthorized`; `openapi:components.responses.MerchantNotConfigured`
  完成條件：未授權仍回傳訂單 payload 或 503/401 mapping 錯誤而失敗
- [x] T052 [US5] [BDD:GREEN] 實作／維持 merchant authentication/configuration guards ← `spec:FR-020`; `research:顧客店家-api-擴充`

**Checkpoint**：`backend/店家訂單/付款資訊.feature` 後端 Example 全綠。

---

## Phase 7: `specs/truth/features/backend/店家訂單/取消訂單護欄.feature`

**Goal**：cancelled 訂單拒絕 accept/start/complete；狀態不變。

**追溯**：acceptance「店家不能接單/推進/完成已取消訂單」→ `spec:FR-019`; `spec:BR-003`

**Read when executing this phase**：`specs/truth/features/backend/店家訂單/取消訂單護欄.feature`、004 merchant action contracts。

### 取消訂單護欄.feature 任務

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `traceability.md` | 取消護欄 acceptance → 後端 Feature | `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#店家不能接單已取消訂單`; `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#店家不能推進已取消訂單`; `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#店家不能完成已取消訂單` | 409 guards |
| `specs/truth/features/backend/店家訂單/取消訂單護欄.feature` | 接單／狀態／完成 Example | `feature:specs/truth/features/backend/店家訂單/取消訂單護欄.feature#店家不能接單已取消訂單`; `feature:specs/truth/features/backend/店家訂單/取消訂單護欄.feature#店家不能推進已取消訂單`; `feature:specs/truth/features/backend/店家訂單/取消訂單護欄.feature#店家不能完成已取消訂單` | 權威狀態不變 |
| `specs/truth/contracts/http-api.yaml` | 004 merchant actions | `004-openapi:acceptMerchantOrder`; `004-openapi:startPreparingMerchantOrder`; `004-openapi:completeMerchantOrder` | cancelled action guard |

- [x] T049 [US5] [BDD:RED] 接通 Examples「店家不能接單已取消訂單」「店家不能推進已取消訂單」「店家不能完成已取消訂單」← `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#店家不能接單已取消訂單`; `feature:specs/truth/features/backend/店家訂單/取消訂單護欄.feature#店家不能接單已取消訂單`; `feature:specs/truth/features/backend/店家訂單/取消訂單護欄.feature#店家不能推進已取消訂單`; `feature:specs/truth/features/backend/店家訂單/取消訂單護欄.feature#店家不能完成已取消訂單`; `spec:FR-019`; `004-openapi:acceptMerchantOrder`
  完成條件：cancelled order 仍被 accept/start/complete 改寫而失敗
- [x] T050 [US5] [BDD:GREEN] 實作／維持所有 merchant transition 拒絕 cancelled order ← `feature:specs/truth/features/backend/店家訂單/取消訂單護欄.feature#店家不能接單已取消訂單`; `spec:BR-003`; `004-openapi:startPreparingMerchantOrder`; `004-openapi:completeMerchantOrder`

**Checkpoint**：`backend/店家訂單/取消訂單護欄.feature` 後端 Example 全綠。

---

## Phase 8: `specs/truth/features/frontend/店家訂單/付款資訊.feature` 與 `取消訂單護欄.feature`

**Goal**：店家看板 payment badge/filter、失敗詳情、cancelled 隱藏出餐操作。

**Read when executing this phase**：`specs/truth/features/frontend/店家訂單/付款資訊.feature`、`specs/truth/features/frontend/店家訂單/取消訂單護欄.feature`、`ui/ui-plan.md`。

### 店家訂單 UI 任務

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `specs/truth/features/frontend/店家訂單/付款資訊.feature` | 列表、詳情、auth Example | `feature:specs/truth/features/frontend/店家訂單/付款資訊.feature#店家依付款狀態篩選訂單`; `feature:specs/truth/features/frontend/店家訂單/付款資訊.feature#店家查看付款失敗訂單詳情`; `feature:specs/truth/features/frontend/店家訂單/付款資訊.feature#無效店家憑證無法讀取付款資訊` | merchant UI |
| `specs/truth/features/frontend/店家訂單/取消訂單護欄.feature` | 看板拒絕操作 Example | `feature:specs/truth/features/frontend/店家訂單/取消訂單護欄.feature#店家不能接單已取消訂單`; `feature:specs/truth/features/frontend/店家訂單/取消訂單護欄.feature#店家不能推進已取消訂單`; `feature:specs/truth/features/frontend/店家訂單/取消訂單護欄.feature#店家不能完成已取消訂單` | cancelled guard UI |
| `ui/ui-plan.md` | 店家付款篩選／詳情／已取消不可接單 | `ui-plan:§畫面與流程→店家付款篩選`; `ui-plan:§畫面與流程→店家詳情付款資訊`; `ui-plan:§畫面與流程→已取消不可接單` | walkthrough |

- [x] T053 [US5] [NON-TDD] 手動走查 merchant payment badge/filter、失敗詳情及 cancelled 隱藏出餐操作；對齊 `frontend/店家訂單/*` Truth Example；屬 UI acceptance walkthrough ← `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#店家依付款狀態篩選訂單`; `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#店家不能接單已取消訂單`; `feature:specs/truth/features/frontend/店家訂單/付款資訊.feature#店家依付款狀態篩選訂單`; `spec:US5`; `ui-plan:§畫面與流程→店家付款篩選`

**Checkpoint**：店家 UI walkthrough 與 Truth Example 一致。

---

## Phase 9: PayOrder body allowlist（`spec:FR-006`）

**Purpose**：補強付款請求不可信欄位回歸；route allowlist 已存在，本 Phase 僅補測試。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `spec.md` | FR-006 付款請求拒絕不可信欄位 | `spec:FR-006` | 幣別與訂單識別以伺服器契約／路徑為準 |
| `specs/truth/contracts/http-api.yaml` | payOrder、PayOrderRequest allowlist | `openapi:payOrder`; `openapi:components.schemas.PayOrderRequest` | 僅接受 schema 明列欄位 |

- [x] T056 [US2] [NON-TDD] 在 `backend/src/__tests__/orders/payment-pay.test.js` 補上未知 `currency`／替代訂單識別欄位的參數化回歸測試，並驗證回 400、付款服務未執行且訂單狀態／快照不變；付款 route 已有 allowlist，因此本任務僅補測試、不預期修改產品行為 ← `acceptance:features/acceptance/付款取消與狀態查詢總驗收旅程.feature#顧客端提交不同金額不會改變應付金額`; `spec:FR-006`; `openapi:payOrder`; `openapi:components.schemas.PayOrderRequest`

**Checkpoint**：TP-027 對應 FR-006 回歸已驗證（見 Retroactive note）。

---

## Phase 10: NFR 重構

**Purpose**：檢視本 scope 是否另有專屬 NFR 任務；若無，確認金額權威、付款狀態一致與敏感錯誤呈現已由 Feature Example 覆蓋。

**Read when executing this phase**：`spec.md`（SC）、`traceability.md`（Coverage Summary）。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `traceability.md` | Coverage Summary | `traceability.md` | 18 acceptance Examples 全 assigned |
| `spec.md` | SC 與付款／取消成果 | `spec:SC-005`; `spec:SC-006` | 可衡量成果 |

- [x] T057 [NON-TDD] 核對：本迭代 spec 無專屬 NFR ID；金額快照、付款狀態機與錯誤摘要已由介面 Feature Example 與 walkthrough 覆蓋，無額外跨 Feature NFR 重構任務 ← `traceability.md`; `spec:SC-005`; `scenario-index.md`

**Checkpoint**：已檢視 NFR／SC；無額外 NFR 任務。

---

## Dependencies & Execution Order

- 每個 `[BDD:RED]` 必須先驗證預期失敗，再執行同 Example 的 `[BDD:GREEN]`；`[BDD:REFACTOR]` 未列表示無需重構。
- **TP-010**／T020–T021：故障注入 seam 已列於 `plan.md`；整合測試與 Truth Example 為 BDD 驗收錨點。
- PayOrderRequest 相容欄位政策已由 T013 完成；**TP-027** 已由 T056 驗證。
- Setup/Foundation、migration 核對、UI manual walkthrough 等非行為工作為 `[NON-TDD]`。
- `[x]` 沿用歷史完成狀態；回溯 BDD 標籤不宣稱歷史 RED→GREEN 時序。

## Format Validation

- Phase 1 必讀含 **`truth-delta.md` 全文**；Phase 3+ 標題為 **`specs/truth/features/…`**；`feature:`／`dsl:` 錨點使用 `specs/truth/features/…`。
- 每個 `####` 小節（含 Setup／Foundational）必有 **必讀對照** 四欄表格。
- 每個 `- [x] Tnnn` 行尾必有 **`←`** 與至少一個機器錨點（行為 task **不得** 使用 `testplan:TP-*`）。
- Phase 3 起以介面 Feature 檔為單位；行為任務帶 `[USn]`；依端點分前端／後端小節。
- 全部 Feature File Phase 之後有 **NFR 重構** Phase；Checkpoint 註明覆蓋狀態。
- 同一 Example 的 RED→GREEN 順序可由 T 編號判定。
- 每個 RED 任務下方有「完成條件：…」；GREEN 不需此行。
- 同一份 tasks 不混用 BDD 與 legacy `[TDD:*]` 行為標籤。

Constitution self-check: pass — TP-010 seam 已列入 `plan.md`／Truth；`smoke:mssql:005` 依 `plan.md`「MSSQL smoke（環境門控）」與 CI 執行，本機未設 `MSSQL_*` 時 skip 不視為計畫缺陷。
