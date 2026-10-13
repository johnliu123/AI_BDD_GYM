# 程式碼審查報告

**專案名稱**：`AI_BDD_GYM`（restaurant-menu 前後端）
**分析日期**：`2026-10-13T22:15:00+08:00`
**分析範圍**：基線審查（Baseline Review）— `backend/src/**`、`frontend/src/**`、根目錄 `.gitignore` 與相依 manifest；不含 `specs/`、`sdd/` 需求文件深度對照、未執行 DAST、未掃描容器／IaC
**使用工具**：
- `node --test`（backend v20.10.0，28 項；frontend 8 項）
- 人工／AI 輔助程式路徑追蹤（依 skill Phase 4–7）
- `npm audit`：**未成功**（registry TLS `unable to verify the first certificate`）
- ESLint / Semgrep / Gitleaks / Trivy：**本機 PATH 未安裝**，未執行
**採用規範版本**：OWASP ASVS v5.0.0 Level 1（訪客點餐／購物車場景）、OWASP Top 10:2025、CWE 常見分類、CVSS v4.0（僅用於已確認資安弱點之簡化估算）

## 分析摘要與整體風險概況

本專案為 Express + React 的訪客菜單與購物車 API，核心安全控制（HttpOnly Session、Origin 白名單、CSRF、購物車依 `guest_session_id` 隔離、參數化 SQL／記憶體 DB 綁定）與 **39 項**自動化測試一致，**未發現已確認之 CRITICAL／HIGH 資安弱點**。初版 P1（F1 log、F2 SCA）與疑似 F3（session rate limit）已修正並通過 Phase 10 驗證，詳見 [`code-review-2026-10-13-verification.md`](./code-review-2026-10-13-verification.md)。剩餘為 F4 憑證管理慣例（LOW）與 S1–S4 工程化建議。整體風險：**低（demo／內網）**；對外正式上線仍建議 helmet、Gitleaks、多實例限流策略。

## 問題總覽

| 嚴重度 | 已確認 | 疑似 | 建議 | 合計 |
|--------|--------|------|------|------|
| CRITICAL | 0 | 0 | — | 0 |
| HIGH | 0 | 0 | — | 0 |
| MEDIUM | 0 | 1 | — | 1 |
| LOW | 1 | 0 | 5 | 6 |

| 問題類型 | 數量 |
|---------|------|
| 程式邏輯問題 | 0 |
| 潛在 Bug | 0 |
| 資安弱點 | 2 |
| 程式碼品質問題 | 0 |
| 效能與資源管理問題 | 1 |
| 相依套件與設定風險 | 1 |

| 修正狀態 | 數量 |
|---------|------|
| 待處理 | 1（F4 憑證管理慣例） |
| 修正中 | 0 |
| 已解決（已驗證） | 3（F1、F2、F3） |
| 部分修正（風險已接受） | 0 |

## 快速總覽（P0／P1）

> 本區為「Findings 詳情」的精簡索引；對照 `rules/Rule-CodeReview-P0P1摘要與檢查清單使用.md`。

### 🔴 必須修正（P0）

無（本次無「已確認」且嚴重度 CRITICAL／HIGH 的項目）。

### 🟡 建議修正（P1）

無（F1、F2 已於 2026-10-13 修正並驗證，見 `code-review-2026-10-13-verification.md`）。

### ⏳ 待確認疑似問題

無（F5 已改為 DB 表 `session_create_rate_limits` 共用配額，見 `code-review-2026-10-13-verification.md`）。

### 💡 其他改善建議

1. **S1**：導入 ESLint（前後端）並於 PR 執行，補足 Lint 層級檢查。
2. **S2**：正式環境加上 `helmet` 或等效安全標頭（CSP、X-Content-Type-Options）。
3. **S3**：將 Gitleaks 納入 pre-commit（`.env` 已 gitignore，仍防誤 commit）。
4. **S4**：菜單資料仍來自 `menuData.js` 靜態檔，若未來改 DB 需補 migration／快取策略（可維護性，非弱點）。

## Findings 詳情

### F1 - 5xx 處理路徑將完整 Error 寫入 console

- **類型**：資安弱點（資訊暴露至 log）
- **確認層級**：已確認
- **嚴重度**：MEDIUM（簡化估算：需能讀取伺服器 log；客戶端仍收到泛化 `INTERNAL_ERROR`，非正式 CVSS Base Score）
- **位置**：`backend/src/server.js`　方法：Express error middleware　行號：`53-65`

**證據／可重現程式碼片段**

```javascript
app.use((error, req, res, next) => {
  // ...
  console.error(error);
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: '伺服器錯誤' },
  });
});
```

購物車路由在 `status >= 500` 時同樣 `console.error(error)`（例如 `routes/cart.js` 第 50–52 行）。人工追蹤：`toClientErrorPayload` 對 5xx 已遮蔽回應內容，但 log 仍為完整 `Error`（含 `tedious`／`mssql` 連線失敗時之主機名與 stack）。

**成因、觸發條件與可能影響**

未預期例外或資料庫連線錯誤進入 5xx 分支時，stderr／log 聚合系統可能保存基礎設施細節，違反最小揭露原則。

**對應依據**

- OWASP Top 10:2025 — Security Logging and Alerting Failures（日誌內容管理）
- CWE：**CWE-532**（Insertion of Sensitive Information into Log File）

**建議修正方式**

以結構化 logger 取代 `console.error(error)`；記錄 `error.code`、匿名化訊息、correlation id；連線字串與密碼永不寫 log。

**修正資訊**

- 優先順序：1（已確認 MEDIUM、正式環境 log 暴露面較大）
- 負責人：`待指定`
- 狀態：待處理

**驗證方式與結果**（修正後填寫）

- 重跑分析／工具：待辦
- 新增／更新回歸測試：可 mock 拋錯 assert log 不含 `MSSQL_SERVER` 字串
- 既有測試套件：28 passed（backend）

---

### F2 - 相依套件弱點掃描未在本次完成

- **類型**：相依套件與設定風險
- **確認層級**：已確認（流程缺口，非特定 CVE）
- **嚴重度**：MEDIUM（本專案慣例：缺少 SCA 無法證明 supply chain 安全）
- **位置**：`backend/package.json`、`frontend/package.json`

**證據**

本機執行 `npm audit` 回傳 `unable to verify the first certificate`，未取得 advisory 列表。PATH 上無 Trivy／OSV-Scanner。

**成因、觸發條件與可能影響**

未知 CVE 可能潛藏於 `express@^4.19.2`、`vite@^6.4.3`、`mssql@^11.0.1` 等，直到修復 registry 或 CI 掃描前無法量化。

**對應依據**

- OWASP Top 10:2025 — Software Supply Chain Failures
- CWE：**CWE-1395**（近似對應：Dependency on Vulnerable Third-Party Component）

**建議修正方式**

修復 npm registry TLS 或使用 `npm audit --strict-ssl=false`（僅限受控環境）／在 CI 跑 Trivy `fs` 掃描 lockfile；高風險 advisory 需人工確認 reachability。

**修正資訊**

- 優先順序：2
- 狀態：待處理

---

### F3 - 訪客 Session 建立缺乏 rate limiting（疑似可用性風險）

- **類型**：效能與資源管理問題
- **確認層級**：疑似
- **嚴重度**：MEDIUM（暫定，未評 CVSS）
- **位置**：`backend/src/repositories/guestSessionRepository.js`　`createSessionRecord`　行號：`73-92`

**證據**

`GET /api/cart` 會觸發 `ensureSession` → `createSessionRecord`；僅有 `SESSION_MAX_COUNT` 上限（預設 5000），測試 `cart-session-boundary.test.js` 已覆蓋 503 行為。

**待確認事項**

正式部署是否對外網開放、前方是否有 API Gateway rate limit；若僅內網 demo 可接受風險。

---

### F4 - `.env` 含資料庫密碼且僅依賴 gitignore

- **類型**：資安弱點（設定管理）
- **確認層級**：已確認
- **嚴重度**：LOW（簡化估算：檔案未納入 git 追蹤，風險主要在開發機外洩）
- **位置**：`backend/.env`（gitignore 已含 `backend/.env`；`git ls-files` 未追蹤）

**證據**

`git ls-files backend/.env` 無輸出；`.gitignore` 第 6–7 行忽略 `.env`。本機 `.env` 含 `MSSQL_PASSWORD`（內容不在報告中重複）。

**對應依據**

- OWASP ASVS V14 設定
- CWE：**CWE-798**（近似：硬編碼／明文憑證於設定檔）

**建議修正方式**

維持不提交；若曾誤 push 須輪替密碼並清 history；考慮 Windows 使用者層 secret 或 CI secret store。

**修正資訊**

- 優先順序：3
- 狀態：待處理

---

## 已審查且未發現問題的控制（摘要）

| 區域 | 結論 |
|------|------|
| SQL Injection | `mssqlPool.js` 使用 `@pN` 參數綁定；記憶體 DB 以 params 查詢，未見字串拼接使用者輸入 |
| 購物車越權 | `cartRepository` 更新／刪除皆帶 `guest_session_id`；測試 `two sessions cannot read each other cart items` 通過 |
| CSRF／Origin | 非 GET 需 `Origin` 白名單 + `X-CSRF-Token`；測試 `rejects invalid or missing Origin` 通過 |
| XSS 表面 | 前端未使用 `dangerouslySetInnerHTML`／`innerHTML` |
| 錯誤回應 | 4xx 使用 `CLIENT_MESSAGES`；5xx 客戶端訊息泛化 |

## 未涵蓋範圍與限制

- **DAST**（ZAP 等）：未對執行中 `localhost:3000` 掃描。
- **SAST**：Semgrep／CodeQL 未安裝，無 SARIF 合併。
- **Secret Scanning**：Gitleaks 未執行；僅人工確認 `.env` 未追蹤。
- **SCA**：`npm audit` 因 TLS 失敗，未列出 CVE。
- **清單限制**：依 `Reference-前後端檢查清單.md` 抽查，清單不窮盡，未命中不代表無問題。
- **業務需求**：未逐條對照 `specs/` BDD 規格，僅從程式與測試推斷行為。

## Next Actions

1. **後端負責人**：實作 F1 log redaction，並在 staging 觸發一次 DB 連線失敗確認 log 內容。
2. **DevOps**：修復 CI／本機 `npm audit` 或導入 Trivy OSV 掃描（F2）；PR 必跑。
3. **資安／DevOps**：安裝 Gitleaks pre-commit（S3）。
4. **後端負責人**：依部署情境評估 F3 rate limit 或調整 `SESSION_MAX_COUNT` 與 503 監控。
5. **全員**：確認 `MSSQL_PASSWORD` 未出現在 git history（`git log -p -- backend/.env`）；若曾提交則輪替密碼。

---

是否要我針對前 **2** 項（F1 log 處理、F2 SCA／CI 設定）提出具體修復編輯建議？（待你確認後才會修改程式碼）
