# Tasks: 點餐系統第五迭代－付款與取消訂單

**Feature directory**：`specs/005-payment-order-cancellation/`

**Retroactive mapping note**：既有行為 tasks 保留完成狀態，單步 RED／GREEN 標籤僅作回溯追溯，不證明歷史 TDD 時序。TP-006 已完成；TP-010 的既有測試入口未列於 system-analysis，舊 T020／T021 不作為目前計畫核准驗收。新增 TP-027 尚待測試與驗證。

**Spec 套件索引**（按需 READ）：

| 文件 | 用途 |
|---|---|
| `spec.md` | US1–US5、FR／BR／SC、付款及取消規則 |
| `testplan.md` | TP-001–TP-026 測試基線 |
| `research.md`、`techstack.md` | stub、payment state、冪等與 pending timeout |
| `plan.md` | endpoint inventory、T002 contract alignment |
| `ui-plan.md`、`prototype/` | 顧客付款／取消、店家 payment filter |
| `data-model.dbml` | payment 欄位與 `payment_idempotency_keys` |
| `contracts/http-api.yaml` | pay/cancel/customer query/merchant query；004 action contracts |

## Phase 1: Setup

**Purpose**：核對 004／003 前置、payment stub 與 memory DB 測試入口；不新增產品行為。

**Read when executing this phase**：`research.md`、`techstack.md`、`plan.md`、`testplan.md`。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | 執行環境、TP-025 | `testplan:TP-025` | memory DB、migration／CI commands |
| `techstack.md` | 005 前置及 payment stub | `techstack:API 後端`; `techstack:資料庫`; `techstack:模擬金流` | 既有 stack 與 deterministic stub |
| `plan.md` | T002 contract alignment | `plan:T002 契約對齊紀錄` | 005/003/004 API compatibility |

- [x] T001 [NON-TDD] 核對 004 order state、003 session/CSRF、005 memory DB/payment stub 測試入口；此為已完成前置環境確認 ← `testplan:TP-025`; `plan:T002 契約對齊紀錄`; `techstack:API 後端`; `techstack:資料庫`

## Phase 2: Foundational

**Purpose**：保留 payment schema、status mapping、stub 與路由基礎。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `data-model.dbml` | orders payment fields、payment_idempotency_keys | `dbml:Table orders`; `dbml:Table payment_idempotency_keys` | status persistence／successful mapping |
| `contracts/http-api.yaml` | Order／PaymentStatus／ErrorBody | `openapi:components.schemas.Order`; `openapi:components.schemas.PaymentStatus`; `openapi:components.schemas.ErrorBody` | response field and errors |
| `research.md` | stub、state machine、idempotency、pending cancellation | `research:模擬金流（stub）`; `research:付款狀態機與並發`; `research:付款冪等`; `research:顧客取消與 pending 競態` | transitions and atomic operations |

- [x] T002 [NON-TDD] 核對已完成 migration、memory DB、payment status/stub、payment idempotency repository 與 order route wiring；不新增產品行為 ← `testplan:TP-009`; `testplan:TP-013`; `dbml:Table orders`; `dbml:Table payment_idempotency_keys`; `plan:端點盤點`

---

## Phase 3: User Story 1－顧客對訂單發起付款（P1）

#### Backend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | TP-001–TP-006 | `testplan:TP-001`; `testplan:TP-002`; `testplan:TP-003`; `testplan:TP-004`; `testplan:TP-005`; `testplan:TP-006` | pay success/conflicts/session/amount policy |
| `contracts/http-api.yaml` | payOrder、PayOrderRequest、PaymentStatus | `openapi:payOrder`; `openapi:components.schemas.PayOrderRequest`; `openapi:components.schemas.PaymentStatus` | pay response/errors/body schema |
| `data-model.dbml` | orders payment fields | `dbml:Table orders` | snapshot and payment timestamps |

- [x] T003 [US1] [TDD:RED] 為 TP-001 unpaid order 成功付款且 snapshot 金額不變建立測試 ← `testplan:TP-001`; `spec:FR-001`; `spec:FR-002`; `spec:FR-010`; `openapi:payOrder`
- [x] T004 [US1] [TDD:GREEN] 實作／維持 TP-001 以 persisted total snapshot 付款並記錄 paid_at ← `testplan:TP-001`; `spec:BR-001`; `dbml:Table orders`; `openapi:payOrder`
- [x] T005 [US1] [TDD:RED] 為 TP-002 已付款訂單重複 pay 回 409 建立測試 ← `testplan:TP-002`; `spec:FR-003`; `openapi:payOrder`
- [x] T006 [US1] [TDD:GREEN] 實作／維持 TP-002 `ORDER_ALREADY_PAID` guard ← `testplan:TP-002`; `spec:FR-003`; `openapi:payOrder`
- [x] T007 [US1] [TDD:RED] 為 TP-003 fresh pending 重複 pay 回 409 建立測試 ← `testplan:TP-003`; `spec:FR-003`; `openapi:payOrder`
- [x] T008 [US1] [TDD:GREEN] 實作／維持 TP-003 `PAYMENT_IN_PROGRESS` 與 pending 不變 ← `testplan:TP-003`; `spec:FR-003`; `research:付款狀態機與並發`; `openapi:payOrder`
- [x] T009 [US1] [TDD:RED] 為 TP-004 stale pending 可重入 stub 建立測試 ← `testplan:TP-004`; `spec:FR-003`; `plan:設計決策·付款 pending 逾時`; `openapi:payOrder`
- [x] T010 [US1] [TDD:GREEN] 實作／維持 TP-004 stale pending pay re-entry，成功後只形成一筆 paid 結果 ← `testplan:TP-004`; `research:付款狀態機與並發`; `openapi:payOrder`
- [x] T011 [US1] [TDD:RED] 為 TP-005 non-owner session pay 回 404 且狀態不變建立測試 ← `testplan:TP-005`; `spec:FR-001`; `spec:FR-011`; `openapi:payOrder`
- [x] T012 [US1] [TDD:GREEN] 實作／維持 TP-005 owner-session 查詢限制與 `ORDER_NOT_FOUND` ← `testplan:TP-005`; `spec:FR-011`; `openapi:payOrder`; `openapi:components.schemas.ErrorBody`
- [x] T013 [NON-TDD] 完成 TP-006 契約對齊：明列相容金額／items 欄位並由伺服器忽略，應付額仍取 order snapshot；未知欄位仍拒絕，已由 payment／integration tests 驗證 ← `testplan:TP-006`; `spec:FR-010`; `spec:US1·情境3`; `openapi:components.schemas.PayOrderRequest`; `plan:T002 契約對齊紀錄`

---

## Phase 4: User Story 2－付款失敗與重試（P1）

#### Backend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | TP-007–TP-010、TP-027 | `testplan:TP-007`; `testplan:TP-008`; `testplan:TP-009`; `testplan:TP-010`; `testplan:TP-027` | failure/retry/idempotency；TP-027 unknown pay body fields |
| `research.md` | stub、付款冪等 | `research:模擬金流（stub）`; `research:付款冪等` | failure reason and only-paid mapping |
| `data-model.dbml` | payment idempotency rows | `dbml:Table payment_idempotency_keys` | one successful mapping |

- [x] T014 [US2] [TDD:RED] 為 TP-007 stub failure 持久化 failed/reason 且不寫 paid mapping 建立測試 ← `testplan:TP-007`; `spec:FR-004`; `spec:FR-012`; `openapi:payOrder`
- [x] T015 [US2] [TDD:GREEN] 實作／維持 TP-007 failed result、可顯示原因與無 success mapping ← `testplan:TP-007`; `spec:FR-004`; `research:模擬金流（stub）`; `dbml:Table payment_idempotency_keys`
- [x] T016 [US2] [TDD:RED] 為 TP-008 failed order retry 後轉 paid 且 snapshot 不變建立測試 ← `testplan:TP-008`; `spec:FR-005`; `spec:BR-001`; `openapi:payOrder`
- [x] T017 [US2] [TDD:GREEN] 實作／維持 TP-008 failed→pending→paid retry 與快照保護 ← `testplan:TP-008`; `spec:FR-005`; `research:付款狀態機與並發`
- [x] T018 [US2] [TDD:RED] 為 TP-009 paid Idempotency-Key replay 只留一 mapping 建立測試 ← `testplan:TP-009`; `spec:FR-012`; `dbml:Table payment_idempotency_keys`
- [x] T019 [US2] [TDD:GREEN] 實作／維持 TP-009 successful paid mapping replay ← `testplan:TP-009`; `spec:FR-012`; `research:付款冪等`; `dbml:Table payment_idempotency_keys`
- [x] T020 [US2] [TDD:RED] 為 TP-010 pending 後 5xx 不寫 mapping、同 key 可重試建立測試 ← `testplan:TP-010`; `spec:US2·情境4`; `spec:FR-012`; `openapi:payOrder`
- [x] T021 [US2] [TDD:GREEN] 實作／維持 TP-010 未 paid 的 5xx rollback／無成功 mapping 與安全 retry ← `testplan:TP-010`; `spec:FR-012`; `research:付款冪等`

> TP-010 的 T020／T021 為既有歷史紀錄；目前 testplan 指出 fault-injection seam 未列於 system-analysis。不得將這些紀錄視為已核准驗收或在來源補齊前重跑此案例。

---

## Phase 5: User Story 3－顧客取消訂單（P1）

#### Backend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | TP-011–TP-018 | `testplan:TP-011`; `testplan:TP-012`; `testplan:TP-013`; `testplan:TP-014`; `testplan:TP-015`; `testplan:TP-016`; `testplan:TP-017`; `testplan:TP-018` | cancel, refund, pending, ownership |
| `contracts/http-api.yaml` | `cancelOrder`、pay-after-cancel errors | `openapi:cancelOrder`; `openapi:payOrder` | state/transition response |
| `data-model.dbml` | order cancellation/payment state fields | `dbml:Table orders` | atomicity/timestamps |

- [x] T022 [US3] [TDD:RED] 為 TP-011 created unpaid cancel 成功且 snapshot 保留建立測試 ← `testplan:TP-011`; `spec:FR-007`; `spec:FR-009`; `openapi:cancelOrder`
- [x] T023 [US3] [TDD:GREEN] 實作／維持 TP-011 created→cancelled、cancelled_at、unpaid 維持及 snapshot 保留 ← `testplan:TP-011`; `spec:FR-007`; `spec:FR-009`; `dbml:Table orders`
- [x] T024 [US3] [TDD:RED] 為 TP-012 failed payment cancel 保持 failed 建立測試 ← `testplan:TP-012`; `spec:FR-013`; `openapi:cancelOrder`
- [x] T025 [US3] [TDD:GREEN] 實作／維持 TP-012 cancelled status 不覆寫 failed payment state ← `testplan:TP-012`; `spec:FR-013`; `dbml:Table orders`
- [x] T026 [US3] [TDD:RED] 為 TP-013 paid cancel 退款及 refunded_at 原子更新建立測試 ← `testplan:TP-013`; `spec:FR-013`; `spec:BR-003`; `openapi:cancelOrder`
- [x] T027 [US3] [TDD:GREEN] 實作／維持 TP-013 paid→refunded 與 cancelled transaction，不呼叫真實金流 ← `testplan:TP-013`; `spec:FR-013`; `research:顧客取消與 pending 競態`; `dbml:Table orders`
- [x] T028 [US3] [TDD:RED] 為 TP-014 accepted order cancel 回 409 建立測試 ← `testplan:TP-014`; `spec:FR-008`; `openapi:cancelOrder`
- [x] T029 [US3] [TDD:GREEN] 實作／維持 TP-014 非 created order 不可取消 ← `testplan:TP-014`; `spec:FR-008`; `openapi:cancelOrder`
- [x] T030 [US3] [TDD:RED] 為 TP-015 fresh pending cancel 回 PAYMENT_IN_PROGRESS 建立測試 ← `testplan:TP-015`; `spec:FR-013`; `openapi:cancelOrder`
- [x] T031 [US3] [TDD:GREEN] 實作／維持 TP-015 fresh pending cancel refusal ← `testplan:TP-015`; `spec:FR-013`; `research:顧客取消與 pending 競態`
- [x] T032 [US3] [TDD:RED] 為 TP-016 stale pending 同交易轉 failed+cancelled 建立測試 ← `testplan:TP-016`; `spec:FR-013`; `spec:BR-003`; `openapi:cancelOrder`
- [x] T033 [US3] [TDD:GREEN] 實作／維持 TP-016 atomic stale pending abort then cancel ← `testplan:TP-016`; `spec:FR-013`; `research:顧客取消與 pending 競態`; `dbml:Table orders`
- [x] T034 [US3] [TDD:RED] 為 TP-017 已取消 order 再 cancel no unintended mutation 建立測試 ← `testplan:TP-017`; `spec:FR-007`; `spec:BR-003`; `openapi:cancelOrder`
- [x] T035 [US3] [TDD:GREEN] 實作／維持 TP-017 already-cancelled guard ← `testplan:TP-017`; `spec:BR-003`; `openapi:cancelOrder`
- [x] T036 [US3] [TDD:RED] 為 TP-018 non-owner session cancel 回 404 建立測試 ← `testplan:TP-018`; `spec:FR-011`; `openapi:cancelOrder`
- [x] T037 [US3] [TDD:GREEN] 實作／維持 TP-018 guest session ownership 與 no disclosure ← `testplan:TP-018`; `spec:FR-011`; `openapi:components.schemas.ErrorBody`

---

## Phase 6: User Story 4－顧客查詢付款與取消狀態（P1）

#### Backend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | TP-019–TP-020 | `testplan:TP-019`; `testplan:TP-020` | state fields／owner boundary |
| `contracts/http-api.yaml` | getOrder／Order schema | `openapi:getOrder`; `openapi:components.schemas.Order` | payment/status labels and snapshot |

- [x] T038 [US4] [TDD:RED] 為 TP-019 getOrder paid/failed/cancelled/refunded 狀態欄位與 snapshot 建立測試 ← `testplan:TP-019`; `spec:FR-016`; `openapi:getOrder`
- [x] T039 [US4] [TDD:GREEN] 實作／維持 TP-019 persisted payment/outcome labels 與 snapshot serialization ← `testplan:TP-019`; `spec:FR-015`; `spec:FR-016`; `openapi:components.schemas.Order`
- [x] T040 [US4] [TDD:RED] 為 TP-020 non-owner query 不揭露訂單建立測試 ← `testplan:TP-020`; `spec:FR-011`; `openapi:getOrder`
- [x] T041 [US4] [TDD:GREEN] 實作／維持 TP-020 session-bound 404 behavior ← `testplan:TP-020`; `spec:FR-011`; `research:延續既有堆疊與訂單持久化`

#### Frontend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | US4 query result | `testplan:TP-019` | payment/status labels |
| `ui-plan.md` | 顧客查詢付款狀態 | `ui-plan:§畫面與流程→查詢付款狀態` | 顧客顯示 |

- [x] T042 [US4] [NON-TDD] 手動走查 owner 查詢頁顯示 payment/status labels、取消狀態與 snapshot；屬 UI acceptance walkthrough ← `testplan:TP-019`; `spec:US4`; `ui-plan:§畫面與流程→查詢付款狀態`

---

## Phase 7: User Story 5－店家檢視付款與取消資訊（P1）

#### Backend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | TP-021–TP-025 | `testplan:TP-021`; `testplan:TP-022`; `testplan:TP-023`; `testplan:TP-024`; `testplan:TP-025` | merchant list/detail/guard |
| `contracts/http-api.yaml` | merchant list/detail/pay fields | `openapi:listMerchantOrders`; `openapi:getMerchantOrder` | payment filter/detail |
| 004 `contracts/http-api.yaml` | merchant actions | `004-openapi:acceptMerchantOrder`; `004-openapi:startPreparingMerchantOrder`; `004-openapi:completeMerchantOrder` | cancelled action guard |

- [x] T043 [US5] [TDD:RED] 為 TP-021 payment_status=paid list filter 與 payment summary 建立測試 ← `testplan:TP-021`; `spec:FR-017`; `spec:FR-018`; `openapi:listMerchantOrders`
- [x] T044 [US5] [TDD:GREEN] 實作／維持 TP-021 merchant payment filter and response fields ← `testplan:TP-021`; `spec:FR-017`; `spec:FR-018`; `openapi:listMerchantOrders`
- [x] T045 [US5] [TDD:RED] 為 TP-022 invalid payment filter 回 400 建立測試 ← `testplan:TP-022`; `spec:FR-018`; `openapi:listMerchantOrders`
- [x] T046 [US5] [TDD:GREEN] 實作／維持 TP-022 `INVALID_PAYMENT_STATUS_FILTER` ← `testplan:TP-022`; `spec:FR-018`; `openapi:listMerchantOrders`
- [x] T047 [US5] [TDD:RED] 為 TP-023 merchant detail payment failure reason／snapshot 建立測試 ← `testplan:TP-023`; `spec:FR-017`; `openapi:getMerchantOrder`
- [x] T048 [US5] [TDD:GREEN] 實作／維持 TP-023 contract-supported payment details without altering snapshot ← `testplan:TP-023`; `spec:FR-017`; `openapi:getMerchantOrder`
- [x] T049 [US5] [TDD:RED] 為 TP-024 cancelled order 的 accept/start/complete 各回 409 建立測試 ← `testplan:TP-024`; `spec:FR-019`; `004-openapi:acceptMerchantOrder`; `004-openapi:startPreparingMerchantOrder`; `004-openapi:completeMerchantOrder`
- [x] T050 [US5] [TDD:GREEN] 實作／維持 TP-024 所有 merchant transition 拒絕 cancelled order ← `testplan:TP-024`; `spec:BR-003`; `004-openapi:acceptMerchantOrder`; `004-openapi:startPreparingMerchantOrder`; `004-openapi:completeMerchantOrder`
- [x] T051 [US5] [TDD:RED] 為 TP-025 missing／invalid token 401、未配置 token 503 建立測試 ← `testplan:TP-025`; `spec:FR-020`; `openapi:components.responses.MerchantUnauthorized`; `openapi:components.responses.MerchantNotConfigured`
- [x] T052 [US5] [TDD:GREEN] 實作／維持 TP-025 merchant authentication/configuration guards ← `testplan:TP-025`; `spec:FR-020`; `research:顧客店家-api-擴充`

#### Frontend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | TP-021、TP-023–TP-024 UI view | `testplan:TP-021`; `testplan:TP-023`; `testplan:TP-024` | payment badge/filter, details, cancelled guard |
| `ui-plan.md` | 店家付款篩選／詳情／已取消不可接單 | `ui-plan:§畫面與流程→店家付款篩選`; `ui-plan:§畫面與流程→店家詳情付款資訊`; `ui-plan:§畫面與流程→已取消不可接單` | merchant UI states |

- [x] T053 [US5] [NON-TDD] 手動走查 merchant payment badge/filter、失敗詳情及 cancelled 隱藏出餐操作；屬 UI acceptance walkthrough ← `testplan:TP-021`; `testplan:TP-023`; `testplan:TP-024`; `spec:US5`; `ui-plan:§畫面與流程→店家付款篩選`; `ui-plan:§畫面與流程→店家詳情付款資訊`; `ui-plan:§畫面與流程→已取消不可接單`

## US3 Additional TDD Slice: TP-026 cancelled order pay guard

#### Backend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | TP-026 已取消訂單不可付款 | `testplan:TP-026` | 409 `ORDER_CANCELLED` |
| `contracts/http-api.yaml` | payOrder cancelled response | `openapi:payOrder`; `openapi:components.schemas.ErrorBody` | 不可付款狀態 |

- [x] T054 [US3] [TDD:RED] 為 TP-026 cancelled order pay 回 409 `ORDER_CANCELLED` 且狀態不變建立測試 ← `testplan:TP-026`; `spec:BR-003`; `openapi:payOrder`
- [x] T055 [US3] [TDD:GREEN] 實作／維持 TP-026 已取消訂單付款拒絕 guard ← `testplan:TP-026`; `spec:BR-003`; `openapi:payOrder`

## US2 Additional Verification: TP-027 payment body allowlist

#### Backend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | US2 TP-027 不可信幣別／訂單識別欄位 | `testplan:TP-027` | 未定義 body 欄位回 400 且訂單狀態／快照不變 |
| `spec.md` | FR-006 付款請求拒絕不可信欄位 | `spec:FR-006` | 幣別與訂單識別以伺服器契約／路徑為準 |
| `contracts/http-api.yaml` | `payOrder`、`PayOrderRequest` allowlist | `openapi:payOrder`; `openapi:components.schemas.PayOrderRequest` | 僅接受 schema 明列欄位 |

- [x] T056 [US2] [NON-TDD] 在 `backend/src/__tests__/orders/payment-pay.test.js` 補上未知 `currency`／替代訂單識別欄位的參數化回歸測試，並驗證回 400、付款服務未執行且訂單狀態／快照不變；付款 route 已有 allowlist，因此本任務僅補測試、不預期修改產品行為 ← `testplan:TP-027`; `spec:FR-006`; `openapi:payOrder`; `openapi:components.schemas.PayOrderRequest`

## Dependencies & Execution Order

- 每個 RED 必須先驗證預期失敗，再執行同 TP 的 GREEN；REFACTOR 未列表示無需重構。
- TP-010 暫停至 plan／API analysis 指定故障注入 seam；T056 僅補 TP-027 的回歸覆蓋，不改變產品行為。
- TP-006 對應 T013 已完成：PayOrderRequest 明列相容金額／items 欄位並忽略，僅使用 server snapshot。
- Setup/Foundation、migration 核對、UI manual walkthrough 等非行為工作為 `[NON-TDD]`。
- `[x]` 沿用歷史完成狀態；回溯標籤不宣稱歷史 TDD 時序。

## Format Validation

- 每個 testplan TP 至少被一項 task 行尾 `testplan:TP-xxx` 引用。
- 行為 task 恰有一個 TDD step marker；非行為 task 使用 `[NON-TDD]` 並說明原因。
- 每個有任務端點小節均有四欄 Binding，所有表列由任務錨點引用。

Constitution self-check: exceptions — TP-010 故障注入 seam 未列入 system-analysis；real MSSQL migration／prior-data preservation smoke 仍因沒有隔離 SQL Server 測試目標而未驗證。
