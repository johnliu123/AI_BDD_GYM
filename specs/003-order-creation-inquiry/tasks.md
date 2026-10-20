# Tasks: 點餐系統第三迭代－訂單建立與查詢

**Feature directory**：`specs/003-order-creation-inquiry/`

**Retroactive mapping note**：本 feature 舊行為 tasks 均已完成。本次保留既有 `[x]`，依 testplan TP 案例把測試與行為實作切成單步 RED／GREEN 對照；標籤不代表歷史執行時序證明。TP-006 金額相容欄位政策已於 contract／plan 對齊，T013 已完成並有整合測試證據。

**Spec 套件索引**（按需 READ）：

| 文件 | 用途 |
|---|---|
| `spec.md` | US1–US2、FR／BR／SC、冪等澄清 |
| `testplan.md` | TP-001–TP-013 案例與測試入口 |
| `research.md`、`techstack.md` | 訂單 transaction、快照、session、冪等決策 |
| `plan.md` | endpoint inventory、transaction boundary、order number policy |
| `ui-plan.md`、`prototype/` | checkout、order success、lookup flow |
| `data-model.dbml` | orders、order items/options、idempotency keys |
| `contracts/http-api.yaml` | `createOrder`／`getOrder`；002 cart contract 為前置 |

## Phase 1: Setup

**Purpose**：核對 002 cart/session/money 前置；不新增訂單行為。

**Read when executing this phase**：`research.md`、`techstack.md`、`plan.md`、`testplan.md`。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | test environment、TP-001／TP-008 | `testplan:TP-001`; `testplan:TP-008` | memory DB、guest session／CSRF 前置 |
| `techstack.md` | 003 前置、test command | `techstack:API 後端`; `techstack:資料庫` | 延用 002 harness 與 server tools |
| `plan.md` | 端點及 transaction 設計 | `plan:端點盤點`; `plan:設計決策·訂單編號` | order scope |

- [x] T001 [NON-TDD] 核對既有 guest session、cart read、money helper 與 `USE_MEMORY_DB=1 npm test` 入口；此為前置環境確認，不改產品行為 ← `plan:端點盤點`; `research:延續既有前後端與訪客工作階段`; `techstack:API 後端`; `testplan:TP-001`

## Phase 2: Foundational

**Purpose**：保留 order、detail、idempotency persistence 與 transaction foundation。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `data-model.dbml` | orders、order_items/options、order_idempotency_keys | `dbml:Table orders`; `dbml:Table order_items`; `dbml:Table order_idempotency_keys` | snapshot 及冪等 mapping |
| `research.md` | 建單 transaction、冪等、查詢授權 | `research:訂單建立交易與購物車清空`; `research:冪等鍵與避免重複送單`; `research:訂單查詢授權` | 單 transaction／owner-session 查詢 |
| `contracts/http-api.yaml` | `createOrder`／`getOrder` schemas | `openapi:createOrder`; `openapi:getOrder`; `openapi:components.schemas.Order` | 既有 API contract |

- [x] T002 [NON-TDD] 核對已完成的 003 schema／migration、memory DB table 與 OpenAPI order number／error code；保留原 T002 contract alignment record ← `plan:T002 契約對齊紀錄`; `dbml:Table orders`; `dbml:Table order_idempotency_keys`; `openapi:createOrder`; `openapi:getOrder`

---

## Phase 3: User Story 1－從購物車確認並建立訂單（P1）

**端點（對齊 plan.md）**：Checkout UI、Orders API、MSSQL、guest session／CSRF、既有 cart service。

#### Backend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | TP-001–TP-009 | `testplan:TP-001`; `testplan:TP-002`; `testplan:TP-003`; `testplan:TP-004`; `testplan:TP-005`; `testplan:TP-006`; `testplan:TP-007`; `testplan:TP-008`; `testplan:TP-009` | 建單 transaction、拒絕、冪等及安全 |
| `contracts/http-api.yaml` | `createOrder`, CreateOrderRequest, ErrorBody | `openapi:createOrder`; `openapi:components.schemas.CreateOrderRequest`; `openapi:components.schemas.ErrorBody` | 201／200／400／409／403 behavior |
| `data-model.dbml` | orders／details／idempotency | `dbml:Table orders`; `dbml:Table order_items`; `dbml:Table order_idempotency_keys` | snapshot、transaction、unique mapping |

- [x] T003 [US1] [TDD:RED] 為 TP-001 建立 available cart 建單、order number、完整 snapshot 與成功後清 cart 測試 ← `testplan:TP-001`; `spec:FR-001`; `spec:FR-002`; `spec:FR-003`; `spec:FR-006`; `openapi:createOrder`; `dbml:Table orders`; `dbml:Table order_items`
- [x] T004 [US1] [TDD:GREEN] 實作 TP-001 transaction 建單、快照寫入及清 cart 行為 ← `testplan:TP-001`; `spec:FR-001`; `spec:FR-003`; `spec:FR-006`; `research:訂單建立交易與購物車清空`; `dbml:Table orders`; `dbml:Table order_items`
- [x] T005 [US1] [TDD:RED] 為 TP-002 建立 mixed unavailable cart 全筆拒絕且 cart 保留測試 ← `testplan:TP-002`; `spec:FR-004`; `spec:BR-002`; `openapi:createOrder`
- [x] T006 [US1] [TDD:GREEN] 實作 TP-002 建單前 availability revalidation 與 409 error mapping ← `testplan:TP-002`; `spec:FR-004`; `spec:BR-002`; `openapi:createOrder`; `openapi:components.schemas.ErrorBody`
- [x] T007 [US1] [TDD:RED] 為 TP-003 建立 empty／only-unavailable cart 拒絕測試 ← `testplan:TP-003`; `spec:FR-005`; `openapi:createOrder`
- [x] T008 [US1] [TDD:GREEN] 實作 TP-003 `CART_EMPTY` refusal 且不寫入 order ← `testplan:TP-003`; `spec:FR-005`; `openapi:createOrder`; `openapi:components.schemas.ErrorBody`
- [x] T009 [US1] [TDD:RED] 為 TP-004 建立同 session/key 重送回原 order 的測試 ← `testplan:TP-004`; `spec:FR-007`; `spec:BR-003`; `openapi:createOrder`
- [x] T010 [US1] [TDD:GREEN] 實作 TP-004 order idempotency replay，成功 mapping 唯一且 replay 回 200 ← `testplan:TP-004`; `spec:FR-007`; `research:冪等鍵與避免重複送單`; `dbml:Table order_idempotency_keys`
- [x] T011 [US1] [TDD:RED] 為 TP-005 expired idempotency mapping 視為新請求建立測試 ← `testplan:TP-005`; `spec:FR-007`; `research:冪等鍵與避免重複送單`; `openapi:createOrder`
- [x] T012 [US1] [TDD:GREEN] 實作 TP-005 24h expiry 判斷並允許相同過期 key 新建 order ← `testplan:TP-005`; `spec:FR-007`; `research:冪等鍵與避免重複送單`; `dbml:Table order_idempotency_keys`
- [x] T013 [NON-TDD] 完成 TP-006 契約對齊：明列 `total_amount`、`unit_price`、`line_total` 相容欄位並由伺服器忽略，未知欄位仍拒絕；已更新 OpenAPI／testplan，且整合測試驗證 response 與持久化 snapshot ← `testplan:TP-006`; `spec:US1·情境5`; `spec:FR-011`; `openapi:components.schemas.CreateOrderRequest`; `plan:T002 契約對齊紀錄`
- [x] T014 [US1] [TDD:RED] 為 TP-007 建立 failed create 不寫成功 idempotency mapping、cart 修正後同 key 可成功測試 ← `testplan:TP-007`; `spec:FR-007`; `research:冪等鍵與避免重複送單`; `openapi:createOrder`
- [x] T015 [US1] [TDD:GREEN] 實作 TP-007 僅在建單成功後持久化 idempotency mapping ← `testplan:TP-007`; `spec:FR-007`; `research:冪等鍵與避免重複送單`; `dbml:Table order_idempotency_keys`
- [x] T016 [US1] [TDD:RED] 為 TP-008 invalid Origin／CSRF 不寫 order、不清 cart 的測試 ← `testplan:TP-008`; `spec:FR-001`; `spec:FR-006`; `002-openapi:components.parameters.OriginHeader`; `002-openapi:components.parameters.CsrfTokenHeader`
- [x] T017 [US1] [TDD:GREEN] 實作／維持 TP-008 建單沿用 002 session-bound Origin／CSRF guard ← `testplan:TP-008`; `spec:FR-010`; `research:延續既有前後端與訪客工作階段`; `002-openapi:getCart`; `openapi:createOrder`
- [x] T018 [US1] [TDD:RED] 為 TP-009 同 key 並行建單僅建立一筆 order 的整合測試 ← `testplan:TP-009`; `spec:FR-007`; `spec:BR-003`; `openapi:createOrder`
- [x] T019 [US1] [TDD:GREEN] 實作／維持 TP-009 同 key concurrency serialization／unique mapping，兩回應指向同一 order ← `testplan:TP-009`; `spec:FR-007`; `research:冪等鍵與避免重複送單`; `dbml:Table order_idempotency_keys`

#### Frontend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | checkout request mapping/UI journey | `testplan:TP-001`; `testplan:TP-003`; `testplan:TP-006` | checkout 與錯誤呈現 |
| `ui-plan.md` | 確認送單、拒絕不可用、成功結果 | `ui-plan:§畫面與流程→確認送單`; `ui-plan:§畫面與流程→拒絕不可用購物車送單`; `ui-plan:§畫面與流程→訂單建立成功` | 顧客送單流程 |
| `contracts/http-api.yaml` | createOrder request/response | `openapi:createOrder`; `openapi:components.schemas.OrderResponse` | 空 body、idempotency header |

- [x] T020 [US1] [TDD:RED] 為 TP-001 checkout success／order number／snapshot 顯示及 TP-003 refused checkout 建立前端 API/UI tests ← `testplan:TP-001`; `testplan:TP-003`; `spec:US1`; `ui-plan:§畫面與流程→確認送單`; `openapi:createOrder`
- [x] T021 [US1] [TDD:GREEN] 實作／維持 Checkout flow：CSRF bootstrap、空 body create、成功結果顯示與後端錯誤呈現 ← `testplan:TP-001`; `testplan:TP-003`; `spec:FR-001`; `spec:FR-006`; `ui-plan:§畫面與流程→訂單建立成功`; `openapi:createOrder`; `openapi:getCart`

---

## Phase 4: User Story 2－查詢訂單狀態與明細（P1）

#### Backend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | TP-010–TP-012 | `testplan:TP-010`; `testplan:TP-011`; `testplan:TP-012` | owner query、snapshot、foreign session 404 |
| `contracts/http-api.yaml` | `getOrder`、Order schema | `openapi:getOrder`; `openapi:components.schemas.Order`; `openapi:components.schemas.ErrorBody` | response and not-found behavior |
| `data-model.dbml` | orders and snapshot rows | `dbml:Table orders`; `dbml:Table order_items` | immutable snapshots |

- [x] T022 [US2] [TDD:RED] 為 TP-010 owner session 查詢完整 order/snapshot 建立測試 ← `testplan:TP-010`; `spec:FR-008`; `spec:FR-009`; `openapi:getOrder`
- [x] T023 [US2] [TDD:GREEN] 實作／維持 TP-010 以 order number + guest session 查詢並回傳 snapshot ← `testplan:TP-010`; `spec:FR-008`; `spec:FR-009`; `research:訂單查詢授權`; `openapi:getOrder`
- [x] T024 [US2] [TDD:RED] 為 TP-011 menu price 變更後 query snapshot 不變建立測試 ← `testplan:TP-011`; `spec:BR-001`; `spec:FR-011`; `openapi:getOrder`
- [x] T025 [US2] [TDD:GREEN] 實作／維持 TP-011 查詢只讀 persisted snapshot、不重算 menu price ← `testplan:TP-011`; `spec:BR-001`; `research:訂單金額快照與查詢權威`; `openapi:getOrder`
- [x] T026 [US2] [TDD:RED] 為 TP-012 foreign session／unknown order 都回 `ORDER_NOT_FOUND` 建立測試 ← `testplan:TP-012`; `spec:FR-010`; `spec:US2·情境3`; `spec:US2·情境4`; `openapi:getOrder`
- [x] T027 [US2] [TDD:GREEN] 實作／維持 TP-012 不洩漏他 session order existence ← `testplan:TP-012`; `spec:FR-010`; `research:訂單查詢授權`; `openapi:getOrder`

#### Frontend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | TP-013 lookup UI | `testplan:TP-013` | owner view／not found |
| `ui-plan.md` | query state／not found | `ui-plan:§畫面與流程→查詢訂單狀態`; `ui-plan:§畫面與流程→查無訂單` | lookup behavior |

- [x] T028 [US2] [NON-TDD] 手動走查 TP-013：owner order 顯示 status/snapshot；unknown 或切 session 顯示查無；此為 UI acceptance walkthrough ← `testplan:TP-013`; `spec:FR-008`; `spec:FR-009`; `ui-plan:§畫面與流程→查詢訂單狀態`; `openapi:getOrder`

---

## Dependencies & Execution Order

- 每個 TDD RED 先驗證預期紅燈，再執行同 TP GREEN；REFACTOR 未列即代表不需要。
- TP-006 的 contract-policy task 不得標完成，直到上游 contract／plan 對齊；解除後新增明確單步 TDD tasks。
- 已完成 checkbox 保留為 `[x]`，但本次回溯標籤不證明歷史 RED→GREEN 時序。

## Format Validation

- 每個 TP 案例至少有一項 `testplan:TP-xxx` task；各行為 task 恰有一個 TDD marker。
- 非行為準備／manual walkthrough／blocked upstream alignment 使用 `[NON-TDD]` 並說明原因。
- 各有任務 endpoint 小節具有必讀對照表；表列由任務行尾 anchor 引用。

Constitution self-check: pass
