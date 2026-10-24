# Plan / Truth 工作流契約

版本：1.1  
適用：`/specify` → `/spec-by-example` → `/technical-research` → `/system-analysis` → `/dsl-refine` → `/tasks` → `/analyze` → `/implement`

## 目錄與符號

| 符號 | 路徑 | 語意 |
| --- | --- | --- |
| `PLANS_ROOT` | `specs/plans/` | 所有 plan 包 |
| `TRUTH_ROOT` | `specs/truth/` | 系統現況 SSoT |
| `PLAN_DIR` | `specs/plans/<NNN>-<slug>/` | **本次**作用中的 plan 包 |

## Plan 產物（「這次改什麼」）

- `spec.md`、`research.md`、`plan.md`、`traceability.md`、`tasks.md`
- `features/acceptance/**/*.feature`
- `ui/ui-plan.md`、`ui/prototype/`
- `plan.meta.yaml`（由 `/specify` 建立）
- **`truth-delta.md`**（Truth 變更紀錄；見下節 **`/truth-delta`**）

## Truth 產物（「系統現在是什麼」）

- `techstack.md`
- `contracts/**`（如 `contracts/http-api.yaml`）
- `data/**`（如 `data/data-model.dbml`）
- `features/**`（介面 Feature、DSL；可含累積 `acceptance-to-interface-traceability.md`）

## Truth owner skills

對 `TRUTH_ROOT` 具 **ADD / MOD / DEL** 責任，且 MUST 遵循 `references/Rule-Truth-Owner-Inventory-and-Delta.md`：

| Skill | Truth 路徑 |
| --- | --- |
| `/technical-research` | `TRUTH_ROOT/techstack.md` |
| `/data-plan` | `TRUTH_ROOT/data/data-model.dbml`（預設） |
| `/api-plan` | `TRUTH_ROOT/contracts/http-api.yaml`（預設） |
| `/dsl-refine` | `TRUTH_ROOT/features/**`、`traceability` 累積檔（若採用） |

**Non-owner**（MUST NOT 改 Truth）：`/specify`、`/spec-by-example`、`/tasks`；`/analyze` 唯讀。

`/ui-plan` 只寫 `PLAN_DIR/ui/**`。

## `/truth-delta`（Q1–Q8:A；非主線使用者步驟）

- **Skill**：`.agent/skills/truth-delta/SKILL.md`
- **檔案**：`PLAN_DIR/truth-delta.md`（template：`skills/truth-delta/templates/truth-delta.template.md`）
- **誰可寫表格列**：**僅** `/truth-delta`。Truth owner 在 **Apply Truth 成功後** DELEGATE 一次（`entries[]` 含本輪全部列）。
- **`/specify`**：只 COPY template 建立**空骨架**，不得 append 資料列。
- **Inventory / clarify**：留在各 Truth owner Phase 0–1；delta skill 驗證 DEL 與破壞性 MOD 之 `reason`／spec 追溯。

## `/specify` 與新 plan 包

- 除非使用者**明示**「延續 plan」並提供既有 `PLAN_DIR`，否則 MUST 配置**新**目錄：`PLANS_ROOT/<NNN>-<slug>/`。
- `NNN` = `plans/` 下既有三位數 id 最大值 + 1（無則 `001`）。
- 初次只寫 `spec.md`、`plan.meta.yaml`、空骨架 `truth-delta.md`；**不得**寫入 `TRUTH_ROOT`。

## Truth delta 表格（分 owner 小節）

- 每個執行過的 Truth owner MUST 經 `/truth-delta` 確保對應 `## <owner_skill_id>` 小節有列。
- 表格欄位：**Op**（ADD/MOD/DEL）、**路徑／錨點**、**摘要**、**原因**、**Spec 追溯**（FR/NFR/BR/US 等）。

## MOD/DEL 閘門

- **DEL** Truth 內容前 MUST `/clarify`（除非使用者在本輪已明示刪除決策並寫入 spec）。
- **MOD** 若影響既有 `openapi:`、`dbml:`、`feature:#`、`dsl:#` 錨點，MUST `/clarify` 後再改。

## 下游必讀順序（Q5:A）

進入 Phase 1 前（`/tasks`、`/analyze`、`/implement` 等）：

1. `PLAN_DIR/spec.md`
2. `PLAN_DIR/truth-delta.md`（全文；依表格按需再 READ Truth 檔）
3. `TRUTH_ROOT` 內被點名的路徑
4. `PLAN_DIR/traceability.md`（BDD 模式）

**Harness**：truth-delta 含 **MOD/DEL** 時，`/tasks` MUST 產出 **Phase 2.5**；`/implement` 執行 baseline 與交付前 **全 suite**（見 `skills/tasks/rules/Rule-Tasks-Truth-Delta-與-Harness-對齊.md`、`skills/implement/rules/Rule-Implement-Truth-Delta-Harness-Gates.md`）。BDD 驗收權威 = Truth Feature **Then** + DSL。

錨點預設解析根目錄：`TRUTH_ROOT`（見 `skills/implement/references/anchor-resolver.md`）。

## `/implement` 交付

Completion 後 MUST：

1. Plan 交付摘要（`PLAN_DIR`、tasks 完成度）
2. `truth-delta.md` 摘要
3. 程式變更摘要
4. **詢問**使用者是否以 git commit 交付本迭代；若同意，DELEGATE `/git-conventional-commit`（預設單一 commit 含 plan + truth + 程式，除非使用者要求拆分）

## FEATURE_DIR 別名

文件與 skill 中既有 **FEATURE_DIR** 語意等同 **PLAN_DIR**（歷史名稱保留，路徑為 `specs/plans/...`）。
