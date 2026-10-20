# SDD 主流程（Primary Workflow）

版本：1.1
範圍：功能從構想到實作的 **預設** slash command 順序。  
權威：流程步驟與 SOP 以 `.agent/skills/<skill-id>/SKILL.md` 為準；產物 MUST 以 `.agent/constitution/` 為準（見 `artifact-authority.md`）。

## 主線

```text
/specify → /technical-research → /system-analysis → /testplan → /tasks → /analyze → /implement
```

| 步驟 | Skill | 主要產物 | 說明 |
| --- | --- | --- | --- |
| 1 | `/specify` | `specs/<feature>/spec.md` | 可追溯功能規格 |
| 2 | `/technical-research` | `research.md`, `techstack.md` | 技術決策與堆疊摘要 |
| 3 | `/system-analysis` | `plan.md` + 端點分析產物 | Wave 委派 ui/data/api plan |
| 4 | `/testplan` | `testplan.md` | 依 User Story 規劃 FR／NFR 案例；測試入口依 system-analysis |
| 5 | `/tasks` | `tasks.md` | 依 TP 案例拆解單步 TDD 任務與 `←` 錨點 |
| 6 | `/analyze` | （無檔案；對話報告） | spec／plan／testplan／tasks 唯讀健檢 |
| 7 | `/implement` | 程式碼 + `tasks.md` `[x]` | 依 tasks 實作；TDD 標籤派送 `/tdd` |

`/analyze` 與 `/implement` **不在**憲法 Artifacts registry 內：`analyze` 不寫入產物；`implement` 消費產物並改程式。

## 選用分支（不取代主線順序）

| 時機 | 指令 | 備註 |
| --- | --- | --- |
| 寫 spec 前／中，高影響未知 | `/clarify` | 由 `/specify` 等 skill **DELEGATE**，非主線獨立步驟 |
| spec 交付後，使用者要求第二 pass | `/clarify-over-specs` | 預設 `/technical-research` 之前可選 |
| `/system-analysis` Wave 內 | `/ui-plan`, `/data-plan`, `/api-plan` | 由 plan 委派，產物寫入 feature 目錄 |
| `/implement` 執行 TDD 任務 | `/tdd` | 每個標記任務以單一 RED／GREEN／REFACTOR step 呼叫，不自動擴成完整循環 |
| analyze 發現 CRITICAL | `/specify`, `/system-analysis`, `/testplan`, `/tasks`, … | 修復後 **重新** `/analyze`，再 `/implement` |
| 產物約束變更 | `/constitution` | 不修改主線定義 |

## `/analyze` 閘門（實作前）

- **前置**：同目錄存在 `spec.md`、`plan.md`、`testplan.md`、`tasks.md`。
- **行為**：唯讀交叉分析（重複、歧義、覆蓋缺口、憲法對齊、錨點一致性等）；詳見 `.agent/skills/analyze/SKILL.md`。
- **出口**：
  - 有 **CRITICAL** → 先修復產物，勿 `/implement`。
  - 僅 LOW/MEDIUM → 可 caution 下 `/implement`。
  - 零 issue → 預設 `/implement`。
- **修復**：analyze **不得**改檔；須使用者同意後 invoke 對應 producer skill 或手動編輯。

## `/implement` 與 analyze

主流程預期在 **同一 feature、同一輪 tasks 定稿後** 已執行 `/analyze`。若使用者直接 `/implement` 且未明示跳過健檢，Implement skill 應提示先 `/analyze` 或確認仍 proceed（見 `skills/implement/SKILL.md` Phase 1）。

## Feature 目錄慣例

預設：`specs/<NNN-short-name>/`（與 `/specify` 一致）。各步驟以 **FEATURE_DIR** 為工作根目錄；analyze/implement 可由 `tasks.md` 路徑推斷父目錄。
