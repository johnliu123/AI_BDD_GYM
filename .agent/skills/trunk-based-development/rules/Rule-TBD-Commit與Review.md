# Rule 1 - Commit 必須小步且可獨立建置

- Level: `MUST`
- 每個 commit 應代表一個清楚、可還原的變更單位，且盡量保持 trunk/分支在該 commit 上仍可建置或可測試。
- 禁止把多個無關主題塞進單一「巨型 commit」；本地可有多個小 commit，squash 時機應在合併進 trunk 時，而非在共享分支上改寫已被他人看到的歷史。
- Commit 前應跑專案既有的快速測試/lint（若存在），不得明知會壞仍提交。

## Good Example

- 這個例子是好的，因為兩個 commit 各做一件事且各自可建置。

````text
commit A：重命名介面（行為不變）；commit B：接上新的實作（flag 關閉）。
````

## Bad Example

- 這個例子是壞的，因為一次 commit 混合重構、功能與設定變更。

````text
單一 commit：重構 20 檔 + 新功能 + 升級依賴 + 改 CI。
````

# Rule 2 - Commit 訊息不得由本 Skill 自行發明格式

- Level: `MUST`
- 當使用者要求 commit、產生 commit message、或 Stage 4 要提交變更時，必須 `DELEGATE` 至 `git-conventional-commit` skill（優先 `.agent/skills/git-conventional-commit/`，其次 `.cursor/skills/git-conventional-commit/`），並執行該 skill 的 SOP。
- 本 Skill 只負責 TBD 流程中的時機與粒度；不自行套用 Conventional Commits 字串模板，除非使用者明確拒絕委派且專案無慣例。

## Good Example

- 這個例子是好的，因為 commit 前委派專用 skill 偵測慣例並驗證訊息。

````text
DELEGATE git-conventional-commit → detect_project_convention → validate → git commit。
````

## Bad Example

- 這個例子是壞的，因為未偵測專案慣例就寫死 `feat: update`。

````text
直接 git commit -m "feat: update" 而未讀取專案 commit 歷史或 commitlint 設定。
````

# Rule 3 - Code Review 應同步或近同步完成

- Level: `SHOULD`
- PR 開出後，審查應在同一個工作日、理想上數小時內完成；審查延遲是累積大批次的主因之一。
- 自動化檢查（測試、lint、coverage）應先於人工審查；人工審查聚焦邏輯、設計、可維護性。
- PR diff 超過 ~400 行應建議拆分或 stacked PR；pair programming 是否可替代額外 review 依專案慣例，不確定時先問。

## Good Example

- 這個例子是好的，因為 PR 小且當日完成審查與合併。

````text
120 行 diff PR，上午開、下午 merge，CI 先綠再請人 review。
````

## Bad Example

- 這個例子是壞的，因為 PR 閒置多日導致分支持續變老。

````text
PR 開了 5 天無 review，作者繼續在同一分支堆疊新 commit。
````

# Rule 4 - Review 與 Merge 不得跳過 CI Gate

- Level: `MUST`
- CI 未綠燈不得 merge 到 trunk；不得以「本地有跑過」取代 branch protection 要求的 CI。
- Flaky test 導致偶發紅燈時，應標記隔離並回報，不可靠無意義重跑矇混過關。

## Good Example

- 這個例子是好的，因為等待 CI 綠燈後才 merge。

````text
GitHub Checks 全綠 → squash merge → 確認 post-merge trunk pipeline 仍綠。
````

## Bad Example

- 這個例子是壞的，因為跳過 CI 合併。

````text
CI 失敗但「應該沒事」仍 merge PR。
````
