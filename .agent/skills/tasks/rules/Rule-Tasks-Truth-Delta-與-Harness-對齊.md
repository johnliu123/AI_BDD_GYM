# Rule 6 - Truth delta 與 Harness 對齊（Q1:A、Q2:A、Q3:C）

- Level: `MUST`
- 引用：`references/plan-truth-workflow.md`；`truth-delta.md` 由 `/truth-delta` 追加。
- **驗收權威（Q2:A）**：BDD 主模式下，`TRUTH_ROOT/features/**` 的 Example／Scenario **Then** 與 `dsl.md` 為行為意圖權威；任務可指定**過渡測試檔**（如 `*.test.js`）作 RED 接通，但 **GREEN 完成條件 MUST 對齊 Truth Example Then**，不得以過渡檔断言取代 Truth。

## 閘門：何時 MUST 有 Harness 對齊 Phase

1. READ `PLAN_DIR/truth-delta.md` 全文。
2. THINK 若任一 owner 小節（`technical-research`、`data-plan`、`api-plan`、`dsl-refine`）存在 **Op = MOD 或 DEL** 的資料列（非「*(尚無)*」占位列），MUST 在 **Phase 2 Foundational 之後、Phase 3 第一個 Feature File Phase 之前** 編排：

   **`## Phase 2.5: Harness 對齊 Truth delta`**

3. THINK 若僅 **ADD**、或 delta 全為占位列，可省略 Phase 2.5；仍須在 Phase 1 必讀對照含 `truth-delta.md`。

## Phase 2.5 內容要求

- **Purpose**：使既有自動化測試／step definitions／過渡 harness 與 **本 plan truth-delta 所列 MOD/DEL** 及最新 Truth 契約一致；刪除或停用已 DEL 的幽靈測試。
- **Read when executing this phase**：`truth-delta.md`（全文）、受影響 Truth 路徑（依 delta 表格）、`specs/truth/techstack.md`（整合／BDD 測試命令）。
- **必讀對照**：至少含 `truth-delta.md` 與本 Phase 任務引用的 `feature:`／`dsl:`／`openapi:`／`dbml:` 列。
- **任務覆蓋（Q3:C 前半）**：
  - 每筆 **DEL** delta 列 → 至少一項 `[NON-TDD]` 或 `[BDD:REFACTOR]` 任務（刪除／停用／移除 step），行尾 `←` 含 `truth-delta:` 錨點 + 對應 `feature:#`／`dsl:#`／`openapi:`（若適用）+ delta 列之 Spec 追溯。
  - 每筆 **MOD** delta 列 → 至少一項行為或對齊任務（`[BDD:RED]`／`[BDD:GREEN]`／`[BDD:REFACTOR]` 或具理由的 `[NON-TDD]`），使 harness 反映 MOD 後 Truth；行尾 MUST 含 `truth-delta:` 與受影響 Truth 錨點。
- **Checkpoint**：依 `techstack.md` 執行**全 suite**（或該 plan 定義之 BDD smoke 超集）一次；失敗須在本 Phase 內以任務消化，不得留到 Phase 3 新 Feature GREEN 才處理。

## 與 Phase 3+ 的關係

- Phase 3 起的 RED/GREEN 仍對 **目前** Truth Feature 檔；Phase 2.5 處理 **delta 造成的既有程式／測試漂移**。
- 不得因 Phase 2.5 而改寫 Truth Feature／DSL 語意（改 Truth 屬 `/dsl-refine` + `/truth-delta`）。

## Truth 變更後 tasks 生命週期（Q5:C）

- 上游再次修改 Truth 並更新 `truth-delta.md` 後，**預設 MUST 重跑 `/tasks`** 產出或整併 `tasks.md`（已完成項可保留 `[x]` 並加 retro note）。
- 若使用者僅手修 tasks，**MUST** 再跑 **`/analyze`** 驗證 delta ↔ tasks ↔ Truth 一致後方可 `/implement`。

## Good Example

```md
## Phase 2.5: Harness 對齊 Truth delta

**Purpose**：對齊 dsl-refine MOD「分類篩選 Then 改為含空分類」；移除已 DEL Example 的舊測試。

**Read when executing this phase**：`truth-delta.md`、`specs/truth/techstack.md`、受影響 Feature／DSL。

- [ ] T010 [BDD:REFACTOR] 更新 step／断言使 `backend/src/__tests__/menu-api.test.js` 對齊 Example Then ← `truth-delta:dsl-refine#2`; `feature:specs/truth/features/backend/菜單/依分類讀取餐點.feature#顧客讀取菜單時餐點欄位對應正確分類`; `dsl:specs/truth/features/backend/菜單/dsl.md#…`
- [ ] T011 [NON-TDD] 刪除引用已 DEL Example 的測試區塊 ← `truth-delta:dsl-refine#3`; `spec:FR-002`

**Checkpoint**：`npm test`（techstack 定義）全 suite 通過。
```

## Bad Example

- truth-delta 有 MOD/DEL 但無 Phase 2.5；或 DEL 後仍保留引用舊 Example 標題的 tasks 錨點。

```md
## Phase 3: …feature…
- [ ] T003 [BDD:GREEN] 只改 production，未更新因 delta 失效的測試
```
