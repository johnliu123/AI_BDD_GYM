# 前端與後端程式碼檢查清單

本清單是 Phase 4（Bug 與邏輯分析）與 Phase 5（資安弱點分析）的**追蹤起點**，不是自動判定依據。清單依 OWASP ASVS／OWASP Top 10:2025／CWE 常見分類與實務常見錯誤模式整理，**不窮盡**：

- 命中清單項目 ≠ 已確認問題；仍須依 `rules/Rule-CodeReview-證據與確認層級.md` 人工追蹤程式碼路徑或重現後，才能升級為「已確認」。
- 清單項目全數「未命中」≠ 沒有問題；只代表本次抽查未發現，不代表保證不存在，也不代表已完整審查該區域。
- 清單未涵蓋的商業邏輯、授權設計合理性、跨模組一致性，一律依 `rules/Rule-CodeReview-工具互補與人工審查邊界.md` 另行人工追蹤，不可因清單未列出而略過。

## 如何使用

依本次分析範圍（前端／後端／兩者皆有），在 Phase 4、Phase 5 選讀對應小節：

| Phase | 應選讀小節 |
|-------|-----------|
| Phase 4（邏輯與流程） | A2、B3、B4 |
| Phase 5（資安） | A1、A3、A5、B1、B2、B5、B6 |

逐項檢查時，命中者記錄為候選項目（含位置、命中項目描述），併入該 Phase 既有的候選清單，繼續走標準 SOP（人工確認→分類→嚴重度）。

## A. 前端程式碼檢查清單

### A1 輸入驗證與輸出編碼（對應 OWASP Top 10:2025 A05 Injection、CWE-79 XSS）

- [ ] 是否把使用者輸入或外部資料直接插入 DOM（`innerHTML`、Vue `v-html`、React `dangerouslySetInnerHTML`）而未消毒（sanitize）？
- [ ] 是否使用 `eval`／`new Function`／`setTimeout(string)` 執行動態字串？
- [ ] URL 參數、Query String、Hash、`document.referrer` 是否直接用於渲染或導向（`window.location`），未驗證格式或白名單？
- [ ] 第三方套件注入的 HTML／Script 是否有對應 CSP（Content-Security-Policy）限制？

### A2 狀態、資料流與邏輯問題

- [ ] 非同步呼叫（Promise／async／RxJS）是否有競態條件（race condition），導致錯誤流程被誤判為成功流程、或 loading 狀態與實際結果不一致？
- [ ] 元件卸載（unmount）後是否仍有未清除的訂閱、計時器、事件監聽，造成記憶體洩漏或對已卸載元件呼叫 `setState`？
- [ ] 表單／按鈕是否缺少防止重複送出的機制（debounce、disable、loading lock）？
- [ ] 邊界條件（空陣列、`null`、`undefined`、`0`、空字串、尚未載入完成）是否都有處理，而非僅處理「正常有值」情境？
- [ ] 重新渲染或重新觸發流程（如 `showX = false` 後立即呼叫初始化函式）是否確認 DOM／View 已更新，而非假設上一輪渲染已完成？

### A3 身分驗證、Session 與 Token

- [ ] Token／敏感資料存放位置（`localStorage`／`sessionStorage`／記憶體）是否符合專案風險評估，而非預設選用最方便但風險較高的方式？
- [ ] 是否僅依賴 UI 隱藏按鈕／頁面做權限控管，後端未重複驗證（Broken Access Control，CWE-862）？
- [ ] `console.log`、瀏覽器除錯輸出是否洩漏 Token、完整 API 回應內容、使用者 PII（CWE-200）？

### A4 效能與資源

- [ ] 大型列表渲染是否有虛擬化（virtualization）或分頁，避免一次渲染過多 DOM 節點？
- [ ] 是否存在不必要的重複 API 呼叫（例如元件重複掛載觸發重複的初始化請求）？

### A5 相依套件與機敏資訊

- [ ] `package.json` 相依版本是否存在已知弱點（需搭配 SCA 工具，見 `references/Reference-分析工具地圖.md`）？
- [ ] 是否把機敏 Key／Secret 寫在前端程式碼中？（前端程式碼對使用者可見，任何寫入前端的密鑰應視為已公開外洩）

## B. 後端程式碼檢查清單

### B1 輸入驗證與輸出編碼（CWE-89 SQL Injection、CWE-78 OS Command Injection、CWE-502 不安全反序列化）

- [ ] SQL 查詢是否使用字串拼接而非參數化查詢／ORM？
- [ ] 是否把使用者輸入直接傳入 shell 指令、`os.system`、`exec`、`eval` 類函式？
- [ ] 反序列化（`pickle`、`yaml.load`、Java `ObjectInputStream` 等）是否處理不受信任的輸入？
- [ ] 檔案上傳／路徑組合是否驗證副檔名、檔案內容、是否可能構成 Path Traversal（CWE-22）？

### B2 身分驗證與權限控管（CWE-862／863 Missing／Incorrect Authorization）

- [ ] 每個 API 端點是否都驗證呼叫者身分，而非僅驗證 Token 存在（有 Token ≠ 有權限）？
- [ ] 資源存取是否檢查「擁有權」（例如使用者只能操作自己的訂單），而非只檢查「是否登入」？
- [ ] 權限檢查邏輯是否集中於共用 middleware／decorator，而非散落各處容易遺漏？

### B3 例外處理與流程控制

- [ ] 錯誤／例外是否被不當過濾（filter）掉，導致錯誤流程被當成功流程執行（例如外部服務的錯誤回應被攔截器吞掉，仍觸發 `complete`／成功後續流程）？
- [ ] `try/catch` 是否吞掉例外卻未讓呼叫端得知失敗（例如 `catchError` 回傳預設值掩蓋失敗，上層仍沿用可能過期的本機狀態)？
- [ ] API 回應／狀態碼是否正確反映實際處理結果，成功與失敗語意是否一致？

### B4 資料庫操作與效能

- [ ] 迴圈內是否逐筆查詢造成 N+1 Query？
- [ ] 交易（transaction）邊界是否正確，部分失敗時是否有 rollback？
- [ ] 是否有未釋放的資料庫連線、檔案 handle、鎖（lock）？

### B5 敏感資料與機敏資訊

- [ ] Log／Console 是否輸出密碼、Token、PII 等敏感欄位（CWE-200／CWE-532）？認證回應物件若記錄到 Console／Log，須排除完整物件輸出，避免夾帶如 `accessToken` 等欄位。
- [ ] 設定檔／環境變數範例檔（`.env.example`）是否不小心含真實密鑰？
- [ ] 是否有機敏資訊曾提交進 Git 歷史（即使目前檔案已刪除，歷史紀錄仍存在)？

### B6 相依套件與設定

- [ ] 相依套件版本是否存在已知弱點（需搭配 SCA 工具掃描）？
- [ ] 正式環境設定是否仍開啟 Debug 模式、使用預設帳密、CORS 設定過度寬鬆？

## 使用限制

- 本清單依 OWASP ASVS v5.0.0／OWASP Top 10:2025／CWE 常見分類整理，僅涵蓋跨專案常見的錯誤模式，**不可取代**針對專案實際技術堆疊（框架版本、特有架構）的官方安全指南查證（見 `references/Reference-官方規範與標準.md` 第 7 節）。
- 專案特有的商業邏輯風險（例如計費邏輯、審批流程、角色權限劃分是否合理）不在本清單範圍，須依 `rules/Rule-CodeReview-工具互補與人工審查邊界.md` 另行人工審查。
- 報告中若引用本清單的勾選結果，須同時保留「清單不窮盡、命中仍須人工確認」的限制說明，不可宣稱「已依清單完成審查」即等同「已完整審查」。
