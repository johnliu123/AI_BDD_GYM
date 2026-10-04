# Rule 1 - 一條規則的所有要求必須同屬一個主題，且強度與 `Level` 一致

- Level: `MUST`
- 一條規則可以包含多個要求，但這些要求必須同屬一個主題。
- 每個要求的強度必須和該規則的 `Level` 一致。
- 若要求之間需要不同的 Example 情境才能示範，必須拆成多條規則。

## Good Example

- 這個例子是好的，因為必須與可選的要求拆成兩條規則，各自的強度與 `Level` 一致。

````md
# Rule 101 - Example 的示範本體必須包在 fenced code block

- Level: `MUST`
- 實際示範內容必須使用 fenced code block 包裹。

# Rule 102 - Example 的 code fence 可以標示 language

- Level: `MAY`
- 可以在 code fence 上標示 language；不標示也仍然合格。
````

## Bad Example

- 這個例子是壞的，因為 `MUST` 規則裡混入了「建議」要求，強度與 `Level` 不一致。

````md
# Rule 101 - Example 的示範本體必須包在 fenced code block

- Level: `MUST`
- 實際示範內容必須使用 fenced code block 包裹。
- code fence 建議標示 language。
````

# Rule 2 - Good 與 Bad 處理同一個情境，Bad 只違反一個要求

- Level: `SHOULD`
- Good 與 Bad 使用同一個情境或同一份資料，只改變被本條規則管轄的那一處。
- Bad 只違反規則描述中的一個要求；要示範多種違反時，拆成多條規則。

## Good Example

- 這個例子是好的，因為 Good 與 Bad 使用同一份編號資料，只有第三筆不同。

````md
# Rule 101 - Rule 編號必須連號

- Level: `MUST`
- 編號不可跳號。

## Good Example

- 編號 1、2、3 連續。

```md
# Rule 1 - A
# Rule 2 - B
# Rule 3 - C
```

## Bad Example

- 編號從 2 跳到 4。

```md
# Rule 1 - A
# Rule 2 - B
# Rule 4 - C
```
````

## Bad Example

- 這個例子是壞的，因為 Good 與 Bad 的資料完全不同，Bad 還同時違反了跳號、重複與標題格式三件事。

````md
# Rule 101 - Rule 編號必須連號

- Level: `MUST`
- 編號不可跳號。

## Good Example

- 編號連續。

```md
# Rule 1 - 檔名應清楚表達主題
# Rule 2 - 檔名不應使用空白
```

## Bad Example

- 編號有問題。

```md
# 規則
# Rule 3 - 命名
# Rule 3 - 格式
```
````

# Rule 3 - 規則可宣告適用範圍與例外，例外必須是可判定的條件

- Level: `SHOULD`
- 規則只適用於特定情境時，在規則描述中以「適用於：」寫出情境。
- 規則有例外時，以「例外：」寫出可判定的條件，不寫「必要時可例外」這類無法判定的說法。
- 例外寫在該規則的描述中，不另外覆寫 `Level`。

## Good Example

- 這個例子是好的，因為例外寫成可判定的條件，且 `Level` 維持不變。

````md
# Rule 101 - 來源的分類與子項必須保留

- Level: `MUST`
- 適用於：RuleFile 由既有檢查清單或分類表轉寫而來。
- 例外：來源項目已由其他 RuleFile 承接時，可省略，並在規則中註明承接的檔名。
````

## Bad Example

- 這個例子是壞的，因為例外寫成「必要時」，無法判定何時成立。

````md
# Rule 101 - 來源的分類與子項必須保留

- Level: `MUST`
- 適用於：RuleFile 由既有檢查清單或分類表轉寫而來。
- 例外：必要時可以省略。
````

# Rule 4 - 規則描述必須有可判定的標準

- Level: `MUST`
- 每條規則至少包含一個可觀察的檢查方式，例如是否存在、數量、順序、格式、是否包含特定欄位。
- 使用「清楚」、「簡短」、「適當」、「必要時」等詞時，必須附上具體界線，或改寫成可檢查的條件。

## Good Example

- 這個例子是好的，因為「簡短」被具體化為「一行內且不超過 30 個字」，可以直接檢查。

````md
# Rule 101 - 規則名稱應簡短

- Level: `SHOULD`
- 規則名稱應控制在一行內，且不超過 30 個字。
````

## Bad Example

- 這個例子是壞的，因為「夠短」、「清楚」沒有具體界線，不同人會得出不同結論。

````md
# Rule 101 - 規則名稱應簡短

- Level: `SHOULD`
- 規則名稱應該要夠短，讓人看得清楚。
````

# Rule 5 - 引用其他規則時使用「檔名加規則名稱」，不使用 Rule 編號

- Level: `MUST`
- 引用其他規則時，以檔名加規則名稱指出，不使用 Rule 編號。
- 被引用的規則改名或刪除時，必須同步更新所有引用處。

## Good Example

- 這個例子是好的，因為引用使用檔名加規則名稱，規則重排後引用依然正確。

````md
# Rule 101 - 範例說明不重複 Level 語意

- Level: `SHOULD`
- `Level` 的語意以 `RuleLevel-定義.md` 的「`MUST` 只用於不可違反的硬性規則」為準。
````

## Bad Example

- 這個例子是壞的，因為引用使用 Rule 編號，一旦規則增刪重排就會悄悄指錯。

````md
# Rule 101 - 範例說明不重複 Level 語意

- Level: `SHOULD`
- `Level` 的語意以 `RuleLevel-定義.md` 的 Rule 1 為準。
````

# Rule 6 - 同一語意只在一個檔案定義，其他地方引用

- Level: `SHOULD`
- 同一個概念只在一個檔案定義一次，其他檔案以引用方式使用，不重複抄寫定義內容。
- 若必須在多處說明，只寫與當前規則有關的本地要求。

## Good Example

- 這個例子是好的，因為只引用定義所在的檔案，沒有抄寫定義內容。

````md
# Rule 101 - 檔名應清楚表達主題

- Level: `SHOULD`
- `SHOULD` 的語意以 `RuleLevel-定義.md` 為準。
- 檔名應包含主題關鍵字。
````

## Bad Example

- 這個例子是壞的，因為在本檔重複抄寫了 `SHOULD` 的定義，之後定義變更時容易不同步。

````md
# Rule 101 - 檔名應清楚表達主題

- Level: `SHOULD`
- `SHOULD` 表示強烈建議，預設應遵守；若不採用，應能說明具體理由。
- 檔名應包含主題關鍵字。
````

# Rule 7 - 一個 RuleFile 只規範一個主題

- Level: `SHOULD`
- 一個 RuleFile 的所有規則必須指向同一個主題，且主題名稱出現在檔名中。
- 規則數量超過 15 條時，必須檢查是否已混入第二個主題；若是，拆成兩個 RuleFile。

## Good Example

- 這個例子是好的，因為兩個主題分別放在兩個檔案，檔名也反映了各自的主題。

````md
RuleFile-格式規範.md
- Rule 1 到 Rule 14 全部規範 RuleFile 的結構與 Example 格式

RuleLevel-定義.md
- Rule 1 到 Rule 6 全部規範 Level 的語意與選擇方式
````

## Bad Example

- 這個例子是壞的，因為單一檔案同時規範結構與 `Level` 語意兩個主題，檔名也只反映其中一個。

````md
RuleFile-格式規範.md
- Rule 1 到 Rule 14 規範 RuleFile 的結構與 Example 格式
- Rule 15 到 Rule 20 規範 Level 的語意與選擇方式
````
