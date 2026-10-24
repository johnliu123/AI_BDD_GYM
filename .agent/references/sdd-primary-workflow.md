# SDD 主流程（Primary Workflow）

版本：1.2  
範圍：功能從構想到實作的 **預設** slash command 順序。  
權威：流程步驟與 SOP 以 `.agent/skills/<skill-id>/SKILL.md` 為準；Plan/Truth 契約見 `plan-truth-workflow.md`；產物 MUST 以 `.agent/constitution/` 為準（見 `artifact-authority.md`）。

## 主線

```text
/specify → /spec-by-example → /technical-research → /system-analysis → /dsl-refine → /tasks → /analyze → /implement
```

| 步驟 | Skill | Plan 產物 | Truth 產物 | 說明 |
| --- | --- | --- | --- | --- |
| 1 | `/specify` | `specs/plans/<id>/spec.md`、`plan.meta.yaml`、`truth-delta.md`（骨架） | — | **MUST** 新建 plan 包（除非使用者明示延續既有 `PLAN_DIR`） |
| 2 | `/spec-by-example` | `features/acceptance/*.feature` | — | 整體驗收 Journey；`/clarify` 收斂標籤 |
| 3 | `/technical-research` | `research.md` | `truth/techstack.md` + DELEGATE `/truth-delta` | Truth owner |
| 4 | `/system-analysis` | `plan.md` | — | Wave 委派；`ui/**`→ plan，`api/data`→ truth |
| 4a | `/ui-plan` | `ui/ui-plan.md`、`ui/prototype/` | — | 非 Truth owner |
| 4b | `/data-plan` | — | `truth/data/data-model.dbml` + DELEGATE `/truth-delta` | Truth owner |
| 4c | `/api-plan` | — | `truth/contracts/http-api.yaml` + DELEGATE `/truth-delta` | Truth owner |
| 5 | `/dsl-refine` | `traceability.md` | `truth/features/**` + DELEGATE `/truth-delta` | Truth owner |
| 6 | `/tasks` | `tasks.md` | — | 必讀 `truth-delta.md`；MOD/DEL → Phase 2.5 Harness |
| 7 | `/analyze` | — | — | 唯讀；含 truth-delta vs truth 一致性 |
| 8 | `/implement` | `tasks.md` `[x]` | — | delta MOD/DEL → baseline＋交付前全 suite；詢問 commit |

`/analyze` 與 `/implement` **不在**憲法 Artifacts registry 內：`analyze` 不寫入產物；`implement` 消費產物並改程式。

## Plan / Truth 目錄

- **PLAN_DIR**：`specs/plans/<NNN-short-name>/`（**FEATURE_DIR** 為同義舊名）
- **TRUTH_ROOT**：`specs/truth/`
- **Truth 變更紀錄**：`PLAN_DIR/truth-delta.md`（各 Truth owner 一表；**僅** `/truth-delta` 追加列；見 `plan-truth-workflow.md`）

## 選用分支（不取代主線順序）

| 時機 | 指令 | 備註 |
| --- | --- | --- |
| 寫 spec 前／中，高影響未知 | `/clarify` | 由 producer skill **DELEGATE** |
| Truth **DEL** 或破壞性 **MOD** | `/clarify` | Truth owner Phase 1 閘門 |
| spec 交付後，使用者要求第二 pass | `/clarify-over-specs` | 可在 `/spec-by-example` 前 |
| `/implement` 執行 BDD 任務 | `/bdd` | 單一 red/green/refactor |
| Legacy TDD | `/testplan`、`/tdd` | 非新主線預設 |
| analyze 發現 CRITICAL | 對應 producer skill | 再 `/analyze` → `/implement` |
| 使用者同意交付 commit | `/git-conventional-commit` | 由 `/implement` 收尾 **DELEGATE** |

## `/analyze` 閘門（實作前）

- **前置**：`PLAN_DIR` 存在 `spec.md`、`plan.md`、`tasks.md`、`truth-delta.md`；BDD 模式須 traceability + Truth 介面 Feature；legacy 須 `testplan.md`。
- **行為**：唯讀交叉分析（含 **truth-delta 與 TRUTH_ROOT 是否一致**、錨點是否因 DEL 失效）。
- **出口**：CRITICAL → 勿 `/implement`；否則可 proceed。

## `/implement` 與 analyze

主流程預期 **同一 PLAN_DIR、同一輪 tasks 定稿後** 已 `/analyze`。Completion 後詢問是否 git commit（Q6:A）。

## Feature 目錄慣例（更新）

預設 plan 包：`specs/plans/<NNN-short-name>/`。Acceptance Feature：`PLAN_DIR/features/acceptance/`。介面 Feature／DSL：`TRUTH_ROOT/features/`。各步驟以 **PLAN_DIR** 為工作根；Truth 以 **TRUTH_ROOT** 為準。
