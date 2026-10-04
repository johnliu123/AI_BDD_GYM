# Commit 結果回報

## 摘要

| 項目 | 值 |
|---|---|
| Commit SHA（短） | {{commit_sha_short}} |
| 預期 semver 影響 | {{semver_impact}} |
| 專案慣例來源 | {{convention_source}} |

## 完整訊息

```text
{{full_commit_message}}
```

## 包含檔案

{{files_list}}

## 多 commit 序列（若適用）

{{multi_commit_sequence}}

## 尚未處理的工作區變更

{{remaining_changes}}

## 驗證

| 項目 | 結果 |
|---|---|
| validate_commit_message.py | {{validation_result}} |
| git log -1 --stat 與預期一致 | {{stat_match}} |
| commit-msg hook | {{hook_result}} |
