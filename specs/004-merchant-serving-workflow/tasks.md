# Tasks: 點餐系統第四迭代－店家管理與出餐流程

**Feature directory**：`specs/004-merchant-serving-workflow/`

**Retroactive mapping note**：原行為任務均已完成。本次保留既有完成狀態，依 `testplan.md` 回溯分類 RED／GREEN／REFACTOR；標籤不證明歷史執行時序。TP-015 action body contract 已對齊，T032 已完成並有 snapshot／unknown-field 測試證據。

**Spec 套件索引**（按需 READ）：

| 文件 | 用途 |
|---|---|
| `spec.md` | US1–US4、FR／BR／SC 狀態機與驗收 |
| `testplan.md` | TP-001–TP-017 案例、fixture 與 Assert |
| `research.md`、`techstack.md` | token、狀態機、條件 UPDATE、test runner |
| `plan.md` | endpoint inventory 與 analysis Wave |
| `ui-plan.md`、`prototype/` | merchant board 與顧客查詢狀態 |
| `data-model.dbml` | orders.status、status_updated_at、snapshot |
| `contracts/http-api.yaml` | 004 merchant endpoints；003 getOrder extension |

## Phase 1: Setup

**Purpose**：核對 003 前置、merchant token 與 memory DB test harness；不改產品行為。

**Read when executing this phase**：`research.md`、`techstack.md`、`plan.md`、`testplan.md`。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | environment、TP-001／TP-013 | `testplan:TP-001`; `testplan:TP-013` | test runner 與 concurrency seam |
| `techstack.md` | 004 前置與 Node/MSSQL constraints | `techstack:API 後端`; `techstack:資料庫` | 沿用既有 stack |
| `plan.md` | 設計決策、T002 contract alignment | `plan:端點盤點`; `plan:T002 契約對齊紀錄` | contract source of truth |

- [x] T001 [NON-TDD] 核對既有 003 order repository、memory DB、merchant test token 與 `USE_MEMORY_DB=1 npm test` 入口；僅為前置環境整理 ← `testplan:TP-001`; `testplan:TP-013`; `techstack:API 後端`; `plan:端點盤點`
- [x] T002 [NON-TDD] 核對 004／003 contracts、`orders.status` 與 `status_updated_at` 一致；保留既有 T002 alignment record ← `testplan:TP-001`; `plan:T002 契約對齊紀錄`; `openapi:components.schemas.OrderStatus`; `dbml:Table orders`

## Phase 2: Foundational

**Purpose**：保留 migration、狀態映射、merchant auth 與共用 repository/API 基礎。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `data-model.dbml` | orders/status fields | `dbml:Table orders` | status timestamp 與 snapshot |
| `contracts/http-api.yaml` | merchant auth／status operations | `openapi:components.schemas.ErrorBody`; `openapi:components.responses.OrderStatusConflict` | 401／409 response |
| `research.md` | token／狀態機／並發 | `research:店家憑證驗證`; `research:訂單狀態機與並發安全` | token guard、conditional update |

- [x] T003 [NON-TDD] 核對已完成的 migration、memory DB、status mapping、merchantAuth 與 routes wiring；既有基礎狀態摘要，不新增行為 ← `testplan:TP-001`; `testplan:TP-007`; `dbml:Table orders`; `research:訂單狀態機與並發安全`

---

## Phase 3: User Story 1－店家檢視訂單佇列與明細（P1）

#### Backend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | TP-001–TP-006 | `testplan:TP-001`; `testplan:TP-002`; `testplan:TP-003`; `testplan:TP-004`; `testplan:TP-005`; `testplan:TP-006` | list cap/order/filter, detail, auth |
| `contracts/http-api.yaml` | list/detail operations | `openapi:listMerchantOrders`; `openapi:getMerchantOrder`; `openapi:components.responses.MerchantUnauthorized`; `openapi:components.responses.MerchantNotConfigured` | response/status/errors |
| `data-model.dbml` | orders and order items | `dbml:Table orders`; `dbml:Table order_items` | snapshot-only reads |

- [x] T004 [US1] [TDD:RED] 為 TP-001 建立 201-row list 上限、降序與 summary 欄位測試 ← `testplan:TP-001`; `spec:FR-001`; `openapi:listMerchantOrders`
- [x] T005 [US1] [TDD:GREEN] 實作／維持 TP-001 list limit=200、created_at descending 與 summary fields ← `testplan:TP-001`; `spec:FR-001`; `openapi:listMerchantOrders`; `dbml:Table orders`
- [x] T006 [US1] [TDD:RED] 為 TP-002 合法 status filter 建立測試 ← `testplan:TP-002`; `spec:FR-003`; `openapi:listMerchantOrders`
- [x] T007 [US1] [TDD:GREEN] 實作／維持 TP-002 依 status 篩選列表 ← `testplan:TP-002`; `spec:FR-003`; `openapi:listMerchantOrders`
- [x] T008 [US1] [TDD:RED] 為 TP-003 invalid status filter 回 400 建立測試 ← `testplan:TP-003`; `spec:FR-003`; `openapi:listMerchantOrders`
- [x] T009 [US1] [TDD:GREEN] 實作／維持 TP-003 `INVALID_STATUS_FILTER` response ← `testplan:TP-003`; `spec:FR-003`; `openapi:listMerchantOrders`; `openapi:components.schemas.ErrorBody`
- [x] T010 [US1] [TDD:RED] 為 TP-004 merchant detail snapshot 建立測試 ← `testplan:TP-004`; `spec:FR-002`; `spec:FR-012`; `openapi:getMerchantOrder`
- [x] T011 [US1] [TDD:GREEN] 實作／維持 TP-004 返回 persisted order item/total snapshot，不重算 menu price ← `testplan:TP-004`; `spec:BR-001`; `openapi:getMerchantOrder`; `dbml:Table order_items`
- [x] T012 [US1] [TDD:RED] 為 TP-005 missing/invalid token 回 401 建立測試 ← `testplan:TP-005`; `spec:FR-010`; `openapi:listMerchantOrders`; `openapi:getMerchantOrder`
- [x] T013 [US1] [TDD:GREEN] 實作／維持 TP-005 merchant token authentication 與資料不洩漏 ← `testplan:TP-005`; `spec:FR-010`; `research:店家憑證驗證`
- [x] T014 [US1] [TDD:RED] 為 TP-006 credentials 未設定回 503 建立測試 ← `testplan:TP-006`; `spec:FR-010`; `openapi:components.responses.MerchantNotConfigured`
- [x] T015 [US1] [TDD:GREEN] 實作／維持 TP-006 `MERCHANT_NOT_CONFIGURED` response ← `testplan:TP-006`; `spec:FR-010`; `openapi:components.responses.MerchantNotConfigured`

---

## Phase 4: User Story 2－店家接受訂單（P1）

#### Backend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | TP-007–TP-009 | `testplan:TP-007`; `testplan:TP-008`; `testplan:TP-009` | accept success／conflict／auth |
| `contracts/http-api.yaml` | accept action | `openapi:acceptMerchantOrder`; `openapi:components.responses.OrderStatusConflict`; `openapi:components.responses.MerchantUnauthorized` | created→accepted, 409, 401 |
| `data-model.dbml` | orders state fields | `dbml:Table orders` | status/timestamp, immutable snapshot |

- [x] T016 [US2] [TDD:RED] 為 TP-007 created order accept 成功、timestamp 更新及 snapshot 不變建立測試 ← `testplan:TP-007`; `spec:FR-004`; `spec:FR-005`; `spec:FR-012`; `openapi:acceptMerchantOrder`
- [x] T017 [US2] [TDD:GREEN] 實作／維持 TP-007 條件狀態轉換 created→accepted ← `testplan:TP-007`; `spec:FR-004`; `spec:FR-005`; `research:訂單狀態機與並發安全`; `dbml:Table orders`
- [x] T018 [US2] [TDD:RED] 為 TP-008 非 created order accept 回 409 建立測試 ← `testplan:TP-008`; `spec:FR-006`; `openapi:acceptMerchantOrder`
- [x] T019 [US2] [TDD:GREEN] 實作／維持 TP-008 非法／重複 accept 回 `ORDER_STATUS_CONFLICT` 且狀態不變 ← `testplan:TP-008`; `spec:FR-006`; `openapi:components.responses.OrderStatusConflict`
- [x] T020 [US2] [TDD:RED] 為 TP-009 no-token accept 回 401、狀態不變建立測試 ← `testplan:TP-009`; `spec:FR-010`; `openapi:components.responses.MerchantUnauthorized`
- [x] T021 [US2] [TDD:GREEN] 實作／維持 TP-009 auth guard 在讀寫前拒絕未授權操作 ← `testplan:TP-009`; `spec:FR-010`; `research:店家憑證驗證`

---

## Phase 5: User Story 3－店家更新出餐狀態並完成訂單（P1）

#### Backend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | TP-010–TP-015 | `testplan:TP-010`; `testplan:TP-011`; `testplan:TP-012`; `testplan:TP-013`; `testplan:TP-014`; `testplan:TP-015` | transitions、race、auth、body policy |
| `contracts/http-api.yaml` | start／complete／accept actions | `openapi:startPreparingMerchantOrder`; `openapi:completeMerchantOrder`; `openapi:acceptMerchantOrder`; `openapi:components.responses.OrderStatusConflict` | state machine and error contract |
| `research.md` | state machine and conditional update | `research:訂單狀態機與並發安全` | concurrency-safe transition |

- [x] T022 [US3] [TDD:RED] 為 TP-010 accepted→preparing success 建立測試 ← `testplan:TP-010`; `spec:FR-007`; `openapi:startPreparingMerchantOrder`
- [x] T023 [US3] [TDD:GREEN] 實作／維持 TP-010 start-preparing conditional transition ← `testplan:TP-010`; `spec:FR-007`; `research:訂單狀態機與並發安全`
- [x] T024 [US3] [TDD:RED] 為 TP-011 preparing→completed success、timestamp 與 snapshot 不變建立測試 ← `testplan:TP-011`; `spec:FR-008`; `spec:FR-015`; `openapi:completeMerchantOrder`
- [x] T025 [US3] [TDD:GREEN] 實作／維持 TP-011 complete transition 並保留明細／金額 ← `testplan:TP-011`; `spec:FR-008`; `spec:FR-012`; `dbml:Table orders`
- [x] T026 [US3] [TDD:RED] 為 TP-012 skip/reverse transitions 回 409 建立測試 ← `testplan:TP-012`; `spec:FR-009`; `openapi:components.responses.OrderStatusConflict`
- [x] T027 [US3] [TDD:GREEN] 實作／維持 TP-012 僅允許狀態機合法相鄰轉換 ← `testplan:TP-012`; `spec:BR-002`; `research:訂單狀態機與並發安全`
- [x] T028 [US3] [TDD:RED] 為 TP-013 並行 accept 一個成功、一個衝突建立 integration test ← `testplan:TP-013`; `spec:FR-009`; `research:訂單狀態機與並發安全`
- [x] T029 [US3] [TDD:GREEN] 實作／維持 TP-013 conditional UPDATE concurrency behavior ← `testplan:TP-013`; `spec:BR-002`; `dbml:Table orders`
- [x] T030 [US3] [TDD:RED] 為 TP-014 start-preparing 未授權請求不改狀態建立測試 ← `testplan:TP-014`; `spec:FR-010`; `openapi:components.responses.MerchantUnauthorized`
- [x] T031 [US3] [TDD:GREEN] 實作／維持 TP-014 action authorization guard ← `testplan:TP-014`; `spec:FR-010`; `research:店家憑證驗證`
- [x] T032 [NON-TDD] 完成 TP-015 契約對齊：action body 明列相容金額／明細欄位並忽略，未知欄位拒絕；測試驗證合法轉換不改 snapshot、非法欄位回 400 且狀態不變 ← `testplan:TP-015`; `spec:FR-012`; `spec:FR-013`; `openapi:MerchantOrderActionRequest`; `plan:T002 契約對齊紀錄`

---

## Phase 6: User Story 4－顧客查詢反映店家狀態（P1）

#### Backend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | TP-016 同步狀態 | `testplan:TP-016` | owner session query latest persisted status |
| 003 `contracts/http-api.yaml` | `getOrder` response/status fields | `003-openapi:getOrder`; `003-openapi:components.schemas.Order` | 顧客查詢沿用 003 session boundary |
| 004 `contracts/http-api.yaml` | merchant transition operation | `openapi:acceptMerchantOrder`; `openapi:startPreparingMerchantOrder`; `openapi:completeMerchantOrder` | state change source |

- [x] T033 [US4] [TDD:RED] 為 TP-016 merchant transition 後 owner getOrder status/label 同步且 snapshot 不變建立測試 ← `testplan:TP-016`; `spec:FR-011`; `spec:FR-014`; `openapi:getOrder`
- [x] T034 [US4] [TDD:GREEN] 實作／維持 TP-016 customer query 從同一 persisted order state 組裝動態 label ← `testplan:TP-016`; `spec:BR-003`; `research:顧客查詢同步`; `003-openapi:getOrder`

#### Frontend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | TP-017 customer lookup walkthrough | `testplan:TP-017` | status label/snapshot presentation |
| `ui-plan.md` | customer lookup sync | `ui-plan:§畫面與流程→顧客查詢狀態同步`; `prototype:index.html` | UI behavior |

- [x] T035 [US4] [NON-TDD] 手動走查 TP-017：customer lookup 顯示店家更新後 status label 與原 snapshot；屬 UI acceptance walkthrough ← `testplan:TP-017`; `spec:US4`; `ui-plan:§畫面與流程→顧客查詢狀態同步`; `openapi:getOrder`

## Dependencies & Execution Order

- 每個 RED 先驗證預期紅燈，再執行同 TP GREEN；REFACTOR 若未列即表示不需重構。
- TP-015 對應 T032 已完成：contract 明列並忽略金額／明細相容欄位，拒絕未知欄位。
- 已完成 checkbox 保留；回溯 TDD 標籤不是歷史執行證明。

## Format Validation

- 每個 TP 至少被一項 task 以 `testplan:TP-xxx` 引用；行為 task 恰有一個 TDD marker。
- UI 手動 walkthrough 與上游對齊任務標 `[NON-TDD]` 並註明原因。
- 各有任務端點 subsection 均含四欄 Binding，表列由 task anchor 覆蓋。

Constitution self-check: pass
