# Rule 1 - 蒐證 JSON 的阻斷條件須依優先序處理

- Level: `MUST`
- 讀取 `analyze_git_changes.py` 輸出後，依序檢查；命中任一阻斷項即停止後續 commit 流程，並向使用者說明原因與下一步。
- 優先序：`nothing_to_commit` → `merge_in_progress` / `rebase_in_progress` / `cherry_pick_in_progress` → `conflicted` 非空 → `security.possible_secrets` 或 `security.sensitive_filenames` 非空。
- merge/rebase/cherry-pick 進行中：不套用一般 Conventional Commits 判斷；merge commit 慣例見 [anti-patterns.md](../references/anti-patterns.md) #12。
- 無變更可 commit：不編造 message（見 [examples.md](../references/examples.md) 範例 5）。

## Good Example

- 這個例子是好的，因為在 staged 含 `.env` 時停止並警告。

````text
security.sensitive_filenames 含 ".env" → 停止 stage/commit，請使用者確認是否應被 ignore。
````

## Bad Example

- 這個例子是壞的，因為 rebase 進行中仍產生 feat message 並 commit。

````text
rebase_in_progress: true → 仍執行 git commit -F msg.txt。
````

# Rule 2 - 分析範圍與 diff 完整性

- Level: `MUST`
- 使用者未明確要求包含 unstaged/untracked 時，只分析 `status.staged`；staged 為空則詢問要 stage 哪些路徑，不得 `git add -A` 或 `git add .` 猜測。
- 若 `*_diff_truncated == true` 且該檔為 type/拆分/breaking 判斷關鍵，須對該檔執行 `git diff --staged -- <file>`（或 unstaged 對應指令）取得完整 diff。
- 腳本不可用時，SHOULD 改以平行執行 `git status`、`git diff`（含 `--staged`）蒐證，仍遵守本 Rule 的阻斷邏輯。

## Good Example

- 這個例子是好的，因為 staged 為空時先問使用者。

````text
status.staged 為空、unstaged 有 3 檔 → 「要 commit 哪些檔案？目前 staged 是空的。」
````

## Bad Example

- 這個例子是壞的，因為未詢問就 add 整個工作區。

````text
使用者只說「幫我 commit」→ git add -A && git commit。
````

# Rule 3 - Git 寫入與歷史安全

- Level: `MUST`
- Staging 使用明確路徑 `git add <path>`；同檔不同 hunk 依 [tooling.md](../references/tooling.md) 使用 hunk 級 staging。
- Stage 後須 `git diff --staged` 確認範圍與計畫一致，才 `git commit -F <訊息檔>`；禁止用多個 `-m` 組多段訊息（見 tooling.md）。
- 不得更新 git config；不得 `--no-verify` / `--no-gpg-sign` 除非使用者明確要求且已走 Phase 5 確認。
- `git commit --amend`、`rebase`、`push --force`、`reset --hard` 等改寫歷史操作：僅在使用者明確要求且 Phase 5 確認後執行；已推送共享分支須警告。
- commit-msg hook 拒絕時：讀 hook 錯誤、對照 [spec.md](../references/spec.md) 第 8 節修正後重試，不得用 `--no-verify` 硬闖。

## Good Example

- 這個例子是好的，因為只 stage 計畫內路徑並用 -F 提交。

````text
git add src/auth/login.ts tests/auth/login.test.ts
git diff --staged
git commit -F .commit-msg.tmp
````

## Bad Example

- 這個例子是壞的，因為 hook 失敗仍 --no-verify。

````text
commitlint 報 subject too long → git commit --no-verify。
````
