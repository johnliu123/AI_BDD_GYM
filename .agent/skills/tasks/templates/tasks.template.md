# Tasks: {{feature_name}}

**Input**: 設計文件位於 `{{feature_spec_dir}}/`

**Spec 套件索引**（按需 READ；執行到對應 Phase／小節再載入，勿一次讀完）：

| 文件 | 用途 |
|---|---|
| `spec.md` | 需求、User Story、驗收 |
| `testplan.md` | User Story 測試案例、TP ID、測試入口與 NFR 追溯（任務唯一測試來源） |
| `research.md` | 技術決策、理由與替代方案（Setup／Foundational、對齊 plan 時） |
| `plan.md` | 專案結構、端點盤點、設計決策 |
| `techstack.md` | 技術棧與版本（Setup；摘要自 research） |
| `ui-plan.md` · `prototype/` | 前端（前端小節前 READ 對照表列） |
| `data-model.dbml` | 資料與儲存（後端小節前 READ 對照表列） |
| `contracts/http-api.yaml` | API（後端小節前 READ 對照表列） |
| `quickstart.md` | 建置與 smoke（Polish） |

**Organization**: 依 `testplan.md` 的 User Story 與 TP 案例切分；每個 TP 案例至少被一項 task 引用。行為任務恰有一個 `[TDD:RED]`／`[TDD:GREEN]`／`[TDD:REFACTOR]` 標籤，多步驟工作拆成多項 task；非行為準備任務用 `[NON-TDD]` 並說明原因。每個 task 行尾含 `← testplan:TP-xxx` 及必要來源錨點。

**機器錨點語法**：`testplan:TP-001` · `spec:FR-001` · `spec:US1` · `research:{決策小節}` · `plan:設計決策·…` · `techstack:…` · `openapi:{operationId}` · `dbml:Table {name}` · `dbml:Note:…` · `ui-plan:§…` · `prototype:{file}`

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

### User Story {{us1_id}} 任務

依 TP 案例排列；每個案例先 RED、再 GREEN、必要時 REFACTOR。只建立本故事有任務的端點小節。

<!-- 若此故事有前端任務，保留此前端小節；否則移除。 -->
#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
{{us1_frontend_bindings}}

{{us1_frontend_tdd_tasks}}

<!-- 若此故事有後端任務，保留此後端小節；否則移除。 -->
#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
{{us1_backend_bindings}}

{{us1_backend_tdd_tasks}}

<!-- 任務範例：
- [ ] T001 [US1] [TDD:RED] 建立 TP-001 測試 ← `testplan:TP-001`; `spec:US1`; `openapi:{operationId}`
  完成條件：測試因「{依 TP-001 Assert 推導的預期行為缺口}」而失敗
同一 TP 的 GREEN／可選 REFACTOR 另列任務，不重複完成條件行。 -->

**Checkpoint**: {{us1_checkpoint}}

---

{{additional_user_story_phases}}

## Phase {{polish_phase_number}}: Polish & Cross-Cutting Concerns

{{polish_section}}

---

## Format Validation

- 每個 `####` 小節（含 Setup／Foundational 若有任務表）必有 **必讀對照** 四欄表格。
- 每個 `- [ ] Tnnn` 行尾必有 **`←`** 與至少一個機器錨點；對照表每列至少被一個任務 `←` 引用。
- User Story 任務帶 `[USn]`；依實際任務端點分前端／後端等小節；不同 codebase 不得混列。
- 每個 TP 的 RED→GREEN→可選 REFACTOR 順序可由 T 編號與 Dependencies 明確判定；不可集中所有 RED 後再安排 GREEN。
- 每個 `testplan.md` 的 TP 案例至少被一項 task 的 `testplan:TP-xxx` 錨點引用；不得新增沒有 testplan 依據的行為任務。
- 每個行為任務恰有一個 TDD 步驟標籤；RED、GREEN、REFACTOR 必須拆成不同 task，且引用同一 TP 案例。
- 每個 `[TDD:RED]` 任務下方須有一行「完成條件：…」，明確寫出依 testplan Assert 推導的預期紅燈原因；`[TDD:GREEN]`／`[TDD:REFACTOR]` 不需此行。
- 純文件／環境準備等非行為任務須標 `[NON-TDD]` 並寫明原因；產品行為不得以此豁免 TDD。
- 缺 openapi／dbml／ui-plan 錨點時不得發明實作任務；Setup／Foundational 及受 `/technical-research` 驅動的任務須含對應 `research:{決策小節}`。
