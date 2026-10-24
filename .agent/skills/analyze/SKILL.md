---
name: analyze
description: 在 `/tasks` 產出 tasks.md 之後，對 spec、plan、BDD Feature／DSL 或 legacy testplan、tasks 及相關分析產物做唯讀一致性與覆蓋分析；不修改檔案。
license: MIT
license-file: LICENSE.txt
attribution: "SDD workflow informed by github/spec-kit (MIT, Copyright GitHub, Inc.)"
---

# Analyze（規格套件健檢）

主流程位置：`/tasks` 之後、`/implement` 之前（見 `../../references/sdd-primary-workflow.md`）。

在實作前（`/implement`）對功能規格套件做 **唯讀** 交叉分析：找出重複、歧義、欠規格、憲法衝突、需求覆蓋缺口、interface Feature Example（或 Scenario）／DSL 或 legacy testplan 案例未被 task 覆蓋及跨文件不一致。本 skill **不得** 寫入或修改任何產物；修復須由使用者明確同意後，另行 invoke `/specify`、`/system-analysis`、`/dsl-refine`、`/testplan`、`/tasks`、`/clarify` 等。

## SOP

### Phase 0 -- 確認執行閘門與路徑

1. THINK 本 skill 預期在 **`/tasks` 已成功產出完整 `tasks.md`** 之後執行；若使用者僅有 spec 或 plan，WARN 覆蓋分析不完整，並依現有檔案做部分分析或建議先 `/tasks`。
2. READ `../../references/plan-truth-workflow.md`；若使用者提供 `tasks.md` 路徑，以其父目錄為 **PLAN_DIR**（**FEATURE_DIR** 同義）；否則請使用者確認 `specs/plans/<id>/`。
3. READ 在 PLAN_DIR 確認 `spec.md`、`plan.md`、`tasks.md`、`truth-delta.md` 存在；依 tasks 判定唯一模式：BDD 須 `traceability.md` + `specs/truth/features/**`；legacy 須 `testplan.md`。缺件或混用標籤時 **STOP**。
4. THINK 記錄索引：`PLAN_DIR`（spec、research、traceability、acceptance、ui）、`TRUTH_ROOT`（techstack、contracts、data、features）；READ `truth-delta.md` 全文並抽查表格列與 Truth 檔是否一致（DEL 後錨點是否仍被 tasks 引用）；後續按需 READ，不一次載入全文。

### Phase 1 -- 載入分析判準與憲法

1. READ `rules/Rule-Analyze-唯讀與權威.md`、`rules/Rule-Analyze-檢測與嚴重度.md`。
2. READ `../../constitution/CONSTITUTION.md` 與 `../../constitution/references/artifact-authority.md`；擷取 MUST／SHOULD 原則供對照（本 skill 不執行 Phase Load／Self-check 寫入流程）。
3. READ `/specify` 的 `rules/Rule-Spec-Requirement-Traceability.md`（需求 ID 與歸屬）。
4. READ `/tasks` 的 `rules/Rule-Tasks-端點分層與按需讀取.md`、`rules/Rule-Tasks-Truth-Delta-與-Harness-對齊.md`（必讀對照、`←` 錨點、Phase 2.5）。
5. READ `.agent/constitution/skills/tasks/tasks.md` 的 MUST；BDD 模式可對照 `.agent/constitution/skills/implement/implement.md` 預檢 implement 可執行性；僅 legacy TDD 模式讀取 `.agent/constitution/skills/testplan/testplan.md` 的 MUST。
6. DELEGATE 可選：從 `/specify` skill 根目錄執行 `uv run scripts/validate_spec.py <FEATURE_DIR>/spec.md`；若失敗，在報告中列為 **HIGH**（結構／追溯問題），仍繼續語意分析。

### Phase 2 -- 漸進載入產物（高信噪）

1. READ **spec.md** 最小必要段落：概述／脈絡、User Story、FR／NFR／BR、成功標準（SC）、邊界情況、主要實體、假設與澄清紀錄（若有）。
2. READ **plan.md** 最小必要段落：專案結構、設計決策、需求部位與端點對照、Wave 排程、端點至 skill 委派與產物路徑。
3. READ 依模式讀取測試來源：BDD 模式讀取 acceptance traceability、納入範圍的 interface Feature Example（或 Scenario）與 DSL；legacy TDD 模式讀取 **testplan.md** 的 User Story 分組、TP ID、需求追溯、測試入口及全域 NFR 對照。
4. READ **tasks.md** 最小必要段落：Phase 分組（BDD：Feature File 與 NFR 重構；Legacy：User Story）、必讀對照表、任務 ID（Tnnn）、BDD／TDD／NON-TDD 標籤、描述與行尾 `←` 錨點、平行標記 `[P]`。
5. THINK 建立內部語意模型（**勿**在報告中貼全文）：
   - **需求清單**：FR-／NFR-／BR-／SC- 穩定鍵；SC 僅納入需建置／可驗證的工作，排除純營運 KPI。
   - **故事／動作清單**：可驗收的使用者動作與 GWT 對齊。
   - **任務覆蓋對照**：BDD 模式檢查 spec 範圍內可驗收的 FR／NFR／BR／SC 是否列入 acceptance traceability，沒有未處理的 unmapped／blocked 項，且逐一經 acceptance Example → interface Feature Example → RED/GREEN task 覆蓋；Phase 3 起是否以 Feature 檔為 Phase 單位；是否含 NFR 重構 Phase；legacy TDD 模式檢查每個 TP 是否有 task 引用 `testplan:TP-xxx`。
   - **錨點對照**：彙整 tasks 中 `feature:`、`dsl:`、`acceptance:`、legacy `testplan:`、`spec:`、`plan:`、`research:`、`techstack:`、`openapi:`、`dbml:`、`ui-plan:`、`prototype:` 引用。
   - **階段標記**：行為 task 恰有一個所選模式的 RED／GREEN／REFACTOR 標籤，且同一份 tasks 不混用 BDD 與 legacy TDD；非行為 task 標 `[NON-TDD]` 並有理由。
   - **憲法規則集**：原則名稱與 MUST 陳述。

### Phase 3 -- 檢測 passes（上限 50 項）

1. THINK 依 `Rule-Analyze-檢測與嚴重度.md` 執行檢測類別 A–H（含 Harness／truth-delta）；超出 50 項時彙總於 overflow 摘要。
2. THINK 額外檢查（本工作流特有）：
   - **truth-delta MOD/DEL** 列是否均有 Phase 2.5 任務覆蓋；缺 Phase 2.5 → **CRITICAL**。
   - **H 類 Harness**：DEL 列對應 Example／DSL／operationId 是否仍被 `tasks.md` 錨點或 repo 測試程式引用（按需 Grep `backend/`、`frontend/`）；幽靈測試 → **HIGH** 或 **CRITICAL**（若阻擋 implement）。
   - tasks 必讀對照表列是否皆有至少一個任務引用 `←` 錨點；任務錨點是否指向存在檔案與合理部位（按需 READ 被引用檔案標題／schema 名／Table 名）。
   - BDD 模式：每個範圍內可驗收的 spec requirement ID 是否在 traceability 中有 acceptance 對應並由 interface Example 與 RED/GREEN task 覆蓋；`feature:#` 錨點標題是否能在 Feature 檔中匹配 Example 或 Scenario；每個 BDD task 的 acceptance／Feature／DSL 錨點是否唯一、存在且彼此一致；上游 acceptance 面向是否有去向或明確例外。
   - Legacy TDD 模式：每個 TP 是否至少被一項 task 以 `testplan:TP-xxx` 引用；TDD step 標籤與 NON-TDD 豁免是否正確。
   - plan 端點與 tasks 各 US「端點」標示是否一致。
   - spec 中待確認假設或 TODO 是否與已寫死的 FR 衝突。
3. THINK 為每項 finding 指派嚴重度（CRITICAL／HIGH／MEDIUM／LOW）並產生穩定 ID（類別首字母 + 序號，如 D1、E2）。

### Phase 4 -- 產出分析報告（僅對話輸出）

1. READ `templates/analysis-report.template.md`、`templates/analysis-report.example.md`。
2. WRITE 依模板在對話中輸出 **規格套件分析報告**（繁體中文說明；技術 ID／錨點維持原文）： findings 表、覆蓋摘要表、憲法對齊問題、未映射任務、指標、Next Actions。
   覆蓋摘要除 FR／NFR／BR 外，BDD 模式須列出 Example→RED/GREEN task、Feature File Phase 與 acceptance traceability 覆蓋；legacy TDD 模式須列出每個 `TP-xxx` 的 task 對應。未映射項目列為 Coverage finding。
3. WRITE **Next Actions** 須含：
   - 若有 **CRITICAL**：建議先修復再 `/implement`。
   - 若僅 LOW／MEDIUM：可 Proceed with caution，並列改善建議。
   - 明確建議指令：如 `/clarify`、`/tasks`（Truth 變更後預設重跑）、`/analyze`（手修 tasks 後必跑）、手動編輯路徑。
4. WRITE 結尾詢問：「是否要我針對前 N 項問題提出具體修復編輯建議？」**不得**在未獲同意下修改任何檔案。

### Phase 5 -- 交付摘要

1. WRITE 回報 FEATURE_DIR、已分析的檔案清單、finding 總數與 CRITICAL 數、需求覆蓋率、是否執行 `validate_spec.py` 及其結果。
2. WRITE 若零 issue，仍輸出覆蓋統計與成功訊息，並建議下一指令（預設 `/implement`，若 CRITICAL 則對應修復 skill）。
