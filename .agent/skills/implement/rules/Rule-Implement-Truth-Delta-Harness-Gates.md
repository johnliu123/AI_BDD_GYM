# Rule 6 - Truth delta 與全 suite 閘門（Q4:A、Q2:A）

- Level: `MUST`
- Implement MUST READ `PLAN_DIR/truth-delta.md` 全文（與 constitution overlay 一致）。

## 判定：delta 是否觸發 Harness 閘門

- 若 `truth-delta.md` 任一 owner 表格含 **MOD** 或 **DEL** 資料列 → **Harness 閘門啟用**。
- 若僅 ADD 或全為「*(尚無)*」→ 不強制 baseline 全 suite；仍依 tasks Phase Checkpoint。

## tasks 結構閘門（Q1:A）

- Harness 閘門啟用時，`tasks.md` **MUST** 含 **`Phase 2.5: Harness 對齊 Truth delta`**（標題允許「2.5」或同義「Harness 對齊 Truth delta」）。
- 若缺 Phase 2.5：**STOP**，建議重跑 **`/tasks`** 或手補 Phase 2.5 後 **`/analyze`**。

## Baseline 全 suite（Phase 4 前）

- Harness 閘門啟用時，進入 **Phase 4 按任務執行** 前 MUST：
  1. READ `specs/truth/techstack.md` 取得整合／BDD **全 suite** 命令（無則用 tasks Phase 2.5 Checkpoint 記載命令）。
  2. RUN 全 suite 一次，記錄結果（pass/fail 與失敗摘要）。
  3. 若失敗：優先執行 **Phase 2.5**（及 Foundational）任務直至 baseline 通過，或 STOP 並回報；**不得**跳過 Phase 2.5 直接做 Phase 3 新 Example GREEN。

## 交付前全 suite（Phase 6 前）

- Harness 閘門啟用時，全部任務 `[x]` 後、**Plan Delivery Summary** 前 MUST 再 RUN **全 suite** 一次。
- Completion Report MUST 附 **baseline** 與 **交付前** 兩次命令與結果摘要。

## 過渡 harness（Q2:A）

- `[BDD:GREEN]` 完成條件 MUST 對齊任務 `←` 中 `feature:#` Example 的 **Then**；僅過渡 `*.test.js` 通過不足以標 `[x]`，若與 Truth Then 不一致 MUST STOP。

## Good Example

```text
truth-delta 含 dsl-refine DEL → 確認 tasks 有 Phase 2.5 → baseline npm test → 執行 T010–T011 → Phase 3+ → 交付前再 npm test
```

## Bad Example

```text
delta 有 MOD → 略過 Phase 2.5 → 直接 T020 [BDD:GREEN] → 僅 junit 子集通過即交付
```
