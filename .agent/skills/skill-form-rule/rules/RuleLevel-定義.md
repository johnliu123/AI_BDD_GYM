# Rule 1 - `MUST` 只用於不可違反的硬性規則

- Level: `MUST`
- `MUST` 表示硬性規則，預設不可違反。
- 若規則不符合 `MUST`，應視為錯誤、缺漏或違規，而不是單純可改進項。
- 適合用於必要欄位、固定結構、禁止事項或會影響格式正確性的要求。
- 不可把純偏好、可替代寫法或風格建議標成 `MUST`。

## Good Example

- 這個例子是好的，因為缺少 Good Example 區塊是明確的結構缺漏，符合 `MUST` 的語意。

````md
# Rule 101 - Rule 必須包含 Good Example 區塊

- Level: `MUST`
- 每條規則都必須包含 `## Good Example`，缺少視為格式錯誤。
````

## Bad Example

- 這個例子是壞的，因為說明長度只是偏好，不構成錯誤，卻被標成 `MUST`。

````md
# Rule 101 - Good Example 的說明應保持簡短

- Level: `MUST`
- 說明最好控制在一到兩句。
````

# Rule 2 - `SHOULD` 用於預設應遵守但容許具理由偏離的規則

- Level: `MUST`
- `SHOULD` 表示強烈建議，預設應遵守。
- 若不採用 `SHOULD`，應能說明具體理由，而不是任意忽略。
- 適合用於提升可讀性、一致性、維護性或協作效率的規則。
- 不應把缺少就會造成明確錯誤的要求標成 `SHOULD`。

## Good Example

- 這個例子是好的，因為說明長度是提升可讀性的偏好，允許在特殊情況下調整。

````md
# Rule 102 - Good Example 的說明應保持簡短

- Level: `SHOULD`
- 說明最好控制在一到兩句；過長只會降低可讀性，不影響結構正確。
````

## Bad Example

- 這個例子是壞的，因為缺少 Good Example 區塊會造成結構缺漏，卻被降成 `SHOULD`。

````md
# Rule 102 - Rule 必須包含 Good Example 區塊

- Level: `SHOULD`
- 每條規則都必須包含 `## Good Example`，缺少視為格式錯誤。
````

# Rule 3 - `MAY` 用於可選寫法、替代方案或延伸彈性

- Level: `MUST`
- `MAY` 表示可選規則，可採用也可不採用。
- 適合用於補充替代寫法、可選欄位、語法變體或非必要優化。
- `MAY` 不應承擔必要結構，也不應偽裝成實際上的硬限制。
- 若使用 `MAY`，應讓讀者清楚知道「不採用也仍然合格」。

## Good Example

- 這個例子是好的，因為補充備註是可選的寫法，不採用也不影響格式正確性。

````md
# Rule 103 - Good Example 的說明後可以附上補充備註

- Level: `MAY`
- 說明後可以附上一行補充備註；不附也仍然合格。
````

## Bad Example

- 這個例子是壞的，因為它把必要的 Good Example 區塊包裝成可選項，會誤導讀者對規則強度的理解。

````md
# Rule 103 - Rule 必須包含 Good Example 區塊

- Level: `MAY`
- 每條規則可以視情況決定是否包含 `## Good Example`。
````

# Rule 4 - 選擇 `Level` 時依「違反後的後果」判斷

- Level: `MUST`
- 決定 `Level` 前，先問：違反這條規則後，結果是「錯誤或缺漏」，還是「只是可讀性、一致性下降」，或是「完全不影響合格與否」。
- 結果是錯誤或缺漏，標 `MUST`。
- 結果是可讀性、一致性或維護性下降，標 `SHOULD`。
- 不採用也仍然合格，標 `MAY`。
- 判斷不出來時，優先選擇較弱的 `SHOULD`，並在規則描述中補上會造成什麼後果，而不是預設標 `MUST`。

## Good Example

- 這個例子是好的，因為 `Level` 是由違反後的後果推導出來，而且規則描述清楚寫出後果。

````md
# Rule 108 - Rule 編號必須連號

- Level: `MUST`
- 編號跳號會讓引用與檢查失去依據，視為格式錯誤。

# Rule 109 - 規則名稱應簡短

- Level: `SHOULD`
- 過長的名稱降低目錄可讀性，但不影響結構正確。
````

## Bad Example

- 這個例子是壞的，因為 `Level` 看起來是憑感覺選的，且沒有說明違反後的後果。

````md
# Rule 108 - Rule 編號必須連號

- Level: `SHOULD`
- 編號最好連號。

# Rule 109 - 規則名稱應簡短

- Level: `MUST`
- 名稱要短。
````

# Rule 5 - Bad Example 的措辭應反映 `Level` 的強度

- Level: `SHOULD`
- `MUST` 的 Bad Example 說明應使用「違反」、「缺少」、「錯誤」等語氣，表示這是不合格的結果。
- `SHOULD` 的 Bad Example 說明應使用「偏離」、「降低可讀性」等語氣，表示這是可被接受理由豁免的結果。
- `MAY` 的 Bad Example 說明應聚焦於「誤把可選當必要」或「誤把必要當可選」，而不是描述不合格結果。

## Good Example

- 這個例子是好的，因為 `SHOULD` 規則的 Bad Example 使用「降低可讀性」的語氣，沒有把它說成錯誤。

````md
# Rule 110 - 檔名應清楚表達主題

- Level: `SHOULD`
- 檔名應讓讀者一眼辨識主題。

## Bad Example

- 檔名過度抽象，降低可讀性，但不一定造成格式錯誤。

```md
foo.md
```
````

## Bad Example

- 這個例子是壞的，因為 `SHOULD` 規則的 Bad Example 把偏離說成「錯誤」，與 `Level` 強度不一致。

````md
# Rule 110 - 檔名應清楚表達主題

- Level: `SHOULD`
- 檔名應讓讀者一眼辨識主題。

## Bad Example

- 這是嚴重的格式錯誤，必須立即修正。

```md
foo.md
```
````

# Rule 6 - 禁止類規則以 `MUST` 搭配否定語氣表達，不新增其他 `Level`

- Level: `MUST`
- `Level` 只有 `MUST`、`SHOULD`、`MAY` 三種，不新增 `MUST NOT`、`SHOULD NOT` 等值。
- 硬性禁止事項標 `MUST`，並在規則描述中使用「不可」、「禁止」等否定語氣。
- 建議避免的事項標 `SHOULD`，並在規則描述中使用「不應」等否定語氣。

## Good Example

- 這個例子是好的，因為禁止事項仍使用 `MUST`，以否定語氣表達限制。

````md
# Rule 111 - 不可在 RuleFile 開頭放 frontmatter

- Level: `MUST`
- RuleFile 的第一行必須是 `# Rule 1`，不可放 frontmatter。
````

## Bad Example

- 這個例子是壞的，因為它自創了 `MUST NOT` 這個 `Level` 值。

````md
# Rule 111 - 不可在 RuleFile 開頭放 frontmatter

- Level: `MUST NOT`
- RuleFile 的第一行必須是 `# Rule 1`，不可放 frontmatter。
````
