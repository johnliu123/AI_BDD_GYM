# Rule 1 - Trunk 變紅必須立即處理

- Level: `MUST`
- Trunk 上 build/test 失敗是最高優先事件，不得擱置。
- 處理順序：fix-forward（立刻修）> revert 問題 commit（自己的 commit 可自動 revert；他人的須先確認，見 `Rule-TBD-Git操作與互動.md`）> 禁止「有空再修」。
- Trunk 短暫變紅時應有可見的負責人與時間界線；修復完成前不應堆疊新的 merge。

## Good Example

- 這個例子是好的，因為 trunk 紅燈後立即 revert 並開 fix PR。

````text
main CI 紅 → revert 問題 SHA → trunk 恢復綠燈 → 另開分支修根因。
````

## Bad Example

- 這個例子是壞的，因為 trunk 紅燈仍繼續 merge 新 PR。

````text
main 已紅 2 天，團隊仍 merge 三個 PR「之後一起修」。
````

# Rule 2 - CI 回饋必須夠快以支撐 TBD

- Level: `SHOULD`
- Review/merge 前的快速測試理想上在數分鐘內回饋；過慢（例如數小時）會迫使「先 merge 再說」，使分支變相變長。
- 應優先使用 branch protection 強制 CI 綠燈才能合併，而非依賴人工記得跑測試。

## Good Example

- 這個例子是好的，因為 PR 在 8 分鐘內得到 CI 結果並完成 merge。

````text
unit + lint pipeline < 10 分鐘，merge queue 在綠燈後自動合併。
````

## Bad Example

- 這個例子是壞的，因為 CI 過慢導致審查與合併被拖延數天。

````text
完整 CI 需 3 小時，工程師改在週末才 merge。
````

# Rule 3 - Release 策略必須依部署能力選擇

- Level: `MUST`
- 能持續部署且可快速 fix-forward/回滾 → 直接從 trunk 發布；出問題優先向前修，而非依賴回退式 rollback 常態化。
- 需多版本並存、App 商店審核、法規 hardening → 可從已知良好 commit 切 release branch；release branch **不得** merge 回 trunk；修 bug 先進 trunk 再 cherry-pick 到 release。
- 功能由 Feature Flag 控制可見性時，「發布」= 調整 rollout 比例，不是重新部署同一套程式碼才算發布。

## Good Example

- 這個例子是好的，因為 SaaS 從 main 部署，功能以 flag 漸進 rollout。

````text
deploy from main → 將 new_checkout flag 從 5% 調到 25%，監控錯誤率。
````

## Bad Example

- 這個例子是壞的，因為 release branch 雙向 merge 污染 trunk。

````text
release/2.1 merge 回 main，同時 main 再 merge 回 release/2.1「同步」。
````

# Rule 4 - 引入版本/Changelog 自動化前須取得同意

- Level: `SHOULD`
- 若專案有 `CHANGELOG.md`、`package.json` version 等線索，可建議 Conventional Commits + semantic-release/release-please，但不得在使用者未同意下新增工具鏈或改變發版流程。

## Good Example

- 這個例子是好的，因為先說明效益並詢問是否導入 semantic-release。

````text
「目前 commit 風格混亂，是否同意我先以 git-conventional-commit 統一，再評估 release-please？」
````

## Bad Example

- 這個例子是壞的，因為未詢問就加入 semantic-release 與改 CI。

````text
直接在 repo 加入 semantic-release 設定並改動 version 流程。
````

# Rule 5 - Merge Queue 應在高併發時評估

- Level: `SHOULD`
- 多 PR 並行且 trunk 更新頻繁時，應評估 Merge Queue / Merge Train，降低 merge skew（各自 CI 都過但合併後才壞）風險。

## Good Example

- 這個例子是好的，因為啟用 merge queue 避免語意衝突。

````text
GitHub merge queue：PR A/B 依序在最新 main 上重測後合併。
````

## Bad Example

- 這個例子是壞的，因為兩個 PR 同時 merge 導致 post-merge 失敗才發現衝突。

````text
PR A、B 各自 CI 綠燈，幾乎同時 merge，main 立即紅燈。
````
