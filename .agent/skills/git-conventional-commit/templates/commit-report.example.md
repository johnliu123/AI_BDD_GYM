# Commit 結果回報

## 摘要

| 項目 | 值 |
|---|---|
| Commit SHA（短） | a1b2c3d |
| 預期 semver 影響 | PATCH |
| 專案慣例來源 | FOLLOW_DETECTED_CONVENTION（commitlint + 歷史合規） |

## 完整訊息

```text
fix(auth): persist session on successful login

Sessions were dropped on redirect because cookie max-age was unset.

Fixes #482
```

## 包含檔案

- src/auth/session.ts
- tests/auth/session.test.ts

## 多 commit 序列（若適用）

（本次僅單一 commit）

## 尚未處理的工作區變更

README.md 仍有 unstaged 修改，未納入本次 commit。

## 驗證

| 項目 | 結果 |
|---|---|
| validate_commit_message.py | valid: true |
| git log -1 --stat 與預期一致 | 是 |
| commit-msg hook | 通過 |
