# Rule 1 - Type / scope / breaking 須依專案慣例與決策樹

- Level: `MUST`
- Phase 0 的 `recommendation` 為 `GITMOJI_STYLE_DETECTED_ASK_USER` 時，須在選 type 前完成 Phase 5 方向確認（gitmoji vs Conventional Commits）；見 [examples.md](../references/examples.md) 範例 4。
- `MIXED_HISTORY_ASK_USER_OR_USE_MAJORITY`：採多數慣例；不確定則問使用者。
- 選 type / scope / breaking 時 READ [decision-trees.md](../references/decision-trees.md) 對應章節；`detected_type_enum` / `detected_scope_enum` 非空時以偵測結果限制選項。
- 每一（拆分後的）commit 獨立走一遍 type → scope → breaking。

## Good Example

- 這個例子是好的，因為修正錯誤登入行為用 fix 而非 refactor。

````text
使用者無法登入（session 未寫入）→ fix(auth): persist session on login
````

## Bad Example

- 這個例子是壞的，因為 breaking API 改動標成 chore。

````text
移除公開 export oldClient → chore: clean up exports
````

# Rule 2 - Breaking change 須觸發確認與正確標記

- Level: `MUST`
- 判定 breaking 後一律進入 Phase 5 確認，不論證據多明確。
- 標記須符合 [spec.md](../references/spec.md) 第 7 節：`!` 與／或 footer `BREAKING CHANGE:`；一 commit 一個 breaking；多個 breaking 應拆 commit。

## Good Example

- 這個例子是好的，因為 footer 含遷移說明。

````text
feat(api)!: rename user endpoint

BREAKING CHANGE: GET /users renamed to GET /v2/users; update client base paths.
````

## Bad Example

- 這個例子是壞的，因為 BREAKING CHANGE 放在 subject。

````text
feat: BREAKING CHANGE remove legacy flag
````

# Rule 3 - 意圖分析（what / why）

- Level: `MUST`
- 對每個變更回答 what（依 diff 內容）與 why（現象、需求、註解、branch 的 `issue_refs_from_branch` 等）。
- diff 與上下文皆不足以說明 why 時，須詢問使用者，不得編造合理但虛構的原因。

## Good Example

- 這個例子是好的，因為 branch `fix/482-login-timeout` 與 diff 一致時才引用 issue。

````text
issue_refs_from_branch: [#482] + diff 修正 timeout → footer: Fixes #482
````

## Bad Example

- 這個例子是壞的，因為猜測 why。

````text
看不出原因 → body: "improve performance"（diff 僅改變數名）
````
