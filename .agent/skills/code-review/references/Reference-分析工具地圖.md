# 常見分析工具地圖與選型建議

本文件比較七類分析工具，說明互補關係、限制與適合階段。**不得宣稱單一工具或單一類別能找出所有問題**；每類工具都有盲區，必須搭配人工審查（見各類別「仍需人工審查」欄）。

## 1. Lint 與程式碼品質分析

| 工具 | 語言 | 主要用途 | 限制 |
|------|------|---------|------|
| ESLint + Prettier | JS/TS | 語法慣例、潛在錯誤、格式一致性 | 不做跨檔資料流分析 |
| Ruff / Pylint | Python | 風格、未使用變數、複雜度 | 規則集需依專案調整，預設可能過嚴或過鬆 |
| golangci-lint | Go | 聚合多個 linter（govet、staticcheck 等） | 設定不當易產生大量雜訊 |
| SonarQube/SonarLint | 20+ 語言 | Bug、Code Smell、重複度、複雜度、安全熱點，含品質閘門 | Community 版部分規則與安全規則較 Commercial 版陽春 |

- **免費/開源 vs 商業**：以上均有免費/開源版本；SonarQube 商業版（Developer/Enterprise）提供更完整的安全規則與多分支分析。
- **IDE/Git/PR/CI**：全部可整合 IDE 外掛（SonarLint、ESLint 擴充套件）、pre-commit hook、PR 註解、CI 失敗閘門。
- **適合階段**：開發中即時回饋（IDE）、PR 檢查（CI）。
- **仍需人工審查**：命名是否達意、抽象層級是否合理、是否符合專案特有慣例，Lint 規則無法判斷「這樣寫對不對」，只能判斷「是否符合既定規則」。

## 2. SAST（Static Application Security Testing）

分析技術分兩種：**Pattern/AST 比對**（快、低誤報，但難抓跨函式/跨檔案問題，如 Semgrep、Bandit）與 **Dataflow/Taint 分析**（追蹤不信任輸入到危險操作的路徑，較完整但較慢、誤報較高，如 CodeQL、Checkmarx）。

| 工具 | 類型 | 語言 | 授權 | 特性 |
|------|------|------|------|------|
| Semgrep | Pattern + intra-file taint | 30+ 語言 | OSS engine（規則集另有 Semgrep Rules License，非 OSI） | 快、易寫自訂規則、IDE/CI 整合佳；跨檔 taint 需商業 AppSec Platform |
| CodeQL | Dataflow/taint | Java、C/C++、C#、Go、JS/TS、Python 等 | 公開倉庫免費；私有倉庫需 GitHub Code Security | 深度語意分析，速度較慢（整庫 10–60 分鐘量級） |
| SonarQube Community | Pattern + 部分 dataflow | 20+ 語言 | OSS/商業 | 廣泛語言覆蓋，含品質閘門整合 |
| Bandit | Pattern | Python | OSS | 僅 Python，無 dataflow |
| Brakeman / gosec | Pattern | Ruby on Rails / Go | OSS | 語言專屬，深度優於通用工具 |

- **官方清單**：OWASP Source Code Analysis Tools（<https://owasp.org/www-community/Source_Code_Analysis_Tools>）。
- **誤報/漏報**：Pattern 類誤報低但漏報跨函式問題；Dataflow 類漏報低但誤報率較高，需人工複核。
- **建議搭配**：Semgrep（快速 PR 掃描 + 自訂規則）＋ 語言專屬工具（Bandit/Brakeman/gosec）＋ 視需要加 CodeQL（深度週期性全庫掃描）。
- **仍需人工審查**：商業邏輯層的授權繞過、多步驟攻擊鏈、設計層級缺陷（Insecure Design），SAST 無法理解「這個功能應不應該允許這個操作」。

## 3. DAST（Dynamic Application Security Testing）

- **代表工具**：OWASP 官方推薦 **ZAP（現名 ZAP by Checkmarx，Apache-2.0 開源）**；其他含 Burp Suite（商業/社群版）、Nuclei、Dastardly（PortSwigger，CI 用輕量掃描）、StackHawk（商業、基於 ZAP 優化 CI/CD）。
- **原理**：對執行中的應用程式送出惡意/異常請求並觀察回應（黑箱），不需原始碼，能發現僅在執行期才顯現的問題（如 Session 管理、伺服器設定、執行期注入點）。
- **限制**：需要可執行環境；對需要登入狀態或複雜流程的功能，須額外設定驗證腳本；無法定位到原始碼行號，只能定位到 URL/參數。
- **CI/CD 整合**：ZAP 官方提供 GitHub Actions（`zaproxy/action-full-scan`、`action-api-scan` 等）。
- **適合階段**：Staging 環境、Release 前、排程夜間掃描；不適合取代單元測試層級的快速回饋。
- **仍需人工審查**：複雜的商業邏輯濫用（如繞過流程順序）、需要特定業務情境才能觸發的授權繞過，DAST 的自動化爬蟲常無法覆蓋深層流程。

## 4. SCA（Software Composition Analysis）

| 工具 | 授權 | 強項 | 弱項 |
|------|------|------|------|
| OWASP Dependency-Check | Apache-2.0 | Java/Maven/Gradle 生態成熟、合規稽核常指定 | CPE 比對誤報率高、NVD 同步慢（整體掃描可能 10 分鐘以上） |
| Trivy（Aqua Security） | Apache-2.0 | 一個執行檔涵蓋依賴、容器、檔案系統、IaC、Secret、SBOM 產出，速度快（約 14 秒中位數） | 仍可能有少量誤報 |
| Grype（+ Syft） | Apache-2.0 | 容器/SBOM 掃描強，結合 EPSS/KEV 做風險排序 | 需搭配 Syft 產生 SBOM 才能發揮全部能力 |
| OSV-Scanner | Apache-2.0 | lockfile/manifest 掃描精準度高、誤報最低 | 容器掃描能力較新、覆蓋度不如 Trivy/Grype |
| Snyk | 商業（含免費額度） | Reachability 分析可排除「有漏洞但程式碼未呼叫到」的誤報，IDE/PR 整合佳 | 商業授權，大型專案需付費方案 |

- **建議搭配**：CI 用 Trivy 或 OSV-Scanner 做廣泛快速掃描；若需 Reachability 降噪或完整 IDE 體驗，加入 Snyk；Java/Maven 合規場景可額外跑 OWASP Dependency-Check。
- **仍需人工審查**：確認弱點版本是否真的被專案呼叫到（Reachability，免費工具多半無此能力）、授權條款風險（部分工具另有授權掃描功能，需個別確認）。

## 5. Secret Scanning

| 工具 | 授權 | 特性 |
|------|------|------|
| Gitleaks | MIT | 正規表達式 + 熵值偵測，速度快（約數秒），適合 pre-commit/PR 閘門；不驗證密鑰是否仍有效 |
| TruffleHog | AGPL-3.0（企業版另計） | 偵測器眾多，支援對供應商 API **即時驗證密鑰是否仍存活**，可大幅降低誤報；掃描範圍含 Git、S3、Docker、CI 日誌等 |
| GitHub Secret Scanning + Push Protection | GitHub 原生（公開 repo 免費，私有需 GitHub Secret Protection） | 伺服器端全歷史/全分支掃描，可在 push 前攔截已知密鑰格式；無法涵蓋自訂格式密鑰 |

- **建議搭配**：Gitleaks 放在 pre-commit/PR 做即時攔截；TruffleHog 定期（如每日/每週）做深度歷史掃描並以 verified-only 模式降噪；若用 GitHub，啟用原生 Secret Scanning/Push Protection 作為最後防線。
- **重要原則**：一旦密鑰被提交，**從工作目錄刪除不等於從 Git 歷史移除**；發現外洩須立即到金鑰發行方撤銷/輪替，再處理歷史清除，不可僅靠程式碼修改視為已解決。
- **仍需人工審查**：內部自訂格式的密鑰（如公司內部 API Token 格式）需另外設定自訂規則，通用工具預設規則可能偵測不到。

## 6. 測試與品質驗證工具

- **單元/整合測試**：依語言慣例（Jest/Vitest、pytest、JUnit 等），用於驗證修正後行為正確、沒有引入回歸。
- **覆蓋率（Coverage）**：衡量「測試執行到哪些程式碼」，不代表「測試有沒有驗證到正確行為」——100% 覆蓋率的測試仍可能完全沒有斷言。
- **突變測試（Mutation Testing）**：衡量「測試是否能偵測到程式碼被蓄意改錯」，代表工具 **Stryker**（JS/TS）、**PIT**（Java/JVM）。做法是對程式碼注入小幅錯誤（mutant），若測試仍全數通過代表該處測試不足（mutant survived）。
  - 全量突變測試成本高（中大型專案可能數十分鐘到數小時），建議僅對**變更檔案**或**高風險模組（商業邏輯、安全檢查、金流計算）**啟用增量模式（Stryker `--incremental`、PIT incremental analysis），不追求全專案 100% 分數，而是關注「存活的 mutant」逐一檢視。
- **如何套用**：Phase 10（修正與驗證）要求針對修正處至少補齊會失敗後又通過的回歸測試；高風險模組建議加跑突變測試確認測試有效性，而非只看覆蓋率數字。

## 7. AI 輔助程式碼審查

- **適用範圍**：理解程式意圖與命名品質、產生修正建議草稿、解釋既有 SAST/DAST 發現的資安風險、作為大量重複性檢查的初篩加速器（如研究顯示 LLM 與靜態分析結合可消除 94–98% 的靜態分析誤報，同時維持高召回率）。
- **已知限制（有研究數據佐證，須如實告知使用者，不可誇大能力）**：
  - **幻覺**：AI 對程式碼變更產生的自然語言描述，存在相當比例內容與實際程式碼不符的情況；務必要求每個 AI 產出的 finding 都附上可追溯的檔案路徑與行號證據，無法附證據的陳述須標記為「待確認」而非「已確認」。
  - **過度矯正（Overcorrection）**：研究發現提示詞越詳細（要求逐步解釋、列出修正建議），LLM 判斷正確實作為「不符合需求」的誤判率可能不降反升，即 AI 可能把正確的程式碼誤判為有問題。
  - **跨模組/全庫脈絡能力有限**：AI 審查準確度高度依賴「能看到多少相關程式碼」；對單一檔案局部變更準確度較高，對跨模組、跨服務的影響分析，若沒有完整程式庫檢索能力，準確度明顯下降。
- **治理建議**：AI 產出的 finding 一律視為「疑似」起點，需與靜態分析結果或人工複核交叉確認才能升級為「已確認」（對應 `rules/Rule-CodeReview-證據與確認層級.md`）；優先把信心門檻設高、容忍較低數量但高品質的提示，而非一開始就追求高召回率、高雜訊。
- **不可取代之處**：商業邏輯是否符合需求、授權設計是否合理、是否有業務流程繞過風險——這些仍需要熟悉該系統業務脈絡的人工審查者做最終判斷，AI 與自動化工具僅能輔助與加速，不能單獨作為結案依據。

## 工具互補關係總結

- Lint → 找「寫法」問題；SAST → 找「程式碼內的已知弱點模式」；DAST → 找「執行期才會出現的問題」；SCA → 找「別人程式碼（相依套件）帶來的已知弱點」；Secret Scanning → 找「不該出現在程式碼/歷史中的機敏資料」；測試/突變測試 → 驗證「修正是否真的生效、沒有破壞其他功能」；AI/人工審查 → 補上所有自動化工具都無法判斷的「這樣做在這個業務情境下對不對」。
- 任何單一類別都不足以涵蓋表中全部六大問題類型；實務上應依專案風險與資源，至少涵蓋 Lint + 一種 SAST + 一種 SCA + 一種 Secret Scanning，並保留人工/AI 審查處理業務邏輯與跨模組問題。
