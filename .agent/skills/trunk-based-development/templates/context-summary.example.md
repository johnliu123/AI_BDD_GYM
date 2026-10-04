# TBD 現況摘要

> 證據來源：`analyze_tbd_context.py` 輸出 + 必要時補充的唯讀 git 指令。任何策略判斷須能對應到下方證據欄位。

## 基本資訊

| 項目 | 值 |
|---|---|
| Trunk 名稱 | `main` |
| Trunk 偵測方式 | `origin/HEAD` |
| 目前分支 | `feat/checkout-ui` |
| 工作目錄是否乾淨 | 是 |
| 流程風格提示 | `tbd_like` |

## 分支概況

| 活躍分支數（不含 trunk） | 2 |
|---|---|
| 最老分支年齡（天） | 1.4 |
| 近期 trunk 整合風格 | `likely_linear_or_squash` |

### 各分支明細

| 分支 | 年齡（天） | 領先 trunk | 落後 trunk | 目前分支 |
|---|---:|---:|---:|---|
| `feat/checkout-ui` | 0.6 | 5 | 0 | 是 |
| `fix/typo-login` | 1.4 | 1 | 2 | 否 |

## 基礎設施

| CI 設定 | `.github/workflows/ci.yml` |
|---|---|
| Feature Flag 依賴線索 | `package.json` 含 `unleash-client` |

## 關鍵缺口（資訊不足時必須先問使用者）

- Release / 部署節奏：未知（需詢問：持續部署或固定排程？）
- 部署與 rollback 能力：未知
- Feature Flag 系統與治理：已有 Unleash 依賴，但 owner/清理政策未知
- 團隊規模與 PR 強制：有 CI + branch protection 跡象（需確認）

## 初步結論（供 Phase 1 使用）

專案整體符合 TBD-like：活躍分支 ≤3、最老分支未超過 2 天。應走 short-lived branch + PR，不宜直推 trunk。多日使用者可見功能需評估 Feature Flag；commit 訊息應委派 `git-conventional-commit`。
