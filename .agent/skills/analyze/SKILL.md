---
name: analyze
description: 在 `/tasks` 產出 tasks.md 之後，對 spec、plan、tasks 及相關分析產物做唯讀的跨文件一致性與品質分析；不修改任何檔案，輸出結構化報告與後續建議。
license: MIT
license-file: LICENSE.txt
attribution: "SDD workflow informed by github/spec-kit (MIT, Copyright GitHub, Inc.)"
---

# Analyze（規格套件健檢）

在實作前（`/implement`）對功能規格套件做 **唯讀** 交叉分析：找出重複、歧義、欠規格、憲法衝突、需求覆蓋缺口與跨文件不一致。本 skill **不得** 寫入或修改任何產物；修復須由使用者明確同意後，另行 invoke `/specify`、`/system-analysis`、`/tasks`、`/clarify` 等。

## SOP

### Phase 0 -- 確認執行閘門與路徑

1. THINK 本 skill 預期在 **`/tasks` 已成功產出完整 `tasks.md`** 之後執行；若使用者僅有 spec 或 plan，WARN 覆蓋分析不完整，並依現有檔案做部分分析或建議先 `/tasks`。
2. READ 若使用者提供功能目錄或 `tasks.md` 路徑，以其父目錄為 **FEATURE_DIR**；否則依 `/specify` 慣例推斷 `specs/<feature-branch>/` 並請使用者確認。
3. READ 在 FEATURE_DIR 確認必備檔案存在：`spec.md`、`plan.md`、`tasks.md`。任缺則 **STOP**，列出缺少檔案並建議對應 skill（`/specify`、`/system-analysis`、`/tasks`）。
4. THINK 記錄 FEATURE_DIR 內 Spec 套件索引（見 `tasks` 範例）：`research.md`、`techstack.md`、`ui-plan.md`、`prototype/`、`data-model.dbml`、`contracts/http-api.yaml` 等；後續僅在 tasks 錨點或 plan 引用時按需 READ，不一次載入全文。

### Phase 1 -- 載入分析判準與憲法

1. READ `rules/Rule-Analyze-唯讀與權威.md`、`rules/Rule-Analyze-檢測與嚴重度.md`。
2. READ `../../constitution/CONSTITUTION.md` 與 `../../constitution/references/artifact-authority.md`；擷取 MUST／SHOULD 原則供對照（本 skill 不執行 Phase Load／Self-check 寫入流程）。
3. READ `/specify` 的 `rules/Rule-Spec-Requirement-Traceability.md`（需求 ID 與歸屬）。
4. READ `/tasks` 的 `rules/Rule-Tasks-端點分層與按需讀取.md`（必讀對照與 `←` 錨點雙向覆蓋）。
5. DELEGATE 可選：從 `/specify` skill 根目錄執行 `uv run scripts/validate_spec.py <FEATURE_DIR>/spec.md`；若失敗，在報告中列為 **HIGH**（結構／追溯問題），仍繼續語意分析。

### Phase 2 -- 漸進載入產物（高信噪）

1. READ **spec.md** 最小必要段落：概述／脈絡、User Story、FR／NFR／BR、成功標準（SC）、邊界情況、主要實體、假設與澄清紀錄（若有）。
2. READ **plan.md** 最小必要段落：專案結構、設計決策、需求部位與端點對照、Wave 排程、端點至 skill 委派與產物路徑。
3. READ **tasks.md** 最小必要段落：Phase 分組、User Story 小節、必讀對照表、任務 ID（Tnnn）、描述與行尾 `←` 錨點、平行標記 `[P]`。
4. THINK 建立內部語意模型（**勿**在報告中貼全文）：
   - **需求清單**：FR-／NFR-／BR-／SC- 穩定鍵；SC 僅納入需建置／可驗證的工作，排除純營運 KPI。
   - **故事／動作清單**：可驗收的使用者動作與 GWT 對齊。
   - **任務覆蓋對照**：每個 Tnnn 對應一個以上需求或故事（依 ID、`← spec:`／故事標題／關鍵詞推斷）。
   - **錨點對照**：彙整 tasks 中 `spec:`、`plan:`、`research:`、`techstack:`、`openapi:`、`dbml:`、`ui-plan:`、`prototype:` 引用。
   - **憲法規則集**：原則名稱與 MUST 陳述。

### Phase 3 -- 檢測 passes（上限 50 項）

1. THINK 依 `Rule-Analyze-檢測與嚴重度.md` 執行檢測類別 A–G（重複、歧義、欠規格、憲法對齊、覆蓋缺口、不一致、Tasks 錨點／Binding）；超出 50 項時彙總於 overflow 摘要。
2. THINK 額外檢查（本工作流特有）：
   - tasks 必讀對照表列是否皆有至少一個任務引用 `←` 錨點；任務錨點是否指向存在檔案與合理部位（按需 READ 被引用檔案標題／schema 名／Table 名）。
   - plan 端點與 tasks 各 US「端點」標示是否一致。
   - spec 中待確認假設或 TODO 是否與已寫死的 FR 衝突。
3. THINK 為每項 finding 指派嚴重度（CRITICAL／HIGH／MEDIUM／LOW）並產生穩定 ID（類別首字母 + 序號，如 D1、E2）。

### Phase 4 -- 產出分析報告（僅對話輸出）

1. READ `templates/analysis-report.template.md`、`templates/analysis-report.example.md`。
2. WRITE 依模板在對話中輸出 **規格套件分析報告**（繁體中文說明；技術 ID／錨點維持原文）： findings 表、覆蓋摘要表、憲法對齊問題、未映射任務、指標、Next Actions。
3. WRITE **Next Actions** 須含：
   - 若有 **CRITICAL**：建議先修復再 `/implement`。
   - 若僅 LOW／MEDIUM：可 Proceed with caution，並列改善建議。
   - 明確建議指令：如 `/clarify`、`/clarify-over-specs`、`/specify`、`/system-analysis`、`/tasks`、手動編輯路徑。
4. WRITE 結尾詢問：「是否要我針對前 N 項問題提出具體修復編輯建議？」**不得**在未獲同意下修改任何檔案。

### Phase 5 -- 交付摘要

1. WRITE 回報 FEATURE_DIR、已分析的檔案清單、finding 總數與 CRITICAL 數、需求覆蓋率、是否執行 `validate_spec.py` 及其結果。
2. WRITE 若零 issue，仍輸出覆蓋統計與成功訊息，並建議下一指令（預設 `/implement`，若 CRITICAL 則對應修復 skill）。
