# Rule 1 - Hotfix 修復必須雙向回到 Trunk

- Level: `MUST`
- 生產緊急 hotfix 可從 release tag/branch 切出，但修復完成後同一修復必須進 trunk（cherry-pick 或等價重作），不得只存在於 release branch。

## Good Example

- 這個例子是好的，因為 hotfix 先上 release 再 cherry-pick 到 main。

````text
hotfix/2.0.1 修復 → deploy release → cherry-pick 到 main。
````

## Bad Example

- 這個例子是壞的，因為 production 修復未回 trunk，下次 release 又漏修。

````text
只在 release/2.0 修 bug，main 從未收到相同 patch。
````

# Rule 2 - 大型 Schema 變更必須 Expand-Migrate-Contract

- Level: `MUST`
- 大型 DB schema 變更須分多 PR/多階段：expand（相容新增）→ migrate/雙寫雙讀驗證 → contract（移除舊結構）；禁止 big-bang 一次改完，禁止假設 flag 關閉可無痛復原資料。

## Good Example

- 這個例子是好的，因為分三個 PR 完成 schema 遷移。

````text
PR1 加可空欄位 → PR2 雙寫 → PR3 切讀取並刪舊欄。
````

## Bad Example

- 這個例子是壞的，因為週末一次性改表並依賴 flag rollback。

````text
週五晚上 DROP COLUMN + flag 控制新 API，週一關 flag 期望恢復舊行為。
````

# Rule 3 - 健康度檢查須用證據產出報告

- Level: `SHOULD`
- 使用者要求「是否符合 TBD」、完成較大功能後、或 Phase 5 收尾時，應執行 `analyze_tbd_context.py --include-health`，並依 `templates/health-check-report.md` 產出報告。
- 任一指標明顯不合格時，須對照 `references/anti-patterns.md` 提出改善建議，而非只列紅綠燈。
- Code freeze、flag 衛生等腳本無法自動量測的項目，須在報告中標註「需人工/文件證據」。

## Good Example

- 這個例子是好的，因為用腳本 JSON 填健康度模板並連結 anti-pattern。

````text
health.overall_healthy_hint=false → 對照 #8 活躍分支過多 → 提出合併/關閉 stale 分支計畫。
````

## Bad Example

- 這個例子是壞的，因為只回「不健康」無數據與建議。

````text
「感覺你們分支太多，不符合 TBD。」
````

# Rule 4 - Gitflow 遷移必須漸進且經使用者同意

- Level: `MUST`
- 證據顯示 Gitflow 慣例時，不得擅自刪除 `develop`/release 流程或強制改 trunk 直推；須說明遷移成本、風險與漸進步驟（例如先縮短 release 分支壽命、提高 merge 頻率、以 flag 解耦），並取得使用者對範圍與時程的同意後才執行結構性變更。

## Good Example

- 這個例子是好的，因為提出分階段遷移計畫並等待核准。

````text
Phase A：新功能只從 main 切分支；develop 凍結新 merge。Phase B：…（需使用者確認時程）。
````

## Bad Example

- 這個例子是壞的，因為未徵詢就刪除 develop 並改寫團隊流程。

````text
直接 git push -d origin develop 並要求所有人改推 main。
````
