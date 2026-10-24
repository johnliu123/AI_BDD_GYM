# Rule 1 - GREEN 必須從目標 Scenario 的有效 RED 開始

- Level: `MUST`
- 修改 production code 前，必須重跑目標 Scenario，確認它仍因預期行為缺口有效失敗。
- 若測試已通過、失敗原因改變或測試未實際執行，必須停止並回報；不得自行補跑 RED 或改動測試以製造前置狀態。

## Good Example

- GREEN 開始時重現目標 assertion 的有效失敗，再著手實作。

```text
重跑目標 Scenario -> 預期行為 assertion 有效失敗 -> 開始最小實作
```

## Bad Example

- 只根據先前的口頭描述或其他 Scenario 的紅燈就直接修改程式。

```text
沒有重跑目標 Scenario -> 其他案例失敗 -> 修改本 Scenario 的 production code
```

# Rule 2 - GREEN 只實作讓當前行為通過的最小改動

- Level: `MUST`
- production code 的修改範圍必須受目標 Scenario 的有效 RED 與其預期結果支持；不可預作其他 Scenario、額外需求或 speculative branches。
- 實作後必須確認目標 Scenario 實際執行且通過；若共用程式或測試支援受影響，還要執行相關回歸測試。
- GREEN 通過後立即停止，回報實際異動與測試結果，不自動重構。

## Good Example

- 只加入使當前失敗 assertion 通過的必要行為，並重跑目標測試。

```text
目標 RED 指出單一行為缺口 -> 最小 production 修改 -> 目標 Scenario 通過 -> 停止
```

## Bad Example

- 趁 GREEN 順便實作未被本 Scenario 要求的分支，或只看 exit code 而不確認案例有執行。

```text
修正目標行為 + 預作未測功能 -> runner 回傳成功 -> 未確認案例結果
```