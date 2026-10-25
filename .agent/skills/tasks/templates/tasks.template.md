# Tasks: {{feature_name}}

**Plan directory (PLAN_DIR)**: `{{feature_spec_dir}}/`（同義：歷史名 **FEATURE_DIR**）

**Truth root (TRUTH_ROOT)**: `specs/truth/`（介面 Feature、DSL、techstack、contracts、data；見 `.agent/references/plan-truth-workflow.md`）

**測試工作模式**：{{test_work_mode_bdd_or_legacy}}

<!-- 可選：`Retroactive mapping note`（已完成套件重編 tasks 時說明回溯狀態） -->

**Spec 套件索引**（按需 READ；執行到對應 Phase／小節再載入，勿一次讀完）：

| 文件 | 位置 | 用途 |
|---|---|---|
| `spec.md` | PLAN_DIR | 需求、User Story、驗收 |
| `truth-delta.md` | PLAN_DIR | 本 plan 對 Truth 的 ADD/MOD/DEL 摘要（各 Truth owner 一表） |
| `traceability.md` | PLAN_DIR | 介面情境摘要 + AI Coverage Matrix（BDD 主模式） |
| `scenario-index.md` | PLAN_DIR | 業務情境索引（人 Review 主入口；BDD 主模式） |
| `features/acceptance/*.feature` | PLAN_DIR | 整體驗收 Journey |
| `specs/truth/features/<介面>/<模組>/*.feature` | TRUTH_ROOT | 原子化 Example／Scenario（BDD 主模式） |
| `specs/truth/features/<介面>/…/dsl.md` | TRUTH_ROOT | Example step 的實作契約 |
| `testplan.md` | PLAN_DIR | TP 案例（僅 legacy TDD 模式） |
| `research.md` | PLAN_DIR | 技術決策（Setup／Foundational） |
| `plan.md` | PLAN_DIR | 端點盤點、設計決策 |
| `specs/truth/techstack.md` | TRUTH_ROOT | 技術棧（Setup） |
| `ui/ui-plan.md` · `ui/prototype/` | PLAN_DIR | 前端 walkthrough |
| `specs/truth/data/data-model.dbml` | TRUTH_ROOT | 資料模型 |
| `specs/truth/contracts/http-api.yaml` | TRUTH_ROOT | API 契約 |
| `quickstart.md` | PLAN_DIR 或 repo | 建置與 smoke（可選 Polish） |

## 情境進度（BDD 主模式 — 人 Review）

<!-- 依 acceptance Example／scenario-index.md 填寫；任務完成後將 ⬜ 改為 ✅ 並填入 Tnnn -->

| 業務情境 | 後端 RED | 後端 GREEN | 前端 RED | 前端 GREEN | 備註 |
| --- | --- | --- | --- | --- | --- |
| {{acceptance_scenario_title}} | ⬜ {{backend_red_task_or_dash}} | ⬜ {{backend_green_task_or_dash}} | ⬜ {{frontend_red_task_or_dash}} | ⬜ {{frontend_green_task_or_dash}} | {{notes_or_empty}} |

**Organization**: BDD 主模式以 **TRUTH_ROOT 內介面 Feature 檔**為 Phase 單位；**驗收權威** = Truth Feature **Then** + DSL（過渡 `*.test.js` 僅 RED 接通）。若 `truth-delta.md` 含 **MOD/DEL** 列，MUST 在 Phase 2 與 Phase 3 之間插入 **`Phase 2.5: Harness 對齊 Truth delta`**（每筆 MOD/DEL 至少一 task）。Phase 3 起每檔一 Phase，Example 拆 `[BDD:RED]`／`[BDD:GREEN]`／可選 `[BDD:REFACTOR]`。全部 Feature Phase 後 **NFR 重構** Phase。Legacy 模式依 testplan User Story；delta 有 MOD/DEL 時仍須 Phase 2.5。不得混用 BDD 與 legacy 標籤。

**機器錨點語法**（Truth 路徑以 repo 根 `specs/truth/` 為準）：

- `feature:specs/truth/features/<介面>/<模組>/<檔名>.feature#<Example 或 Scenario 標題>`
- `dsl:specs/truth/features/<介面>/<模組>/dsl.md#<DSL 句型>`
- `acceptance:features/acceptance/<檔名>.feature#<Example 標題>`（相對 PLAN_DIR）
- `testplan:TP-001`（legacy）· `spec:FR-001` · `spec:US1`
- `research:{決策小節}` · `plan:設計決策·…` · `techstack:…`（解析至 `specs/truth/techstack.md`）
- `openapi:{operationId}` · `dbml:Table {name}` · `dbml:Note:…`（解析至 Truth 契約／DBML）
- `ui-plan:§…` · `prototype:{file}`（相對 `PLAN_DIR/ui/`）
- `truth-delta:{owner_skill_id}#{列序或摘要鍵}`（Phase 2.5 對齊任務；指向 `PLAN_DIR/truth-delta.md` 表格列）

## Phase 1: Setup

**Purpose**: {{phase1_purpose}}

**Read when executing this phase**: `truth-delta.md`（全文）、`research.md`（決策摘要）、`specs/truth/techstack.md`、`plan.md`（僅本 Phase 章節）、`traceability.md`（Coverage Summary；BDD 模式）。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
{{phase1_binding_rows}}

{{phase1_tasks}}

---

## Phase 2: Foundational

**Purpose**: {{phase2_purpose}}

**⚠️ {{foundational_gate_note}}**

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
{{phase2_binding_rows}}

{{phase2_tasks}}

**Checkpoint**: {{phase2_checkpoint}}

---

## Phase 2.5: Harness 對齊 Truth delta

<!-- 僅當 truth-delta.md 含 MOD 或 DEL 資料列時保留本 Phase；否則刪除整節 -->

**Purpose**: {{harness_delta_purpose}}

**Read when executing this phase**: `truth-delta.md`（全文）、`specs/truth/techstack.md`、受 delta 點名的 Truth 路徑。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
{{harness_delta_binding_rows}}

{{harness_delta_tasks}}

**Checkpoint**: {{harness_delta_checkpoint}}

---

## Phase 3: `specs/truth/features/{{ff1_feature_relative_path}}` 🎯 MVP

**Goal**: {{ff1_goal}}

**端點（對齊 plan.md）**: {{ff1_endpoints_from_plan}}

**追溯（acceptance traceability）**: {{ff1_traceability_summary}}

**Read when executing this phase**: `traceability.md`（本檔相關列）、`specs/truth/features/{{ff1_feature_relative_path}}`、{{ff1_dsl_paths}}。

### {{ff1_feature_basename}} 任務

BDD 主模式：依本 Feature 檔內各 Example（或 Scenario）交錯建立 RED、GREEN、必要時 REFACTOR。Legacy 模式：依 TP 案例建立 TDD 階段。只建立本 Phase 有任務的端點小節。

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
{{ff1_frontend_bindings}}

{{ff1_frontend_bdd_or_legacy_tasks}}

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
{{ff1_backend_bindings}}

{{ff1_backend_bdd_or_legacy_tasks}}

<!-- BDD 任務範例：
- [ ] T001 [US1] [BDD:RED] 接通 Example「{Example 標題}」 ← `acceptance:features/acceptance/<檔名>.feature#{Acceptance Example}`; `feature:specs/truth/features/<介面>/<模組>/<檔名>.feature#{Example 標題}`; `dsl:specs/truth/features/<介面>/<模組>/dsl.md#{DSL 句型}`; `spec:US1`
  完成條件：Example 因「{預期行為缺口}」而在業務結果斷言失敗
- [ ] T002 [US1] [BDD:GREEN] 實作讓該 Example 通過的最小行為 ← 同一組 acceptance／feature／dsl／spec 錨點
完整 BDD 定稿見 `tasks.bdd.example.md` 與 `specs/plans/001-food-browsing-categories/tasks.md`。Legacy TDD 見 `tasks.example.md` 與 `specs/plans/006-advanced-features-system-verification/tasks.md`。 -->

**Checkpoint**: {{ff1_checkpoint}}

---

{{additional_feature_file_phases}}

## Phase {{nfr_phase_number}}: NFR 重構

**Purpose**: {{nfr_phase_purpose}}

> 針對所有 User Story 的 NFR 去思考，是否有必要多列一些任務，來重構既有程式，達到 NFR

**Read when executing this phase**: `spec.md`（NFR、SC）、`traceability.md`（NFR 相關列；BDD 主模式）。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
{{nfr_binding_rows}}

{{nfr_tasks}}

**Checkpoint**: {{nfr_checkpoint}}

---

## Phase {{polish_phase_number}}: Polish & Cross-Cutting Concerns

{{polish_section}}

---

## Format Validation

- 每個 `####` 小節（含 Setup／Foundational 若有任務表）必有 **必讀對照** 四欄表格。
- Phase 1 必讀含 **`truth-delta.md` 全文**；Truth 檔依表格與任務錨點按需 READ。
- truth-delta 含 **MOD/DEL** 時 MUST 含 **Phase 2.5**；每筆 MOD/DEL 至少一 task，含 `truth-delta:` 錨點。
- BDD **GREEN** 須對齊 Truth Example **Then**（過渡測試檔僅 RED）。
- 每個 `- [ ] Tnnn` 行尾必有 **`←`** 與至少一個機器錨點；對照表每列至少被一個任務 `←` 引用。
- BDD 主模式 Phase 3 起 Phase 標題為 **`specs/truth/features/…` 路徑**；Legacy 仍以 User Story 為 Phase 單位。
- BDD 主模式在全部 Feature File Phase 之後須有 **NFR 重構** Phase。
- 同一 Example／Scenario（BDD）或 TP（Legacy）的 RED→GREEN→可選 REFACTOR 順序明確；BDD 錨點含 `acceptance:`、`feature:specs/truth/…#`、`dsl:specs/truth/…#`。
- 同一份 tasks 不可混用 BDD 與 legacy `[TDD:*]` 行為標籤。
- 每個 RED 任務下方須有「完成條件：…」；GREEN／REFACTOR 不需此行。
- 純文件／環境準備標 `[NON-TDD]` 並寫明原因。
