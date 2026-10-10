---
name: system-analysis
description: "在功能規格已明確後，建立系統分析規劃，拆解需求部位、盤點技術端點、安排依賴 Wave，並委派 UI Plan、Data Plan、API Plan 執行端點分析及整合產出。Use when planning or executing system analysis from a feature specification."
license: MIT
license-file: LICENSE.txt
attribution: "SDD workflow informed by github/spec-kit (MIT, Copyright GitHub, Inc.)"
---

# 系統分析規劃與執行

**專責端點分析 Skill**（根目錄優先 `.agent/skills/<name>/`）：`/ui-plan`、`/data-plan`、`/api-plan`。Phase 4 委派時須要求執行者讀取對應 Skill 的完整 SOP。

## SOP

### Phase 1 -- 收斂需求與專案脈絡

1. READ 讀取使用者需求、已確認的功能規格與澄清結果；檢視儲存庫的現有目錄結構與專案慣例。
2. READ 讀取 `rules/Rule-研究產物前置閘門.md`；在 `spec.md` 所在目錄確認 `research.md` 與 `techstack.md` 存在（或使用者提供兩檔路徑）。任缺且無 Rule 1 豁免時 **STOP**，請先 `/technical-research`。
3. READ 讀取上述 `research.md` 與 `techstack.md`（至少決策摘要與堆疊表，供後續 Wave 對齊）。
4. THINK 區分已確認需求、明示限制、技術研究已採用決策與未決事項；若存在會改變功能範圍或計畫結構的高影響缺口，先透過 `/clarify` 收斂，未取得回答前停止。
5. THINK 依規格、研究產物與現有專案脈絡整理實作計畫所需的專案結構及設計決策；不得把未確認假設或未寫入 research 的建議描述成已採用決策。

### Phase 2 -- 規劃需求部位、端點與分析 Wave

1. READ 讀取 `rules/Rule-需求端點與波段規劃.md`，準備拆解需求、盤點技術端點並安排分析依賴。
2. THINK 將需求拆成可辨識的功能、品質或限制部位，建立「需求部位 → 涉及技術端點」對照，並由需求推導本次實際端點；不預設端點只有前端、後端或資料庫。
3. THINK 依各端點分析工作所需的輸入與先後依賴安排 Wave：每個端點至少分配一個明確分析步驟；無未滿足前置依賴的工作可同 Wave 平行，有依賴的工作排在後續 Wave，並說明其所需前置結果。
4. THINK 依端點責任選擇專責 Skill：前端與使用者介面交給 `UI Plan`（`/ui-plan`），資料模型、資料庫及檔案／物件儲存交給 `Data Plan`（`/data-plan`），後端 API、通訊協定及外部服務整合交給 `API Plan`（`/api-plan`）。其他端點交由職責最接近的 Skill，並在計畫中說明歸屬理由與分析邊界；不得省略未能一對一命名的端點。
5. THINK 只有在有助於解釋 Wave 排程或使用者要求時，才加入額外的排程示意；清楚標示示意並非本次需求或實際端點。
6. THINK 本階段只規劃分析範圍、端點、順序、Wave 與委派，不在分析排程段落中填入端點分析結論；計畫完成後必須進入 Phase 4 執行。

### Phase 3 -- 產出系統分析規劃文件

1. THINK 依專案既有規格文件慣例決定輸出位置；若無慣例，將 `plan.md` 放在本次功能規格所在目錄。若目標檔已存在，先讀取並整合，不可未檢查就覆寫。
2. READ 讀取 `templates/plan.template.md` 與 `templates/plan.example.md`，確認文件結構、佔位符與已完成範例。
3. READ `../../constitution/CONSTITUTION.md`、`../../constitution/references/artifact-authority.md`、`../../constitution/references/artifact-overlay-sop.md`；EXEC **Phase Load**（artifact=`plan.md`）。
4. WRITE 依 `templates/plan.template.md` 撰寫完整計畫，參照 `templates/plan.example.md` 的內容粒度，填入專案結構、設計決策、需求部位與端點對照，以及依賴排序的 Wave 排程。若某可選示意不適用，移除該區塊；不保留佔位符或空白章節；產物 MUST 以憲法為最高優先。
5. WRITE 在分析 Wave 排程中明確標出每項端點分析工作、負責 Skill（含可呼叫的 skill id）、輸出產物路徑、所需前置結果及其分析邊界；只有已確認可獨立開始的工作才標示為平行。列出本 skill 定義的專責 Skill；其他端點依 Phase 2 的最接近職責原則指派並說明理由。

### Phase 4 -- 按 Wave 委派並執行端點分析

1. READ 讀取 `rules/Rule-端點分析委派.md`、已完成的 `plan.md`、來源規格、研究文件與相關程式／文件慣例；開始每個 Wave 前，讀取該 Wave 所需的前置 Wave 分析產物。
2. DELEGATE 依計畫順序執行 Wave。每個 Wave 中彼此獨立的工作應分別委派給獨立 sub-agent，且每項委派指令須符合 `Rule-端點分析委派.md`：明確要求執行計畫所指定的專責 Skill（`/ui-plan`、`/data-plan` 或 `/api-plan`）、限定端點範圍、附上規格與計畫、提供必要的前置分析，以及指定該 Skill 的產物路徑（UI Plan 含 `ui-plan.md` 與 `prototype/`）。一次同 Wave 委派不得因輸出檔案衝突而平行寫入同一產物；應將同一 Skill 的同 Wave 工作合併為一項委派並逐端點分析。若無 sub-agent 能力，依相同 Wave 順序在本對話中逐項載入並執行對應 Skill，不得宣稱已平行委派。
3. THINK 各專責 Skill 只分析其受派端點並產出分析文件，不實作程式碼、不擴張規格；既有產物須先讀取並整合，不可直接覆寫。對無法安全判定的高影響缺口，透過 `/clarify` 收斂後再執行受影響工作。
4. THINK 若某委派失敗或缺少必要輸入，明確記錄失敗並停止依賴該結果的後續 Wave；可繼續的獨立工作仍可完成，不得將未完成工作回報為成功。

### Phase 5 -- 整合驗收與交付

1. READ 對照來源規格、`plan.md`、各端點分析產物及已載入規則，確認每個需求部位與端點都有可追溯的分析結果，Wave 執行順序符合依賴，且產物沒有遺漏或未解析佔位符。
2. THINK 檢查跨端點決策的一致性及前置輸入是否已被納入；發現矛盾時不得自行掩蓋或選擇其一，應釐清後更新受影響的分析產物並重新驗收。
3. THINK 各端點分析產物須含受派 skill 回報的 `Constitution self-check`；缺漏視為該產物未完成。
4. EXEC **Phase Self-check**（artifact=`plan.md`）。
5. WRITE 回報 `plan.md` 路徑、端點至 Skill 的委派對照、Wave 執行狀態、各分析產物路徑與其 Constitution self-check、未完成工作、待確認事項或失敗原因，以及本 skill 對 `plan.md` 的 `Constitution self-check: pass` 或 `exceptions`（格式見 artifact-overlay-sop）。

test
