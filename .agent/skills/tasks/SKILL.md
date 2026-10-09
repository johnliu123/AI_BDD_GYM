---
name: tasks
description: "依 spec 套件與 plan 端點產出 tasks.md：User Story 內分前端／後端，每小節必讀對照表（人讀部位+機器錨點）與任務行 ← 綁定。Use after system analysis or to break a feature into executable tasks."
---

# Tasks

產出 `tasks.md`：Phase 1–2 基礎；Phase 3+ 依 User Story；故事內 **前端／後端** 第二層。每小節以 **必讀對照** 綁定 spec 套件的**具體部位**（雙軌：人讀標題 + `openapi:`/`dbml:`/`spec:` 等錨點）；每個任務行尾 **`←` 錨點**；對照表列須與任務雙向覆蓋。

## SOP

### Phase 1 -- 確認輸入

1. READ `spec.md`、`plan.md`（端點盤點）、`research.md` 與 `techstack.md`（確認存在與路徑；僅讀目錄結構或標題以對齊錨點，不讀全文）、分析產物路徑列表。
2. READ `rules/Rule-Tasks-端點分層與按需讀取.md`。
3. THINK 若缺 `research.md` 或 `techstack.md`（已執行 `/technical-research` 卻未產出），先補研究產物或 `/clarify`；若某 US 在 openapi／dbml／ui-plan 無對應錨點，先補分析產物或 `/clarify`。

### Phase 2 -- 編排 Phase 1–2 與故事

1. THINK Phase 1：必讀對照含 `techstack.md`、`plan.md` 具體列／章；Setup 任務若依 `/technical-research` 決策，須含 `research.md` 列與 `← research:…` / `techstack:…` / `plan:…`。
2. THINK Phase 2：必讀對照含 `data-model.dbml` 的 Table／Note、`http-api.yaml` 的 ErrorBody／Origin 等共通部位。
3. THINK 每 User Story 標 **端點（對齊 plan.md）**。

### Phase 3 -- User Story 任務與 Binding

1. THINK 每個 Tests／Implementation 的 **#### 前端**、**#### 後端** 下先寫 **必讀對照** 四欄表（文件｜人讀部位｜機器錨點｜本節須對齊）。
2. THINK 從 `contracts/http-api.yaml` 摘 **operationId**（或 METHOD path）；從 `data-model.dbml` 摘 **Table**／**Note**；從 `spec.md` 摘 **US/FR/情境**；從 `ui-plan.md` 摘 **§章節** 與 **prototype 檔名**。
3. WRITE 每個 `- [ ] Tnnn` 描述含檔案路徑，行尾 **`←`** 引用該小節錨點子集；確保對照表**每一列**至少一個任務引用。
4. THINK 後端任務必引用對應 `openapi:`；持久化任務必引用 `dbml:`；前端必引用 `ui-plan:`／`prototype:`。

### Phase 4 -- 產出 tasks.md

1. READ `templates/tasks.template.md`、`templates/tasks.example.md`。
2. WRITE 完整 `tasks.md`（預設與 `plan.md` 同目錄），含 Format Validation。
3. WRITE 回報是否每 US、每小節通過 Binding 雙向覆蓋檢查。

完成 `tasks.md` 後，實作階段由 **`/implement`** 執行（使用者須提供 feature 或 `tasks.md` 路徑）；Implement 依必讀對照與 `←` 錨點按需 READ，見 `../implement/SKILL.md`。
