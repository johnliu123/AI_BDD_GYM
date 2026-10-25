---
name: tasks
description: "依 dsl-refine 的 Feature／DSL 與 acceptance traceability 產出 BDD 任務，供 /implement 派送 /bdd；可明確選擇 legacy testplan/TDD 模式以支援既有 feature 套件。"
license: MIT
license-file: LICENSE.txt
attribution: "SDD workflow informed by github/spec-kit (MIT, Copyright GitHub, Inc.)"
---

# Tasks

產出 `tasks.md`：新主模式依 `.agent/skills/dsl-refine` 產生的介面 Feature、DSL 與 acceptance-to-interface traceability，**以介面 Feature 檔為 Phase 單位**（Phase 3 起一檔一 Phase；**不再**以 User Story 或 testplan Slice 為 Phase 標題），於各端點小節內按 Feature 檔內各 **Example**（或 Gherkin `Scenario:` 標題）建立任務；每個 Example 拆成 `[BDD:RED]`、`[BDD:GREEN]`、可選 `[BDD:REFACTOR]`，供 `/implement` 逐階段派送 `/bdd`。全部 Feature Phase 完成後須有 **NFR 重構** Phase，檢視 spec 內 NFR 是否需跨 Feature 的重構或驗證任務。不得改寫 Feature／DSL 的驗收語意或增加無來源依據的行為。純文件／環境準備等非行為任務標 `[NON-TDD]` 並說明原因。BDD 定稿範例見 `templates/tasks.bdd.example.md` 與 `specs/plans/001-food-browsing-categories/tasks.md`。

明確選擇 legacy 模式時，依 `testplan.md` 的 TP 案例建立 `[TDD:RED]`、`[TDD:GREEN]`、可選 `[TDD:REFACTOR]` 任務，供 `/implement` 派送 `/tdd`。Legacy 定稿範例見 `templates/tasks.example.md` 與 `specs/plans/006-advanced-features-system-verification/tasks.md`。若 Feature／DSL 與 testplan 同時存在，預設 BDD 主模式；不得把兩種模式的來源與標籤混在同一份 tasks。兩種模式均沿用 **必讀對照**、**`truth-delta.md`**、Plan／Truth 路徑、任務行尾 `←` 與憲法 overlay；本 skill 不執行測試或實作。

## SOP

### Phase 1 -- 確認輸入、判準與 tasks 骨架

1. READ `../../references/plan-truth-workflow.md`；令 `PLAN_DIR` = 輸入 spec 包（`specs/plans/...`），`TRUTH_ROOT` = `specs/truth/`。
2. READ `PLAN_DIR/spec.md`、`plan.md`、`truth-delta.md`（全文）、`research.md`；`TRUTH_ROOT/techstack.md`（按需）；Truth 內被 truth-delta 點名的 contracts／data／features；BDD 讀 `PLAN_DIR/traceability.md`、`PLAN_DIR/scenario-index.md`（若已有）+ `TRUTH_ROOT/features/**`；legacy 讀 `testplan.md`。
3. READ 一次載入 `rules/Rule-Tasks-端點分層與按需讀取.md`、`rules/Rule-Tasks-Truth-Delta-與-Harness-對齊.md`、`templates/tasks.template.md`。**後續 Phase 不再重複 READ 上述 Rules 與 template 骨架**（憲法 overlay 於 Phase 4 另 READ）。
4. THINK 自 `truth-delta.md` 建立 **Delta → 任務矩陣**（MOD/DEL/ADD × 路徑 × harness 影響）；任一 MOD/DEL 列 MUST 在 Phase 2.5 有對應任務。
5. THINK 選定 BDD 或 legacy 模式；若來源不足或混用，停止並回報。若缺 `research.md` 或 `TRUTH_ROOT/techstack.md`，依前置閘門補齊。選定後 READ 一次模式範例：BDD → `templates/tasks.bdd.example.md`；legacy → `templates/tasks.example.md`。
6. THINK BDD：建立 requirement → acceptance → interface Example → task 覆蓋清單，traceability 無 unmapped／blocked。Legacy：TP-to-task，每 TP 至少一 task。缺口交回上游，不得補造案例。

### Phase 2 -- 編排 Phase 1–2 與後續 Phase

1. THINK Phase 1：必讀對照含 `techstack.md`、`plan.md` 具體列／章；Setup 任務若依 `/technical-research` 決策，須含 `research.md` 列與 `← research:…` / `techstack:…` / `plan:…`。
2. THINK Phase 2：必讀對照含 `data-model.dbml` 的 Table／Note、`http-api.yaml` 的 ErrorBody／Origin 等共通部位。
3. THINK 若 truth-delta 含 MOD/DEL，WRITE **Phase 2.5: Harness 對齊 Truth delta**（每筆 MOD/DEL 至少一 task；Checkpoint 含 techstack 全 suite）；再編排 Phase 3+。
4. THINK BDD：Phase 3 起**每 Truth 介面 Feature 檔一 Phase**（判準：不得以 User Story 為 BDD Phase 標題）；後端 Feature 宜先於前端；之後 **NFR 重構** Phase。Legacy：依 testplan User Story 分 Phase。

### Phase 3 -- Feature File／User Story 任務與 Binding

1. THINK BDD 模式：每個 Feature File Phase 依實際有任務的端點建立 **#### 前端**／**#### 後端**（或其他具名端點）小節；各小節先寫 **必讀對照** 四欄表，列出該檔內 Feature Example（或 Scenario）、DSL 及需求錨點。Legacy 模式：每個 User Story Phase 同樣依端點分小節，列出 `testplan:TP-xxx`。
2. THINK NFR 重構 Phase：READ `spec.md` 範圍內 NFR／SC 與 traceability；若 FR 級 Example 已覆蓋則可不另列任務，但仍須保留 Phase 與 template 引導文字，並在 Checkpoint 註明檢視結果。
3. THINK 從 **`TRUTH_ROOT/contracts/http-api.yaml`**（或 plan 明示路徑）摘 **operationId**；從 **`TRUTH_ROOT/data/data-model.dbml`** 摘 **Table**／**Note**；從 `spec.md` 摘 **US/FR/情境**；從 `ui-plan.md` 摘 **§章節** 與 **prototype 檔名**。Phase 2.5 任務 MUST 含 `truth-delta:<owner>#<列序或摘要鍵>` 錨點（見 `anchor-resolver.md`）。
4. WRITE 每個 `- [ ] Tnnn` 含檔案路徑及恰一個任務類型。BDD：`[BDD:RED]`／`[BDD:GREEN]`／`[BDD:REFACTOR]`，行尾 `←` 引用 `acceptance:`、`feature:`、`dsl:`、`spec:`；**GREEN 對齊 Truth Example Then**。Legacy：`[TDD:*]` + `testplan:TP-xxx`。`[NON-TDD]` 須說明理由。
   - 判準提醒：同一 Example 的 RED、GREEN、可選 REFACTOR **交錯排列**，不得先集中全部 RED（Rule-Tasks 端點分層）。
   - 判準提醒：**RED 須另起一行「完成條件：…」**；BDD RED 寫預期紅燈原因。
5. THINK GREEN 只做最小轉綠；REFACTOR 僅在 GREEN 後且行為不變；每 task 只一階段。
6. THINK 後端任務必引用對應 `openapi:`；持久化任務必引用 `dbml:`；前端必引用 `ui-plan:`／`prototype:`。

### Phase 4 -- 產出 tasks.md

1. READ `../../constitution/CONSTITUTION.md`、`../../constitution/references/artifact-authority.md`、`../../constitution/references/artifact-overlay-sop.md`；EXEC **Phase Load**（artifact=`tasks.md`）。
2. WRITE 依 Phase 1 已載入的 `tasks.template.md` 與模式範例產出完整 `tasks.md`（與 `plan.md` 同目錄），含 **情境進度**表（依 `scenario-index.md` 或 acceptance Example；純後端可省略前端欄）與 Format Validation；MUST 以憲法為最高優先。
3. EXEC **Phase Self-check**（artifact=`tasks.md`）。
4. WRITE 回報 Feature File Phase（BDD）或 User Story Phase（legacy）、Phase 2.5（若 delta 有 MOD/DEL）、NFR 重構 Phase 與 Binding 覆蓋；MOD/DEL vs Phase 2.5 是否 1:1；`Constitution self-check: pass` 或 `exceptions`。
5. WRITE 建議下一指令：預設 **`/analyze`**；實作 **`/implement`**（BDD → `/bdd`，legacy → `/tdd`）。

完成 `tasks.md` 後，依主流程先 **`/analyze`** 對 `spec.md`、`plan.md`、Feature／DSL 或 legacy `testplan.md`、`tasks.md` 做唯讀健檢，再 **`/implement`**（使用者須提供 feature 目錄或 `tasks.md` 路徑）；Implement 依必讀對照、任務錨點與 BDD／legacy TDD 標籤按需 READ，見 `../implement/SKILL.md` 與 `../analyze/SKILL.md`。
