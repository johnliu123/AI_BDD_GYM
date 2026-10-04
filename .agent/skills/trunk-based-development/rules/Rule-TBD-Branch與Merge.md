# Rule 1 - Trunk 必須是唯一的整合中心

- Level: `MUST`
- 除明確的 release branch 或 hotfix 護欄外，所有完成的工作最終必須整合回 trunk（`main`/`master`，以 Stage 0 偵測結果為準）。
- 不得把 short-lived branch 當成長期功能空間，也不得把分支合併到 trunk 以外的長期分支（例如 `develop`）當成常態整合路徑。
- 唯一合法的合併方向：`trunk → 分支`（同步）與 `分支 → trunk`（收尾）。

## Good Example

- 這個例子是好的，因為功能完成後合併回 `main`，並刪除短命分支。

````text
feat/payment 完成 review 與 CI → merge 到 main → 刪除遠端 feat/payment。
````

## Bad Example

- 這個例子是壞的，因為把未完成工作長期留在 feature 分支，並以 develop 當整合中心。

````text
三個功能分支都 merge 到 develop，等「版本日」再一次 merge develop → main。
````

# Rule 2 - 分支策略必須依 Git 證據做 Project-Aware 判斷

- Level: `MUST`
- 判斷直推 trunk 或 short-lived branch + PR 時，必須引用 Stage 0 證據（commit 歷史、branch protection、活躍分支數、團隊規模線索），不可只憑使用者一句「幫我 push」。
- 若證據顯示 Gitflow 風格（存在 `develop`/`release/*`/`hotfix/*` 且持續使用），不得單方面強制搬遷；須提出漸進方案並徵詢使用者（見 `rules/Rule-TBD-例外與健康度.md`）。
- 新專案或無慣例線索時，release 節奏與團隊規模未知則先問，再選策略。

## Good Example

- 這個例子是好的，因為引用歷史與保護規則後才建議走 PR。

````text
git log 顯示近期皆為 PR merge，且存在 branch protection → 建議 short-lived branch + PR，不直推 main。
````

## Bad Example

- 這個例子是壞的，因為未盤點就套用「TBD 一定要直推 trunk」。

````text
使用者要修 typo，未看歷史就直接 git push origin main。
````

# Rule 3 - Short-Lived Branch 不得超過硬上限

- Level: `MUST`
- 分支軟目標：數小時內合併；硬上限：2 天。超過 2 天必須視為風險訊號並採取行動，不可繼續累積 diff。
- 單一 PR diff 建議以 ~400 行為警戒線；超過應拆分 PR、stacked PR、配對完成，或以 Feature Flag 先併回安全部分。
- 整 repo 活躍分支數（不含 trunk）以 ≤ 3 為健康基準；明顯超過須在健康度報告中提出。

## Good Example

- 這個例子是好的，因為分支超時後立即拆小 PR 並當日合併。

````text
分支已 2.5 天、diff 600 行 → 拆成兩個 PR，今天內合併第一部分（flag 關閉）。
````

## Bad Example

- 這個例子是壞的，因為分支已一週仍「等下再 merge」。

````text
feature/checkout 已存活 7 天，理由：等全部做完再一次 PR。
````

# Rule 4 - 合併前必須先與 trunk 同步

- Level: `MUST`
- 合併進 trunk 前，必須 `fetch` 並把最新 trunk 同步進分支（merge 或 rebase，依專案慣例）；不得在過時基準上通過 CI 就 merge。
- 同步時衝突頻繁或衝突範圍擴大，本身即分支過老的訊號，須回到 Rule 3 的處理選項。
- 不得對 trunk 本身做 rebase 改寫歷史。

## Good Example

- 這個例子是好的，因為 merge 前先更新分支基準。

````text
git fetch origin && git merge origin/main → CI 綠燈 → 再 merge PR。
````

## Bad Example

- 這個例子是壞的，因為分支落後 trunk 很多天仍直接 merge。

````text
分支落後 main 80 commits，略過同步，因為「本地測試有過」。
````

# Rule 5 - 整合頻率至少每日一次且禁止 code freeze 常態化

- Level: `SHOULD`
- 每個活躍分支至少每天一次把工作整合回 trunk（DORA 對 TBD 的核心量化指標）。
- 不應以「整合週」「stabilization sprint」作為固定儀式；若團隊存在此慣例，須在健康度檢查中標記為反模式並提出漸進改善。
- 合併策略預設 squash merge；需保留分支內原子 commit 脈絡時可用 merge commit；rebase merge 僅用於未被他人 fork 的分支。

## Good Example

- 這個例子是好的，因為每日小步合併並保持 trunk 可發布。

````text
連續三天：每天 merge 一個小 PR 到 main，trunk CI 全程綠燈。
````

## Bad Example

- 這個例子是壞的，因為衝刺末才整合，累積大爆炸 merge。

````text
兩週 sprint 期間零 merge，最後一天 merge 12 個分支到 main。
````
