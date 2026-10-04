# TBD 健康度檢查報告

> 檢查時間（UTC）：{{generated_at_utc}}

## 摘要

| 整體提示 | {{overall_healthy_hint}} |
|---|---|
| 對應 workflow 風格 | {{workflow_style_hint}} |

## DORA 對照

| 檢查項 | 實測值 | 健康基準 | 結果 |
|---|---|---|---|
| 活躍分支數 | {{active_branch_count}} | ≤ 3 | {{branch_count_status}} |
| 最老分支年齡（天） | {{max_branch_age_days}} | < 2（硬上限） | {{branch_age_status}} |
| CI 是否存在 | {{has_ci}} | 建議有自動化 CI | {{ci_status}} |
| Code freeze / 整合週 | {{code_freeze_notes}} | 不應存在 | {{code_freeze_status}} |
| Feature Flag 衛生 | {{flag_hygiene_notes}} | 有 owner 與到期預期 | {{flag_hygiene_status}} |

## 建議改善（對應 anti-patterns）

{{improvement_bullets}}

## 證據附錄

```json
{{script_json_snippet}}
```
