# 模組化憲法布局（速查）

根目錄：`.agent/constitution/`

| 路徑 | 用途 |
| --- | --- |
| `CONSTITUTION.md` | Registry + **authority** 入口 |
| `references/artifact-authority.md` | 產物 MUST 優先序與 STOP 條件 |
| `references/artifact-overlay-sop.md` | Phase Load / Phase Self-check |
| `shared/*.md` | 跨產物約束 |
| `skills/<skill_id>/<artifact>` | 單一產物 overlay（檔名 = 產物 basename） |

## Artifacts（registry 1.2.0）

| skill_id | artifact |
| --- | --- |
| specify | spec.md |
| technical-research | research.md, techstack.md |
| system-analysis | plan.md |
| ui-plan | ui-plan.md, prototype/ |
| data-plan | data-model.dbml |
| api-plan | http-api.yaml |
| testplan | testplan.md |
| tasks | tasks.md |

Producer skill 在 WRITE 前 **Phase Load**、交付前 **Phase Self-check**（見 overlay-sop）。

## 主流程（非 registry 步驟）

預設順序見 `../../references/sdd-primary-workflow.md`：

`/specify` → `/technical-research` → `/system-analysis` → `/testplan` → `/tasks` → **`/analyze`** → `/implement`

| 步驟 | 寫入憲法產物 | 備註 |
| --- | --- | --- |
| `/analyze` | 否 | 唯讀健檢；報告僅對話輸出 |
| `/testplan` | `testplan.md` | 憲法 registry 產物 |
| `/implement` | 否（改程式與 tasks 勾選） | 不在 registry 內；依 TDD 標籤委派 `/tdd` |
