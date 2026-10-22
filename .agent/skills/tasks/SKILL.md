---
name: tasks
description: "嚴格依 testplan.md 的 User Story 與 TP 案例產出 tasks.md；每項行為任務只對應一個 TDD RED/GREEN/REFACTOR 步驟，供 /implement 明確派送 /tdd。"
license: MIT
license-file: LICENSE.txt
attribution: "SDD workflow informed by github/spec-kit (MIT, Copyright GitHub, Inc.)"
---

# Tasks

產出 `tasks.md`：Phase 1–2 基礎；後續依 `testplan.md` 的 User Story、TP 案例、測試入口及 NFR 追溯切分。不得自行重規劃測試範圍、改寫 Assert 或增加沒有 TP 依據的行為任務。每個 TP 案例至少被一項 task 引用 `testplan:TP-xxx`。每項行為任務恰有一個 `[TDD:RED]`、`[TDD:GREEN]` 或 `[TDD:REFACTOR]` 標籤；涉及多步驟時必須拆成不同任務。純文件／環境準備等非行為任務標 `[NON-TDD]` 並說明原因。

沿用既有 **必讀對照** 雙軌錨點、任務行尾 `←`、端點分層與憲法 overlay 規則。`/implement` 依標籤逐項呼叫 `/tdd`，本 skill 不執行 RED／GREEN／REFACTOR。

## SOP

### Phase 1 -- 確認輸入

1. READ `spec.md`、`testplan.md`、`plan.md`（端點盤點）、`research.md` 與 `techstack.md`（確認存在與路徑；按需讀取），以及 system-analysis 產物路徑列表。
2. READ `rules/Rule-Tasks-端點分層與按需讀取.md`。
3. THINK 缺少 `testplan.md` 時先停止並建議 `/testplan`；若缺 `research.md` 或 `techstack.md`，依既有前置閘門補齊；若 testplan 的 seam／需求對照在 system-analysis 產物中不存在，停止相關任務並回報上游分析缺口，不自行規劃。
4. THINK 建立 TP-to-task 覆蓋清單；每個 TP 案例至少有一項 task。不得新增沒有 TP 追溯的行為任務。

### Phase 2 -- 編排 Phase 1–2 與故事

1. THINK Phase 1：必讀對照含 `techstack.md`、`plan.md` 具體列／章；Setup 任務若依 `/technical-research` 決策，須含 `research.md` 列與 `← research:…` / `techstack:…` / `plan:…`。
2. THINK Phase 2：必讀對照含 `data-model.dbml` 的 Table／Note、`http-api.yaml` 的 ErrorBody／Origin 等共通部位。
3. THINK 每 User Story 標 **端點（對齊 plan.md）**，並維持 testplan 的故事及案例追溯。

### Phase 3 -- User Story 任務與 Binding

1. THINK 每個 User Story 依實際有任務的端點建立 **#### 前端**／**#### 後端**（或其他具名端點）小節；各小節先寫 **必讀對照** 四欄表，包含對應的 `testplan:TP-xxx`。
2. THINK 從 `contracts/http-api.yaml` 摘 **operationId**（或 METHOD path）；從 `data-model.dbml` 摘 **Table**／**Note**；從 `spec.md` 摘 **US/FR/情境**；從 `ui-plan.md` 摘 **§章節** 與 **prototype 檔名**。
3. WRITE 每個 `- [ ] Tnnn` 描述含檔案路徑及恰一個任務類型：行為任務用 `[TDD:RED]`／`[TDD:GREEN]`／`[TDD:REFACTOR]`；非行為任務用 `[NON-TDD]` 並寫明理由。行尾 `←` 引用 `testplan:TP-xxx` 與該小節錨點；確保對照表每列至少一個任務引用。**`[TDD:RED]` 任務須在該行下方另起一行「完成條件：…」，依對應 TP 案例的 Assert 寫出預期紅燈原因（測試應因哪個尚未實作的行為缺口而失敗）；不得只寫「建立測試」等無法判定對錯的描述。`[TDD:GREEN]`／`[TDD:REFACTOR]` 不需此行。**
4. THINK 依 TP 案例交錯安排任務：RED 只建立該案例的一個測試；其後 GREEN 只實作讓該紅燈轉綠的最小行為；REFACTOR 僅在測試全綠後做行為不變整理。任務不可合併多個 TDD 步驟；不得集中所有 RED 後才開始 GREEN。
5. THINK 後端任務必引用對應 `openapi:`；持久化任務必引用 `dbml:`；前端必引用 `ui-plan:`／`prototype:`。

### Phase 4 -- 產出 tasks.md

1. READ `templates/tasks.template.md`、`templates/tasks.example.md`。
2. READ `../../constitution/CONSTITUTION.md`、`../../constitution/references/artifact-authority.md`、`../../constitution/references/artifact-overlay-sop.md`；EXEC **Phase Load**（artifact=`tasks.md`）。
3. WRITE 完整 `tasks.md`（預設與 `plan.md` 同目錄），含 Format Validation；產物 MUST 以憲法為最高優先。
4. EXEC **Phase Self-check**（artifact=`tasks.md`）。
5. WRITE 回報是否每 US、每小節通過 Binding 雙向覆蓋檢查，以及 `Constitution self-check: pass` 或 `exceptions`（格式見 artifact-overlay-sop）。
6. WRITE 建議下一指令：預設 **`/analyze`**（主流程見 `../../references/sdd-primary-workflow.md`）；實作由 **`/implement`** 執行，TDD 標籤須映射成明確 requested step 後呼叫 `/tdd`。

完成 `tasks.md` 後，依主流程先 **`/analyze`** 對 `spec.md`、`plan.md`、`testplan.md`、`tasks.md` 做唯讀健檢，再 **`/implement`**（使用者須提供 feature 或 `tasks.md` 路徑）；Implement 依必讀對照、TP 錨點與 TDD 標籤按需 READ，見 `../implement/SKILL.md` 與 `../analyze/SKILL.md`。
