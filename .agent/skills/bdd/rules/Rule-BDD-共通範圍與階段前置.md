# Rule 1 - BDD 必須將 Feature 與 DSL 保持唯讀

- Level: `MUST`
- BDD 可以讀取既有 `.feature` 與 DSL，並依 DSL 實作測試連接；不可新增、修改或刪除 Feature／DSL。
- 若案例缺漏、step 找不到唯一 DSL row、契約重複或規格語意需改變，必須停止受影響的 Scenario，交回 `/dsl-refine`；若來源需求本身不清楚，交回 `/clarify`。

## Good Example

- Feature step 沒有 DSL row 時，停止並回報需要由 `/dsl-refine` 補齊契約。

```text
讀取 Feature 與 DSL -> 發現 step 沒有唯一契約 -> 不修改 Feature／DSL -> 回報阻塞
```

## Bad Example

- 為了讓測試能執行，直接替 Feature 增加 step 或在 DSL 中猜測實作契約。

```text
讀取 Feature 與 DSL -> 找不到契約 -> 自行改寫 Feature／新增 DSL row -> 繼續測試
```

# Rule 2 - 每次呼叫必須只處理一個 Scenario 的一個階段

- Level: `MUST`
- 每次 `/bdd red`、`/bdd green` 或 `/bdd refactor` 只可處理一個明確的 Scenario，並只執行指定階段。
- Scenario 無法從使用者要求與上下文唯一辨識時，必須先詢問；不得掃描或批次處理其他 Scenario。
- 階段驗證完成後必須停止，不得自動進入下一階段或選取下一個 Scenario。

## Good Example

- `/bdd red` 對指定 Scenario 建立有效紅燈並回報後停止。

```text
/bdd red -> 一個 Scenario -> RED 驗證 -> 回報並停止
```

## Bad Example

- 一次呼叫 red 後自動完成 green、refactor，並繼續處理下一個 Scenario。

```text
/bdd red -> 多個 Scenario -> RED -> GREEN -> REFACTOR -> 自動選下一個案例
```

# Rule 3 - 階段前置不成立時必須停止

- Level: `MUST`
- GREEN 開始前，目標 Scenario 必須仍因預期行為缺口而有效失敗；REFACTOR 開始前，目標 Scenario 必須通過。
- 前置狀態不成立、測試命令不可用或結果無法診斷時，必須回報證據與阻塞，不得以改寫 Feature、跳階段或假造測試結果繼續。
- 若存在 `testplan:TP-xxx`，必須以 testplan 案例完整內容作為測試意圖依據，且不得把階段完成標記成使用者驗收。

## Good Example

- GREEN 前重跑 Scenario，發現測試已通過，回報目前沒有有效 RED 並停止。

```text
/bdd green -> 目標 Scenario 已通過 -> 回報前置狀態不成立 -> 停止
```

## Bad Example

- GREEN 沒有有效紅燈時仍開始修改 production code，或把階段完成當成已驗收。

```text
/bdd green -> 未確認 RED -> 修改程式 -> 將 testplan 標為已驗收
```