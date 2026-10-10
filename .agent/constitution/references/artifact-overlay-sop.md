# Artifact Constitution Overlay SOP

憲法根目錄：`.agent/constitution/`（自 repo 根或 `.agent` 工作區起算）。

憲法模組檔名與 **產物 basename 相同**（如 `spec.md`、`http-api.yaml`），路徑在 `constitution/skills/<skill-id>/`，與 feature 目錄內實際產物（如 `specs/NNN-foo/spec.md`）**不同目錄**，勿混淆。

**Authority**：產物內容 MUST 衝突時以憲法為準，詳見 `artifact-authority.md`。

## Phase Load（WRITE 該 artifact 之前，必做）

1. READ `.agent/constitution/CONSTITUTION.md`
2. READ `.agent/constitution/references/artifact-authority.md`
3. READ 所有 `CONSTITUTION.md` Shared 表中 `applies_to` 含本 artifact（或 `all artifacts below`）的 `shared/*.md`
4. READ Artifacts 表中本 artifact 的 `module` 檔（`status: active` 且檔案存在）
5. THINK 合併 template + skill rules 與憲法；**同主題 MUST 衝突且不可兩立** → STOP（見 artifact-authority.md）

## Phase Self-check（宣告該 artifact 完成之前，必做）

1. THINK 逐項執行該 artifact 模組內「交付自檢（Agent）」（若模組僅 overlay 且無額外 MUST，至少完成 shared 自檢項）
2. THINK 逐項確認 applicable shared 的 MUST
3. 若有未滿足項：修正產物或 STOP；不得宣稱交付完成

## 交付報告

須含一行：

`Constitution self-check: pass`

或

`Constitution self-check: exceptions — <簡述>`

多 artifact 同一 skill 交付時，可逐行列出 artifact 與 pass/exceptions。

## Registry 對照（module 路徑）

| skill_id | artifact | module 路徑 |
| --- | --- | --- |
| specify | spec.md | `.agent/constitution/skills/specify/spec.md` |
| clarify-over-specs | spec.md | （同 specify） |
| technical-research | research.md | `.agent/constitution/skills/technical-research/research.md` |
| technical-research | techstack.md | `.agent/constitution/skills/technical-research/techstack.md` |
| system-analysis | plan.md | `.agent/constitution/skills/system-analysis/plan.md` |
| ui-plan | ui-plan.md | `.agent/constitution/skills/ui-plan/ui-plan.md` |
| ui-plan | prototype/ | `.agent/constitution/skills/ui-plan/prototype.md` |
| data-plan | data-model.dbml | `.agent/constitution/skills/data-plan/data-model.dbml` |
| api-plan | http-api.yaml | `.agent/constitution/skills/api-plan/http-api.yaml` |
| tasks | tasks.md | `.agent/constitution/skills/tasks/tasks.md` |

`/implement` 不在 registry 內。
