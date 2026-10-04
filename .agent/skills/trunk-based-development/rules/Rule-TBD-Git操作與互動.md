# Rule 1 - 關鍵資訊不足時必須先問使用者

- Level: `MUST`
- 下列任一未知且會影響分支/merge/release/flag 決策時，不得猜測，須先詢問：release 與部署節奏、rollback 能力、是否已有 feature flag 系統或可否新增依賴、變更是否與他人工作衝突且所有權不明、DB/金流/權限等高風險且無既有規範、Gitflow 專案要求改 TBD 但未說明遷移範圍與時程。
- 盤點指令與 `analyze_tbd_context.py` 無法回答的業務/context 問題，一律歸入此規則。

## Good Example

- 這個例子是好的，因為部署方式未知時停下來詢問。

````text
已 commit 到 main，但未找到 CI/CD 設定 → 詢問使用者如何部署，不假設手動 rsync。
````

## Bad Example

- 這個例子是壞的，因為未知 release 節奏仍選 release branch 策略。

````text
未詢問部署方式，直接切 release/1.0 並改動版本號。
````

# Rule 2 - 唯讀 Git 盤點與低風險本機操作可自動執行

- Level: `SHOULD`
- 可自動：`git status`/`diff`/`log`/`branch`、`git fetch`/`pull`（同步 trunk）、從最新 trunk 建立新 short-lived branch、本機 `add`/`commit`（commit 訊息仍須委派 Rule-TBD-Commit與Review）、push 自己新建的分支、開 PR。

## Good Example

- 這個例子是好的，因為只跑唯讀指令蒐證。

````text
git fetch && python analyze_tbd_context.py --repo . --include-health
````

## Bad Example

- 這個例子是壞的，因為把 force-push 當成一般同步手段自動執行。

````text
分支落後，未詢問就 git push --force origin shared/feature。
````

# Rule 3 - 高風險 Git 與流程操作執行前必須確認

- Level: `MUST`
- 執行前必須向使用者說明風險並取得確認：`git push --force`/`--force-with-lease`（尤其共享分支）、略過 PR/CI 直接推 trunk、`git rebase -i` 改寫已推送或他人可見歷史、刪除含未合併 commit 的分支、非本機新分支上的 `git reset --hard`、revert 他人 commit、merge 未過 CI 的 PR、切出/刪除 release branch、解 conflict 時改動超出當前任務範圍的程式碼。
- 技術上可行不代表現在應由 AI 自行決定執行。

## Good Example

- 這個例子是好的，因為說明 force-push 風險並等待確認。

````text
「此分支他人可能已 pull，force-push 會改寫共享歷史。是否仍要 --force-with-lease？」
````

## Bad Example

- 這個例子是壞的，因為未確認就 force-push 共享分支。

````text
為「整理歷史」對 origin/feature 執行 git push --force。
````

# Rule 4 - 回報判斷時須附 Git/CI 證據

- Level: `SHOULD`
- 向使用者建議分支策略、merge 方式、flag 或 release 路徑時，應能指出依據哪項 Stage 0 證據（分支年齡、活躍分支數、merge 風格、CI 是否存在等），避免只給教條式結論。

## Good Example

- 這個例子是好的，因為建議與證據連結。

````text
「建議走 PR：recent_trunk_history 顯示 merge 風格為 PR，且 active_branch_count=2。」
````

## Bad Example

- 這個例子是壞的，因為只說「不符合 TBD」未引用證據。

````text
「你這樣不對，應該用 TBD。」
````
