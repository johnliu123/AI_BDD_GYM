# Rule 1 - RuleFile 必須在目標 step 需要時才載入

- Level: `MUST`
- RuleFile 的 `READ` 必須緊鄰被把關的目標 step，且讀取條件必須與該 step 需要套用此規則的條件一致。
- 若無條件預先載入，會使不需執行目標 step 的情境也載入規則，違反按需載入的目的。

## Good Example

- 這個例子是好的，因為新 RuleFile 的路徑寫在目標步驟前的條件式 `READ`，原步驟則明確依已載入規則執行。

````md
Before：
2. WRITE 撰寫 Gherkin scenarios。

新增 `rules/Scenario-可驗證性.md` 後，改為：
2. READ 若本次需要撰寫 Gherkin scenarios，讀取 `rules/Scenario-可驗證性.md`。
3. WRITE 若本次需要撰寫 Gherkin scenarios，依已載入規則撰寫 Gherkin scenarios。
````

## Bad Example

- 這個例子是壞的，因為 RuleFile 無條件載入，即使本次不需要撰寫 scenarios 也會讀取。

````md
1. THINK 判斷本次是否需要撰寫 Gherkin scenarios。
2. READ 讀取 `rules/Scenario-可驗證性.md`。
3. WRITE 若需要撰寫 Gherkin scenarios，依已載入規則完成撰寫。
````