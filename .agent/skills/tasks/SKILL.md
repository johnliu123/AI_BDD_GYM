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

### Phase 1 -- 確認輸入

1. READ `../../references/plan-truth-workflow.md`；令 `PLAN_DIR` = 輸入 spec 包（`specs/plans/...`），`TRUTH_ROOT` = `specs/truth/`。
2. READ `PLAN_DIR/spec.md`、`plan.md`、`truth-delta.md`（全文）、`research.md`；`TRUTH_ROOT/techstack.md`（按需）；以及 Truth 內被 truth-delta 點名的 contracts／data／features；依選定模式：BDD 讀 `PLAN_DIR/traceability.md` + `TRUTH_ROOT/features/**`；legacy 讀 `testplan.md`。
3. READ `rules/Rule-Tasks-端點分層與按需讀取.md`、`rules/Rule-Tasks-Truth-Delta-與-Harness-對齊.md`。
4. THINK 自 `truth-delta.md` 建立 **Delta → 任務矩陣**（MOD/DEL/ADD × 路徑 × harness 影響）；任一 MOD/DEL 列 MUST 在 Phase 2.5 有對應任務（見 Rule-Tasks-Truth-Delta）。
5. THINK 若使用者指定 legacy testplan/TDD 模式，依該模式作業；否則若介面 Feature、DSL 與 traceability 已存在，採 BDD 主模式；若來源不足以唯一選定模式或缺少所選模式的必要產物，停止並詢問／回報缺口，不自行混用兩種來源。若缺 `research.md` 或 `TRUTH_ROOT/techstack.md`，依既有前置閘門補齊。
6. THINK BDD 模式建立 spec requirement → acceptance Example → interface Feature Example → task 覆蓋清單；確認每個範圍內可驗收的 FR／NFR／BR／SC 均在 traceability 中有對應且未標 unmapped／blocked，每個納入範圍的 interface Example 有任務並可回查 acceptance。任何缺口先停止並交回 `/spec-by-example`、`/dsl-refine` 或 `/clarify`，不得自行補造案例。Legacy 模式建立 TP-to-task 覆蓋清單，每個 TP 至少有一項任務；Legacy 若 truth-delta 含 MOD/DEL，仍 MUST Phase 2.5 對齊契約／testplan 引用。

### Phase 2 -- 編排 Phase 1–2 與後續 Phase

1. THINK Phase 1：必讀對照含 `techstack.md`、`plan.md` 具體列／章；Setup 任務若依 `/technical-research` 決策，須含 `research.md` 列與 `← research:…` / `techstack:…` / `plan:…`。
2. THINK Phase 2：必讀對照含 `data-model.dbml` 的 Table／Note、`http-api.yaml` 的 ErrorBody／Origin 等共通部位。
3. THINK 若 truth-delta 含 MOD/DEL，WRITE **Phase 2.5: Harness 對齊 Truth delta**（每筆 MOD/DEL 至少一 task；Checkpoint 含 techstack 全 suite）；再編排 Phase 3+。
4. THINK BDD 模式：Phase 3 起**每個納入範圍的介面 Feature 檔**一 Phase，標 **端點（對齊 plan.md）** 與 traceability 摘要；Phase 順序建議後端／契約 Feature 先於前端呈現 Feature（依 plan 端點與 traceability，除非 plan 另有要求）；全部 Feature Phase 之後編排 **NFR 重構** Phase。BDD 主模式預設不另設 Polish Phase，除非 spec／plan 明確要求 cross-cutting smoke。Legacy 模式：仍依 testplan 的 User Story 分 Phase，並維持 TP 追溯。

### Phase 3 -- Feature File／User Story 任務與 Binding

1. THINK BDD 模式：每個 Feature File Phase 依實際有任務的端點建立 **#### 前端**／**#### 後端**（或其他具名端點）小節；各小節先寫 **必讀對照** 四欄表，列出該檔內 Feature Example（或 Scenario）、DSL 及需求錨點。Legacy 模式：每個 User Story Phase 同樣依端點分小節，列出 `testplan:TP-xxx`。
2. THINK NFR 重構 Phase：READ `spec.md` 範圍內 NFR／SC 與 traceability；若 FR 級 Example 已覆蓋則可不另列任務，但仍須保留 Phase 與 template 引導文字，並在 Checkpoint 註明檢視結果。
3. THINK 從 **`TRUTH_ROOT/contracts/http-api.yaml`**（或 plan 明示路徑）摘 **operationId**；從 **`TRUTH_ROOT/data/data-model.dbml`** 摘 **Table**／**Note**；從 `spec.md` 摘 **US/FR/情境**；從 `ui-plan.md` 摘 **§章節** 與 **prototype 檔名**。Phase 2.5 任務 MUST 含 `truth-delta:<owner>#<列序或摘要鍵>` 錨點（見 `anchor-resolver.md`）。
4. WRITE 每個 `- [ ] Tnnn` 描述含檔案路徑及恰一個任務類型。BDD 模式使用 `[BDD:RED]`／`[BDD:GREEN]`／`[BDD:REFACTOR]`，並在行尾 `←` 引用上游 `acceptance:`、`feature:`、`dsl:`、`spec:`；**GREEN 須對齊 Truth Example Then**（過渡測試檔僅作 RED 接通，見 Rule-Tasks-Truth-Delta）。Legacy 模式使用 `[TDD:*]` 並引用 `testplan:TP-xxx`。非行為任務用 `[NON-TDD]` 並寫明理由。兩種模式均確保對照表每列至少被一個任務引用。**RED 任務須另起一行「完成條件：…」**；**GREEN 可附「完成條件：Truth Example「…」Then 成立」**。
5. THINK 依 Example／Scenario／TP 交錯安排同一行為的 RED、GREEN、可選 REFACTOR；GREEN 只實作讓對應紅燈轉綠的最小行為，REFACTOR 僅在 GREEN 後做行為不變整理。每項任務只涵蓋一個階段；不得集中所有 RED 後才開始 GREEN。
6. THINK 後端任務必引用對應 `openapi:`；持久化任務必引用 `dbml:`；前端必引用 `ui-plan:`／`prototype:`。

### Phase 4 -- 產出 tasks.md

1. READ `templates/tasks.template.md`；BDD 模式讀取 `templates/tasks.bdd.example.md`，legacy TDD 模式讀取 `templates/tasks.example.md`。
2. READ `../../constitution/CONSTITUTION.md`、`../../constitution/references/artifact-authority.md`、`../../constitution/references/artifact-overlay-sop.md`；EXEC **Phase Load**（artifact=`tasks.md`）。
3. WRITE 完整 `tasks.md`（預設與 `plan.md` 同目錄），含 Format Validation；產物 MUST 以憲法為最高優先。
4. EXEC **Phase Self-check**（artifact=`tasks.md`）。
5. WRITE 回報是否每 Feature File Phase（BDD）或 User Story Phase（legacy）、**Phase 2.5（若 delta 有 MOD/DEL）**、NFR 重構 Phase（BDD）與各小節通過 Binding 雙向覆蓋檢查；truth-delta MOD/DEL 列數 vs Phase 2.5 任務覆蓋是否 1:1，以及 `Constitution self-check: pass` 或 `exceptions`（格式見 artifact-overlay-sop）。
6. WRITE 建議下一指令：預設 **`/analyze`**（主流程見 `../../references/sdd-primary-workflow.md`）；實作由 **`/implement`** 執行，BDD 標籤映射成明確 subcommand 呼叫 `/bdd`，legacy TDD 標籤仍映射至 `/tdd`。

完成 `tasks.md` 後，依主流程先 **`/analyze`** 對 `spec.md`、`plan.md`、Feature／DSL 或 legacy `testplan.md`、`tasks.md` 做唯讀健檢，再 **`/implement`**（使用者須提供 feature 目錄或 `tasks.md` 路徑）；Implement 依必讀對照、任務錨點與 BDD／legacy TDD 標籤按需 READ，見 `../implement/SKILL.md` 與 `../analyze/SKILL.md`。
