# Tasks: 點餐系統第六迭代－進階功能與系統驗證

**Feature directory**：`specs/006-advanced-features-system-verification/`

**Retroactive mapping note**：既有行為任務依 `testplan.md` 回溯分類為單步 RED／GREEN；標籤不證明歷史上已按 TDD 時序執行。TP-013／TP-023 已有歷史驗收紀錄；TP-019 目前因 system-analysis 未指定安全觸發 seam 而阻塞，TP-028 真實 SQL Server 資料保留驗證仍未完成。

**測試基線**：同目錄 `testplan.md`（TP-001–TP-028）；不可自行改寫其 Assert 或增加未規劃行為。

**Spec 套件索引**（按需 READ）：

| 文件 | 用途 |
|---|---|
| `spec.md` | US1–US6、FR／NFR／BR／SC |
| `testplan.md` | TP 案例、測試入口、fixtures、NFR 追溯 |
| `research.md`、`techstack.md` | 技術決策、memory DB、stub、CI commands |
| `plan.md` | 端點、Wave、跨迭代契約權威 |
| `ui-plan.md`、`prototype/` | merchant menu／sold-out／customer UI |
| `data-model.dbml` | categories、menu items、option groups/options |
| `contracts/http-api.yaml` | 006 merchant menu、RBAC、ErrorBody |
| `../002.../contracts/http-api.yaml` | cart operations |
| `../003.../contracts/http-api.yaml` | create/get order |
| `../004.../contracts/http-api.yaml` | merchant serving operations |
| `../005.../contracts/http-api.yaml` | payment operations |

**任務標籤**：每項行為 task 恰有一個 `[TDD:RED]`、`[TDD:GREEN]` 或 `[TDD:REFACTOR]`；每步另列 task。純環境／CI 驗證及人工 walkthrough 標 `[NON-TDD]` 並說明原因。TP-019 暫停至 system-analysis 指定可用 seam；既有 T046 只保留歷史紀錄，不作為驗收入口。

## Phase 1: Setup

**Purpose**：核對 005 前置與既有測試入口；不改變產品行為。

**Read when executing this phase**：`research.md`、`techstack.md`、`plan.md`、`testplan.md`。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | 執行環境、TP-025／TP-028 | `testplan:TP-025`; `testplan:TP-028` | backend CI／migration commands |
| `techstack.md` | 006 前置、整合測試、migration command | `techstack:006 前置（005 依賴）`; `techstack:整合測試` | 既有 stack／test harness |
| `plan.md` | 006 OpenAPI authority、端點盤點 | `plan:端點盤點`; `plan:設計決策·契約權威` | 006／004／005 contract ownership |

- [x] T001 [NON-TDD] 核對 005 memory DB suite、006 menu contract、migration verify 與 integration entrypoint；本項為前置驗證，不改產品行為 ← `testplan:TP-020`; `testplan:TP-025`; `testplan:TP-028`; `techstack:006 前置（005 依賴）`; `plan:端點盤點`

## Phase 2: Foundational

**Purpose**：保留 migration、RBAC、error middleware、menu repository／route foundation。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | shared fixtures 與 integration harness | `testplan:TP-014`; `testplan:TP-020` | test credentials、memory DB reset |
| `data-model.dbml` | menu tables／Project | `dbml:Project advanced_features_menu`; `dbml:Table categories`; `dbml:Table menu_items`; `dbml:Table menu_item_options` | 持久化欄位 |
| `contracts/http-api.yaml` | ErrorBody／merchant operations | `openapi:components.schemas.ErrorBody`; `openapi:components.responses.MerchantForbidden` | shared API error/auth |

- [x] T002 [NON-TDD] 核對既有 006 migration、memory DB schema、merchant credentials fixtures 與 routes；僅為已完成基礎任務回溯，不增加產品行為 ← `testplan:TP-014`; `testplan:TP-020`; `dbml:Project advanced_features_menu`; `research:菜單資料持久化（由 menuData 遷移至 MSSQL）`

---

## Phase 3: User Story 1－店家維護餐點分類與餐點資料（P1）

#### Backend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | TP-001–TP-006、TP-026 | `testplan:TP-001`; `testplan:TP-002`; `testplan:TP-003`; `testplan:TP-004`; `testplan:TP-005`; `testplan:TP-006`; `testplan:TP-026` | CRUD、validation、snapshot、category constraints |
| `spec.md` | US1、FR-001–FR-003、FR-012 | `spec:US1`; `spec:FR-001`; `spec:FR-002`; `spec:FR-003`; `spec:FR-012` | menu persistence behavior |
| `contracts/http-api.yaml` | category/menu operations | `openapi:createMerchantCategory`; `openapi:updateMerchantCategory`; `openapi:deleteMerchantCategory`; `openapi:createMerchantMenuItem`; `openapi:updateMerchantMenuItem`; `openapi:listMenuItems` | request／response/errors |
| `data-model.dbml` | categories/menu/options tables | `dbml:Table categories`; `dbml:Table menu_items`; `dbml:Table menu_item_option_groups`; `dbml:Table menu_item_options` | schema ownership |

- [x] T003 [US1] [TDD:RED] 為 TP-001 建立分類建立與列表回傳測試 ← `testplan:TP-001`; `spec:FR-001`; `openapi:createMerchantCategory`; `openapi:listMerchantCategories`
- [x] T004 [US1] [TDD:GREEN] 實作／維持 TP-001 category create/list contract ← `testplan:TP-001`; `spec:FR-001`; `openapi:createMerchantCategory`; `openapi:listMerchantCategories`
- [x] T005 [US1] [TDD:RED] 為 TP-002 建立 menu item／option groups 建立及 public read 測試 ← `testplan:TP-002`; `spec:FR-002`; `spec:FR-003`; `openapi:createMerchantMenuItem`; `openapi:listMenuItems`
- [x] T006 [US1] [TDD:GREEN] 實作／維持 TP-002 餐點與規格持久化及 menu serialization ← `testplan:TP-002`; `spec:FR-002`; `spec:FR-003`; `dbml:Table menu_items`; `dbml:Table menu_item_options`
- [x] T007 [US1] [TDD:RED] 為 TP-003 更新 menu price/options 但保留既有 order snapshot 建立測試 ← `testplan:TP-003`; `spec:FR-012`; `spec:BR-002`; `openapi:updateMerchantMenuItem`; `003-openapi:getOrder`
- [x] T008 [US1] [TDD:GREEN] 實作／維持 TP-003 menu update 不回寫既有 order snapshot ← `testplan:TP-003`; `spec:FR-012`; `spec:BR-002`; `dbml:Table orders`
- [x] T009 [US1] [TDD:RED] 為 TP-004 invalid price／partial write rejection 建立測試 ← `testplan:TP-004`; `spec:US1·情境4`; `openapi:createMerchantMenuItem`
- [x] T010 [US1] [TDD:GREEN] 實作／維持 TP-004 request validation／atomic write ← `testplan:TP-004`; `spec:FR-002`; `openapi:createMerchantMenuItem`
- [x] T011 [US1] [TDD:RED] 為 TP-005 duplicate category name 回 409 建立測試 ← `testplan:TP-005`; `spec:FR-001`; `openapi:createMerchantCategory`
- [x] T012 [US1] [TDD:GREEN] 實作／維持 TP-005 duplicate category rejection ← `testplan:TP-005`; `spec:FR-001`; `openapi:createMerchantCategory`
- [x] T013 [US1] [TDD:RED] 為 TP-006 deleting referenced category 回 `CATEGORY_IN_USE` 建立測試 ← `testplan:TP-006`; `spec:FR-001`; `openapi:deleteMerchantCategory`
- [x] T014 [US1] [TDD:GREEN] 實作／維持 TP-006 category reference guard ← `testplan:TP-006`; `spec:FR-001`; `openapi:deleteMerchantCategory`; `dbml:Table categories`
- [x] T015 [US1] [TDD:RED] 為 TP-026 category update 後 list 顯示更新內容建立測試 ← `testplan:TP-026`; `spec:FR-001`; `openapi:updateMerchantCategory`; `openapi:listMerchantCategories`
- [x] T016 [US1] [TDD:GREEN] 實作／維持 TP-026 category PATCH 欄位更新 ← `testplan:TP-026`; `spec:FR-001`; `openapi:updateMerchantCategory`

#### Frontend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | US1 UI create/edit flows through TP-001/002 | `testplan:TP-001`; `testplan:TP-002` | merchant menu UI |
| `ui-plan.md` | 店家菜單維護 | `ui-plan:§畫面與流程→店家菜單維護`; `prototype:index.html` | form and UI state |

- [x] T017 [US1] [TDD:RED] 為 TP-001／TP-002 merchant menu create UI payload／result 建立前端測試 ← `testplan:TP-001`; `testplan:TP-002`; `spec:US1`; `ui-plan:§畫面與流程→店家菜單維護`
- [x] T018 [US1] [TDD:GREEN] 實作／維持 MerchantMenuPage category/item forms 與 API result display ← `testplan:TP-001`; `testplan:TP-002`; `spec:FR-001`; `spec:FR-002`; `ui-plan:§畫面與流程→店家菜單維護`

---

## Phase 4: User Story 2－店家管理餐點售完與規格停供（P1）

#### Backend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | TP-007–TP-009 | `testplan:TP-007`; `testplan:TP-008`; `testplan:TP-009` | item/option stop and restore |
| `contracts/http-api.yaml` | availability operations | `openapi:patchMenuItemAvailability`; `openapi:patchMenuOptionAvailability`; `openapi:listMenuItems` | state persistence/public view |
| `spec.md` | FR-004–FR-006, FR-011, BR-001 | `spec:FR-004`; `spec:FR-005`; `spec:FR-006`; `spec:FR-011`; `spec:BR-001` | availability authority |

- [x] T019 [US2] [TDD:RED] 為 TP-007 stop item 後 API/menu response 與顧客加購護欄建立測試 ← `testplan:TP-007`; `spec:FR-004`; `spec:FR-006`; `openapi:patchMenuItemAvailability`
- [x] T020 [US2] [TDD:GREEN] 實作／維持 TP-007 item availability PATCH 與顧客讀取狀態 ← `testplan:TP-007`; `spec:FR-004`; `openapi:patchMenuItemAvailability`; `openapi:listMenuItems`
- [x] T021 [US2] [TDD:RED] 為 TP-008 stopped option 加購回 409 建立測試 ← `testplan:TP-008`; `spec:FR-005`; `spec:FR-011`; `002-openapi:addCartItem`
- [x] T022 [US2] [TDD:GREEN] 實作／維持 TP-008 option availability enforcement ← `testplan:TP-008`; `spec:FR-005`; `002-openapi:addCartItem`
- [x] T023 [US2] [TDD:RED] 為 TP-009 restore item 後 public menu 與合法 cart add 恢復建立測試 ← `testplan:TP-009`; `spec:FR-004`; `spec:FR-006`; `002-openapi:addCartItem`
- [x] T024 [US2] [TDD:GREEN] 實作／維持 TP-009 restore availability 與最新價格加購 ← `testplan:TP-009`; `spec:BR-001`; `openapi:patchMenuItemAvailability`; `002-openapi:addCartItem`

#### Frontend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | TP-007 sold-out UI | `testplan:TP-007` | customer/menu status |
| `ui-plan.md` | 餐點售完切換 | `ui-plan:§畫面與流程→餐點售完切換` | merchant toggle |

- [x] T025 [US2] [TDD:RED] 為 TP-007 merchant availability toggle 及 customer sold-out display 建立 UI/API test ← `testplan:TP-007`; `spec:US2`; `ui-plan:§畫面與流程→餐點售完切換`
- [x] T026 [US2] [TDD:GREEN] 實作／維持 item／option sold-out toggle 與顧客菜單 refresh ← `testplan:TP-007`; `spec:FR-004`; `spec:FR-005`; `ui-plan:§畫面與流程→餐點售完切換`

---

## Phase 5: User Story 3－顧客端反映供應狀態並阻擋無效下單（P1）

#### Frontend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | TP-010／TP-011 customer menu/cart UI | `testplan:TP-010`; `testplan:TP-011` | sold-out state and cart totals |
| `ui-plan.md` | 顧客售完標示／Cart unavailable | `ui-plan:§畫面與流程→顧客售完標示`; `prototype:index.html` | customer presentation |

- [x] T027 [US3] [TDD:RED] 為 TP-010 sold-out MenuCard 與 TP-011 unavailable CartPage presentation 建立前端測試 ← `testplan:TP-010`; `testplan:TP-011`; `spec:FR-007`; `spec:FR-013`; `ui-plan:§畫面與流程→顧客售完標示`
- [x] T028 [US3] [TDD:GREEN] 實作／維持 sold-out badge、不可用金額隱藏及 cart total exclusion ← `testplan:TP-010`; `testplan:TP-011`; `spec:FR-007`; `spec:FR-013`

#### Backend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | TP-012／TP-013／TP-027 | `testplan:TP-012`; `testplan:TP-013`; `testplan:TP-027` | order guard and amount trust |
| 003／002 contracts | createOrder／addCartItem | `003-openapi:createOrder`; `002-openapi:addCartItem` | 409／400及金額欄位政策 |
| `spec.md` | FR-008、FR-012–FR-013 | `spec:FR-008`; `spec:FR-012`; `spec:FR-013` | server-side validation |

- [x] T029 [US3] [TDD:RED] 為 TP-012 mixed unavailable cart 建單回 409 且 cart 保留建立測試 ← `testplan:TP-012`; `spec:FR-008`; `spec:FR-013`; `003-openapi:createOrder`
- [x] T030 [US3] [TDD:GREEN] 實作／維持 TP-012 create order latest availability revalidation ← `testplan:TP-012`; `spec:FR-008`; `003-openapi:createOrder`
- [x] T031 [NON-TDD] 完成 TP-013 契約對齊：003 CreateOrderRequest 明列相容金額欄位並忽略；已由 system integration test 驗證偽造金額不影響訂單 response／持久化 snapshot ← `testplan:TP-013`; `spec:FR-012`; `spec:BR-001`; `003-openapi:components.schemas.CreateOrderRequest`
- [x] T032 [TDD:RED] 為 TP-027 cart add body 夾帶價格欄位回 400 且 cart 不變建立測試 ← `testplan:TP-027`; `spec:FR-012`; `002-openapi:addCartItem`
- [x] T033 [TDD:GREEN] 實作／維持 TP-027 cart amount fields 按 002 contract 拒絕 ← `testplan:TP-027`; `spec:FR-012`; `002-openapi:addCartItem`

---

## Phase 6: User Story 4－店家 API RBAC（P1）

#### Backend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | TP-014–TP-016 role/auth matrix | `testplan:TP-014`; `testplan:TP-015`; `testplan:TP-016` | roles、401／403／503 |
| `contracts/http-api.yaml` | MerchantForbidden／Unauthorized／NotConfigured | `openapi:components.responses.MerchantForbidden`; `openapi:components.responses.MerchantUnauthorized`; `openapi:components.responses.MerchantNotConfigured` | authorization contract |

- [x] T034 [US4] [TDD:RED] 為 TP-014 menu/orders/admin/legacy role matrix 與 client role spoof rejection 建立整合測試 ← `testplan:TP-014`; `spec:FR-009`; `spec:FR-010`; `spec:FR-014`; `spec:FR-015`; `spec:BR-003`
- [x] T035 [US4] [TDD:GREEN] 實作／維持 TP-014 server-side role authorization matrix ← `testplan:TP-014`; `spec:FR-009`; `spec:BR-003`; `openapi:components.responses.MerchantForbidden`
- [x] T036 [US4] [TDD:RED] 為 TP-015 missing／invalid token 401 建立測試 ← `testplan:TP-015`; `spec:FR-015`; `openapi:components.responses.MerchantUnauthorized`
- [x] T037 [US4] [TDD:GREEN] 實作／維持 TP-015 merchant credential validation ← `testplan:TP-015`; `research:店家 RBAC（設定層 token → roles）`; `openapi:components.responses.MerchantUnauthorized`
- [x] T038 [US4] [TDD:RED] 為 TP-016 無任何 merchant credential 設定時 503 建立測試 ← `testplan:TP-016`; `openapi:components.responses.MerchantNotConfigured`
- [x] T039 [US4] [TDD:GREEN] 實作／維持 TP-016 `MERCHANT_NOT_CONFIGURED` guard ← `testplan:TP-016`; `openapi:components.responses.MerchantNotConfigured`

#### Frontend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | TP-014 forbidden menu/order action | `testplan:TP-014` | 403 presentation |
| `ui-plan.md` | RBAC 權限提示 | `ui-plan:§畫面與流程→RBAC 權限提示` | user-facing error |

- [x] T040 [US4] [TDD:RED] 為 TP-014 403 API response 顯示權限提示建立前端測試 ← `testplan:TP-014`; `spec:BR-003`; `ui-plan:§畫面與流程→RBAC 權限提示`
- [x] T041 [US4] [TDD:GREEN] 實作／維持 403 user-facing authorization message ← `testplan:TP-014`; `ui-plan:§畫面與流程→RBAC 權限提示`

---

## Phase 7: User Story 5－一致例外處理（P1）

#### Backend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | TP-017／TP-018／TP-019 | `testplan:TP-017`; `testplan:TP-018`; `testplan:TP-019` | 400/404/500、安全錯誤 |
| `contracts/http-api.yaml` | ErrorBody／NotFound | `openapi:components.schemas.ErrorBody`; `openapi:components.responses.NotFound` | JSON error structure |
| `research.md` | 集中式 HTTP 例外處理 | `research:集中式 HTTP 例外處理` | centralized error middleware |

- [x] T042 [US5] [TDD:RED] 為 TP-017 invalid merchant body 回 400 ErrorBody 建立測試 ← `testplan:TP-017`; `spec:FR-016`; `spec:NFR-010`; `openapi:components.schemas.ErrorBody`
- [x] T043 [US5] [TDD:GREEN] 實作／維持 TP-017 predictable error response shape ← `testplan:TP-017`; `spec:FR-016`; `spec:NFR-010`; `research:集中式 HTTP 例外處理`
- [x] T044 [US5] [TDD:RED] 為 TP-018 unknown `/api/*` route JSON 404/no leakage 建立測試 ← `testplan:TP-018`; `spec:FR-017`; `spec:NFR-010`; `openapi:components.responses.NotFound`
- [x] T045 [US5] [TDD:GREEN] 實作／維持 TP-018 JSON `NOT_FOUND` handler ← `testplan:TP-018`; `spec:FR-017`; `research:集中式 HTTP 例外處理`
- [x] T046 [NON-TDD] 歷史紀錄：曾以 `ENABLE_HTTP_ERROR_TEST_ROUTES=1` 驗證 test-only error route；此 route 未列於 system-analysis，不作為 TP-019 的核准 seam／驗收。待 plan／API analysis 補齊安全觸發入口後再重驗 ← `testplan:TP-019`; `spec:NFR-010`; `spec:NFR-011`; `plan:端點盤點`

#### Frontend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | TP-017 error presentation | `testplan:TP-017` | customer/merchant error message |
| 006 UI Plan | RBAC error cue | `ui-plan:§畫面與流程→RBAC 權限提示` | 403 message contract |

- [x] T047 [US5] [TDD:RED] 為 TP-017 customer／merchant API error.message display 建立 frontend test ← `testplan:TP-017`; `spec:NFR-010`; `openapi:components.schemas.ErrorBody`
- [x] T048 [US5] [TDD:GREEN] 實作／維持 frontend 顯示 server `error.message` 而非空白 ← `testplan:TP-017`; `spec:NFR-010`; `openapi:components.schemas.ErrorBody`

---

## Phase 8: User Story 6－整合測試與系統驗證（P1）

#### Backend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | TP-020–TP-025、TP-028 | `testplan:TP-020`; `testplan:TP-021`; `testplan:TP-022`; `testplan:TP-023`; `testplan:TP-024`; `testplan:TP-025`; `testplan:TP-028` | end-to-end、idempotency、availability、CI/migration |
| `research.md` | integration harness／smoke | `research:整合測試與 smoke` | memory DB public test entry |
| `techstack.md` | test command／migration command | `techstack:整合測試`; `techstack:006 smoke（本機）` | 預設 CI entry |

- [x] T049 [US6] [TDD:RED] 為 TP-020 顧客點餐→付款→merchant serving 完整 HTTP journey 建立 integration test ← `testplan:TP-020`; `spec:FR-018`; `spec:FR-019`; `spec:SC-003`; `004-openapi:completeMerchantOrder`; `005-openapi:payOrder`
- [x] T050 [US6] [TDD:GREEN] 補齊／維持 TP-020 integration journey 所需缺漏行為 ← `testplan:TP-020`; `spec:SC-003`; `research:整合測試與 smoke`
- [x] T051 [US6] [TDD:RED] 為 TP-021 同建單 Idempotency-Key replay 建立 integration test ← `testplan:TP-021`; `spec:FR-018`; `spec:SC-003`; `003-openapi:createOrder`
- [x] T052 [US6] [TDD:GREEN] 實作／維持 TP-021 唯一 order mapping 與相同 order replay ← `testplan:TP-021`; `spec:FR-007`; `003-openapi:createOrder`
- [x] T053 [US6] [TDD:RED] 為 TP-022 同付款 key replay 無重複 successful mapping 建立 integration test ← `testplan:TP-022`; `spec:FR-012`; `spec:SC-006`; `005-openapi:payOrder`
- [x] T054 [US6] [TDD:GREEN] 實作／維持 TP-022 paid-only idempotency replay ← `testplan:TP-022`; `spec:FR-012`; `dbml:Table payment_idempotency_keys`; `005-openapi:payOrder`
- [x] T055 [NON-TDD] 完成 TP-023 契約對齊：005 PayOrderRequest 明列相容金額／items 欄位並忽略；system integration test 驗證付款只使用 server snapshot 且持久化明細不變 ← `testplan:TP-023`; `spec:FR-012`; `spec:SC-005`; `005-openapi:components.schemas.PayOrderRequest`
- [x] T056 [US6] [TDD:RED] 為 TP-024 stop item 後建單拒絕、cart 保留與恢復後可建單建立 integration test ← `testplan:TP-024`; `spec:FR-011`; `spec:FR-013`; `spec:SC-002`; `003-openapi:createOrder`
- [x] T057 [US6] [TDD:GREEN] 實作／維持 TP-024 order create revalidates latest persisted availability ← `testplan:TP-024`; `spec:BR-001`; `spec:FR-013`; `003-openapi:createOrder`
- [x] T058 [US6] [NON-TDD] 執行 TP-025 指定的 backend default CI suite 並記錄 exit code；本項是驗證命令，不改產品行為 ← `testplan:TP-025`; `spec:FR-018`; `spec:FR-019`; `spec:NFR-012`; `techstack:整合測試`
- [ ] T059 [US6] [NON-TDD] 在專用可重建 MSSQL DB 執行 migration 並核對 prior order／detail snapshot 保留；目前只完成靜態 `verify:migrations`，尚未驗證真實 SQL Server 資料保留 ← `testplan:TP-028`; `spec:FR-018`; `spec:SC-007`; `techstack:006 前置（005 依賴）`

## Dependencies & Execution Order

- 每個 TDD RED 僅建立一個 TP case test；同 TP GREEN 僅實作該紅燈要求的最小行為；REFACTOR 可選且需在相關 tests 綠燈後。
- TP-013、TP-023 保留歷史驗收紀錄；TP-019 的錯誤觸發 seam 未列於 system-analysis，且 testplan 的 NFR-010 對照仍有重複／矛盾敘述，須先修正來源並確認後再驗收；TP-028 真實 SQL Server migration smoke 需專用測試資料庫。
- CI／migration 命令及基礎環境核對為 NON-TDD，需保留理由。
- `[x]` 保留舊完成狀態；新 TDD tags 是回溯映射，不證明歷史時序。

## Format Validation

- 每個 TP case 均由至少一項 task 的 `testplan:TP-xxx` 錨點引用。
- 每個行為 task 恰有一個 TDD marker；非行為 task 有 `[NON-TDD]` 及理由。
- 各實際端點 subsection 有四欄 Binding；每一列都被 task anchor 覆蓋。

Constitution self-check: exceptions — TP-019 seam／NFR 對照仍待上游釐清；T059／TP-028 awaits an isolated MSSQL test target for the prior-data preservation smoke.
