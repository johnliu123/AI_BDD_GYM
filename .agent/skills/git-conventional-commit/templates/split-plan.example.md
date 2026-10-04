# Commit 拆分計畫

> 依 Phase 2 判定產出；須使用者確認後才進入 Phase 6。

## 背景

| 項目 | 值 |
|---|---|
| 目前分支 | feat/rate-limit |
| Staged 檔案數 | 4 |
| 拆分原因摘要 | 混雜 API 功能與無關 README 更新，無法通過 "And" 測試 |

## 計畫（依序 commit）

### Commit 1

| 欄位 | 內容 |
|---|---|
| 預期 type / scope | feat(api) |
| Breaking | 否 |
| 包含路徑 | src/api/limit.ts, tests/api/limit.test.ts |
| 草稿 subject | add per-ip rate limiting |

### Commit 2

| 欄位 | 內容 |
|---|---|
| 預期 type / scope | docs |
| Breaking | 否 |
| 包含路徑 | README.md |
| 草稿 subject | document rate limit headers |

## 未納入本次的變更

無（全部納入上述兩個 commit）

## 請使用者確認

- [ ] 拆分順序與檔案歸屬是否正確？
- [ ] 是否開始依序 stage 並 commit？
