# Rule 1 - RuleFile 的第一行必須是 `# Rule 1`

- Level: `MUST`
- RuleFile 的第一行必須是 `# Rule 1 - <Rule name>`。
- 檔案開頭不可放 frontmatter、前言段落或其他標題。

## Good Example

- 這個例子是好的，因為第一行就是 `# Rule 1`。

````md
# Rule 101 - 檔名應清楚表達主題

- Level: `SHOULD`
- 檔名應包含主題關鍵字，讓讀者不必開檔就能辨識內容。
````

## Bad Example

- 這個例子是壞的，因為第一行是 frontmatter，不是 `# Rule 1`。

````md
---
name: some-rule
---

# Rule 101 - 檔名應清楚表達主題

- Level: `SHOULD`
- 檔名應包含主題關鍵字，讓讀者不必開檔就能辨識內容。
````

# Rule 2 - 規則標題使用單一 `#` 與 `# Rule N - <Rule name>` 格式

- Level: `MUST`
- 每條規則的標題必須是 `# Rule N - <Rule name>`，使用單一 `#`。
- 標題不可改用 `##` 或更深的層級。

## Good Example

- 這個例子是好的，因為標題使用單一 `#`，且符合 `# Rule N - <Rule name>` 格式。

````md
# Rule 101 - 檔名應清楚表達主題

- Level: `SHOULD`
- 檔名應包含主題關鍵字，讓讀者不必開檔就能辨識內容。
````

## Bad Example

- 這個例子是壞的，因為標題使用 `##`，不是單一 `#`。

````md
## Rule 101 - 檔名應清楚表達主題

- Level: `SHOULD`
- 檔名應包含主題關鍵字，讓讀者不必開檔就能辨識內容。
````

# Rule 3 - 規則名稱必須包含規則主張，不可只有名詞主題

- Level: `MUST`
- `<Rule name>` 必須包含動詞或否定詞，說明要做什麼或不可做什麼。
- 不可只寫名詞主題，例如「命名」、「格式」、「範例」。

## Good Example

- 這個例子是好的，因為名稱含有「應包含」，直接說出規則主張。

````md
# Rule 101 - 檔名應清楚表達主題

- Level: `SHOULD`
- 檔名應包含主題關鍵字，讓讀者不必開檔就能辨識內容。
````

## Bad Example

- 這個例子是壞的，因為名稱只有名詞主題「檔名」，沒有說出主張。

````md
# Rule 101 - 檔名

- Level: `SHOULD`
- 檔名應包含主題關鍵字，讓讀者不必開檔就能辨識內容。
````

# Rule 4 - Rule 編號從 1 連續遞增

- Level: `MUST`
- `N` 從 1 開始，依序遞增，不跳號、不重複。

## Good Example

- 這個例子是好的，因為編號依序為 1、2。

````md
# Rule 1 - 檔名應清楚表達主題

- Level: `SHOULD`
- 檔名應包含主題關鍵字。

# Rule 2 - 檔名不應使用空白

- Level: `SHOULD`
- 檔名不應包含空白字元。
````

## Bad Example

- 這個例子是壞的，因為編號從 1 跳到 3。

````md
# Rule 1 - 檔名應清楚表達主題

- Level: `SHOULD`
- 檔名應包含主題關鍵字。

# Rule 3 - 檔名不應使用空白

- Level: `SHOULD`
- 檔名不應包含空白字元。
````

# Rule 5 - `Level` 必須是標題後的第一個非空行

- Level: `MUST`
- 標題後的第一個非空行必須是 `` - Level: `<value>` ``。
- 規則描述條列寫在 `Level` 之後。

## Good Example

- 這個例子是好的，因為標題後的第一個非空行就是 `Level`。

````md
# Rule 101 - 檔名應清楚表達主題

- Level: `SHOULD`
- 檔名應包含主題關鍵字。
````

## Bad Example

- 這個例子是壞的，因為標題後的第一個非空行是規則描述，`Level` 欄位缺漏。

````md
# Rule 101 - 檔名應清楚表達主題

- 檔名應包含主題關鍵字。
````

# Rule 6 - `Level` 只能是 `MUST`、`SHOULD`、`MAY`

- Level: `MUST`
- `Level` 的值只能是這三個，其語意以 `RuleLevel-定義.md` 為準。
- 不可自創其他值。

## Good Example

- 這個例子是好的，因為 `Level` 使用合法值 `SHOULD`。

````md
# Rule 101 - 檔名應清楚表達主題

- Level: `SHOULD`
- 檔名應包含主題關鍵字。
````

## Bad Example

- 這個例子是壞的，因為 `Level` 使用了自創值 `RECOMMENDED`。

````md
# Rule 101 - 檔名應清楚表達主題

- Level: `RECOMMENDED`
- 檔名應包含主題關鍵字。
````

# Rule 7 - Example 區塊依序為 Good 與 Bad，各出現一次

- Level: `MUST`
- 規則描述之後必須依序是 `## Good Example`、`## Bad Example`。
- 兩個區塊各只出現一次，不可省略、不可顛倒。
- 例外：Example 內用於示範的 RuleFile 片段，不需包含 Good 與 Bad 區塊。

## Good Example

- 這個例子是好的，因為 Good 在前、Bad 在後，各出現一次。

````md
# Rule 101 - 檔名應清楚表達主題

- Level: `SHOULD`
- 檔名應包含主題關鍵字。

## Good Example

- 檔名含有主題關鍵字。

```md
RuleLevel-定義.md
```

## Bad Example

- 檔名沒有任何主題關鍵字。

```md
foo.md
```
````

## Bad Example

- 這個例子是壞的，因為 Bad 出現在 Good 之前，順序顛倒。

````md
# Rule 101 - 檔名應清楚表達主題

- Level: `SHOULD`
- 檔名應包含主題關鍵字。

## Bad Example

- 檔名沒有任何主題關鍵字。

```md
foo.md
```

## Good Example

- 檔名含有主題關鍵字。

```md
RuleLevel-定義.md
```
````

# Rule 8 - Example 的示範本體必須包在 fenced code block

- Level: `MUST`
- `Good Example` 與 `Bad Example` 中，實際示範內容必須使用 fenced code block 包裹。
- code block 外只放說明文字，不放示範本體。

## Good Example

- 這個例子是好的，因為示範本體包在 code block 內，與說明文字有清楚邊界。

````md
## Good Example

- 檔名含有主題關鍵字。

```md
RuleLevel-定義.md
```
````

## Bad Example

- 這個例子是壞的，因為示範本體裸露在段落裡，沒有 code block 包裹。

````md
## Good Example

- 檔名含有主題關鍵字。

RuleLevel-定義.md
````

# Rule 9 - 巢狀 code block 的外層 fence 必須比內層長

- Level: `MUST`
- 若示範內容本身含有 fenced code block，外層 fence 的反引號數量必須多於內層。
- 例如內層使用三個反引號時，外層至少使用四個反引號。

## Good Example

- 這個例子是好的，因為內層使用三個反引號，外層使用四個，示範內容完整保留。

`````md
````md
```md
# Rule 101 - 範例標題
```
````
`````

## Bad Example

- 這個例子是壞的，因為外層與內層 fence 一樣長，外層會被內層提早結束。

````md
```md
```md
# Rule 101 - 範例標題
```
```
````

# Rule 10 - Example 的 code fence 可以標示 language

- Level: `MAY`
- 若示範內容有明確語言類型，可以在 code fence 上標示 language，例如 Markdown 使用 `md`。
- 不標示 language 也仍然合格。

## Good Example

- 這個例子是好的，因為它把 language 當成可選項，不採用也不會被判定違規。

````md
# Rule 101 - Example 的 code fence 可以標示 language

- Level: `MAY`
- 可以在 code fence 上標示 language；不標示也仍然合格。
````

## Bad Example

- 這個例子是壞的，因為它把可選的 language 標示寫成「必須」，與 `MAY` 的語意矛盾。

````md
# Rule 101 - Example 的 code fence 必須標示 language

- Level: `MAY`
- 所有 code fence 都必須標示 language，否則視為錯誤。
````

# Rule 11 - Example 的說明使用一到兩句的 `- ` 條列

- Level: `SHOULD`
- `Good Example` 與 `Bad Example` 標題下方，先以 `- ` 條列寫說明，再放示範本體。
- 說明控制在一到兩句，不重複規則描述。

## Good Example

- 這個例子是好的，因為說明是一句 `- ` 條列。

````md
## Good Example

- 檔名含有主題關鍵字，不必開檔就能辨識內容。

```md
RuleLevel-定義.md
```
````

## Bad Example

- 這個例子是壞的，因為說明寫成多句的段落，不是 `- ` 條列。

````md
## Good Example

這個例子非常完整，首先它有清楚的檔名，其次內容也很精準，再來整體讀起來相當順暢，是一份相當優秀的示範，值得所有人學習。

```md
RuleLevel-定義.md
```
````

# Rule 12 - Bad Example 的說明必須指出違反的要求，不附修正方式

- Level: `SHOULD`
- `Bad Example` 的說明必須指出違反了規則描述中的哪一個要求。
- 說明中不附修正方式，修正方向由 `Good Example` 呈現。

## Good Example

- 這個例子是好的，因為說明指出違反的是「檔名應包含主題關鍵字」，且沒有附修正方式。

````md
## Bad Example

- 檔名沒有任何主題關鍵字。

```md
foo.md
```
````

## Bad Example

- 這個例子是壞的，因為說明附上了修正方式。

````md
## Bad Example

- 檔名沒有任何主題關鍵字，應改成能說明主題的名稱，例如「RuleLevel-定義.md」。

```md
foo.md
```
````

# Rule 13 - Example 內的 Rule 編號從 101 起算

- Level: `SHOULD`
- Example 內示範用的 Rule 編號從 101 起算。
- 這樣可避免與當前檔案的真實編號混淆。
- 例外：示範內容本身就是在說明編號連續性時，可使用 1 起算的編號。

## Good Example

- 這個例子是好的，因為示範用的編號是 101，不會和真實編號混淆。

````md
## Good Example

- 檔名含有主題關鍵字。

```md
# Rule 101 - 檔名應清楚表達主題
```
````

## Bad Example

- 這個例子是壞的，因為示範用的編號是 3，和檔案內真實的 Rule 3 容易混淆。

````md
## Good Example

- 檔名含有主題關鍵字。

```md
# Rule 3 - 檔名應清楚表達主題
```
````

# Rule 14 - `Level` 欄位只填值，不重複定義共用語意

- Level: `MUST`
- 每個 Rule 只宣告自身的 `Level` 值。
- 不在規則描述中重複解釋 `MUST`、`SHOULD`、`MAY` 的共用語意。

## Good Example

- 這個例子是好的，因為它只填 `Level` 值，規則內容聚焦在本地要求上。

````md
# Rule 101 - 檔名應清楚表達主題

- Level: `SHOULD`
- 檔名應包含主題關鍵字。
````

## Bad Example

- 這個例子是壞的，因為它在規則描述中重複解釋了 `SHOULD` 的共用語意。

````md
# Rule 101 - 檔名應清楚表達主題

- Level: `SHOULD`
- `SHOULD` 代表強烈建議，預設應遵守；若不採用，應有明確理由。
- 檔名應包含主題關鍵字。
````
