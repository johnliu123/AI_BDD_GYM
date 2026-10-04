# Rule 1 - 跳過探索須提示 Solution-First 並保留問題錨點

- Level: `MUST`
- 使用者要求「跳過探索直接做方案」時：
  1. 依 `references/anti-patterns.md` Solution-First 說明風險。
  2. 若使用者明確知情仍堅持 → 尊重決定。
  3. **仍須**產出至少一句輕量 Problem Statement 作錨點，並在文件標註「未經完整 Discover/Define」。
- 不得在未告知風險下配合跳階段。

## Good Example

- 這個例子是好的，因為風險說明、錨點與標註齊全。

````text
提示 Solution-First → 使用者堅持 → 寫一句錨點 statement + 文件註記證據等級弱。
````

## Bad Example

- 這個例子是壞的，因為直接實作且無錨點。

````text
使用者：「別研究了直接做 dashboard」→ AI 立刻寫 code，無 problem 錨點。
````

# Rule 2 - 退回階段必須對應被推翻的假設類型

- Level: `MUST`
- 退回依下表，**不是**「想重做某階段」：
  - 使用者沒有此問題 / 需求不存在 → **Discover**
  - 問題存在但方向/範圍錯 → **Define**
  - 問題定義成立但方案錯 → **Develop**
  - 方案對但上線執行/採用不如預期 → **Deliver 內迭代**或視嚴重度退回 **Develop**
- 測試推翻**問題假設** → Discover/Define；否定**方案**但問題仍成立 → Develop only。

## Good Example

- 這個例子是好的，因為測試發現無痛點而退回 Define/Discover。

````text
原型測試：使用者表示從未遇到該問題 → 退回 Discover 重新界定使用者與情境。
````

## Bad Example

- 這個例子是壞的，因為方案失敗卻重跑完整 Discover。

````text
UI 配色不受歡迎 → 要求從零做競品分析（問題定義未變）→ 應在 Develop 迭代。
````

# Rule 3 - 資源極限與關係人分歧時不得擅自拍板

- Level: `MUST`
- **時間/預算極限**：採輕量 Discover（桌面研究 + 既有資料 + 少量訪談/專家判斷）；標註弱證據與待驗證假設。
- **Problem Statement / 優先序分歧**：列出分歧點與各方證據，facilitate 收斂，**裁決權交使用者/關係人**。
- **極模糊請求**（「幫我做個東西」）：視為 Discover 起點，先問問題與使用者，不自行假設專案類型。
- **使用者主體錯誤**：退回 User 層，對真正使用者重新蒐證（見 `references/principles.md` User→Problem→Solution）。

## Good Example

- 這個例子是好的，因為分歧時呈現證據並請 owner 裁決。

````text
PM 與 Sales 對 HMW 優先序不同 → 表格列證據 → 請 sign-off owner 選一個方向。
````

## Bad Example

- 這個例子是壞的，因為 AI 選邊站並宣告定案。

````text
兩方意見不同 → AI 選 PM 版本為最終 Problem Statement，未經 sign-off。
````
