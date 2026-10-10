# Rule 1 - 憲法只寫 overlay，且必須最小必要

- Level: `MUST`
- 憲法模組只記錄 **本 repo 在 skill `templates/` + `rules/` 之上** 的增量；已在 skill 層寫死的 MUST，不得複製到憲法（除非使用者明確要求「憲法顯式覆寫／提醒」且與 skill 無衝突）。
- 每次 `/constitution` 預設只處理 **一個增量目標**：一個 `shared` 模組、或一個 registry 內的 **artifact 模組**、或 registry 列（新增 artifact／調整 applies_to）。使用者明確要求一批次多檔時才合併。
- 新增或修改條文以 **一條 MUST / MUST NOT = 一個可交付自檢的陳述** 為單位；無使用者確認的條文不得寫入。
- 流程性要求（例如「一定要先寫測試」）**不得**寫入憲法；應建議新增或調整 SDD skill，並在本 skill 中列為 deferred。

## Good Example

- 使用者：「本專案 API 錯誤 response 要有 requestId。」→ 若 registry 尚未含 `http-api.yaml`，先 `/clarify` 是否擴 registry 或改 `api-plan` rules；確認後只加對應模組 2～3 條 MUST。

## Bad Example

- 把 `Rule-Spec-Requirement-Traceability.md` 全文貼進 `constitution/skills/specify/spec.md`。

# Rule 2 - 模組放置：shared 與 artifact

- Level: `MUST`
- **跨多個受管 artifact** 且與產物內容無關的約束（語言、追溯 ID 格式等）→ `constitution/shared/` + 更新 `CONSTITUTION.md` 的 Shared 表 `applies_to`。
- **只影響單一產物形狀**（例如 spec 澄清紀錄、openapi error envelope）→ `constitution/skills/<skill_id>/<artifact>`（檔名與產物 basename 相同）。
- 新增 artifact 進 registry 時：必須確認 **producer skill** 已依 `artifact-overlay-sop.md` 執行 Phase Load／Self-check；若未掛載，列入交付報告 WARN，不 silent 假設已生效。Producer 對照見 `references/modular-layout.md`。

# Rule 3 - 訪談與核准閘門

- Level: `MUST`
- 下列情況 **DELEGATE `/clarify`**（由本 skill 傳遞主題與選項，不累計超過 clarify session 5 題上限）：
  - 目標 artifact 或 shared／artifact 歸屬不明
  - 需求像流程／skill 能力而非產物約束
  - 與既有 skill MUST 可能衝突
  - 使用者描述模糊，無法寫成可自檢的一條 MUST
- **WRITE 任何憲法檔案前**，須向使用者展示本增量提案（將改哪幾檔、將增刪哪些條文、version bump 類型），並取得明確同意；使用者只說「繼續」且上下文已核准同一提案時視為同意。
- 使用者表示「先這樣／下次再補」→ 只交付已完成增量，不為「完整憲法」自動補齊。

# Rule 4 - 版本與模組檔格式

- Level: `MUST`
- 變更 `CONSTITUTION.md` 的 `version`：新增 MUST 或新增 registry 列 → **MINOR**；僅刪除／改寫既有 MUST 或澄清文意 → **PATCH**；移除整 artifact 或向後不相容 redefinition → **MAJOR**（需使用者確認）。
- artifact 模組保留既有骨架：`# Artifact: …`、`skill:`、`overlay: true`、`## MUST`、`## MUST NOT`、`## 交付自檢（Agent）`；新增 MUST 時同步新增或更新自檢項，且自檢項數量保持最少。

# Rule 5 - 本 skill 邊界

- Level: `MUST`
- 只修改 `.agent/constitution/` 與（若使用者另外核准）registry 引用的說明；**不得**修改 `specs/` feature 產物、application 程式、或主流程 skill SOP，除非使用者另開 `/skill-engineering` 等任務。
- 功能實作、寫 spec、跑 `/specify` 等意圖 → 記錄為 deferred，在交付報告建議後續指令，**不得**代為執行。
