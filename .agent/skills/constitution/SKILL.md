---
name: constitution
description: 依使用者需求，以最小增量、逐步訪談方式建立或更新 `.agent/constitution/` 模組化產物憲法（shared 與 artifact overlay）；只寫必要 MUST，不重述 skill 預設。Use when invoking /constitution, amending artifact rules, or expanding the constitution registry.
license: MIT
---

# Constitution

維護 **artifact 憲法**（`.agent/constitution/`）：registry + `shared/` + `skills/<skill_id>/<artifact>`。  
憲法 **不** 改 SDD 流程；流程性需求應另開 skill，在本 skill 中僅 deferred 提示。

**布局速查**：`references/modular-layout.md`  
**主流程載入契約**：`.agent/constitution/references/artifact-overlay-sop.md`

## 核心原則

| 原則 | 一句話 |
| --- | --- |
| Overlay Only | 只寫 skill 未覆蓋、且本 repo 需要的產物約束 |
| One Increment | 預設一次只改一個 shared 或 artifact 模組（或 registry 一列） |
| Interview Before Guess | 缺口用 `/clarify` 訪談，不腦補 MUST |
| Approve Before Write | 展示提案並取得同意後才寫檔 |
| Agent Self-Check | 憲法條文須能對應模組內「交付自檢（Agent）」 |

## SOP

### Phase 0 -- 邊界與 deferred 意圖

1. READ 使用者輸入；依 `rules/Rule-Constitution-最小增量與撰寫判準.md` Rule 5 分類：憲法工作 vs 功能／spec／實作等 deferred。
2. THINK 若輸入混合多類意圖，本 session 只處理憲法部分；其餘記下 deferred，不代為執行。

### Phase 1 -- 盤點現狀與對照 skill 預設

1. READ `.agent/constitution/CONSTITUTION.md`、`references/artifact-authority.md`、`references/modular-layout.md`、`references/artifact-overlay-sop.md`。
2. READ 本次增量可能觸及的既有模組：`shared/*.md`、`skills/**` 對應 artifact 檔。
3. READ 對每個目標 artifact，讀取對應 skill 的 `templates/` 與 `rules/`（路徑見 `.agent/skills/<skill_id>/`），列出 **已在 skill 層滿足** 的 MUST，避免重複寫入憲法。
4. THINK 將使用者需求轉成候選增量：改 shared／改 artifact 模組／新增 registry 列／刪除或弱化既有 MUST；標記與 skill 重疊或衝突的項目。

### Phase 2 -- 必要性判斷與訪談

1. READ `rules/Rule-Constitution-最小增量與撰寫判準.md` Rule 1–3。
2. THINK 若 Rule 3 任一條成立，或增量目標仍不唯一，**DELEGATE `/clarify`**，並傳遞：
   - 本輪主題（例如：約束落在 `shared` 還是 `http-api.yaml` 模組、是否擴 registry）
   - 已知的 skill 重疊結論（避免重複）
   - 要求 options 含「本輪不寫憲法、改 skill」當合理選項之一
3. THINK 若使用者已給出可寫成單條 MUST 的明確決策且無衝突，可略過 clarify，直接進 Phase 3。
4. THINK 整 session 配合 clarify 累計不超過 5 題；使用者 signal 完成（done、先這樣）則以已確認部分進 Phase 3，其餘標為 Outstanding。

### Phase 3 -- 最小增量提案（寫檔前）

1. THINK 依 Rule 1 收斂為 **一個** 增量包（檔案清單 + 逐條 MUST/MUST NOT 增刪改 + 自檢項變更 + `version` bump 類型）。
2. WRITE 向使用者輸出提案摘要：
   - **將修改檔案**
   - **將新增的 MUST/MUST NOT**（逐條）
   - **刻意不寫**（含已在 skill、或留待下次）
   - **registry / shared `applies_to` 是否變更**
   - 若需擴 artifact 且主流程 skill 未掛載憲法 → WARN
3. THINK 未取得使用者對本增量包的明確同意前 **STOP**，不 WRITE 憲法檔。

### Phase 4 -- 套用增量

1. WRITE 僅寫入 Phase 3 核准內容；條文格式依 Rule 4；`overlay: true` 的 artifact 模組不重述 template 全文。
2. WRITE 同步更新 `CONSTITUTION.md`（`version`、Shared 或 Artifacts 表）；無 registry 變更時可只 bump version 或僅改模組檔，依 Rule 4。
3. THINK 寫入後重讀變更檔，確認無與 skill MUST 矛盾、無空泛不可自檢句。

### Phase 5 -- 交付

1. WRITE 回報：`version`、變更檔案、受影響 `skill_id`／artifact、本 session 是否還有 Outstanding。
2. WRITE 列出 deferred 意圖與建議後續（如 `/specify`、`/skill-engineering`），**不得**代為 invoke。
3. WRITE 若使用者要繼續增量，提示可再次 `/constitution` 並帶入 Outstanding 項目。
