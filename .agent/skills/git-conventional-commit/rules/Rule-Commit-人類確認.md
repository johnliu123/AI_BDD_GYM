# Rule 1 - 必須停下來等待使用者確認的情境

- Level: `MUST`
- 下列任一成立時，不得逕行 `git commit`（message-only 任務仍可提供草稿，但不得代為提交）：
  - 判定 Breaking Change
  - Phase 2 需多 commit 且拆分計畫尚未確認
  - Phase 0 recommendation 為 `GITMOJI_STYLE_DETECTED_ASK_USER`，或慣例／breaking 高度不確定
  - 蒐證顯示可能密鑰或敏感檔名（與 Rule-Commit-阻斷與安全 Rule 1 一致）
  - `--amend`、`rebase`、`push --force`、`reset --hard` 等改寫歷史
  - 使用者要求 `--no-verify` 跳過 hook
- 使用者說「全部照你判斷不用問」時：仍須 Phase 4 驗證與 Phase 7 回報；breaking、密鑰、歷史改寫確認不可取消。

## Good Example

- 這個例子是好的，因為列出拆分計畫後等待 OK。

````text
「建議拆成 2 個 commit（如下表）。確認後我再依序 stage 並 commit。」
````

## Bad Example

- 這個例子是壞的，因為未確認就 force-push。

````text
使用者：幫我 commit → git push --force
````

# Rule 2 - 低風險可執行但仍須透明回報

- Level: `SHOULD`
- 可不等確認即 commit 的條件：使用者明確要求 commit、單一邏輯改動、無 breaking、Phase 4 驗證通過、Phase 0 為 `FOLLOW_DETECTED_CONVENTION` 或慣例證據充分。
- 即使不等待，仍須在 Phase 7 列出：完整 message、檔案範圍、semver 影響（PATCH/MINOR/MAJOR/無）；禁止靜默 commit。

## Good Example

- 這個例子是好的，因為 commit 後立即回報 SHA 與範圍。

````text
Committed abc1234 — fix(ui): align submit button
Files: src/Button.tsx
Semver: PATCH
````

## Bad Example

- 這個例子是壞的，因為只回「已 commit」無 message 與檔案。

````text
好了。
````

# Rule 3 - 僅產生 message、不 commit

- Level: `MUST`
- 使用者只要 commit message 建議、或明確表示不要執行 commit 時：完成 Phase 0–4（必要時 Phase 5 詢問慣例），WRITE 產出訊息後停止；不進入 Phase 6。

## Good Example

- 這個例子是好的，因為只輸出草稿。

````text
使用者：「幫我想 commit message，先不要 commit」→ 輸出建議 + 驗證結果，不跑 git commit。
````

## Bad Example

- 這個例子是壞的，因為使用者只問 message 仍自動 commit。

````text
使用者：commit message 怎麼寫？→ git commit -F msg
````
