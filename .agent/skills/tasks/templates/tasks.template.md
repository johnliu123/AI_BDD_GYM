# Tasks: {{feature_name}}

**Input**: 設計文件位於 `{{feature_spec_dir}}/`

**Spec 套件索引**（按需 READ；執行到對應 Phase／小節再載入，勿一次讀完）：

| 文件 | 用途 |
|---|---|
| `spec.md` | 需求、User Story、驗收 |
| `research.md` | 技術決策、理由與替代方案（Setup／Foundational、對齊 plan 時） |
| `plan.md` | 專案結構、端點盤點、設計決策 |
| `techstack.md` | 技術棧與版本（Setup；摘要自 research） |
| `ui-plan.md` · `prototype/` | 前端（前端小節前 READ 對照表列） |
| `data-model.dbml` | 資料與儲存（後端小節前 READ 對照表列） |
| `contracts/http-api.yaml` | API（後端小節前 READ 對照表列） |
| `quickstart.md` | 建置與 smoke（Polish） |

**Organization**: Phase 3 起依 User Story；故事內 **#### 前端／後端** 第二層。每小節先 **必讀對照** 表格（人讀部位 + 機器錨點），再執行任務；每個 `Tnnn` 行尾 **`←` 錨點**，且對照表每一列至少被一個任務引用。

**機器錨點語法**：`spec:FR-001` · `spec:US1` · `research:{決策小節}` · `plan:設計決策·…` · `techstack:…` · `openapi:{operationId}` · `dbml:Table {name}` · `dbml:Note:…` · `ui-plan:§…` · `prototype:{file}`

## Phase 1: Setup

**Purpose**: {{phase1_purpose}}

**Read when executing this phase**: `research.md`（決策摘要）、`techstack.md`、`plan.md`（僅本 Phase 章節）。

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

## Phase 3: User Story {{us1_id}} - {{us1_title}} (Priority: {{us1_priority}}) 🎯 MVP

**Goal**: {{us1_goal}}

**Independent Test**: {{us1_independent_test}}

**端點（對齊 plan.md）**: {{us1_endpoints_from_plan}}

### Tests for User Story {{us1_id}}

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
{{us1_frontend_tests_bindings}}

{{us1_frontend_tests}}

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
{{us1_backend_tests_bindings}}

{{us1_backend_tests}}

### Implementation for User Story {{us1_id}}

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
{{us1_frontend_impl_bindings}}

{{us1_frontend_implementation}}

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
{{us1_backend_impl_bindings}}

{{us1_backend_implementation}}

**Checkpoint**: {{us1_checkpoint}}

---

{{additional_user_story_phases}}

## Phase {{polish_phase_number}}: Polish & Cross-Cutting Concerns

{{polish_section}}

---

## Format Validation

- 每個 `####` 小節（含 Setup／Foundational 若有任務表）必有 **必讀對照** 四欄表格。
- 每個 `- [ ] Tnnn` 行尾必有 **`←`** 與至少一個機器錨點；對照表每列至少被一個任務 `←` 引用。
- User Story 任務帶 `[USn]`；含前端／後端第二層；禁止僅列檔案名而不列部位／錨點。
- 缺 openapi／dbml／ui-plan 錨點時不得發明實作任務；Setup／Foundational 及受 `/technical-research` 驅動的任務須含對應 `research:{決策小節}`。
