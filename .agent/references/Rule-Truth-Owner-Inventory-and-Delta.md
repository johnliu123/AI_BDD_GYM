# Rule：Truth Owner — Inventory、Apply Truth、委派 Delta

適用：`/technical-research`、`/data-plan`、`/api-plan`、`/dsl-refine`。

引用：`references/plan-truth-workflow.md`；delta 紀錄 **`/truth-delta`**（Q1–Q8:A）。

## Phase 0 — Truth Inventory（Q4:A）

1. READ `TRUTH_ROOT` 下**本 skill 受管**路徑的目錄樹與現有檔案。
2. THINK 列出與 `PLAN_DIR/spec.md`（及 acceptance，若 dsl-refine）相關的**現有** Truth 片段。

## Phase 1 — Delta Plan（Q5:A）

1. THINK 列舉本 skill 將執行的 **ADD / MOD / DEL**（組成 `entries[]` 草案）。
2. THINK 若含 **DEL**，或 **MOD** 會破壞既有錨點，DELEGATE `/clarify`；未澄清前 STOP，不寫 Truth。

## Phase 2 — Apply Truth（Q6:A）

1. WRITE 僅改 `TRUTH_ROOT` 內受管檔案；先 READ 再 MERGE。
2. THINK Apply 失敗或未執行時 **不得** DELEGATE `/truth-delta`。

## Phase 3 — 紀錄 Delta（Q3:A）

1. DELEGATE **`/truth-delta`**：一次傳入 `PLAN_DIR`、`owner_skill_id`、完整 `entries[]`（本輪所有列）。
2. WRITE 交付摘要須含 truth-delta 回報之新增列。

## owner_skill_id

| Skill | `owner_skill_id` |
| --- | --- |
| `/technical-research` | `technical-research` |
| `/data-plan` | `data-plan` |
| `/api-plan` | `api-plan` |
| `/dsl-refine` | `dsl-refine` |

## MUST NOT

- 自行編輯 `PLAN_DIR/truth-delta.md` 表格（除 DELEGATE `/truth-delta` 外）。
- 在 `PLAN_DIR` 另存 Truth 權威副本。
- 在未 DELEGATE `/truth-delta` 前宣稱 Truth 變更已完整交付給下游。
