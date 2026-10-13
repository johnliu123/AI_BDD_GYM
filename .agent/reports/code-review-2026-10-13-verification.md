# 程式碼審查 — 修正驗證報告（Phase 10）

**專案名稱**：`AI_BDD_GYM`
**初版驗證日期**：`2026-10-13T22:45:00+08:00`
**最新複驗日期**：`2026-10-13T23:10:00+08:00`（含 F5 結案）
**分析類型**：差異驗證 + 複驗（對照 `code-review-2026-10-13.md`）
**使用工具**：
- `node --test`（backend **32** pass、frontend **8** pass，合計 **40**）
- `npm run audit:sca`（backend + frontend 皆 **0 vulnerabilities**）
- 人工路徑複核（`sessionRateLimitRepository`、`safeLogger`、migrations）
- ESLint / Semgrep / Gitleaks / DAST：**未執行**（與初版相同限制）
**採用規範版本**：OWASP ASVS v5.0.0 Level 1、OWASP Top 10:2025、CVSS v4.0（簡化估算）

## 驗證摘要

| 項目 | 初版 | 最新 |
|------|------|------|
| P0（已確認 CRITICAL/HIGH） | 0 | **0** |
| P1（已確認 MEDIUM/LOW 待修） | 2 | **0** |
| 疑似待確認 | 1→2（曾增 F5） | **0** |
| 已確認 CRITICAL/HIGH | 0 | **0** |
| 自動化測試 | 36 | **40** |

整體風險：**低（訓練／內網 demo）**。對外正式上線仍建議 F4 憑證流程、S1–S5 工程化與 Node 22 對齊。

## 快速總覽（P0／P1）

### 🔴 必須修正（P0）

無

### 🟡 建議修正（P1）

無

### ⏳ 待確認疑似問題

無

### 💡 其他改善建議

- **S1–S4**：ESLint、helmet、Gitleaks、菜單 DB 化（初版）
- **S5**：`mssql@12` / `tedious@20` 建議 Node ≥ 22（本機 Node 20 測試可過，可能有 `EBADENGINE` 警告）
- **S6（新·建議）**：`USE_MEMORY_DB=1` 多 process 時 rate limit 仍不跨 process；僅限本機／測試，**production 應使用 MSSQL**（`db.js` 已要求 production 設定 MSSQL）

## 結案 Findings

### F1 — 5xx log 資訊暴露 → **已解決（已驗證）**

- `logServerError` + `sanitizeError`；僅 `safeLogger.js` 輸出 JSON 至 stderr
- 測試：2 項 safeLogger + 全 suite 通過

### F2 — SCA 流程 → **已解決（已驗證）**

- `npm run audit:sca`、`.github/workflows/sca.yml`
- 複驗：**0 vulnerabilities**（moderate 門檻）

### F3 — Session 建立 rate limit → **已解決（已驗證）**

- 429 / `SESSION_CREATE_RATE_LIMITED`；API 測試通過

### F5 — 多實例 rate limit 配額分裂 → **已解決（已驗證）**

- **變更**：計數改存 **`session_create_rate_limits`**（與 cart 相同 DB；transaction 更新）
- **Migration**：`001` / `002` + `migrate.js` 依序執行所有 `*.mssql.sql`
- **驗證**：`sessionRateLimitRepository.test.js` — 同一 `client_key` 第三次請求拒絕；複驗 32/32 pass
- **限制（S6）**：memory DB 模式仍為單機記憶體 DB，不適用多實例；MSSQL 部署為設計目標

## 未結案項目

### F4 — `.env` 憑證管理（LOW，已確認）

- 狀態：**待處理**（`.env` 已 gitignore；屬維運習慣）
- 建議：Gitleaks pre-commit（S3）

## 未涵蓋範圍與限制

- DAST、SAST（Semgrep）、Secret scan 未跑
- 清單／工具不窮盡，不代表零風險

## Next Actions

1. 綁定 PR：CI 跑 `npm test` + `npm run audit:sca`（含 `sca.yml`）
2. 正式 MSSQL 環境：確認 migration `002` 已套用
3. 可選：S5 `engines`、S1–S3 工程化
4. F4：確認 git history 無 `.env` 洩漏

---

是否要我針對 **F4（Gitleaks）** 或 **S5（Node engines）** 提出具體修復編輯建議？
