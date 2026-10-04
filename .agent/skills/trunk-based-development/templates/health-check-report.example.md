# TBD 健康度檢查報告

> 檢查時間（UTC）：2026-03-28T14:05:00+00:00

## 摘要

| 整體提示 | 需改善 |
|---|---|
| 對應 workflow 風格 | `many_active_branches` |

## DORA 對照

| 檢查項 | 實測值 | 健康基準 | 結果 |
|---|---|---|---|
| 活躍分支數 | 6 | ≤ 3 | 不合格 |
| 最老分支年齡（天） | 5.2 | < 2（硬上限） | 不合格 |
| CI 是否存在 | true | 建議有自動化 CI | 合格 |
| Code freeze / 整合週 | 文件提到「衝刺尾端 stabilization」 | 不應存在 | 不合格 |
| Feature Flag 衛生 | 程式碼有 3 個 `FF_*` 常數，無 owner 註解 | 有 owner 與到期預期 | 需追蹤 |

## 建議改善（對應 anti-patterns）

- 對照 anti-patterns #8：將 6 條活躍分支收斂到 ≤3，優先合併或關閉已 stale 的 `feature/*`。
- 對照 anti-patterns #3：設定 PR 審查 SLA（同日完成），避免佇列化。
- 對照 anti-patterns #2：為既有 Release Toggle 建立 owner 與 40 天清理檢查。

## 證據附錄

```json
{"active_branch_count_excluding_trunk": 6, "health": {"overall_healthy_hint": false}}
```
