# Tasks: 餐點瀏覽與分類

**Plan directory (PLAN_DIR)**: `specs/plans/001-food-browsing-categories/`

**Truth root (TRUTH_ROOT)**: `specs/truth/`

**測試工作模式**：BDD（來源為 `dsl-refine` 的 interface Feature／DSL 與 `traceability.md`）

**Retroactive mapping note**：既有實作均已完成。本次將 Phase 3 起由 legacy「User Story ＋ testplan TP」改編為「介面 Feature 檔 ＋ Example」；`[x]` 保留完成狀態，任務敘述對齊 `features/**/*.feature` 與 DSL。標籤為回溯性 BDD 分類，不代表本文件證明了歷史 RED 先於 GREEN。原 TP-001 分類列表契約併入 Foundational 核對與後端首個 Example 的讀取断言。

**Spec 套件索引**（按需 READ）：

| 文件 | 位置 | 用途 |
|---|---|---|
| `spec.md` | PLAN_DIR | User Story、FR、SC 與邊界情況 |
| `truth-delta.md` | PLAN_DIR | 本 plan Truth 變更紀錄（legacy plan 見檔首註記） |
| `traceability.md` | PLAN_DIR | acceptance Example → 介面 Feature 覆蓋 |
| `features/acceptance/*.feature` | PLAN_DIR | 整體驗收 Journey |
| `specs/truth/features/<介面>/菜單/*.feature` | TRUTH_ROOT | 原子化 Example 與可驗收行為 |
| `specs/truth/features/<介面>/菜單/dsl.md` | TRUTH_ROOT | Example step 的實作契約 |
| `testplan.md` | PLAN_DIR | 歷史 TP 對照（本 tasks 不以 TP 切片） |
| `research.md` | PLAN_DIR | 研究決策 |
| `specs/truth/techstack.md` | TRUTH_ROOT | stack 與 test commands |
| `plan.md` | PLAN_DIR | 端點盤點與設計決策 |
| `ui/ui-plan.md`、`ui/prototype/` | PLAN_DIR | 瀏覽、分類呈現及 UI walkthrough |
| `specs/truth/data/data-model.dbml` | TRUTH_ROOT | categories 與 menu_items 關聯 |
| `specs/truth/contracts/http-api.yaml` | TRUTH_ROOT | `listCategories`、`listMenuItems` |

**Organization**：Phase 3 起每個納入範圍的介面 Feature 檔一 Phase；各 Example 拆 `[BDD:RED]`、`[BDD:GREEN]`。全部 Feature Phase 完成後執行 **NFR 重構** Phase。非行為準備標 `[NON-TDD]` 並說明原因。

## Phase 1: Setup

**Purpose**：確認既有前後端測試入口；不新增產品行為。

**Read when executing this phase**：`truth-delta.md`（全文）、`research.md`、`specs/truth/techstack.md`、`plan.md`、`traceability.md`（Coverage Summary）。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `specs/truth/techstack.md` | Frontend／API 技術棧 | `techstack:前端`; `techstack:API` | 沿用既有 test runner |
| `plan.md` | 端點盤點 | `plan:端點盤點` | 確認瀏覽相關 codebase |

- [x] T001 [NON-TDD] 確認 backend/frontend `npm test` 與 prototype walkthrough 可執行；本任務只記錄環境，不改產品行為 ← `plan:端點盤點`; `techstack:frontend`; `techstack:backend`

## Phase 2: Foundational

**Purpose**：保留既有 categories/menu_items 關聯及只讀 API 前置；不含尚未有 RED Example 的產品行為。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `plan.md` | 需求端點盤點與資料一致性設計 | `plan:端點盤點`; `plan:設計決策` | 菜單只讀，不加入後續迭代功能 |
| `specs/truth/data/data-model.dbml` | categories／menu_items relation | `dbml:Table categories`; `dbml:Table menu_items` | 餐點分類關聯 |
| `specs/truth/contracts/http-api.yaml` | menu read operations | `openapi:listCategories`; `openapi:listMenuItems` | 讀取契約 |

- [x] T002 [NON-TDD] 確認既有資料 fixture 與 GET menu/category API 仍對齊 model／contract（含分類列表欄位）；屬基礎契約核對，不改產品行為 ← `plan:端點盤點`; `dbml:Table categories`; `dbml:Table menu_items`; `openapi:listCategories`; `openapi:listMenuItems`

**Checkpoint**：後端／前端測試 harness 可載入；契約與 DBML 對齊。

---

## Phase 2.5: Harness 對齊 Truth delta

**Purpose**：對齊 `dsl-refine` MOD「backend/菜單/dsl.md 新增 001 公開菜單讀取句型」；確保 step／整合測試能匹配新增 DSL row 與既有 Truth Example Then。

**Read when executing this phase**：`truth-delta.md`（全文）、`specs/truth/techstack.md`、`specs/truth/features/backend/菜單/dsl.md`、`specs/truth/features/backend/菜單/*.feature`。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `truth-delta.md` | §dsl-refine MOD 列 | `truth-delta:dsl-refine#1` | 公開菜單讀取 DSL 已落地 |
| `specs/truth/features/backend/菜單/dsl.md` | 公開菜單讀取 Given/When/Then | `dsl:specs/truth/features/backend/菜單/dsl.md#顧客檢視分類 "{分類}" 的菜單` | BDD step 可解析新句型 |
| `specs/truth/techstack.md` | 測試命令 | `techstack:backend`; `techstack:frontend` | 全 suite smoke |

- [x] T002a [BDD:REFACTOR] 核對並更新 backend menu 相關 step／測試断言，使公開菜單讀取 Example 的 Given/When/Then 對齊 `backend/菜單/dsl.md` 新增列（含分類篩選、空菜單、缺欄位餐點）← `truth-delta:dsl-refine#1`; `dsl:specs/truth/features/backend/菜單/dsl.md#菜單資料中有多個分類及其所屬餐點`; `feature:specs/truth/features/backend/菜單/依分類讀取餐點.feature#顧客讀取菜單時餐點欄位對應正確分類`; `spec:FR-001`; `spec:FR-002`
- [x] T002b [NON-TDD] 執行 `audit_feature_dsl_topology.py --root specs/truth/features/backend/菜單` 或等價 menu 模組 smoke，確認 001 介面 Feature 與 DSL 拓樸無 step 缺 row ← `truth-delta:dsl-refine#1`; `techstack:backend`

**Checkpoint**：依 `techstack.md` 執行 backend（及必要 frontend menu）測試一次；公開菜單讀取相關 Example 全綠。

---

## Phase 3: `specs/truth/features/backend/菜單/依分類讀取餐點.feature` 🎯 MVP

**Goal**：完成此 Feature 檔內所有 Example 的 BDD 循環（餐點欄位、分類篩選、空菜單集合）。

**端點（對齊 plan.md）**：Backend API、relational data.

**追溯（acceptance traceability）**：`features/acceptance/顧客瀏覽餐點與分類總驗收旅程.feature` Example「顧客依分類瀏覽餐點並確認資訊相符」「顧客開啟尚無餐點的菜單」→ `spec:US1`; `spec:FR-001`; `spec:FR-002`

**Read when executing this phase**：`traceability.md`（本檔相關列）、`specs/truth/features/backend/菜單/依分類讀取餐點.feature`、`specs/truth/features/backend/菜單/dsl.md`。

### 依分類讀取餐點.feature 任務

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `traceability.md` | 瀏覽餐點 acceptance → 後端 derived Feature | `acceptance:features/acceptance/顧客瀏覽餐點與分類總驗收旅程.feature#顧客依分類瀏覽餐點並確認資訊相符` | 承接已確認 acceptance 行為 |
| `specs/truth/features/backend/菜單/依分類讀取餐點.feature` | Example「顧客讀取菜單時餐點欄位對應正確分類」等 | `feature:specs/truth/features/backend/菜單/依分類讀取餐點.feature#顧客讀取菜單時餐點欄位對應正確分類`; `feature:specs/truth/features/backend/菜單/依分類讀取餐點.feature#顧客依分類檢視菜單`; `feature:specs/truth/features/backend/菜單/依分類讀取餐點.feature#顧客檢視尚無餐點的菜單` | 三個 Example 的 Then 断言 |
| `specs/truth/features/backend/菜單/dsl.md` | 菜單 Given／When／Then 句型 | `dsl:specs/truth/features/backend/菜單/dsl.md#菜單資料中有多個分類及其所屬餐點`; `dsl:specs/truth/features/backend/菜單/dsl.md#顧客檢視分類 "{分類}" 的菜單` | 持久化與 API 讀取語意 |
| `specs/truth/contracts/http-api.yaml` | `listCategories`、`listMenuItems` | `openapi:listCategories`; `openapi:listMenuItems` | response contract |
| `specs/truth/data/data-model.dbml` | categories、menu_items | `dbml:Table categories`; `dbml:Table menu_items` | 正確 join |

- [x] T003 [US1] [BDD:RED] 在 `backend/src/__tests__/menu-api.test.js` 接通 Example「顧客讀取菜單時餐點欄位對應正確分類」（含分類列表與餐點欄位断言） ← `acceptance:features/acceptance/顧客瀏覽餐點與分類總驗收旅程.feature#顧客依分類瀏覽餐點並確認資訊相符`; `feature:specs/truth/features/backend/菜單/依分類讀取餐點.feature#顧客讀取菜單時餐點欄位對應正確分類`; `dsl:specs/truth/features/backend/菜單/dsl.md#菜單資料中有多個分類及其所屬餐點`; `spec:US1`; `openapi:listCategories`; `openapi:listMenuItems`; `dbml:Table menu_items`
  完成條件：Example 因 GET 分類或餐點回應欄位／分類關聯不符合 Then 而失敗
- [x] T004 [US1] [BDD:GREEN] 實作／維持 `GET /api/categories` 與 `GET /api/menu-items` 讓上述 Example 通過的最小行為 ← `acceptance:features/acceptance/顧客瀏覽餐點與分類總驗收旅程.feature#顧客依分類瀏覽餐點並確認資訊相符`; `feature:specs/truth/features/backend/菜單/依分類讀取餐點.feature#顧客讀取菜單時餐點欄位對應正確分類`; `spec:FR-001`; `spec:FR-002`; `openapi:listCategories`; `openapi:listMenuItems`
- [x] T005 [US1] [BDD:RED] 接通 Example「顧客依分類檢視菜單」之 `category_id` 篩選断言 ← `acceptance:features/acceptance/顧客瀏覽餐點與分類總驗收旅程.feature#顧客依分類瀏覽餐點並確認資訊相符`; `feature:specs/truth/features/backend/菜單/依分類讀取餐點.feature#顧客依分類檢視菜單`; `dsl:specs/truth/features/backend/菜單/dsl.md#顧客檢視分類 "{分類}" 的菜單`; `openapi:listMenuItems`
  完成條件：Example 因篩選參數仍回傳其他分類餐點而失敗
- [x] T006 [US1] [BDD:GREEN] 實作／維持 `GET /api/menu-items?category_id=...` 只回傳該分類餐點 ← `feature:specs/truth/features/backend/菜單/依分類讀取餐點.feature#顧客依分類檢視菜單`; `spec:FR-002`; `openapi:listMenuItems`
- [x] T007 [US1] [BDD:RED] 接通 Example「顧客檢視尚無餐點的菜單」空集合断言 ← `acceptance:features/acceptance/顧客瀏覽餐點與分類總驗收旅程.feature#顧客開啟尚無餐點的菜單`; `feature:specs/truth/features/backend/菜單/依分類讀取餐點.feature#顧客檢視尚無餐點的菜單`; `dsl:specs/truth/features/backend/菜單/dsl.md#菜單中沒有任何餐點`; `openapi:listMenuItems`
  完成條件：Example 因無餐點時仍回傳非空 items 或混淆分類為餐點而失敗
- [x] T008 [US1] [BDD:GREEN] 實作／維持空餐點集合讀取行為 ← `feature:specs/truth/features/backend/菜單/依分類讀取餐點.feature#顧客檢視尚無餐點的菜單`; `spec:FR-001`; `openapi:listMenuItems`

**Checkpoint**：`依分類讀取餐點.feature` 後端 Example 全綠。

---

## Phase 4: `specs/truth/features/backend/菜單/缺圖餐點讀取.feature`

**Goal**：缺圖、缺價、缺分類時 API 仍回傳餐點且欄位為空值。

**端點（對齊 plan.md）**：Backend API.

**追溯**：acceptance Example「餐點缺少部分資訊時仍保留在菜單」→ `spec:FR-002`; `spec:SC-001`

**Read when executing this phase**：`specs/truth/features/backend/菜單/缺圖餐點讀取.feature`、`specs/truth/features/backend/菜單/dsl.md`。

### 缺圖餐點讀取.feature 任務

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `traceability.md` | 缺資料 acceptance → 後端 Feature | `acceptance:features/acceptance/顧客瀏覽餐點與分類總驗收旅程.feature#餐點缺少部分資訊時仍保留在菜單` | 保留餐點 invariant |
| `specs/truth/features/backend/菜單/缺圖餐點讀取.feature` | 三個缺欄位 Example | `feature:specs/truth/features/backend/菜單/缺圖餐點讀取.feature#菜單包含沒有圖片的餐點`; `feature:specs/truth/features/backend/菜單/缺圖餐點讀取.feature#菜單包含沒有價格的餐點`; `feature:specs/truth/features/backend/菜單/缺圖餐點讀取.feature#菜單包含沒有分類的餐點` | 仍包含該餐點 |
| `specs/truth/features/backend/菜單/dsl.md` | 缺圖／缺價／缺分類 Given | `dsl:specs/truth/features/backend/菜單/dsl.md#菜單中有一項沒有圖片的餐點` | nullable 欄位落地 |
| `specs/truth/contracts/http-api.yaml` | `listMenuItems` nullable 欄位 | `openapi:listMenuItems` | OpenAPI nullable |

- [x] T009 [US1] [BDD:RED] 接通 Example「菜單包含沒有圖片的餐點」 ← `acceptance:features/acceptance/顧客瀏覽餐點與分類總驗收旅程.feature#餐點缺少部分資訊時仍保留在菜單`; `feature:specs/truth/features/backend/菜單/缺圖餐點讀取.feature#菜單包含沒有圖片的餐點`; `dsl:specs/truth/features/backend/菜單/dsl.md#菜單中有一項沒有圖片的餐點`; `spec:US1`; `openapi:listMenuItems`
  完成條件：Example 因 image_url 為空時餐點被過濾或偽造圖片而失敗
- [x] T010 [US1] [BDD:GREEN] 實作／維持缺圖餐點仍出現在菜單結果 ← `feature:specs/truth/features/backend/菜單/缺圖餐點讀取.feature#菜單包含沒有圖片的餐點`; `spec:FR-002`; `openapi:listMenuItems`
- [x] T011 [US1] [BDD:RED] 接通 Example「菜單包含沒有價格的餐點」 ← `feature:specs/truth/features/backend/菜單/缺圖餐點讀取.feature#菜單包含沒有價格的餐點`; `dsl:specs/truth/features/backend/菜單/dsl.md#菜單中有一項沒有價格的餐點`; `openapi:listMenuItems`
  完成條件：Example 因 price 為 null 時餐點消失或以零補值而失敗
- [x] T012 [US1] [BDD:GREEN] 實作／維持缺價餐點仍出現在菜單結果且 price 為 null ← `feature:specs/truth/features/backend/菜單/缺圖餐點讀取.feature#菜單包含沒有價格的餐點`; `spec:FR-002`
- [x] T013 [US1] [BDD:RED] 接通 Example「菜單包含沒有分類的餐點」 ← `feature:specs/truth/features/backend/菜單/缺圖餐點讀取.feature#菜單包含沒有分類的餐點`; `dsl:specs/truth/features/backend/菜單/dsl.md#菜單中有一項沒有分類的餐點`; `dbml:Table menu_items`
  完成條件：Example 因 category 為 null 時餐點被過濾或映射錯誤分類而失敗
- [x] T014 [US1] [BDD:GREEN] 實作／維持缺分類餐點仍出現在菜單結果 ← `feature:specs/truth/features/backend/菜單/缺圖餐點讀取.feature#菜單包含沒有分類的餐點`; `spec:FR-002`

**Checkpoint**：`缺圖餐點讀取.feature` 後端 Example 全綠。

---

## Phase 5: `specs/truth/features/frontend/菜單/分類篩選.feature`

**Goal**：顧客切換分類標籤後，UI 只顯示該分類餐點且卡片欄位正確。

**端點（對齊 plan.md）**：Frontend.

**追溯**：acceptance Example「顧客依分類瀏覽餐點並確認資訊相符」→ frontend derived Feature

**Read when executing this phase**：`specs/truth/features/frontend/菜單/分類篩選.feature`、`specs/truth/features/frontend/菜單/dsl.md`、`ui/ui-plan.md`。

### 分類篩選.feature 任務

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `specs/truth/features/frontend/菜單/分類篩選.feature` | Example「顧客切換分類並辨識餐點資料」 | `feature:specs/truth/features/frontend/菜單/分類篩選.feature#顧客切換分類並辨識餐點資料` | 標籤篩選與卡片欄位 |
| `specs/truth/features/frontend/菜單/dsl.md` | 切換分類 When／Then | `dsl:specs/truth/features/frontend/菜單/dsl.md#顧客切換到分類 "{分類}"` | Playwright 操作語意 |
| `ui/ui-plan.md` | 分類標籤、預設「全部」、排序 | `ui-plan:§畫面與流程`; `prototype:index.html` | 篩選政策 walkthrough |

- [x] T015 [US1] [BDD:RED] 接通 Example「顧客切換分類並辨識餐點資料」之前端／整合測試連接 ← `acceptance:features/acceptance/顧客瀏覽餐點與分類總驗收旅程.feature#顧客依分類瀏覽餐點並確認資訊相符`; `feature:specs/truth/features/frontend/菜單/分類篩選.feature#顧客切換分類並辨識餐點資料`; `dsl:specs/truth/features/frontend/菜單/dsl.md#菜單中有以下餐點：`; `spec:US1`; `ui-plan:§畫面與流程`
  完成條件：Example 因切換分類後仍顯示其他分類餐點或卡片欄位錯配而失敗
- [x] T016 [US1] [BDD:GREEN] 實作／維持分類標籤篩選與餐點卡欄位對應的最小 UI 行為 ← `feature:specs/truth/features/frontend/菜單/分類篩選.feature#顧客切換分類並辨識餐點資料`; `spec:FR-001`; `spec:FR-002`; `ui-plan:§畫面與流程`
- [x] T016a [US1] [BDD:RED] 接通 acceptance Example「多筆相似名稱餐點並列時各卡片資訊不混淆」：並列相似名稱餐點時卡片欄位不得錯置 ← `acceptance:features/acceptance/顧客瀏覽餐點與分類總驗收旅程.feature#多筆相似名稱餐點並列時各卡片資訊不混淆`; `feature:specs/truth/features/frontend/菜單/分類篩選.feature#顧客切換分類並辨識餐點資料`; `dsl:specs/truth/features/frontend/菜單/dsl.md#每張餐點卡都顯示該餐點的名稱、圖片、價格與分類`; `spec:SC-002`
  完成條件：Example 因兩張卡片交換價格、圖片或分類而失敗
- [x] T016b [US1] [BDD:GREEN] 實作／維持多筆相似名稱餐點並列時各卡片與 fixture 一一對應 ← `acceptance:features/acceptance/顧客瀏覽餐點與分類總驗收旅程.feature#多筆相似名稱餐點並列時各卡片資訊不混淆`; `spec:FR-002`; `spec:SC-002`
- [x] T017 [US1] [NON-TDD] 手動走查：在 prototype／正式菜單頁確認餐點名稱、圖片、價格、分類正確對應；屬 UI walkthrough，不修改產品行為 ← `acceptance:features/acceptance/顧客瀏覽餐點與分類總驗收旅程.feature#顧客依分類瀏覽餐點並確認資訊相符`; `ui-plan:§畫面與流程`; `prototype:index.html`
- [x] T018 [NON-TDD] 完成分類篩選政策對齊：「全部」為預設、按分類篩選、分類按名稱排序；已更新 UI Plan 與 testplan，並完成正式前端瀏覽器驗收 ← `ui-plan:§畫面與流程`; `spec:US1`

**Checkpoint**：分類篩選 Example 全綠；篩選政策與 UI Plan 一致。

---

## Phase 6: `specs/truth/features/frontend/菜單/空菜單與缺圖.feature`

**Goal**：缺圖／缺價／缺分類及空菜單時 UI 保留卡片或空狀態並明確提示。

**端點（對齊 plan.md）**：Frontend.

**追溯**：acceptance Examples「餐點缺少部分資訊時仍保留在菜單」「顧客開啟尚無餐點的菜單」

**Read when executing this phase**：`specs/truth/features/frontend/菜單/空菜單與缺圖.feature`、`specs/truth/features/frontend/菜單/dsl.md`。

### 空菜單與缺圖.feature 任務

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `specs/truth/features/frontend/菜單/空菜單與缺圖.feature` | 缺圖／缺價／缺分類／空菜單 Example | `feature:specs/truth/features/frontend/菜單/空菜單與缺圖.feature#顧客瀏覽沒有圖片的餐點`; `feature:specs/truth/features/frontend/菜單/空菜單與缺圖.feature#顧客開啟空菜單` | 佔位圖、空值提示、空狀態 |
| `specs/truth/features/frontend/菜單/dsl.md` | 缺資料 Then 句型 | `dsl:specs/truth/features/frontend/菜單/dsl.md#缺少圖片的餐點顯示佔位圖`; `dsl:specs/truth/features/frontend/菜單/dsl.md#顧客看到明確的空菜單狀態` | 可驗證 UI 断言 |
| `ui/ui-plan.md` | 缺資料與空列表呈現 | `ui-plan:§畫面與流程`; `prototype:index.html` | walkthrough |

- [x] T019 [US1] [BDD:RED] 接通 Example「顧客瀏覽沒有圖片的餐點」 ← `acceptance:features/acceptance/顧客瀏覽餐點與分類總驗收旅程.feature#餐點缺少部分資訊時仍保留在菜單`; `feature:specs/truth/features/frontend/菜單/空菜單與缺圖.feature#顧客瀏覽沒有圖片的餐點`; `dsl:specs/truth/features/frontend/菜單/dsl.md#缺少圖片的餐點顯示佔位圖`; `ui-plan:§畫面與流程`
  完成條件：Example 因缺圖餐點被隱藏或未顯示佔位圖而失敗
- [x] T020 [US1] [BDD:GREEN] 實作／維持缺圖餐點卡與佔位圖呈現 ← `feature:specs/truth/features/frontend/菜單/空菜單與缺圖.feature#顧客瀏覽沒有圖片的餐點`; `spec:FR-002`
- [x] T021 [US1] [BDD:RED] 接通 Example「顧客瀏覽沒有價格的餐點」 ← `feature:specs/truth/features/frontend/菜單/空菜單與缺圖.feature#顧客瀏覽沒有價格的餐點`; `dsl:specs/truth/features/frontend/菜單/dsl.md#缺少價格的餐點顯示明確提示`
  完成條件：Example 因顯示零或假價格、或隱藏餐點而失敗
- [x] T022 [US1] [BDD:GREEN] 實作／維持缺價提示呈現 ← `feature:specs/truth/features/frontend/菜單/空菜單與缺圖.feature#顧客瀏覽沒有價格的餐點`; `spec:FR-002`
- [x] T023 [US1] [BDD:RED] 接通 Example「顧客瀏覽沒有分類的餐點」 ← `feature:specs/truth/features/frontend/菜單/空菜單與缺圖.feature#顧客瀏覽沒有分類的餐點`; `dsl:specs/truth/features/frontend/菜單/dsl.md#缺少分類的餐點顯示明確提示`
  完成條件：Example 因映射錯誤分類或隱藏餐點而失敗
- [x] T024 [US1] [BDD:GREEN] 實作／維持缺分類提示呈現 ← `feature:specs/truth/features/frontend/菜單/空菜單與缺圖.feature#顧客瀏覽沒有分類的餐點`; `spec:FR-002`
- [x] T025 [US1] [BDD:RED] 在 `frontend/src/menuApi.test.js` 接通 Example「顧客開啟空菜單」之空資料載入断言 ← `acceptance:features/acceptance/顧客瀏覽餐點與分類總驗收旅程.feature#顧客開啟尚無餐點的菜單`; `feature:specs/truth/features/frontend/菜單/空菜單與缺圖.feature#顧客開啟空菜單`; `dsl:specs/truth/features/frontend/菜單/dsl.md#菜單目前沒有任何餐點`; `openapi:listCategories`; `openapi:listMenuItems`
  完成條件：Example 因空 categories/items 仍建立虛構餐點卡而失敗
- [x] T026 [US1] [BDD:GREEN] 維持空資料呈現為空菜單狀態，不建立餐點卡 ← `feature:specs/truth/features/frontend/菜單/空菜單與缺圖.feature#顧客開啟空菜單`; `spec:FR-001`; `ui-plan:§畫面與流程`
- [x] T027 [US1] [NON-TDD] 手動走查：缺圖／缺價／缺分類時保留卡片並顯示提示；屬驗收走查，不修改產品行為 ← `acceptance:features/acceptance/顧客瀏覽餐點與分類總驗收旅程.feature#餐點缺少部分資訊時仍保留在菜單`; `ui-plan:§畫面與流程`; `prototype:index.html`

**Checkpoint**：`空菜單與缺圖.feature` Example 全綠；邊界 walkthrough 完成。

---

## Phase 7: NFR 重構

**Purpose**：檢視 spec 範圍內 NFR 是否在 Feature Phase 後仍不足，必要時列出跨 Feature 的重構或驗證任務。

> 針對所有 User Story 的 NFR 去思考，是否有必要多列一些任務，來重構既有程式，達到 NFR

**Read when executing this phase**：`spec.md`（NFR、SC）、`traceability.md`。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `spec.md` | US1 NFR、SC-001／SC-002 | `spec:SC-001`; `spec:SC-002` | 可衡量成果是否已由 Feature 覆蓋 |

（本 scope US1 未另列專屬 NFR；SC 已由各 Feature Example 與 walkthrough 覆蓋，無額外跨 Feature 重構任務。）

**Checkpoint**：已檢視 NFR／SC；無額外 NFR 任務。

---

## Format Validation

- Phase 1 必讀含 **`truth-delta.md` 全文**；Phase 3+ 標題為 **`specs/truth/features/…`**；`feature:`／`dsl:` 錨點使用 `specs/truth/features/…`。
- 每個 `####` 小節（含 Setup／Foundational）必有 **必讀對照** 四欄表格。
- 每個 `- [ ] Tnnn` 行尾必有 **`←`** 與至少一個機器錨點；對照表每列至少被一個任務 `←` 引用。
- Phase 3 起以介面 Feature 檔為單位；行為任務帶 `[US1]`；依端點分前端／後端小節。
- 全部 Feature File Phase 之後有 **NFR 重構** Phase；Checkpoint 註明「無額外 NFR 任務」。
- 同一 Example 的 RED→GREEN 順序可由 T 編號判定；不可集中所有 RED 後再安排 GREEN。
- 每個納入範圍的 Feature Example 至少有一項 RED 與 GREEN；BDD task 引用 acceptance Example、Feature Example、DSL 與 spec 錨點。
- 同一份 tasks 不混用 BDD 與 legacy `[TDD:*]` 行為標籤。
- 每個 RED 任務下方有「完成條件：…」；GREEN 不需此行。
- 純文件／環境／walkthrough 標 `[NON-TDD]` 並寫明原因。

Constitution self-check: pass.
