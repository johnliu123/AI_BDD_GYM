# Tasks: 點餐系統第二迭代－購物車與金額計算

**Plan directory (PLAN_DIR)**: `specs/plans/002-shopping-cart-total-calculation/`

**Truth root (TRUTH_ROOT)**: `specs/truth/`

**測試工作模式**：BDD（來源為 `dsl-refine` 的 interface Feature／DSL 與 `traceability.md`）

**Retroactive mapping note**：既有實作均已完成。本次將 Phase 3 起由 legacy「User Story ＋ testplan TP」改編為「介面 Feature 檔 ＋ Example」；`[x]` 保留完成狀態，任務敘述對齊 `features/**/*.feature` 與 DSL。標籤為回溯性 BDD 分類，不代表本文件證明了歷史 RED 先於 GREEN。原 TP-001 菜單規格回應、TP-007／TP-008 session 安全與過期、TP-011 無效數量驗證等併入 Foundational／Setup 核對或 DSL 契約（無獨立 Truth Example 者不以 `[BDD:RED]` 切片）。

**Spec 套件索引**（按需 READ）：

| 文件 | 位置 | 用途 |
|---|---|---|
| `spec.md` | PLAN_DIR | User Story、FR／BR／SC、Q9–Q11 |
| `truth-delta.md` | PLAN_DIR | 本 plan Truth 變更紀錄（legacy plan 見檔首註記） |
| `traceability.md` | PLAN_DIR | acceptance Example → 介面 Feature 覆蓋 |
| `features/acceptance/*.feature` | PLAN_DIR | 整體驗收 Journey |
| `specs/truth/features/<介面>/購物車/*.feature` | TRUTH_ROOT | 原子化 Example 與可驗收行為 |
| `specs/truth/features/<介面>/購物車/dsl.md` | TRUTH_ROOT | Example step 的實作契約 |
| `testplan.md` | PLAN_DIR | 歷史 TP 對照（本 tasks 不以 TP 切片） |
| `research.md` | PLAN_DIR | session、計價、database 決策 |
| `specs/truth/techstack.md` | TRUTH_ROOT | stack 與 test commands |
| `plan.md` | PLAN_DIR | 端點盤點與設計決策 |
| `ui/ui-plan.md`、`ui/prototype/` | PLAN_DIR | 選規格、cart 與 unavailable UI |
| `specs/truth/data/data-model.dbml` | TRUTH_ROOT | session／cart／menu option persistence |
| `specs/truth/contracts/http-api.yaml` | TRUTH_ROOT | cart operations；menu read |


## 情境進度（人 Review）

| 業務情境 | 後端 RED | 後端 GREEN | 前端 RED | 前端 GREEN | 備註 |
| --- | --- | --- | --- | --- | --- |
| 顧客選完每個規格群組後加入餐點 | T005 | T006 | T031 | T032 | 回溯完成 `[x]` |
| 顧客無法加入未供應餐點或未選完整規格的餐點 | T007、T009 | T008、T010 | T033、T035 | T034、T036 | 回溯完成 `[x]` |
| 顧客修改數量與刪除項目後看到最新總額 | T013、T019、T021 | T014、T020、T022 | T037、T039 | T038、T040 | 含讀取與維護 Example；回溯完成 `[x]` |
| 菜單價格變更後以目前價格更新購物車 | T015 | T016 | T041 | T042 | 回溯完成 `[x]` |
| 顧客端提供的金額不能改變系統計價 | T017 | T018 | — | — | 僅後端 Truth Example；回溯完成 `[x]` |
| 餐點或規格停止供應後仍可移除購物車項目 | T023、T025、T027 | T024、T026、T028 | T043、T045、T047 | T044、T046、T048 | 回溯完成 `[x]` |
| 不同顧客無法看到彼此的購物車 | T011 | T012 | T049 | T050 | 回溯完成 `[x]` |
| 顧客開啟空購物車看到零總額 | T029 | T030 | T051 | T052 | 回溯完成 `[x]` |

**Organization**：Phase 3 起每個納入範圍的介面 Feature 檔一 Phase；各 Example 拆 `[BDD:RED]`、`[BDD:GREEN]`。全部 Feature Phase 完成後執行 **NFR 重構** Phase。非行為準備標 `[NON-TDD]` 並說明原因。

## Phase 1: Setup

**Purpose**：核對 session、menu source 與金額精度前置；不新增產品行為。

**Read when executing this phase**：`truth-delta.md`（全文）、`research.md`、`specs/truth/techstack.md`、`plan.md`、`traceability.md`（Coverage Summary）。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `research.md` | session、precision／scale 前置決策 | `research:訪客工作階段與購物車歸屬`; `research:金額精度與表示` | session identity、金額來源 |
| `specs/truth/techstack.md` | 002 前置與 test command | `techstack:訪客工作階段`; `techstack:資料庫`; `techstack:金額表示` | 使用已定案 memory DB／precision |
| `plan.md` | 端點盤點與設計決策 | `plan:端點盤點`; `plan:設計決策·伺服器權威計價` | 不超出 cart scope |

- [x] T001 [NON-TDD] 核對 guest session／cookie／Origin／CSRF 寫入拒絕與 expired session 空 cart 驗收入口（含 `cart-session-boundary.test.js`）；本項是既有環境／政策核對，非產品行為實作 ← `spec:FR-004`; `research:訪客工作階段與購物車歸屬`; `techstack:訪客工作階段`; `plan:端點盤點`; `openapi:getCart`; `openapi:addCartItem`
- [x] T002 [NON-TDD] 核對既有 menu price／option adjustment 的 precision、scale 與十進位字串來源；本項不變更計價行為 ← `spec:FR-005`; `research:金額精度與表示`; `techstack:金額表示`; `plan:設計決策·伺服器權威計價`
- [x] T003 [NON-TDD] 核對 PostgreSQL／memory DB schema 及 `GET /menu-items` 規格群組／選項回應已對齊 contract（含停用 option 與精確 price strings）；屬基礎契約核對 ← `spec:FR-002`; `spec:FR-005`; `techstack:資料庫`; `openapi:listMenuItems`; `dbml:Table menu_item_options`; `dbml:Table menu_item_option_groups`

## Phase 2: Foundational

**Purpose**：保留共用 session、repository、精確 money 與 cart API 基礎；不含尚未有 RED Example 的產品行為。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `specs/truth/data/data-model.dbml` | carts、cart_items、cart_item_options | `dbml:Table carts`; `dbml:Table cart_items`; `dbml:Table cart_item_options` | session ownership、獨立項目及 option rows |
| `specs/truth/contracts/http-api.yaml` | 共用 ErrorBody、MoneyAmount、CartResponse | `openapi:components.schemas.ErrorBody`; `openapi:components.schemas.MoneyAmount`; `openapi:components.schemas.CartResponse` | schema 與精確金額 |
| `plan.md` | PostgreSQL／伺服器權威計價 | `plan:設計決策·PostgreSQL`; `plan:設計決策·伺服器權威計價` | 既有端點與計價責任 |

- [x] T004 [NON-TDD] 核對 migration、memory DB、session maintenance 與 cart repository 已完成；此為已完成基礎工作摘要，不新增行為 ← `dbml:Project`; `dbml:Table carts`; `research:關聯式購物車資料與交易`; `plan:設計決策·PostgreSQL`

**Checkpoint**：後端／前端測試 harness 可載入；cart 契約與 DBML 對齊。

---

## Phase 3: `specs/truth/features/backend/購物車/新增與隔離.feature` 🎯 MVP

**Goal**：完成此 Feature 檔內所有 Example 的 BDD 循環（有效新增、拒絕未供應／缺規格、session 隔離）。

**端點（對齊 plan.md）**：Backend Cart API、session／CSRF、PostgreSQL.

**追溯（acceptance traceability）**：`features/acceptance/訪客購物車與金額計算總驗收旅程.feature` Example「顧客選完每個規格群組後加入餐點」「顧客無法加入未供應餐點或未選完整規格的餐點」「不同顧客無法看到彼此的購物車」→ `spec:US1`; `spec:FR-001`–`FR-004`

**Read when executing this phase**：`traceability.md`（本檔相關列）、`specs/truth/features/backend/購物車/新增與隔離.feature`、`specs/truth/features/backend/購物車/dsl.md`。

### 新增與隔離.feature 任務

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `traceability.md` | 加入購物車 acceptance → 後端 derived Feature | `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#顧客選完每個規格群組後加入餐點`; `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#顧客無法加入未供應餐點或未選完整規格的餐點`; `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#不同顧客無法看到彼此的購物車` | 承接已確認 acceptance 行為 |
| `specs/truth/features/backend/購物車/新增與隔離.feature` | 四個 Example | `feature:specs/truth/features/backend/購物車/新增與隔離.feature#供應中餐點依完整規格選擇加入目前工作階段購物車`; `feature:specs/truth/features/backend/購物車/新增與隔離.feature#未供應餐點加入遭拒`; `feature:specs/truth/features/backend/購物車/新增與隔離.feature#規格群組未選完整時新增遭拒`; `feature:specs/truth/features/backend/購物車/新增與隔離.feature#第二個工作階段讀取不到第一個工作階段的項目` | 各 Example 的 Then 断言 |
| `specs/truth/features/backend/購物車/dsl.md` | 新增／拒絕／隔離 Given/When/Then | `dsl:specs/truth/features/backend/購物車/dsl.md#菜單中有供應中的餐點 "{餐點}" 及其規格群組`; `dsl:specs/truth/features/backend/購物車/dsl.md#顧客將餐點 "{餐點}" 及每組各一個所選規格加入購物車`; `dsl:specs/truth/features/backend/購物車/dsl.md#第二個不同的訪客工作階段讀取自己的購物車` | 交易新增與 session 邊界 |
| `specs/truth/contracts/http-api.yaml` | `addCartItem`、`getCart` | `openapi:addCartItem`; `openapi:getCart`; `openapi:components.schemas.AddCartItemRequest` | 201／4xx 與 cart 回應 |
| `specs/truth/data/data-model.dbml` | menu options、carts、items | `dbml:Table menu_item_options`; `dbml:Table carts`; `dbml:Table cart_items`; `dbml:Table cart_item_options` | 關聯、有效狀態及 session 隔離 |

- [x] T005 [US1] [BDD:RED] 在 backend cart 整合測試接通 Example「供應中餐點依完整規格選擇加入目前工作階段購物車」（含規格持久化與權威金額 Then） ← `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#顧客選完每個規格群組後加入餐點`; `feature:specs/truth/features/backend/購物車/新增與隔離.feature#供應中餐點依完整規格選擇加入目前工作階段購物車`; `dsl:specs/truth/features/backend/購物車/dsl.md#菜單中有供應中的餐點 "{餐點}" 及其規格群組`; `spec:FR-001`; `spec:FR-002`; `openapi:addCartItem`; `dbml:Table cart_item_options`
  完成條件：Example 因未持久化規格選項或項目金額未依菜單／加價／數量計算而失敗
- [x] T006 [US1] [BDD:GREEN] 實作／維持 `POST` 新增 cart item 讓上述 Example 通過的最小行為（含每群組恰一選項與 server-side 計價） ← `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#顧客選完每個規格群組後加入餐點`; `feature:specs/truth/features/backend/購物車/新增與隔離.feature#供應中餐點依完整規格選擇加入目前工作階段購物車`; `spec:FR-001`; `spec:FR-005`; `openapi:addCartItem`; `research:伺服器權威計價與最新價格`
- [x] T007 [US1] [BDD:RED] 接通 Example「未供應餐點加入遭拒」← `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#顧客無法加入未供應餐點或未選完整規格的餐點`; `feature:specs/truth/features/backend/購物車/新增與隔離.feature#未供應餐點加入遭拒`; `dsl:specs/truth/features/backend/購物車/dsl.md#菜單中有未供應的餐點 "{餐點}"`; `spec:FR-003`; `openapi:addCartItem`
  完成條件：Example 因停供餐點仍寫入 cart 或 total 改變而失敗
- [x] T008 [US1] [BDD:GREEN] 實作／維持停供餐點加入時回拒絕且 cart 不變 ← `feature:specs/truth/features/backend/購物車/新增與隔離.feature#未供應餐點加入遭拒`; `spec:FR-003`; `openapi:addCartItem`; `openapi:components.schemas.ErrorBody`
- [x] T009 [US1] [BDD:RED] 接通 Example「規格群組未選完整時新增遭拒」← `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#顧客無法加入未供應餐點或未選完整規格的餐點`; `feature:specs/truth/features/backend/購物車/新增與隔離.feature#規格群組未選完整時新增遭拒`; `dsl:specs/truth/features/backend/購物車/dsl.md#顧客漏選至少一個群組的選項並嘗試加入餐點 "{餐點}"`; `spec:BR-002`; `openapi:addCartItem`
  完成條件：Example 因缺選群組仍建立 cart_item 或部分 option rows 而失敗
- [x] T010 [US1] [BDD:GREEN] 實作／維持缺規格選項時 400 驗證且不留部分持久化 ← `feature:specs/truth/features/backend/購物車/新增與隔離.feature#規格群組未選完整時新增遭拒`; `spec:FR-002`; `openapi:addCartItem`
- [x] T011 [US1] [BDD:RED] 接通 Example「第二個工作階段讀取不到第一個工作階段的項目」← `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#不同顧客無法看到彼此的購物車`; `feature:specs/truth/features/backend/購物車/新增與隔離.feature#第二個工作階段讀取不到第一個工作階段的項目`; `dsl:specs/truth/features/backend/購物車/dsl.md#第一個訪客工作階段的購物車已有餐點 "{餐點}"`; `spec:FR-004`; `spec:SC-004`; `openapi:getCart`; `dbml:Table carts`
  完成條件：Example 因第二 session 讀取仍含第一 session 項目而失敗
- [x] T012 [US1] [BDD:GREEN] 實作／維持 cart lookup 僅依 server-validated session ← `feature:specs/truth/features/backend/購物車/新增與隔離.feature#第二個工作階段讀取不到第一個工作階段的項目`; `spec:FR-004`; `openapi:getCart`; `research:訪客工作階段與購物車歸屬`

**Checkpoint**：`新增與隔離.feature` 後端 Example 全綠。

---

## Phase 4: `specs/truth/features/backend/購物車/查詢與維護.feature`

**Goal**：讀取、數量／刪除維護、最新菜單計價、client 金額拒絕、不可用項目投影與空 cart。

**端點（對齊 plan.md）**：Backend Cart API、`GET`／`PATCH`／`DELETE` cart items.

**追溯**：acceptance Examples「顧客修改數量與刪除項目後看到最新總額」「菜單價格變更後以目前價格更新購物車」「顧客端提供的金額不能改變系統計價」「餐點或規格停止供應後仍可移除購物車項目」「顧客開啟空購物車看到零總額」→ `spec:US2`; `spec:FR-005`–`FR-008`

**Read when executing this phase**：`specs/truth/features/backend/購物車/查詢與維護.feature`、`specs/truth/features/backend/購物車/dsl.md`.

### 查詢與維護.feature 任務

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `traceability.md` | 管理購物車 acceptance → 後端 Feature | `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#顧客修改數量與刪除項目後看到最新總額`; `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#菜單價格變更後以目前價格更新購物車`; `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#顧客端提供的金額不能改變系統計價`; `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#餐點或規格停止供應後仍可移除購物車項目`; `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#顧客開啟空購物車看到零總額` | 讀取與維護 invariant |
| `specs/truth/features/backend/購物車/查詢與維護.feature` | 九個 Example | `feature:specs/truth/features/backend/購物車/查詢與維護.feature#讀取購物車時回傳項目與可用項目總額`; `feature:specs/truth/features/backend/購物車/查詢與維護.feature#菜單價格更新後重新讀取購物車`; `feature:specs/truth/features/backend/購物車/查詢與維護.feature#顧客端提供的金額不能成為計價依據`; `feature:specs/truth/features/backend/購物車/查詢與維護.feature#修改數量後重算項目與總金額`; `feature:specs/truth/features/backend/購物車/查詢與維護.feature#刪除項目後依剩餘項目重算總額`; `feature:specs/truth/features/backend/購物車/查詢與維護.feature#讀取購物車時保留不可用項目但排除金額`; `feature:specs/truth/features/backend/購物車/查詢與維護.feature#不可用項目數量更新遭拒`; `feature:specs/truth/features/backend/購物車/查詢與維護.feature#刪除不可用項目仍獲允許`; `feature:specs/truth/features/backend/購物車/查詢與維護.feature#顧客讀取空購物車` | 各 Example Then |
| `specs/truth/features/backend/購物車/dsl.md` | 讀取／更新／刪除句型 | `dsl:specs/truth/features/backend/購物車/dsl.md#顧客讀取目前工作階段購物車`; `dsl:specs/truth/features/backend/購物車/dsl.md#顧客將餐點 "{餐點}" 的數量更新為 {數量}`; `dsl:specs/truth/features/backend/購物車/dsl.md#購物車總額等於所有可用項目依目前價格計算後的總和` | 權威重算語意 |
| `specs/truth/contracts/http-api.yaml` | cart operations | `openapi:getCart`; `openapi:updateCartItemQuantity`; `openapi:deleteCartItem`; `openapi:components.schemas.CartResponse` | response 與錯誤契約 |
| `specs/truth/data/data-model.dbml` | cart rows、menu price | `dbml:Table cart_items`; `dbml:Table menu_items`; `dbml:Table menu_item_options` | 持久化與 availability |

- [x] T013 [US2] [BDD:RED] 接通 Example「讀取購物車時回傳項目與可用項目總額」← `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#顧客修改數量與刪除項目後看到最新總額`; `feature:specs/truth/features/backend/購物車/查詢與維護.feature#讀取購物車時回傳項目與可用項目總額`; `dsl:specs/truth/features/backend/購物車/dsl.md#顧客讀取目前工作階段購物車`; `spec:FR-006`; `openapi:getCart`
  完成條件：Example 因 GET cart 缺項目欄位或 total 未等於可用項目合計而失敗
- [x] T014 [US2] [BDD:GREEN] 實作／維持 GET cart 回傳完整項目投影與可用項目總額 ← `feature:specs/truth/features/backend/購物車/查詢與維護.feature#讀取購物車時回傳項目與可用項目總額`; `spec:FR-006`; `openapi:getCart`
- [x] T015 [US2] [BDD:RED] 接通 Example「菜單價格更新後重新讀取購物車」← `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#菜單價格變更後以目前價格更新購物車`; `feature:specs/truth/features/backend/購物車/查詢與維護.feature#菜單價格更新後重新讀取購物車`; `dsl:specs/truth/features/backend/購物車/dsl.md#目前工作階段購物車已有餐點 "{餐點}" 且菜單價格或規格加價已變更`; `spec:FR-005`; `spec:BR-001`; `openapi:getCart`
  完成條件：Example 因仍回傳加入時舊價快照而失敗
- [x] T016 [US2] [BDD:GREEN] 實作／維持每次 cart read 重新讀取 menu price／adjustment 並重算 ← `feature:specs/truth/features/backend/購物車/查詢與維護.feature#菜單價格更新後重新讀取購物車`; `spec:FR-005`; `research:伺服器權威計價與最新價格`; `openapi:getCart`
- [x] T017 [US2] [BDD:RED] 接通 Example「顧客端提供的金額不能成為計價依據」← `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#顧客端提供的金額不能改變系統計價`; `feature:specs/truth/features/backend/購物車/查詢與維護.feature#顧客端提供的金額不能成為計價依據`; `dsl:specs/truth/features/backend/購物車/dsl.md#顧客提交含自訂項目金額或總金額的購物車更新`; `spec:FR-005`; `openapi:addCartItem`
  完成條件：Example 因 request 夾帶 client 金額仍改變持久化或回應 total 而失敗
- [x] T018 [US2] [BDD:GREEN] 實作／維持拒絕或忽略 client amount 且計價仍依權威資料 ← `feature:specs/truth/features/backend/購物車/查詢與維護.feature#顧客端提供的金額不能成為計價依據`; `spec:FR-005`; `openapi:components.schemas.ErrorBody`
- [x] T019 [US2] [BDD:RED] 接通 Example「修改數量後重算項目與總金額」← `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#顧客修改數量與刪除項目後看到最新總額`; `feature:specs/truth/features/backend/購物車/查詢與維護.feature#修改數量後重算項目與總金額`; `dsl:specs/truth/features/backend/購物車/dsl.md#顧客將餐點 "{餐點}" 的數量更新為 {數量}`; `spec:FR-007`; `spec:BR-001`; `openapi:updateCartItemQuantity`
  完成條件：Example 因 quantity 更新後 DB 或回應 total 未重算而失敗
- [x] T020 [US2] [BDD:GREEN] 實作／維持 PATCH quantity 並依目前價格重算（含正整數驗證契約） ← `feature:specs/truth/features/backend/購物車/查詢與維護.feature#修改數量後重算項目與總金額`; `spec:FR-007`; `openapi:updateCartItemQuantity`
- [x] T021 [US2] [BDD:RED] 接通 Example「刪除項目後依剩餘項目重算總額」← `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#顧客修改數量與刪除項目後看到最新總額`; `feature:specs/truth/features/backend/購物車/查詢與維護.feature#刪除項目後依剩餘項目重算總額`; `dsl:specs/truth/features/backend/購物車/dsl.md#顧客刪除餐點 "{餐點}"`; `spec:FR-007`; `openapi:deleteCartItem`
  完成條件：Example 因刪除後仍含該項目或 total 未依剩餘項目重算而失敗
- [x] T022 [US2] [BDD:GREEN] 實作／維持 DELETE item 與剩餘 cart total 回應 ← `feature:specs/truth/features/backend/購物車/查詢與維護.feature#刪除項目後依剩餘項目重算總額`; `spec:FR-007`; `openapi:deleteCartItem`
- [x] T023 [US2] [BDD:RED] 接通 Example「讀取購物車時保留不可用項目但排除金額」← `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#餐點或規格停止供應後仍可移除購物車項目`; `feature:specs/truth/features/backend/購物車/查詢與維護.feature#讀取購物車時保留不可用項目但排除金額`; `dsl:specs/truth/features/backend/購物車/dsl.md#不可用項目不回傳單價或項目金額且不計入總額`; `spec:FR-008`; `spec:SC-005`; `openapi:getCart`
  完成條件：Example 因 unavailable 項目被移除、仍計價或仍回傳 line amount 而失敗
- [x] T024 [US2] [BDD:GREEN] 實作／維持 unavailable projection 且 total 只計 available items ← `feature:specs/truth/features/backend/購物車/查詢與維護.feature#讀取購物車時保留不可用項目但排除金額`; `spec:FR-008`; `spec:BR-001`; `openapi:getCart`
- [x] T025 [US2] [BDD:RED] 接通 Example「不可用項目數量更新遭拒」← `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#餐點或規格停止供應後仍可移除購物車項目`; `feature:specs/truth/features/backend/購物車/查詢與維護.feature#不可用項目數量更新遭拒`; `dsl:specs/truth/features/backend/購物車/dsl.md#系統拒絕更新數量`; `spec:FR-008`; `openapi:updateCartItemQuantity`
  完成條件：Example 因 unavailable item PATCH 仍改變 quantity 或 total 而失敗
- [x] T026 [US2] [BDD:GREEN] 實作／維持 unavailable item 禁止改數量且 cart 不變 ← `feature:specs/truth/features/backend/購物車/查詢與維護.feature#不可用項目數量更新遭拒`; `spec:FR-008`; `openapi:updateCartItemQuantity`
- [x] T027 [US2] [BDD:RED] 接通 Example「刪除不可用項目仍獲允許」← `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#餐點或規格停止供應後仍可移除購物車項目`; `feature:specs/truth/features/backend/購物車/查詢與維護.feature#刪除不可用項目仍獲允許`; `spec:FR-008`; `openapi:deleteCartItem`
  完成條件：Example 因 DELETE unavailable 失敗或未重算剩餘 total 而失敗
- [x] T028 [US2] [BDD:GREEN] 實作／維持 unavailable item 可刪除及正確重算 ← `feature:specs/truth/features/backend/購物車/查詢與維護.feature#刪除不可用項目仍獲允許`; `spec:FR-008`; `openapi:deleteCartItem`
- [x] T029 [US2] [BDD:RED] 接通 Example「顧客讀取空購物車」← `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#顧客開啟空購物車看到零總額`; `feature:specs/truth/features/backend/購物車/查詢與維護.feature#顧客讀取空購物車`; `dsl:specs/truth/features/backend/購物車/dsl.md#目前工作階段購物車沒有項目`; `spec:FR-006`; `openapi:getCart`
  完成條件：Example 因空 cart 仍回傳非空 items 或 total 非零而失敗
- [x] T030 [US2] [BDD:GREEN] 實作／維持 empty cart 與零總額回應 ← `feature:specs/truth/features/backend/購物車/查詢與維護.feature#顧客讀取空購物車`; `spec:FR-006`; `openapi:getCart`

**Checkpoint**：`查詢與維護.feature` 後端 Example 全綠。

---

## Phase 5: `specs/truth/features/frontend/購物車/餐點與購物車操作.feature`

**Goal**：前端依 Truth Example 完成規格選擇、cart 操作、金額顯示、隔離與空車狀態。

**端點（對齊 plan.md）**：Frontend、Cart API 整合.

**追溯**：對應 acceptance Journey 八個 Example 之前端 derived 列（見 `traceability.md` frontend／購物車）

**Read when executing this phase**：`specs/truth/features/frontend/購物車/餐點與購物車操作.feature`、`specs/truth/features/frontend/購物車/dsl.md`、`ui/ui-plan.md`.

### 餐點與購物車操作.feature 任務

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `traceability.md` | 各 acceptance → frontend Feature | `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#顧客選完每個規格群組後加入餐點`; `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#顧客無法加入未供應餐點或未選完整規格的餐點`; `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#顧客修改數量與刪除項目後看到最新總額`; `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#菜單價格變更後以目前價格更新購物車`; `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#餐點或規格停止供應後仍可移除購物車項目`; `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#不同顧客無法看到彼此的購物車`; `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#顧客開啟空購物車看到零總額` | UI 與 API 互動 |
| `specs/truth/features/frontend/購物車/餐點與購物車操作.feature` | 十一個 Example | `feature:specs/truth/features/frontend/購物車/餐點與購物車操作.feature#顧客選完每個規格群組後加入餐點`; `feature:specs/truth/features/frontend/購物車/餐點與購物車操作.feature#未完成規格選擇時加入遭拒`; `feature:specs/truth/features/frontend/購物車/餐點與購物車操作.feature#未供應餐點加入遭拒`; `feature:specs/truth/features/frontend/購物車/餐點與購物車操作.feature#顧客修改可用項目數量`; `feature:specs/truth/features/frontend/購物車/餐點與購物車操作.feature#顧客刪除購物車項目`; `feature:specs/truth/features/frontend/購物車/餐點與購物車操作.feature#菜單價格變更後顧客看到最新金額`; `feature:specs/truth/features/frontend/購物車/餐點與購物車操作.feature#停供項目不顯示金額且不計入總額`; `feature:specs/truth/features/frontend/購物車/餐點與購物車操作.feature#顧客無法修改不可用項目數量`; `feature:specs/truth/features/frontend/購物車/餐點與購物車操作.feature#顧客仍可刪除不可用項目`; `feature:specs/truth/features/frontend/購物車/餐點與購物車操作.feature#顧客只看到目前工作階段的購物車`; `feature:specs/truth/features/frontend/購物車/餐點與購物車操作.feature#顧客開啟空購物車` | Playwright／整合 Then |
| `specs/truth/features/frontend/購物車/dsl.md` | 選規格／cart When／Then | `dsl:specs/truth/features/frontend/購物車/dsl.md#顧客選擇餐點 "{餐點}" 的每個規格群組各一個選項並加入購物車`; `dsl:specs/truth/features/frontend/購物車/dsl.md#購物車總額等於所有可用項目依目前價格計算後的總和`; `dsl:specs/truth/features/frontend/購物車/dsl.md#顧客看到空購物車狀態` | 可驗證 UI 断言 |
| `ui/ui-plan.md` | 選規格、Cart、unavailable | `ui-plan:§畫面與流程→選擇規格並加入供應中餐點`; `ui-plan:§畫面與流程→檢視與管理購物車`; `ui-plan:§畫面與流程→不可用購物車項目`; `prototype:index.html` | walkthrough 對照 |

- [x] T031 [US1] [BDD:RED] 接通 Example「顧客選完每個規格群組後加入餐點」← `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#顧客選完每個規格群組後加入餐點`; `feature:specs/truth/features/frontend/購物車/餐點與購物車操作.feature#顧客選完每個規格群組後加入餐點`; `dsl:specs/truth/features/frontend/購物車/dsl.md#購物車測試菜單中有以下餐點：`; `spec:US1`; `ui-plan:§畫面與流程→選擇規格並加入供應中餐點`
  完成條件：Example 因未顯示所選規格或項目金額未含加價而失敗
- [x] T032 [US1] [BDD:GREEN] 實作／維持規格選擇 UI 與加入後 cart 顯示的最小行為 ← `feature:specs/truth/features/frontend/購物車/餐點與購物車操作.feature#顧客選完每個規格群組後加入餐點`; `spec:FR-001`; `spec:FR-002`; `ui-plan:§畫面與流程→選擇規格並加入供應中餐點`
- [x] T033 [US1] [BDD:RED] 接通 Example「未完成規格選擇時加入遭拒」← `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#顧客無法加入未供應餐點或未選完整規格的餐點`; `feature:specs/truth/features/frontend/購物車/餐點與購物車操作.feature#未完成規格選擇時加入遭拒`; `dsl:specs/truth/features/frontend/購物車/dsl.md#顧客未完成規格選擇就嘗試加入餐點 "{餐點}"`; `spec:FR-002`
  完成條件：Example 因缺選規格仍增加 cart 項目而失敗
- [x] T034 [US1] [BDD:GREEN] 實作／維持 `MealOptionsDialog` 群組選擇完整性及拒絕提交 ← `feature:specs/truth/features/frontend/購物車/餐點與購物車操作.feature#未完成規格選擇時加入遭拒`; `spec:FR-002`; `ui-plan:§畫面與流程→選擇規格並加入供應中餐點`
- [x] T035 [US1] [BDD:RED] 接通 Example「未供應餐點加入遭拒」← `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#顧客無法加入未供應餐點或未選完整規格的餐點`; `feature:specs/truth/features/frontend/購物車/餐點與購物車操作.feature#未供應餐點加入遭拒`; `dsl:specs/truth/features/frontend/購物車/dsl.md#顧客嘗試加入餐點 "{餐點}"`; `spec:FR-003`; `ui-plan:§畫面與流程→拒絕未供應餐點`
  完成條件：Example 因停供餐點仍出現在 cart 或 total 改變而失敗
- [x] T036 [US1] [BDD:GREEN] 實作／維持未供應餐點加入回饋且 cart 不變 ← `feature:specs/truth/features/frontend/購物車/餐點與購物車操作.feature#未供應餐點加入遭拒`; `spec:FR-003`; `ui-plan:§畫面與流程→拒絕未供應餐點`
- [x] T037 [US2] [BDD:RED] 接通 Example「顧客修改可用項目數量」← `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#顧客修改數量與刪除項目後看到最新總額`; `feature:specs/truth/features/frontend/購物車/餐點與購物車操作.feature#顧客修改可用項目數量`; `dsl:specs/truth/features/frontend/購物車/dsl.md#顧客將餐點 "{餐點}" 的數量改為 {數量}`; `spec:FR-007`; `ui-plan:§畫面與流程→檢視與管理購物車`
  完成條件：Example 因數量更新後畫面 total 未與 API 權威值一致而失敗
- [x] T038 [US2] [BDD:GREEN] 實作／維持 cart 數量控制與重算後金額顯示 ← `feature:specs/truth/features/frontend/購物車/餐點與購物車操作.feature#顧客修改可用項目數量`; `spec:FR-007`; `ui-plan:§畫面與流程→檢視與管理購物車`
- [x] T039 [US2] [BDD:RED] 接通 Example「顧客刪除購物車項目」← `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#顧客修改數量與刪除項目後看到最新總額`; `feature:specs/truth/features/frontend/購物車/餐點與購物車操作.feature#顧客刪除購物車項目`; `dsl:specs/truth/features/frontend/購物車/dsl.md#顧客刪除購物車中的餐點 "{餐點}"`; `spec:FR-007`
  完成條件：Example 因刪除後仍顯示該項目或 total 未更新而失敗
- [x] T040 [US2] [BDD:GREEN] 實作／維持刪除項目與剩餘 total 顯示 ← `feature:specs/truth/features/frontend/購物車/餐點與購物車操作.feature#顧客刪除購物車項目`; `spec:FR-007`
- [x] T041 [US2] [BDD:RED] 接通 Example「菜單價格變更後顧客看到最新金額」← `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#菜單價格變更後以目前價格更新購物車`; `feature:specs/truth/features/frontend/購物車/餐點與購物車操作.feature#菜單價格變更後顧客看到最新金額`; `dsl:specs/truth/features/frontend/購物車/dsl.md#項目與購物車總額依目前菜單價格重新計算`; `spec:FR-005`
  完成條件：Example 因 UI 仍顯示舊價格或舊 total 而失敗
- [x] T042 [US2] [BDD:GREEN] 實作／維持重新載入 cart 時採最新 menu 價格呈現 ← `feature:specs/truth/features/frontend/購物車/餐點與購物車操作.feature#菜單價格變更後顧客看到最新金額`; `spec:FR-005`
- [x] T043 [US2] [BDD:RED] 接通 Example「停供項目不顯示金額且不計入總額」← `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#餐點或規格停止供應後仍可移除購物車項目`; `feature:specs/truth/features/frontend/購物車/餐點與購物車操作.feature#停供項目不顯示金額且不計入總額`; `dsl:specs/truth/features/frontend/購物車/dsl.md#購物車不顯示餐點 "{餐點}" 的金額且不計入總額`; `spec:FR-008`; `ui-plan:§畫面與流程→不可用購物車項目`
  完成條件：Example 因停供列仍顯示金額或計入 total 而失敗
- [x] T044 [US2] [BDD:GREEN] 實作／維持 unavailable 列標示與 total 排除 ← `feature:specs/truth/features/frontend/購物車/餐點與購物車操作.feature#停供項目不顯示金額且不計入總額`; `spec:FR-008`; `spec:SC-005`
- [x] T045 [US2] [BDD:RED] 接通 Example「顧客無法修改不可用項目數量」← `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#餐點或規格停止供應後仍可移除購物車項目`; `feature:specs/truth/features/frontend/購物車/餐點與購物車操作.feature#顧客無法修改不可用項目數量`; `dsl:specs/truth/features/frontend/購物車/dsl.md#系統拒絕修改且購物車內容維持不變`; `spec:FR-008`
  完成條件：Example 因不可用項目數量仍可變更而失敗
- [x] T046 [US2] [BDD:GREEN] 實作／維持禁用 unavailable 項目數量控制 ← `feature:specs/truth/features/frontend/購物車/餐點與購物車操作.feature#顧客無法修改不可用項目數量`; `spec:FR-008`
- [x] T047 [US2] [BDD:RED] 接通 Example「顧客仍可刪除不可用項目」← `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#餐點或規格停止供應後仍可移除購物車項目`; `feature:specs/truth/features/frontend/購物車/餐點與購物車操作.feature#顧客仍可刪除不可用項目`; `spec:FR-008`
  完成條件：Example 因 DELETE unavailable 在 UI 仍失敗或未更新列表而失敗
- [x] T048 [US2] [BDD:GREEN] 實作／維持不可用項目可刪除流程 ← `feature:specs/truth/features/frontend/購物車/餐點與購物車操作.feature#顧客仍可刪除不可用項目`; `spec:FR-008`
- [x] T049 [US1] [BDD:RED] 接通 Example「顧客只看到目前工作階段的購物車」← `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#不同顧客無法看到彼此的購物車`; `feature:specs/truth/features/frontend/購物車/餐點與購物車操作.feature#顧客只看到目前工作階段的購物車`; `dsl:specs/truth/features/frontend/購物車/dsl.md#第二個顧客看不到餐點 "{餐點}"`; `spec:FR-004`; `spec:SC-004`
  完成條件：Example 因第二 browser context 仍看見第一 session 項目而失敗
- [x] T050 [US1] [BDD:GREEN] 實作／維持雙 context session 隔離下的 cart 顯示 ← `feature:specs/truth/features/frontend/購物車/餐點與購物車操作.feature#顧客只看到目前工作階段的購物車`; `spec:FR-004`
- [x] T051 [US2] [BDD:RED] 接通 Example「顧客開啟空購物車」← `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#顧客開啟空購物車看到零總額`; `feature:specs/truth/features/frontend/購物車/餐點與購物車操作.feature#顧客開啟空購物車`; `dsl:specs/truth/features/frontend/購物車/dsl.md#顧客看到空購物車狀態`; `spec:FR-006`; `ui-plan:§畫面與流程→檢視與管理購物車`
  完成條件：Example 因空 cart 未顯示空狀態或 total 非零而失敗
- [x] T052 [US2] [BDD:GREEN] 實作／維持空購物車狀態與零 total 顯示 ← `feature:specs/truth/features/frontend/購物車/餐點與購物車操作.feature#顧客開啟空購物車`; `spec:FR-006`
- [x] T053 [US1] [NON-TDD] 手動走查：規格選擇、拒絕未供應與 cart 加入回饋；屬 UI walkthrough，不修改產品行為 ← `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#顧客選完每個規格群組後加入餐點`; `ui-plan:§畫面與流程→選擇規格並加入供應中餐點`; `prototype:index.html`
- [x] T054 [US2] [NON-TDD] 手動走查 CartPage：可用項目金額、unavailable 顯示／禁改／可刪、空車及刪除流程；屬 UI 驗收而非產品行為開發 ← `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#顧客修改數量與刪除項目後看到最新總額`; `acceptance:features/acceptance/訪客購物車與金額計算總驗收旅程.feature#餐點或規格停止供應後仍可移除購物車項目`; `ui-plan:§畫面與流程→檢視與管理購物車`; `prototype:index.html`

**Checkpoint**：`餐點與購物車操作.feature` Example 全綠；cart UI walkthrough 完成。

---

## Phase 6: NFR 重構

**Purpose**：檢視 spec 範圍內 NFR 是否在 Feature Phase 後仍不足，必要時列出跨 Feature 的重構或驗證任務。

> 針對所有 User Story 的 NFR 去思考，是否有必要多列一些任務，來重構既有程式，達到 NFR

**Read when executing this phase**：`spec.md`（SC、FR-004 session 安全）、`traceability.md`.

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `spec.md` | SC-001–SC-005、session FR | `spec:SC-002`; `spec:SC-004`; `spec:SC-005` | 可衡量成果是否已由 Feature 覆蓋 |

- [x] T055 [NON-TDD] 核對：本迭代 spec 無專屬 NFR ID；session 隔離、Origin／CSRF、金額權威與不可用項目行為已由 Truth Example 與 Setup（T001–T004）覆蓋；無效 quantity 邊界由 `backend/購物車/dsl.md` 正整數契約與 T020 一併涵蓋，無額外跨 Feature NFR 重構任務 ← `spec:SC-002`; `spec:SC-004`; `spec:SC-005`; `traceability.md`; `spec:FR-004`

**Checkpoint**：已檢視 NFR／SC；無額外 NFR 任務。

---

## Dependencies & Execution Order

- 每個 `[BDD:RED]` 完成後才執行同 Example 的 `[BDD:GREEN]`；`[BDD:REFACTOR]` 若未列出即表示不需要。
- `[NON-TDD]` 僅為環境準備或人工 UI 驗收；產品行為 task 不得用此標籤替代 BDD。
- 本檔為回溯對照，已完成 task 的 checkbox 保留 `[x]`；不推論歷史實作曾依標籤時序執行。

## Format Validation

- Phase 1 必讀含 **`truth-delta.md` 全文**；Phase 3+ 標題為 **`specs/truth/features/…`**；`feature:`／`dsl:` 錨點使用 `specs/truth/features/…`。
- 每個 `####` 小節（含 Setup／Foundational）必有 **必讀對照** 四欄表格。
- 每個 `- [x] Tnnn`（或進行中 `- [ ] Tnnn`）行尾必有 **`←`** 與至少一個機器錨點；對照表每列至少被一個任務 `←` 引用。本檔為回溯完成態，checkbox 均為 `[x]`。
- Phase 3 起以介面 Feature 檔為單位；行為任務帶 `[US1]` 或 `[US2]`；依端點分前端／後端小節。
- 全部 Feature File Phase 之後有 **NFR 重構** Phase；Checkpoint 註明「無額外 NFR 任務」。
- 同一 Example 的 RED→GREEN 順序可由 T 編號判定；不可集中所有 RED 後再安排 GREEN。
- 每個納入範圍的 Feature Example 至少有一項 RED 與 GREEN；BDD task 引用 acceptance Example、Feature Example、DSL 與 spec 錨點（不以 `testplan:TP-*` 驅動行為任務）。
- 同一份 tasks 不混用 BDD 與 legacy `[TDD:*]` 行為標籤。
- 每個 RED 任務下方有「完成條件：…」；GREEN 不需此行。
- 純文件／環境／walkthrough 標 `[NON-TDD]` 並寫明原因。
- 無 truth-delta MOD/DEL → 省略 Phase 2.5。

Constitution self-check: pass.
