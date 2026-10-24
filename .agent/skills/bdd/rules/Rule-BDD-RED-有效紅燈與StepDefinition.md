# Rule 1 - 每個 Feature step 必須恰好匹配一個 step definition

- Level: `MUST`
- 只為目標 Scenario 建立或調整測試連接，並沿用專案既有 expression、fixture、helper、client 或 page object 慣例。
- 執行測試前，每個 Given、When、Then 都必須恰好匹配一個 step definition；undefined、pending 或 ambiguous step 都不是有效 RED。
- Glue 負責轉換參數、呼叫被測系統及執行 Then assertion，不可在 glue 中重寫產品商業邏輯。

## Good Example

- 所有步驟各自唯一匹配定義，Then 透過被測系統的可觀察結果斷言。

```text
Feature step -> 唯一 DSL row -> 唯一 step definition -> 呼叫被測 seam 並驗證結果
```

## Bad Example

- 把未定義步驟或多重匹配當成紅燈，或在 step definition 內複製產品邏輯。

```text
Feature step -> undefined／ambiguous -> 測試顯示失敗 -> 宣告 RED 成功
```

# Rule 2 - RED 必須由預期行為缺口造成

- Level: `MUST`
- 執行結果必須確認目標 Scenario 確實被選取，且失敗斷言對準尚未實作的目標行為。
- 語法錯誤、測試程式錯誤、環境失敗、案例未執行、案例被略過、undefined、pending 或 ambiguous 都不算有效 RED；修正測試連接或環境後重跑。
- 若目標行為已符合預期且案例通過，記錄既有行為已通過，不得修改測試以製造紅燈。

## Good Example

- Scenario 實際執行，業務結果 assertion 因目標行為尚未存在而失敗。

```text
執行目標 Scenario -> assertion: 預期業務結果未成立 -> 有效 RED
```

## Bad Example

- Scenario 因 runner 語法錯誤而未執行，卻將非零 exit code 當成行為紅燈。

```text
執行命令失敗 -> Scenario 未執行 -> 宣告有效 RED
```

# Rule 3 - RED 階段不可修改 production code

- Level: `MUST`
- RED 階段只可建立或調整目標 Scenario 的測試連接、測試資料與必要測試支援；不可修改被測產品行為。
- 有效 RED 成立後立即停止，回報失敗原因及可供 GREEN 使用的最小行為缺口。

## Good Example

- 補齊 step definition 與 assertion，確認測試因行為尚未實作而失敗後停止。

```text
新增測試 glue -> 執行並確認行為失敗 -> 回報 -> 停止
```

## Bad Example

- RED 命令一邊補測試，一邊先實作功能使測試轉綠。

```text
新增測試 glue -> 修改 production code -> 測試通過 -> 宣告 RED 完成
```