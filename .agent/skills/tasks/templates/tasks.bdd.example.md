# Tasks: 餐點瀏覽與分類

**Plan directory (PLAN_DIR)**: `specs/plans/001-food-browsing-categories/`

**Truth root (TRUTH_ROOT)**: `specs/truth/`

**測試工作模式**：BDD（來源為 `dsl-refine` 的 TRUTH 介面 Feature／DSL 與 `traceability.md`）

**Spec 套件索引**（按需 READ）：

| 文件 | 位置 | 用途 |
|---|---|---|
| `spec.md` | PLAN_DIR | User Story、FR、SC |
| `truth-delta.md` | PLAN_DIR | 本 plan Truth 變更紀錄 |
| `traceability.md` | PLAN_DIR | acceptance → 介面 Feature |
| `features/acceptance/*.feature` | PLAN_DIR | 驗收 Journey |
| `specs/truth/features/<介面>/菜單/*.feature` | TRUTH_ROOT | 介面 Example |
| `specs/truth/features/<介面>/菜單/dsl.md` | TRUTH_ROOT | DSL 契約 |
| `research.md` | PLAN_DIR | 研究決策 |
| `specs/truth/techstack.md` | TRUTH_ROOT | 技術棧 |
| `plan.md` | PLAN_DIR | 端點盤點 |
| `ui/ui-plan.md`、`ui/prototype/` | PLAN_DIR | UI |
| `specs/truth/data/data-model.dbml` | TRUTH_ROOT | DBML |
| `specs/truth/contracts/http-api.yaml` | TRUTH_ROOT | OpenAPI |
| `scenario-index.md` | PLAN_DIR | 業務情境索引（人 Review） |

## 情境進度（人 Review）

| 業務情境 | 後端 RED | 後端 GREEN | 前端 RED | 前端 GREEN | 備註 |
| --- | --- | --- | --- | --- | --- |
| 顧客依分類瀏覽餐點並確認資訊相符 | ⬜ T003 | ⬜ T004 | ⬜ T020 | ⬜ T021 | 對齊 scenario-index |
| 餐點缺少部分資訊時仍保留在菜單 | ⬜ | ⬜ | ⬜ | ⬜ | |
| 顧客開啟尚無餐點的菜單 | ⬜ | ⬜ | ⬜ | ⬜ | |
| 多筆相似名稱餐點並列時各卡片資訊不混淆 | ⬜ | ⬜ | ⬜ | ⬜ | |

**Organization**：若 `truth-delta.md` 有 **MOD/DEL**，先 **Phase 2.5 Harness 對齊**（每 delta 列至少一 task；Checkpoint 全 suite）。Phase 3 起每 **Truth 介面 Feature 檔**一 Phase；**Then 權威**在 Truth Feature。Example 交錯 `[BDD:RED]`、`[BDD:GREEN]`。之後 **NFR 重構** Phase。

> 完整定稿（含全部 Example 與 `[x]` 回溯）：`specs/plans/001-food-browsing-categories/tasks.md`

## Phase 1: Setup

**Purpose**：確認測試入口；不新增產品行為。

**Read when executing this phase**：`truth-delta.md`、`research.md`、`specs/truth/techstack.md`、`plan.md`、`traceability.md`（Coverage Summary）。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `specs/truth/techstack.md` | Frontend／API | `techstack:前端`; `techstack:API` | test runner |
| `plan.md` | 端點盤點 | `plan:端點盤點` | codebase 範圍 |

- [ ] T001 [NON-TDD] 確認 backend/frontend `npm test` 可執行 ← `plan:端點盤點`; `techstack:frontend`; `techstack:backend`

---

## Phase 2: Foundational

**Purpose**：契約與 fixture 前置。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `specs/truth/data/data-model.dbml` | categories／menu_items | `dbml:Table categories`; `dbml:Table menu_items` | 關聯 |
| `specs/truth/contracts/http-api.yaml` | listCategories、listMenuItems | `openapi:listCategories`; `openapi:listMenuItems` | 讀取契約 |

- [ ] T002 [NON-TDD] 確認 fixture 與 GET API 對齊 model／contract ← `openapi:listCategories`; `openapi:listMenuItems`

**Checkpoint**：harness 可載入。

---

## Phase 2.5: Harness 對齊 Truth delta

<!-- 001 legacy plan：delta 表格多為「尚無」→ 正式 tasks 可省略本 Phase。有 MOD/DEL 時見 Rule-Tasks-Truth-Delta。 -->

---

## Phase 3: `specs/truth/features/backend/菜單/依分類讀取餐點.feature` 🎯 MVP

**Goal**：本 Feature 檔內所有 Example 的 BDD 循環。

**追溯**：`features/acceptance/顧客瀏覽餐點與分類.feature` → `spec:US1`

**Read when executing this phase**：`traceability.md`、`specs/truth/features/backend/菜單/依分類讀取餐點.feature`、`specs/truth/features/backend/菜單/dsl.md`。

### 依分類讀取餐點.feature 任務

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `traceability.md` | acceptance → 後端 | `acceptance:features/acceptance/顧客瀏覽餐點與分類.feature#顧客依分類瀏覽餐點並確認資訊相符` | 承接 acceptance |
| `specs/truth/features/backend/菜單/依分類讀取餐點.feature` | Example 標題 | `feature:specs/truth/features/backend/菜單/依分類讀取餐點.feature#顧客讀取菜單時餐點欄位對應正確分類` | Then |
| `specs/truth/features/backend/菜單/dsl.md` | Given／When | `dsl:specs/truth/features/backend/菜單/dsl.md#菜單資料中有多個分類及其所屬餐點` | 語意 |
| `specs/truth/contracts/http-api.yaml` | listMenuItems | `openapi:listMenuItems` | contract |

- [ ] T003 [US1] [BDD:RED] 接通 Example「顧客讀取菜單時餐點欄位對應正確分類」 ← `acceptance:features/acceptance/顧客瀏覽餐點與分類.feature#顧客依分類瀏覽餐點並確認資訊相符`; `feature:specs/truth/features/backend/菜單/依分類讀取餐點.feature#顧客讀取菜單時餐點欄位對應正確分類`; `dsl:specs/truth/features/backend/菜單/dsl.md#菜單資料中有多個分類及其所屬餐點`; `spec:US1`; `openapi:listMenuItems`
  完成條件：Example 因欄位或分類關聯不符合 Then 而失敗
- [ ] T004 [US1] [BDD:GREEN] 實作最小 API 行為 ← `feature:specs/truth/features/backend/菜單/依分類讀取餐點.feature#顧客讀取菜單時餐點欄位對應正確分類`; `spec:FR-001`; `openapi:listMenuItems`

**Checkpoint**：本 Feature 後端 Example 全綠。

---

## Phase 4–6

<!-- 其餘 Truth Feature 檔各一 Phase；結構同 Phase 3。見 001 定稿 Phase 4–6。 -->

---

## Phase 7: NFR 重構

**Read when executing this phase**：`spec.md`（NFR、SC）、`traceability.md`。

**Checkpoint**：已檢視 NFR／SC；無額外 NFR 任務時須明示。

---

## Format Validation

- Phase 1 含 `truth-delta.md`；Phase 3+ 標題為 `specs/truth/features/…`。
- `feature:`／`dsl:` 錨點使用 `specs/truth/features/…`；`acceptance:` 使用 PLAN_DIR 下 `features/acceptance/…`。

Constitution self-check: pass.

---

## Dependencies & Execution Order

Setup → Foundational → 各 Truth Feature Phase（建議後端先于前端）→ NFR 重構。同一 Example：RED 早於 GREEN；每任務只派送一個 `/bdd` 階段。
