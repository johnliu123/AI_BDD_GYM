# 模組化憲法布局（速查）

根目錄：`.agent/constitution/`

| 路徑 | 用途 |
| --- | --- |
| `CONSTITUTION.md` | Registry + **authority** 入口 |
| `references/artifact-authority.md` | 產物 MUST 優先序與 STOP 條件 |
| `references/artifact-overlay-sop.md` | Phase Load / Phase Self-check |
| `shared/*.md` | 跨產物約束 |
| `skills/<skill_id>/<artifact>` | 單一產物 overlay（檔名 = 產物 basename） |

## Artifacts（registry 1.1.0）

| skill_id | artifact |
| --- | --- |
| specify | spec.md |
| technical-research | research.md, techstack.md |
| system-analysis | plan.md |
| ui-plan | ui-plan.md, prototype/ |
| data-plan | data-model.dbml |
| api-plan | http-api.yaml |
| tasks | tasks.md |

Producer skill 在 WRITE 前 **Phase Load**、交付前 **Phase Self-check**（見 overlay-sop）。  
`/implement` 不在 registry 內。
