# Artifact: testplan.md

skill: testplan  
overlay: true

## MUST

- 測試案例以 spec 的 User Story 為主要分組；案例 ID 使用唯一 `TP-xxx`，需求追溯仍引用原有 FR／NFR／BR／SC／User Story ID。
- `spec.md` 是需求與驗收語意來源；端點、系統邊界、測試入口、API operation、資料責任與 UI seam 必須來自 `plan.md` 及其指定的 system-analysis 產物。
- 不得在 testplan 中重新盤點端點或推導系統設計；必要分析來源缺漏或矛盾時須記錄並停止受影響的規劃。
- FR 與適用 NFR 均須有案例追溯，或明確列出排除／待確認理由；跨故事 NFR 須對應適用故事與 TP 案例。
- 每個案例須有唯一主要測試意圖、明確需求追溯、測試層級、system-analysis 支持的 public seam、優先級及可重現的 Arrange／單一 Act／精確 Assert。
- **Assert 必須標註驗證層標記**（`[response]`、`[response+state]`、`[response+side-effect]`、`[state-only]`、`[idempotent]`），明確告知 `/tdd` 執行者需要驗證到什麼深度。
- 未在需求中定義的 NFR 數值門檻不得自行補造；無法形成可判定驗收方式時列為待確認。
- 具名 fixture 須列必要狀態、身分／權限與隔離／重設方式；尚未執行的案例不可標示為已通過。
- testplan 須包含第 10 節「執行狀態追蹤」（初始 ⬜）與第 11 節「AI 自主決策與發現紀錄」（初始為空）。

## MUST NOT

- 不得將 testplan 作為 UI、API、資料模型或技術架構規劃的替代品。
- 不得把實作內部呼叫或未由分析產物確認的 endpoint 當成必須通過的測試入口。
- 不得以 `TP-xxx` 取代 spec 正式需求 ID。

## 交付自檢（Agent）

- [ ] User Story 分組及 FR／NFR／BR／SC 追溯與 spec 一致
- [ ] 每個 public seam 均可追溯到 system-analysis 產物
- [ ] 全域 NFR 對照連回適用故事與案例，未發明量測門檻
- [ ] 案例具單一意圖、可重現 Arrange、單一 Act、精確 Assert（含驗證層標記）
- [ ] 具名 fixture、環境來源及未決分析缺口已列明
- [ ] 第 10 節執行狀態追蹤已初始化；第 11 節 AI 決策紀錄已初始化
- [ ] 面向人類的說明使用繁體中文
