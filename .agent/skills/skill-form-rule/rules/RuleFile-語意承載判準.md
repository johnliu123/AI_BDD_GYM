# Rule 1 - 每條規則必須包含可操作的判斷項，不可只有概念或口號

- Level: `MUST`
- 每條規則的描述中，至少有一項是分類、子項、數值界線、排除條件或可勾選的檢查項。
- 只有概念名稱、抽象口號或來源名稱，視為語意承載不足。
- 不可用「已經有 Good/Bad Example」替代規則主體的判斷項。

## Good Example

- 這個例子是好的，因為規則列出三個分類與各自的子項，還給出標記方式。

````md
# Rule 101 - 必須以 code review checklist 掃描高風險變更

- Level: `MUST`
- 檢查 Correctness，包含邊界條件、錯誤處理與空值處理。
- 檢查 Security，包含輸入驗證、權限檢查與機密資訊外洩。
- 檢查 Maintainability，包含命名、重複程式碼與函式長度。
- 每類標記 `Pass`、`Concern` 或 `Blocker`。
````

## Bad Example

- 這個例子是壞的，因為規則描述只有口號，沒有任何分類、子項或界線。

````md
# Rule 101 - 必須以 code review checklist 掃描高風險變更

- Level: `MUST`
- 要完整審查，不要漏掉重要問題。
````

# Rule 2 - 來源的分類與子項必須逐項保留

- Level: `MUST`
- 適用於：RuleFile 由既有檢查清單、分類表、提示詞或排序規則轉寫而來。
- 來源的每個分類都必須出現在成品中，子項必須逐項對照後保留。
- 可改寫語氣與命名，但不可刪掉會改變判斷結果的掃描項。
- 例外：來源項目已由其他 RuleFile 承接時可省略，並在規則中註明承接的檔名。

## Good Example

- 這個例子是好的，因為成品保留了來源的分類與全部四個子項。

````md
來源 checklist：
- Security
  - Input validation
  - Authorization
  - Secrets handling
  - Dependency risk

RuleFile 成品：
- 檢查 Security，包含 input validation、authorization、secrets handling 與 dependency risk。
- 其中 authorization 與 secrets handling 直接阻擋 merge。
````

## Bad Example

- 這個例子是壞的，因為成品只留下分類名稱，四個子項全部被刪掉。

````md
來源 checklist：
- Security
  - Input validation
  - Authorization
  - Secrets handling
  - Dependency risk

RuleFile 成品：
- 檢查安全性。
````

# Rule 3 - Example 應示範語意密度差異，而不只是格式差異

- Level: `SHOULD`
- 適用於：RuleFile 由既有檢查清單、分類表、提示詞或排序規則轉寫而來。
- Good 與 Bad 應示範「保留分類與子項」與「只留分類名稱」的差異。
- Example 不應只展示標題、`Level`、fenced code block 等格式正確性。

## Good Example

- 這個例子是好的，因為 Good 與 Bad 的差異在子項的保留程度，不在格式。

````md
Good：
- 檢查 Correctness，包含邊界條件、錯誤處理與空值處理。

Bad：
- 檢查 Correctness。
````

## Bad Example

- 這個例子是壞的，因為 Good 與 Bad 的差異只在標題格式，沒有觸及判斷力。

````md
Good：
- 有 `# Rule 1` 標題。

Bad：
- 沒有 `# Rule 1` 標題。
````
