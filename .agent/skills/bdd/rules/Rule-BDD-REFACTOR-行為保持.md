# Rule 1 - REFACTOR 開始前必須確認目標 Scenario 通過

- Level: `MUST`
- 任何整理前都必須執行目標 Scenario 並確認通過；若未通過，停止並交回 GREEN 處理，不可同時修功能與重構。
- 測試命令或案例選取無法確認時，不得開始重構。

## Good Example

- 先確認目標 Scenario 通過，再整理目前切片。

```text
執行目標 Scenario -> 通過 -> 開始行為保持的整理
```

## Bad Example

- 目標測試仍失敗時，將功能修正與重構混在同一階段。

```text
目標 Scenario 失敗 -> 同時改變行為與抽象結構 -> 無法分辨失敗來源
```

# Rule 2 - REFACTOR 不可改變已驗證行為或擴大案例範圍

- Level: `MUST`
- 整理只能涵蓋當前 Scenario 的必要程式與測試支援，且不得改變 Feature、DSL、驗收語意或對外行為。
- 整理後必須重跑目標 Scenario；若共用程式或測試支援受影響，還要執行相關回歸測試。
- 沒有明確且安全的整理收益時應不修改檔案；驗證通過後回報並停止，不自動挑選下一個 Scenario。

## Good Example

- 簡化當前切片的重複程式，測試維持通過後停止。

```text
局部行為保持整理 -> 目標 Scenario 與必要回歸通過 -> 回報並停止
```

## Bad Example

- 在重構中改寫 Feature 或同時重設未處理 Scenario 的程式架構。

```text
整理當前切片 -> 改變驗收語意／擴大到其他案例 -> 只跑原 Scenario
```