# Commit 拆分計畫

> 依 Phase 2 判定產出；須使用者確認後才進入 Phase 6。

## 背景

| 項目 | 值 |
|---|---|
| 目前分支 | {{current_branch}} |
| Staged 檔案數 | {{staged_file_count}} |
| 拆分原因摘要 | {{split_rationale}} |

## 計畫（依序 commit）

### Commit {{commit_index_1}}

| 欄位 | 內容 |
|---|---|
| 預期 type / scope | {{type_scope_1}} |
| Breaking | {{breaking_1}} |
| 包含路徑 | {{paths_1}} |
| 草稿 subject | {{subject_draft_1}} |

### Commit {{commit_index_2}}

| 欄位 | 內容 |
|---|---|
| 預期 type / scope | {{type_scope_2}} |
| Breaking | {{breaking_2}} |
| 包含路徑 | {{paths_2}} |
| 草稿 subject | {{subject_draft_2}} |

{{additional_commits_section}}

## 未納入本次的變更

{{leftover_changes}}

## 請使用者確認

- [ ] 拆分順序與檔案歸屬是否正確？
- [ ] 是否開始依序 stage 並 commit？
