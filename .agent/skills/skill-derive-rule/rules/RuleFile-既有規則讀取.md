# Rule 1 - 擴充既有 RuleFile 前必須通讀並辨識其涵蓋範圍

- Level: `MUST`
- 修改既有 RuleFile 前，必須讀取完整檔案，辨識其主題、每條 Rule 的要求與目前編號。
- 將本次需求與既有要求比對，供後續判斷應擴充、調整或避免重複；不可只讀檔案片段後直接新增 Rule。

## Good Example

- 這個例子是好的，因為先檢視完整檔案與各 Rule 的涵蓋範圍，再判斷本次需求是否已被承接。

````md
既有 RuleFile：
- Rule 1 規範 Scenario 必須描述單一行為。
- Rule 2 規範 Then 必須描述可觀察結果。

本次需求：
- Then 必須描述可觀察結果。

判斷：本次需求已由 Rule 2 涵蓋，不新增重複 Rule。
````

## Bad Example

- 這個例子是壞的，因為只查看檔案末尾便新增 Rule，沒有確認既有內容是否已涵蓋相同要求。

````md
只查看既有 RuleFile 的最後一條後，新增：

# Rule 3 - Then 必須描述可觀察結果
````

# Rule 2 - 讀取 RuleFile 的所有 SOP 載入位置及其執行情境

- Level: `MUST`
- 必須在目標 skill 的 SOP 中找出該 RuleFile 的所有載入位置，並讀取每個位置所在 step 及其前後相關 step。
- 若載入位置有條件，必須辨識其觸發條件，以及規則是在目標 step 的何時載入；不可只搜尋檔名而忽略載入條件或上下文。
- 以辨識出的載入情境為依據，確認本次擴充的規則仍適用於原有觸發條件與 step，不可無意間改變其他情境的載入方式。

## Good Example

- 這個例子是好的，因為讀取了引用所在的完整情境，保留「撰寫 scenarios 時才載入」的條件，並確認新增規則適用於該步驟。

````md
1. THINK 判斷是否需要撰寫 Gherkin scenarios。
2. READ 若需要撰寫 Gherkin scenarios，讀取 `rules/Scenario-可驗證性.md`。
3. WRITE 依已載入規則撰寫 Gherkin scenarios。
````

## Bad Example

- 這個例子是壞的，因為只找到檔名便假設它每次都載入，忽略原有觸發條件與目標 step。

````md
搜尋到 `rules/Scenario-可驗證性.md` 後，未讀取所在 step 與前後步驟，便將本次規則當成所有任務都必須載入。
````
