---
name: code-review
description: 對前端與後端程式碼進行系統性品質與資安審查：依序執行 Lint／SAST／SCA／Secret Scanning、人工與 AI 輔助追蹤程式邏輯與商業規則、依 OWASP／NIST／CWE／CVSS 判斷資安弱點與嚴重度，產出區分已確認／疑似／建議的標準化報告，並追蹤修正與回歸驗證至結案。適用於程式碼審查、PR 檢查、資安弱點掃描、Bug 排查，或使用者要求 code review、審查程式碼、找 Bug、資安檢測時使用。
---

# Code Review（程式碼品質與資安審查）

系統性分析程式碼中的邏輯問題、潛在 Bug、資安弱點、品質問題、效能問題與相依套件風險。任何工具或 AI 都無法單獨保證找出所有問題；本 skill 要求交叉驗證、人工確認後才能將項目列為「已確認」，並區分正式標準（CVSS、NIST SSDF）、業界共識文件（OWASP、CWE）與業界慣例，不得混為一談。

## SOP

### Phase 1 -- 確認分析範圍與技術脈絡

1. READ 讀取使用者提供的程式碼範圍（全專案／特定目錄／PR diff）、專案語言、框架、目錄結構、業務規則與資安需求說明。
2. WRITE 若使用者未提供足夠的範圍資訊（程式碼位置、語言框架、分析目的），列出缺少項目並請使用者補充；確認前不進入後續階段。
3. READ 讀取 `references/Reference-官方規範與標準.md` 第 3 節 OWASP Code Review Guide 方法論。
4. THINK 依已載入內容判斷本次屬於「基線審查（Baseline Review）」或「差異審查（Diff-Based Review）」；基線審查需涵蓋架構、進入點、身分驗證/授權、資料流、商業邏輯、加密、錯誤處理、設定部署；差異審查聚焦變更對既有安全控制、攻擊面、信任邊界的影響。
5. THINK 依語言、框架與風險等級，決定本次適用的規範版本（OWASP ASVS Level、是否比照 OWASP Top 10:2025、是否需對照 NIST SSDF 實踐），記錄供報告「採用規範版本」欄位使用。

### Phase 2 -- 選定分析工具組合

1. READ 讀取 `references/Reference-分析工具地圖.md`，依技術堆疊挑選 Lint、SAST、SCA、Secret Scanning 工具組合；DAST 與突變測試視是否有可執行環境或高風險模組決定是否納入本次範圍。
2. THINK 確認所選工具在目標環境是否已安裝／可執行；缺少時列出安裝指令請使用者確認是否安裝，不可未經確認逕自安裝。
3. WRITE 記錄本次選定的工具清單與版本，供最終報告「使用工具」欄位使用。

### Phase 3 -- 程式碼品質檢查（Lint + SAST）

1. DELEGATE 依 Phase 2 選定工具執行 Lint 與 SAST（如 ESLint/Ruff/golangci-lint + Semgrep/CodeQL/Bandit/SonarQube），輸出為 SARIF 或可解析格式；工具原生不輸出 SARIF 時，保留原始輸出供人工判讀。
2. DELEGATE 若至少兩個工具皆輸出 SARIF，從本 skill 根目錄執行 `uv run scripts/merge_findings.py <sarif1> [<sarif2> ...] --out-md <path> --out-json <path>`，輸入為各工具 SARIF 檔路徑，取得依 (檔案, 行號) 去重後的候選清單（含來源工具、rule id、CWE 標籤）；若環境未安裝 `uv`，請使用者依 [uv 官方安裝指引](https://docs.astral.sh/uv/getting-started/installation/) 安裝後再執行，不可自行安裝或改用全域 `pip install`。若僅單一工具或工具不支援 SARIF，略過本步驟，直接以原始輸出作為候選清單。
3. THINK 本步驟取得的所有候選項目一律視為「疑似」起點，尚不可寫入報告「已確認」欄位。

### Phase 4 -- Bug 與邏輯分析

1. READ 讀取 `references/Reference-前後端檢查清單.md`，依本次程式碼涉及前端／後端選讀對應小節（邏輯與流程控制相關：A2、B3、B4），作為追蹤起點；依 `rules/Rule-CodeReview-P0P1摘要與檢查清單使用.md` Rule 3，命中項目仍須人工確認，不可僅憑清單判定。
2. THINK 依 OWASP Secure Code Review Cheat Sheet 的關注清單（見 `references/Reference-官方規範與標準.md` 第 3 節），追蹤主要執行流程：進入點與輸入驗證、資料流、例外處理、邊界條件、資料庫操作（含交易/鎖定、N+1 查詢風險）；對照 Phase 3 候選清單與本步驟清單命中項目中標記為邏輯/品質類的項目，逐一追蹤實際程式碼路徑。
3. THINK 對每個疑似 Bug，嘗試以實際輸入或既有測試重現；可重現者記錄重現步驟，無法重現者保留為疑似並列出待確認事項，不得略過不報告。

### Phase 5 -- 資安弱點分析

1. READ 讀取 `references/Reference-官方規範與標準.md` 第 1、2、5 節（OWASP ASVS、OWASP Top 10:2025、CWE），對照 Phase 1 決定的規範版本與技術堆疊。
2. READ 讀取 `references/Reference-前後端檢查清單.md` 資安相關小節（A1、A3、A5、B1、B2、B5、B6），作為追蹤起點；依 `rules/Rule-CodeReview-P0P1摘要與檢查清單使用.md` Rule 3，命中項目仍須人工確認，不可僅憑清單判定。
3. THINK 依 OWASP Top 10:2025 分類逐項檢查：輸入驗證／輸出編碼（Injection）、身分驗證、權限控管（Broken Access Control）、敏感資料保護（Cryptographic Failures）、外部介接與供應鏈（Software Supply Chain Failures）、例外處理（Mishandling of Exceptional Conditions）等；對照 Phase 3 候選清單與本步驟清單命中項目中標記為資安類的項目，人工追蹤資料流以確認是否真的構成弱點。
4. THINK 對每筆追蹤後確認存在的資安弱點，標註對應 CWE ID（依候選清單的 CWE 標籤或人工比對 CWE 官方描述，無精確對應時標註「近似對應」）。

### Phase 6 -- 相依套件與設定檢查

1. DELEGATE 執行 Phase 2 選定的 SCA 工具（如 Trivy/OSV-Scanner/Snyk/OWASP Dependency-Check）掃描第三方套件，以及 Secret Scanning 工具（如 Gitleaks，必要時加 TruffleHog 做已驗證掃描）掃描程式碼與 Git 歷史。
2. THINK 檢查專案設定檔（環境變數範例、CI 設定、雲端服務設定）是否存在不安全預設值或機敏資訊誤提交；對 SCA 回報的弱點套件，人工確認專案是否實際呼叫到弱點函式（Reachability），避免把未使用到的弱點版本列為高風險。
3. THINK 若發現已外洩的機敏資訊（API Key、密碼、Token），標記為最高優先處理項目，並提醒使用者：刪除程式碼不等於從 Git 歷史移除，須先至發行方撤銷/輪替金鑰再處理歷史清除。

### Phase 7 -- 人工與 AI 輔助審查（跨模組與業務邏輯）

1. READ 讀取 `rules/Rule-CodeReview-工具互補與人工審查邊界.md`。
2. THINK 依已載入規則，主動追蹤自動化工具無法判斷的項目：商業邏輯是否符合需求、授權設計本身是否合理（而非僅檢查是否有權限檢查）、跨模組/跨服務的業務規則一致性；這些項目即使前面階段沒有任何工具警告，仍須執行本步驟。
3. THINK 若使用 AI 輔助產生額外候選 finding，依已載入規則要求其附上可追溯的檔案路徑與行號證據；缺乏證據者直接剔除或降為待確認事項，不得列入候選清單。

### Phase 8 -- 問題分類、去重與風險評估

1. READ 讀取 `rules/Rule-CodeReview-證據與確認層級.md`、`rules/Rule-CodeReview-嚴重度與風險排序.md`。
2. THINK 依已載入規則，將 Phase 3–7 累積的所有候選項目逐一分類為「已確認」「疑似」或「建議」；已確認的資安弱點以 CVSS v4.0 定性量表評估嚴重度（或標註「簡化估算」），已確認的非資安問題依本專案嚴重度慣例評估；跨來源重複項目合併為單一 finding 並保留所有來源。
3. THINK 依嚴重度與實際可觸發性排出修正優先順序，並寫明排序理由。

### Phase 9 -- 產出分析報告

1. READ 讀取 `templates/code-review-report.template.md`、`templates/code-review-report.example.md` 與 `rules/Rule-CodeReview-P0P1摘要與檢查清單使用.md`。
2. WRITE 依 Rule-CodeReview-P0P1摘要與檢查清單使用.md Rule 1、Rule 2，先產出報告最前面的「快速總覽（P0／P1）」區塊：🔴 必須修正（P0）列出確認層級=已確認且嚴重度 CRITICAL／HIGH 的項目，🟡 建議修正（P1）列出確認層級=已確認且嚴重度 MEDIUM／LOW 的項目；每項附檔案路徑/行號、❌ 目前／✅ 建議 code block（或文字描述）、影響範圍條列，並標註對應完整 Findings 的 finding ID。「疑似」層級另列於「⏳ 待確認疑似問題」、「建議」層級另列於「💡 其他改善建議」，兩者皆不得貼 P0／P1 標籤。
3. WRITE 依骨架與範例的格式與內容粒度，接續產出完整分析報告，涵蓋專案資訊、分析摘要、問題總覽、每筆 finding 詳情（確認層級、嚴重度、位置、證據、成因、對應規範/CWE、建議修正、優先順序）、未涵蓋範圍與限制、Next Actions；findings 超過 50 筆時依類型與嚴重度彙總為 Overflow 摘要。
4. WRITE 報告結尾詢問使用者是否要針對特定問題提出具體修復編輯建議；未獲同意前不得修改任何程式碼檔案。

### Phase 10 -- 修正、驗證與持續改善

1. READ 使用者同意修復特定項目後，讀取 `templates/issue-tracking.template.md` 與 `templates/issue-tracking.example.md`，為每個待修正項目建立工作項，追蹤發現→確認→評估風險→提出方案→執行修正→撰寫/更新測試→重新分析→確認結果→結案的完整流程。
2. READ 讀取 `rules/Rule-CodeReview-修正驗證與回歸.md`。
3. WRITE 依已載入規則，修正每個項目後重跑原發現方式（工具或人工追蹤步驟）、新增可重現原問題的回歸測試、重跑受影響模組既有測試與相關分析，確認無新 finding 與無回歸；未能完全修正者，記錄殘餘風險、負責人、接受理由與覆核時間，不得標記為已解決。
4. WRITE 回報本次分析與修正結果摘要：報告路徑、已確認/疑似/建議件數、CRITICAL/HIGH 已確認件數、已結案與未結案件數；若使用者尚未將本流程整合進 Git hook／PR 檢查／CI pipeline，依 `references/Reference-分析工具地圖.md` 的工具 CI/CD 整合特性提出具體下一步（如將 Gitleaks/Semgrep 納入 pre-commit 或 PR workflow、排程執行 SCA/DAST）。
