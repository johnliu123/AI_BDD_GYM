# Rule 1 - 低風險盤點與草稿產出可直接執行

- Level: `MUST`
- **可直接執行**（不需先問）：
  - 整理/盤點使用者已提供資訊，列出缺口。
  - 只讀盤點專案文件、spec、issue、程式碼以推斷情境。
  - 用既有資訊草擬 Journey Map、Persona、Problem Statement、HMW（**須標註「草稿／待確認」**）。
  - 產出 ideation 候選、方法選擇建議、驗證方案建議。
- 草稿不得當作 sign-off 或 Gate 通過依據。

## Good Example

- 這個例子是好的，因為先讀 repo 再產草稿並標註待確認。

````text
讀 issue #12 與 README → 草擬 Problem Statement（草稿）→ 列出還缺 KPI 與決策者。
````

## Bad Example

- 這個例子是壞的，因為未標註草稿就當定案推進 Develop。

````text
AI 自行寫 Persona → 直接開始寫功能規格，未請使用者確認。
````

# Rule 2 - 關鍵缺口存在時必須先問且不可猜測

- Level: `MUST`
- **必須先問**（Minimal Assumption）當下列任一项影響下一步且無證據：
  - 目標使用者與情境、目標
  - 成功定義 / KPI
  - 資源與時間（能否正式研究、幾輪原型）
  - 是否已有研究資料（避免重複）
  - 跳階段時的風險承受度與知情同意
  - Problem Statement / 方案取捨的 sign-off owner
- 使用者不知道答案時，提供 2–3 個合理選項供選，**不可代替決策**或無限追問。

## Good Example

- 這個例子是好的，因為同一決策所需的缺口一次問完。

````text
「成功是指留存、營收還是工單量？誰能 sign-off？本季能否做 5 次訪談？」（一次列出）
````

## Bad Example

- 這個例子是壞的，因為假設 KPI 並直接排時程。

````text
未問成功定義 → 假設 KPI 是 DAU → 直接排 Design Sprint。
````

# Rule 3 - 提問必須情境化且避免術語門檻

- Level: `MUST`
- 提問須描述具體情境（數據、使用者、流程），不得要求使用者先懂 Double Diamond 階段名稱。
- ❌「你現在在 Discover 還是 Define？」
- ✅「這個問題有沒有跟實際使用者聊過，或有支援單/數據可以參考？」

## Good Example

- 這個例子是好的，因為問題對應可蒐集的證據。

````text
「最近取消的客戶裡，有沒有紀錄原因？能否約 3–5 人做 20 分鐘訪談？」
````

## Bad Example

- 這個例子是壞的，因為只有抽象流程詞彙。

````text
「請先完成 Define 的 affinity mapping 再繼續。」
````
