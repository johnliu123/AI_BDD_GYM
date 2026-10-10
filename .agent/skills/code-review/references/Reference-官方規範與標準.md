# 官方規範與業界 Best Practices

本文件彙整程式碼品質與應用程式安全檢測相關的官方規範、標準組織文件與業界共識文件。使用時務必區分三種權威層級，不可混為一談：

- **正式標準（Formal Standard）**：由標準組織或政府機關發布，具版本號與正式修訂流程。例：NIST SP 800-218、CVSS（FIRST.org）。
- **業界共識文件（Community Consensus）**：由非營利社群（如 OWASP、MITRE）維護，廣泛採用但非法定強制標準。例：OWASP ASVS、OWASP Top 10、CWE。
- **業界慣例（Industry Convention）**：廠商或框架官方建議、常見 DevSecOps 實踐，無統一版本號，依專案技術堆疊而異。例：各語言框架官方安全指南、CI/CD 品質閘門慣例。

## 1. OWASP Application Security Verification Standard（ASVS）— 業界共識文件

- **官方來源**：<https://owasp.org/www-project-application-security-verification-standard/>、<https://asvs.dev/>
- **目前版本**：v5.0.0（2025-05-30 正式發布，取代 2021 年的 v4.0.3）
- **目的**：提供可驗證的應用程式安全需求清單，供開發者自我檢核、採購方驗收、安全測試者制定測試範圍。
- **適用範圍**：Web 應用程式與 API，前後端皆適用；依風險分為 Level 1（基本自動化可驗證）、Level 2（標準，多數應用適用）、Level 3（高保證，關鍵系統）。
- **核心原則**：以「需求」而非「測試案例」描述安全控制，涵蓋 Encoding/Injection、驗證、Session 管理、存取控制、錯誤處理/記錄、資料保護、通訊安全、惡意程式碼、商業邏輯、檔案上傳、API 與 Web Service、設定等章節。
- **如何套用**：Phase 5（資安弱點分析）依專案風險等級選擇 Level，對照前後端程式碼逐條核對輸入驗證、權限控管、Session/Token 管理等章節需求；不要求一次全部驗證，依專案風險分級選用。

## 2. OWASP Top 10:2025 — 業界共識文件

- **官方來源**：<https://owasp.org/Top10/2025/>（最新版；前一版為 2021：<https://owasp.org/Top10/en/>）
- **性質**：Web 應用程式最關鍵安全風險的共識排名，非逐項技術規格，用於建立安全意識與優先順序。
- **2025 版清單**：A01 Broken Access Control、A02 Security Misconfiguration、A03 Software Supply Chain Failures、A04 Cryptographic Failures、A05 Injection、A06 Insecure Design、A07 Authentication Failures、A08 Software or Data Integrity Failures、A09 Security Logging and Alerting Failures、A10 Mishandling of Exceptional Conditions。
- **與 2021 版差異**：SSRF 不再獨立成項，併入 Broken Access Control；新增 Software Supply Chain Failures（對應第三方套件風險）與 Mishandling of Exceptional Conditions（對應例外處理缺陷）。
- **如何套用**：作為 Phase 5 資安弱點分析的分類骨架；每個 finding 盡量標註對應的 Top 10 分類，便於溝通與統計風險分布。專案若仍以 2021 版做合規基準，須在報告中註明採用版本，不可混用兩版編號。

## 3. OWASP Code Review Guide v2 ／ Secure Code Review Cheat Sheet — 業界共識文件

- **官方來源**：<https://owasp.org/www-project-code-review-guide/>（PDF v2）、<https://cheatsheetseries.owasp.org/cheatsheets/Secure_Code_Review_Cheat_Sheet.html>
- **目的**：提供安全程式碼審查的方法論，說明如何將審查整合進 S-SDLC，並列出審查者應關注的技術弱點類型與程式碼範例。
- **核心原則**：
  - 審查應以風險為基礎，先理解應用情境、受保護資產與威脅模型，再決定審查深度，而非無差別逐行審查。
  - 區分 **Baseline Review**（首次完整審查：架構反模式、進入點與輸入驗證、身分驗證/授權、資料流追蹤、商業邏輯、加密實作、錯誤處理、設定與部署）與 **Diff-Based Review**（僅審查變更：對既有安全控制的影響、新攻擊面、信任邊界變化、新整合點、是否有安全回歸）。
  - 明確指出**人工審查聚焦於自動化工具常遺漏的項目**：商業邏輯驗證、複雜安全機制、情境相依的弱點；自動化工具（SAST/DAST）負責找出可規則化的模式，兩者互補而非互斥。
- **如何套用**：Phase 1 依「首次基線分析」或「PR/Diff 分析」選擇對應流程；Phase 4、Phase 7 的人工審查步驟依此 Cheat Sheet 的關注清單執行。

## 4. NIST SP 800-218 Secure Software Development Framework（SSDF）— 正式標準

- **官方來源**：<https://csrc.nist.gov/pubs/sp/800/218/final>（v1.1，2022-02 發布；v1.2 初稿已於 2025-12-17 公告修訂中）
- **性質**：美國政府正式發布的特別出版物，描述組織層級應導入的安全軟體開發核心實踐；聚焦「結果」而非指定特定工具。
- **四大實踐群組（19 項 Practice、42 項 Task）**：
  - **PO（Prepare the Organization）**：人員、流程、技術就緒，含安全需求定義與角色分工。
  - **PS（Protect the Software）**：保護原始碼、組態、發布件不被竄改或未授權存取；含最小權限存放、完整性驗證資訊（雜湊/簽章）、版本溯源保存。
  - **PW（Produce Well-Secured Software）**：涵蓋安全設計、安全編碼、安全建置與測試（含程式碼審查、靜態/動態分析）。
  - **RV（Respond to Vulnerabilities）**：持續蒐集弱點情資、評估/優先排序/修復/溝通，並做根因分析回饋至 SDLC 以避免重蹈覆轍。
- **如何套用**：本 skill 的 Phase 3–6（品質/邏輯/資安/相依檢查）對應 PW 實踐；Phase 9–10（報告、修正驗證、持續改善）對應 RV 實踐與 PS 的版本溯源要求。專案若需對外聲稱符合 SSDF，應逐一對照 42 項 Task 的具體落地證據，本 skill 的 SOP 僅涵蓋與程式碼審查直接相關的子集，不等同於完整 SSDF 合規驗證。

## 5. CWE（Common Weakness Enumeration）— 業界共識分類（MITRE 維護）

- **官方來源**：<https://cwe.mitre.org/>；2025 CWE Top 25：<https://cwe.mitre.org/top25/archive/2025/2025_cwe_top25.html>（CISA 公告：2025-12-11）
- **性質**：軟體弱點的**分類體系**（taxonomy），不是嚴重度評分系統；用於統一描述「這是哪一種弱點」。
- **2025 CWE Top 25（依 CVE/KEV 數據排名）**：CWE-79 XSS、CWE-89 SQL Injection、CWE-352 CSRF、CWE-862 Missing Authorization、CWE-787 Out-of-bounds Write、CWE-22 Path Traversal、CWE-416 Use After Free、CWE-125 Out-of-bounds Read、CWE-78 OS Command Injection、CWE-94 Code Injection、CWE-502 Deserialization of Untrusted Data、CWE-863 Incorrect Authorization、CWE-20 Improper Input Validation、CWE-200 Exposure of Sensitive Information、CWE-306 Missing Authentication、CWE-918 SSRF、CWE-77 Command Injection、CWE-639 Authorization Bypass Through User-Controlled Key、CWE-770 Allocation of Resources Without Limits（完整 25 項含記憶體安全類，詳見官方連結）。
- **如何套用**：每筆已確認的資安 finding 都應標註對應 CWE ID（可由 SAST 工具的 rule tag 取得，或人工比對 CWE 描述），作為報告中「對應依據」欄位；CWE 僅分類弱點類型，**嚴重度仍須另行評估**（見下方 CVSS）。

## 6. CVSS v4.0（Common Vulnerability Scoring System）— 正式標準（FIRST.org）

- **官方來源**：<https://www.first.org/cvss/v4.0/specification-document>（2024-06-18 發布）
- **性質**：由 FIRST.org 制定的弱點嚴重度評分公開框架，**僅適用於已確認的資安弱點**，不適用於一般程式邏輯 Bug、效能問題或程式碼品質問題。
- **四組指標**：Base（內在嚴重度，含新指標 Attack Requirements AT）、Threat（隨時間變化的利用現況）、Environmental（特定環境調整）、Supplemental（不影響分數的補充資訊，如 Safety、Automatable）。
- **官方嚴重度對照表（Qualitative Severity Rating Scale，適用於 Base／Threat／Environmental 任一組合分數）**：

  | Rating | CVSS Score |
  |--------|-----------|
  | None | 0.0 |
  | Low | 0.1 – 3.9 |
  | Medium | 4.0 – 6.9 |
  | High | 7.0 – 8.9 |
  | Critical | 9.0 – 10.0 |

- **如何套用**：對已確認的資安 finding，優先使用 CVSS v4.0 Base 指標估算分數與對應等級；若團隊未安裝完整 CVSS 計算工具，可用官方計算機 <https://www.first.org/cvss/calculator/cvsscalc40> 或依本 skill `rules/Rule-CodeReview-嚴重度與風險排序.md` 的對照表簡化評估，但須在報告中註明「簡化評估」而非正式 CVSS 分數。**非資安類問題（Bug／品質／效能）不得套用 CVSS，須使用該 Rule 定義的另一套業界慣例嚴重度heuristic，並在報告中清楚標示依據為何。**

## 7. 各語言／框架官方安全開發指南 — 業界慣例（依專案技術堆疊挑選，非統一標準）

這類文件沒有單一版本號，必須依專案實際採用的語言與框架，在 Phase 1 確認技術堆疊後，當場查詢官方文件並記錄來源與查詢日期；常見入口包含（實際以專案堆疊為準，不窮舉）：

- Node.js/Express：Node.js 官方 Security Best Practices、OWASP Node.js Security Cheat Sheet。
- Python/Django/Flask：Django 官方 Security 文件、OWASP Python Security、Bandit 規則集涵蓋的 CWE 對照。
- Java/Spring：Spring Security 官方文件、OWASP Java Security。
- PHP：PHP 官方 Security 章節、OWASP PHP Security Cheat Sheet。
- 前端（React/Vue/Angular）：各框架官方 XSS/CSP 防護章節、OWASP DOM-based XSS Prevention Cheat Sheet。

**重要限制**：本文件不代表完整涵蓋所有語言與框架；不可宣稱某框架「沒有已知風險」僅因本文件未列出對應指南，Phase 1 必須針對實際技術堆疊另行查證。
