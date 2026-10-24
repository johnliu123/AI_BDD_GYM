---
name: specify
description: 將使用者提供的功能構想整理成可追溯、可驗收的功能規格；需求有高影響歧義時先透過 clarify 訪談，不自行補完。
license: MIT
license-file: LICENSE.txt
attribution: "SDD workflow informed by github/spec-kit (MIT, Copyright GitHub, Inc.)"
---

# SOP

## Phase 1 -- 理解來源並收斂缺口

1. READ 讀取使用者需求及 `templates/spec.template.md`、`templates/spec.example.md`，確認輸入、輸出結構與目標位置；不得讀取或引用 `.speckit` 目錄中的內容。
2. READ 讀取 `rules/Rule-Spec-Evidence-and-Testability.md`，依其判準整理需求證據、推論與未知事項。
3. THINK 將來源拆成明確目標、使用者、限制、預期行為、品質期待及未確認事項；保留來源依據，不把推論寫成已確認需求。
4. THINK 若未知事項可能改變功能範圍、User Story 邊界、核心流程、資料歸屬或驗收結果，呼叫 `/clarify` 向使用者提問；收到回答前停止產生規格。低影響且不阻礙規格的未知事項，標示為待確認假設，不自行擴寫需求。

## Phase 2 -- 建立故事與需求追溯

1. READ 在分類 FR/NFR 及全域需求前，讀取 `rules/Rule-Spec-Requirement-Traceability.md`。
2. THINK 將需求拆成可獨立交付、測試的 User Story，依使用者價值排序；為每個故事整理目的、優先順序理由、獨立測試及多個可驗證的 Given/When/Then 驗收情境。
3. THINK 將可觀察的系統行為整理為 FR，將明確的品質限制整理為 NFR；故事專屬需求歸入該故事，適用於多個故事的需求只列於全域需求並記錄適用故事，兩者都以穩定且唯一的 ID 追溯。
4. THINK 整理 **商業規則（BR）**：跨故事、跨畫面的領域不變量與政策（非 UI 細節）；每條使用 **BR-** 唯一 ID，可註明對應 FR/NFR；與 FR 重複時 FR 仍為驗收主體。
5. THINK 整理邊界情況、主要實體、可衡量成功標準及假設；只填入來源支持或使用者確認的內容，未提供的門檻不得自行編造。
6. READ `../../references/plan-truth-workflow.md`；確認 **PLAN_DIR** 與 **TRUTH_ROOT** 契約。
7. THINK **配置 plan 包（Q1:A）**：除非使用者明示「延續既有 plan」並提供有效 `PLAN_DIR`，MUST 新建 `specs/plans/<NNN>-<slug>/`；`NNN` = 既有三位數 plan id 最大值 + 1（無則 `001`）；`<slug>` 由需求短名 kebab-case。禁止在未明示延續時寫入既有 plan 目錄。
8. WRITE 於 `PLAN_DIR` 建立 `plan.meta.yaml`（依 `templates/plan.meta.template.yaml`）、`truth-delta.md`（依 `../truth-delta/templates/truth-delta.template.md`，將 `{{PLAN_DIR}}` 替換為實際路徑；**僅空骨架**，不得 append 表格列）；**不得**寫入 `specs/truth/`。
9. READ `../../constitution/CONSTITUTION.md`、`../../constitution/references/artifact-authority.md`、`../../constitution/references/artifact-overlay-sop.md`；EXEC **Phase Load**（artifact=`spec.md`）。
10. WRITE 依 `templates/spec.template.md` 於 `PLAN_DIR/spec.md` 產生完整規格（含 **商業規則** 章節），保留必要章節與需求追溯；移除未使用的可選區塊及所有未替換佔位符；產物 MUST 以憲法為最高優先（見 artifact-authority.md）。

## Phase 3 -- 驗證規格並交付

1. DELEGATE 從本 Skill 根目錄執行 `uv run scripts/validate_spec.py <spec-path>`，輸入為產生的 Markdown 規格，取得結構、佔位符、ID 唯一性及全域需求參照檢查結果；若環境沒有 `uv`，依 https://docs.astral.sh/uv/getting-started/installation/ 安裝後再執行，不改用全域 `pip install`。
2. THINK 對照原始需求與澄清回答，確認每個明確需求都有 User Story 或全域需求歸屬，驗收情境能驗證預期行為，且沒有未經支持的需求、數值或承諾；腳本通過不能取代此語意檢查。
3. EXEC **Phase Self-check**（artifact=`spec.md`）；未全過則修正後重驗。
4. WRITE 修正檢查發現的錯誤與遺漏，重新執行驗證，直到結構檢查通過且語意檢查完成。
5. WRITE 回報 **PLAN_DIR**、`spec.md` 路徑、主要故事與全域需求、尚待確認的假設或限制，以及 `Constitution self-check: pass` 或 `exceptions`（格式見 artifact-overlay-sop）。
6. WRITE 建議下一指令：預設 **`/spec-by-example`**（主流程見 `../../references/sdd-primary-workflow.md`）；若使用者跳過 acceptance 可 **`/technical-research`**；第二 pass 澄清可選 **`/clarify-over-specs`**。