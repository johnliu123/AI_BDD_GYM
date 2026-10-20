# Tasks: 點餐系統第二迭代－購物車與金額計算

**Feature directory**：`specs/002-shopping-cart-total-calculation/`

**Retroactive mapping note**：原 tasks 全部已勾選完成。本次將 testplan 案例回溯拆為 RED／GREEN 單步任務並保留 `[x]`；這是任務類型與追溯整理，不宣稱本文件證明歷史 RED→GREEN 執行時序。UI walkthrough 保留為 `[NON-TDD]`。

**Spec 套件索引**（按需 READ）：

| 文件 | 用途 |
|---|---|
| `spec.md` | User Story、FR／BR／SC、Q9–Q11 |
| `testplan.md` | TP-001–TP-019，測試入口／fixtures／Assert |
| `research.md`、`techstack.md` | session、計價、database 與 test harness 決策 |
| `plan.md` | 端點盤點、設計決策及 Wave |
| `ui-plan.md`、`prototype/` | 選規格、cart 與 unavailable UI |
| `data-model.dbml` | session/cart/menu option persistence |
| `contracts/http-api.yaml` | cart operations；001 `http-api.yaml` 為 menu source |

**任務規則**：每個行為 task 恰有一個 TDD step；每個 TP 至少由一項 task 引用。阻塞案例只列明確的非行為解除前置任務。`[x]` 為既有 feature 完成狀態。

## Phase 1: Setup

**Purpose**：核對 session、menu source 與金額精度前置；不新增產品行為。

**Read when executing this phase**：`research.md`、`techstack.md`、`plan.md`、`testplan.md`。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `research.md` | session、precision／scale 前置決策 | `research:訪客工作階段與購物車歸屬`; `research:金額精度與表示` | session identity、金額來源 |
| `techstack.md` | 002 前置與 test command | `techstack:訪客工作階段`; `techstack:資料庫`; `techstack:金額表示` | 使用已定案 memory DB／precision |
| `plan.md` | 端點盤點與設計決策 | `plan:端點盤點`; `plan:設計決策·伺服器權威計價` | 不超出 cart scope |

- [x] T001 [NON-TDD] 核對 guest session／cookie／Origin／CSRF 前置與 `cart-session-boundary.test.js` 驗收入口；本項是既有環境／政策核對，非產品行為實作 ← `spec:FR-004`; `research:訪客工作階段與購物車歸屬`; `techstack:訪客工作階段`; `plan:端點盤點`
- [x] T002 [NON-TDD] 核對既有 menu price／option adjustment 的 precision、scale 與十進位字串來源；本項不變更計價行為 ← `spec:FR-005`; `research:金額精度與表示`; `techstack:金額表示`; `plan:設計決策·伺服器權威計價`
- [x] T003 [NON-TDD] 核對 PostgreSQL／memory DB schema 及 `GET /menu-items` 規格資料擴充已存在 ← `testplan:TP-001`; `techstack:資料庫`; `openapi:listMenuItems`; `dbml:Table menu_item_options`

## Phase 2: Foundational

**Purpose**：保留共用 session、repository、精確 money 與 cart API 基礎。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `data-model.dbml` | carts、cart_items、cart_item_options | `dbml:Table carts`; `dbml:Table cart_items`; `dbml:Table cart_item_options` | session ownership、獨立項目及 option rows |
| `contracts/http-api.yaml` | 共用 ErrorBody、MoneyAmount、CartResponse | `openapi:components.schemas.ErrorBody`; `openapi:components.schemas.MoneyAmount`; `openapi:components.schemas.CartResponse` | schema 與精確金額 |
| `plan.md` | PostgreSQL／伺服器權威計價 | `plan:設計決策·PostgreSQL`; `plan:設計決策·伺服器權威計價` | 既有端點與計價責任 |

- [x] T004 [NON-TDD] 核對 migration、memory DB、session maintenance 與 cart repository 已完成；此為已完成基礎工作摘要，不新增行為 ← `testplan:TP-008`; `testplan:TP-009`; `dbml:Project`; `dbml:Table carts`; `research:關聯式購物車資料與交易`

---

## Phase 3: User Story 1－將選擇規格的餐點加入購物車（P1）

**端點**：既有 Menu API、Cart API、session／CSRF、PostgreSQL 與前端規格選擇。

#### Backend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | TP-001–TP-008 | `testplan:TP-001`; `testplan:TP-002`; `testplan:TP-003`; `testplan:TP-004`; `testplan:TP-005`; `testplan:TP-006`; `testplan:TP-007`; `testplan:TP-008` | menu options、add cart、ownership、安全與 expiry |
| `contracts/http-api.yaml` | `listMenuItems`、`getCart`、`addCartItem` | `openapi:listMenuItems`; `openapi:getCart`; `openapi:addCartItem`; `openapi:components.schemas.AddCartItemRequest` | 選項來源、bootstrap 與 201/4xx/403/409 |
| `data-model.dbml` | menu options、carts、items、item options | `dbml:Table menu_item_options`; `dbml:Table carts`; `dbml:Table cart_items`; `dbml:Table cart_item_options` | 關聯、有效狀態及 session 隔離 |

- [x] T005 [US1] [TDD:RED] 為 TP-001 建立 menu options 回應測試，驗證多群組、無群組、停用 option 及十進位字串 ← `testplan:TP-001`; `spec:FR-002`; `spec:FR-005`; `openapi:listMenuItems`; `dbml:Table menu_item_options`
- [x] T006 [US1] [TDD:GREEN] 實作／維持既有 `GET /api/menu-items` 回傳完整 option groups／options 與精確 price strings ← `testplan:TP-001`; `spec:FR-002`; `spec:FR-005`; `openapi:listMenuItems`; `dbml:Table menu_item_option_groups`; `dbml:Table menu_item_options`
- [x] T007 [US1] [TDD:RED] 為 TP-002 建立無規格餐點加入 cart、金額計算及獨立 item ID 測試 ← `testplan:TP-002`; `spec:FR-001`; `spec:BR-001`; `openapi:addCartItem`; `dbml:Table cart_items`
- [x] T008 [US1] [TDD:GREEN] 實作 TP-002 無規格餐點新增與 server-side 計價 ← `testplan:TP-002`; `spec:FR-001`; `spec:FR-005`; `openapi:addCartItem`; `research:伺服器權威計價與最新價格`
- [x] T009 [US1] [TDD:RED] 為 TP-003 建立每個 option group 恰選一項並正確計價的測試 ← `testplan:TP-003`; `spec:FR-002`; `spec:BR-002`; `openapi:addCartItem`; `dbml:Table cart_item_options`
- [x] T010 [US1] [TDD:GREEN] 實作 TP-003 規格歸屬驗證、交易新增及金額計算 ← `testplan:TP-003`; `spec:FR-001`; `spec:FR-002`; `spec:BR-002`; `openapi:addCartItem`; `research:關聯式購物車資料與交易`
- [x] T011 [US1] [TDD:RED] 為 TP-004 建立缺選群組時拒絕且 cart 不變的測試 ← `testplan:TP-004`; `spec:US1·情境4`; `spec:BR-002`; `openapi:addCartItem`
- [x] T012 [US1] [TDD:GREEN] 實作 TP-004 缺少規格選項的 400 驗證 ← `testplan:TP-004`; `spec:FR-002`; `openapi:addCartItem`; `openapi:components.schemas.ErrorBody`
- [x] T013 [US1] [TDD:RED] 為 TP-005 建立停供餐點加購回 409 的測試 ← `testplan:TP-005`; `spec:FR-003`; `openapi:addCartItem`
- [x] T014 [US1] [TDD:GREEN] 實作 TP-005 server-side availability guard ← `testplan:TP-005`; `spec:FR-003`; `openapi:addCartItem`
- [x] T015 [US1] [TDD:RED] 為 TP-006 建立兩個 guest session cart 隔離測試 ← `testplan:TP-006`; `spec:FR-004`; `spec:SC-004`; `openapi:getCart`; `dbml:Table carts`
- [x] T016 [US1] [TDD:GREEN] 實作 TP-006 cart lookup 僅依 server-validated session ← `testplan:TP-006`; `spec:FR-004`; `openapi:getCart`; `research:訪客工作階段與購物車歸屬`
- [x] T017 [US1] [TDD:RED] 為 TP-007 建立 invalid Origin／CSRF 寫入拒絕測試 ← `testplan:TP-007`; `spec:FR-004`; `openapi:addCartItem`; `openapi:components.schemas.ErrorBody`
- [x] T018 [US1] [TDD:GREEN] 實作 TP-007 cart write Origin／session-bound CSRF guard ← `testplan:TP-007`; `spec:FR-004`; `openapi:addCartItem`; `research:請求輸入與資料驗證`
- [x] T019 [US1] [TDD:RED] 為 TP-008 建立 expired session 回新空 cart 的測試 ← `testplan:TP-008`; `spec:FR-004`; `research:訪客工作階段與購物車歸屬`; `openapi:getCart`
- [x] T020 [US1] [TDD:GREEN] 實作 TP-008 新 session／空 cart 行為與可控時間 expiry support ← `testplan:TP-008`; `spec:FR-004`; `research:訪客工作階段與購物車歸屬`; `techstack:訪客工作階段`

#### Frontend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | TP-019 incomplete option UI | `testplan:TP-019` | 未選規格不能提交 |
| `ui-plan.md` | 規格選擇、拒絕未供應 | `ui-plan:§畫面與流程→選擇規格並加入供應中餐點`; `ui-plan:§畫面與流程→拒絕未供應餐點` | 選擇 UI 與回饋 |

- [x] T021 [US1] [TDD:RED] 為 TP-019 建立規格未選齊時禁止加入的前端 API/payload 測試 ← `testplan:TP-019`; `spec:FR-002`; `ui-plan:§畫面與流程→選擇規格並加入供應中餐點`
- [x] T022 [US1] [TDD:GREEN] 實作／維持 `MealOptionsDialog` 群組選擇完整性及加入回饋 ← `testplan:TP-019`; `spec:FR-002`; `ui-plan:§畫面與流程→選擇規格並加入供應中餐點`

---

## Phase 4: User Story 2－檢視及管理購物車金額（P1）

#### Backend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | TP-009–TP-017 | `testplan:TP-009`; `testplan:TP-010`; `testplan:TP-011`; `testplan:TP-012`; `testplan:TP-013`; `testplan:TP-014`; `testplan:TP-015`; `testplan:TP-016`; `testplan:TP-017` | read／patch／delete／price authority |
| `contracts/http-api.yaml` | cart operations與 schemas | `openapi:getCart`; `openapi:updateCartItemQuantity`; `openapi:deleteCartItem`; `openapi:components.schemas.CartResponse` | status、payload 與 response |
| `data-model.dbml` | cart rows、menu price/availability | `dbml:Table carts`; `dbml:Table cart_items`; `dbml:Table cart_item_options`; `dbml:Table menu_items`; `dbml:Table menu_item_options` | transaction／server data |

- [x] T023 [US2] [TDD:RED] 為 TP-009 建立 empty cart 回應測試 ← `testplan:TP-009`; `spec:FR-006`; `openapi:getCart`
- [x] T024 [US2] [TDD:GREEN] 實作／維持 TP-009 empty cart 與零總額回應 ← `testplan:TP-009`; `spec:FR-006`; `openapi:getCart`
- [x] T025 [US2] [TDD:RED] 為 TP-010 建立正整數 quantity update 及新金額計算測試 ← `testplan:TP-010`; `spec:FR-007`; `spec:BR-001`; `openapi:updateCartItemQuantity`
- [x] T026 [US2] [TDD:GREEN] 實作 TP-010 quantity update 並依目前價格重算 ← `testplan:TP-010`; `spec:FR-007`; `research:伺服器權威計價與最新價格`; `openapi:updateCartItemQuantity`
- [x] T027 [US2] [TDD:RED] 為 TP-011 建立零／負數／非整數 quantity 拒絕測試 ← `testplan:TP-011`; `spec:FR-007`; `spec:BR-003`; `openapi:updateCartItemQuantity`
- [x] T028 [US2] [TDD:GREEN] 實作 TP-011 正整數驗證，無效輸入不改 cart ← `testplan:TP-011`; `spec:BR-003`; `openapi:updateCartItemQuantity`
- [x] T029 [US2] [TDD:RED] 為 TP-012 建立刪除可用 cart item 並重算 total 的測試 ← `testplan:TP-012`; `spec:FR-007`; `openapi:deleteCartItem`
- [x] T030 [US2] [TDD:GREEN] 實作 TP-012 item deletion 與剩餘 cart total 回應 ← `testplan:TP-012`; `spec:FR-007`; `openapi:deleteCartItem`
- [x] T031 [US2] [TDD:RED] 為 TP-013 建立 menu price 變更後 GET cart 使用最新價格的測試 ← `testplan:TP-013`; `spec:FR-005`; `spec:BR-001`; `openapi:getCart`
- [x] T032 [US2] [TDD:GREEN] 實作／維持 TP-013 每次 cart read 重新讀取 menu price/adjustment ← `testplan:TP-013`; `spec:FR-005`; `research:伺服器權威計價與最新價格`; `openapi:getCart`
- [x] T033 [US2] [TDD:RED] 為 TP-014 建立 cart read 保留 unavailable item、排除金額的測試 ← `testplan:TP-014`; `spec:FR-008`; `spec:SC-005`; `openapi:getCart`
- [x] T034 [US2] [TDD:GREEN] 實作 TP-014 unavailable projection 與只計 available items ← `testplan:TP-014`; `spec:FR-008`; `spec:BR-001`; `openapi:getCart`
- [x] T035 [US2] [TDD:RED] 為 TP-015 建立 unavailable item PATCH 回 409 的測試 ← `testplan:TP-015`; `spec:FR-008`; `openapi:updateCartItemQuantity`
- [x] T036 [US2] [TDD:GREEN] 實作 TP-015 unavailable item 禁止改數量且不變更 cart ← `testplan:TP-015`; `spec:FR-008`; `openapi:updateCartItemQuantity`
- [x] T037 [US2] [TDD:RED] 為 TP-016 建立 unavailable item DELETE 成功但保留其他項目的測試 ← `testplan:TP-016`; `spec:FR-008`; `openapi:deleteCartItem`
- [x] T038 [US2] [TDD:GREEN] 實作 TP-016 unavailable item 可刪除及正確重算 ← `testplan:TP-016`; `spec:FR-008`; `openapi:deleteCartItem`
- [x] T039 [US2] [TDD:RED] 為 TP-017 建立 add cart 不接受 client amount 欄位測試 ← `testplan:TP-017`; `spec:FR-005`; `openapi:addCartItem`
- [x] T040 [US2] [TDD:GREEN] 實作／維持 TP-017 amount 欄位依 contract 拒絕且 cart 不變 ← `testplan:TP-017`; `spec:FR-005`; `openapi:addCartItem`; `openapi:components.schemas.ErrorBody`

#### Frontend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | TP-018 cart UI；TP-019 spec UI | `testplan:TP-018`; `testplan:TP-019` | UI states and controls |
| `ui-plan.md` | Cart／unavailable／price states | `ui-plan:§畫面與流程→檢視與管理購物車`; `ui-plan:§畫面與流程→不可用購物車項目` | cart controls |

- [x] T041 [US2] [NON-TDD] 手動走查 TP-018 CartPage：可用項目金額、unavailable 顯示／禁改／可刪、空車及刪除流程；此為 UI 驗收而非產品行為開發 ← `testplan:TP-018`; `spec:FR-006`; `spec:FR-007`; `spec:FR-008`; `ui-plan:§畫面與流程→檢視與管理購物車`

---

## Dependencies & Execution Order

- 每個 TDD RED task 完成後才執行同 TP 的 GREEN；REFACTOR 若未列出即表示不需要。
- `[NON-TDD]` 僅為環境準備或人工 UI 驗收；產品行為 task 不得用此標籤替代 TDD。
- 本檔為回溯對照，已完成 task 的 checkbox 保留 `[x]`；不推論歷史實作曾依標籤時序執行。

## Format Validation

- 每個 testplan TP 至少由 task 行尾 `testplan:TP-xxx` 引用；各 TDD task 只有一個 step 標籤。
- 每個有任務 endpoint 小節具有四欄必讀對照表，表中每列均由 task 引用。
- 行為任務均有 `[TDD:RED]` 或 `[TDD:GREEN]`；NON-TDD 任務均說明原因。

Constitution self-check: pass
