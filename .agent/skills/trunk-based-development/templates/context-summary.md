# TBD 現況摘要

> 證據來源：`analyze_tbd_context.py` 輸出 + 必要時補充的唯讀 git 指令。任何策略判斷須能對應到下方證據欄位。

## 基本資訊

| 項目 | 值 |
|---|---|
| Trunk 名稱 | {{trunk_name}} |
| Trunk 偵測方式 | {{trunk_detection_source}} |
| 目前分支 | {{current_branch}} |
| 工作目錄是否乾淨 | {{working_tree_clean}} |
| 流程風格提示 | {{workflow_style_hint}} |

## 分支概況

| 活躍分支數（不含 trunk） | {{active_branch_count}} |
|---|---|
| 最老分支年齡（天） | {{max_branch_age_days}} |
| 近期 trunk 整合風格 | {{merge_style_hint}} |

### 各分支明細

{{branch_details_table}}

## 基礎設施

| CI 設定 | {{ci_summary}} |
|---|---|
| Feature Flag 依賴線索 | {{flag_hints_summary}} |

## 關鍵缺口（資訊不足時必須先問使用者）

- Release / 部署節奏：{{release_rhythm_known}}
- 部署與 rollback 能力：{{deploy_rollback_known}}
- Feature Flag 系統與治理：{{flag_system_known}}
- 團隊規模與 PR 強制：{{team_pr_policy_known}}

## 初步結論（供 Phase 1 使用）

{{one_paragraph_conclusion}}
