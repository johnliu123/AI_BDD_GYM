# Project Constitution (Artifact Registry)

version: 1.1.0  
scope: repository  
enforcement: agent-read-and-self-check  
authority: 產物內容 MUST 衝突時，以本 registry 之 shared／artifact 模組為最高優先（流程 SOP 不在此覆寫）。詳見 `references/artifact-authority.md`。

本 registry 只索引 **產物約束**；SDD 流程與 skill SOP 不在此修改。Load／Self-check 步驟見 `references/artifact-overlay-sop.md`。

## 合併與載入

1. READ 本檔與 `artifact-authority.md`、`artifact-overlay-sop.md`
2. 執行 **Phase Load** → WRITE 前依 skill template + rules 產出，並滿足憲法（憲法 MUST **覆寫** skill 產物 MUST 衝突）
3. 執行 **Phase Self-check** → 交付前

若 skill MUST 與憲法 MUST 不可兩立：**STOP**，請 `/constitution` 或調整 skill rules。

## Shared

| id | path | applies_to |
| --- | --- | --- |
| lang-zh-tw | shared/說明文字使用繁體中文.md | all artifacts below |
| trace-ids | shared/需求追溯-id-慣例.md | spec.md, plan.md, tasks.md, ui-plan.md |

## Artifacts

| skill_id | artifact | module | status |
| --- | --- | --- | --- |
| specify | spec.md | skills/specify/spec.md | active |
| technical-research | research.md | skills/technical-research/research.md | active |
| technical-research | techstack.md | skills/technical-research/techstack.md | active |
| system-analysis | plan.md | skills/system-analysis/plan.md | active |
| ui-plan | ui-plan.md | skills/ui-plan/ui-plan.md | active |
| ui-plan | prototype/ | skills/ui-plan/prototype.md | active |
| data-plan | data-model.dbml | skills/data-plan/data-model.dbml | active |
| api-plan | http-api.yaml | skills/api-plan/http-api.yaml | active |
| tasks | tasks.md | skills/tasks/tasks.md | active |

## 擴充

新增產物時：Artifacts 表加一列、新增 `skills/<skill-id>/<artifact>` 模組、確認 producer skill 已掛載 overlay SOP，並 bump `version`（MINOR = 新增 MUST／registry 列；PATCH = 文意澄清）。
