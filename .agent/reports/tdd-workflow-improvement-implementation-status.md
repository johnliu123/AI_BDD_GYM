# TDD Workflow 改進提案 — 落地狀態對照

**日期**：2026-10-22（2026-10-22 更新：E、H、I 已實作完成）  
**對照來源**：[tdd-workflow-improvement-proposal.md](./tdd-workflow-improvement-proposal.md)（2026-10-21）  
**檢查範圍**：`.agent/skills/tdd/`、`.agent/skills/testplan/`、`.agent/constitution/skills/testplan/`；延伸參照 `/implement`、`/tasks`（提案 H、E）

> **更新**：本檔最初標記為部分落地的 **E、H、I** 三項已於 2026-10-22 實作完成，詳見下方對照表與異動摘要。提案 A–I 現已**全數落地**。

---

## 目錄

1. [Executive Summary](#1-executivesummary)
2. [改進 A–I 對照表](#2-改進-ai-對照表)
3. [文件落地地圖](#3-文件落地地圖)
4. [2026-10-22 補完異動明細](#4-2026-10-22-補完異動明細)
5. [既有 feature testplan 遷移備註](#5-既有-feature-testplan-遷移備註)
6. [建議後續工作](#6-建議後續工作)

---

## 1. Executive Summary

提案內容**未**另拆成多份「改進規格」專用 md；改進已**編入**既有 Skill／Template／Constitution overlay 的 markdown 檔。提案原文仍保留於 `reports/`，作設計與決策紀錄。

| 統計 | 數量 |
|---|---|
| 改進項（A–I） | 9 |
| 已完整落地 | **9（A–I 全數完成）** |
| 部分落地 | 0 |
| 未落地 | 0 |

**2026-10-22 異動**：補完 E（`/implement` 明確傳遞 `testplan.md` 路徑）、H（`/tasks` `[TDD:RED]` 完成條件）、I（`tdd/rules` 六併三、template §3 去重複）。

---

## 2. 改進 A–I 對照表

| ID | 改進摘要 | 提案優先級 | 狀態 | 落地檔案（主要） |
|---|---|---|---|---|
| **A** | Assert「驗證層」標記 | P1 | ✅ 完成 | `skills/testplan/SKILL.md` Phase 2；`templates/testplan.template.md` 案例表；`constitution/skills/testplan/testplan.md` |
| **B** | `/tdd` RED 前 Phase 1.5 測試意圖對齊 | P0 | ✅ 完成 | `skills/tdd/SKILL.md` § Phase 1.5 |
| **C** | GREEN 階段 Assert 符合度回報 | P1 | ✅ 完成 | `skills/tdd/SKILL.md` Phase 3 步驟 6–8 |
| **D** | testplan §10 執行狀態追蹤 + `/tdd` 回寫 | P2 | ✅ 完成 | `templates/testplan.template.md` §10；`testplan/SKILL.md` Phase 3；`tdd/SKILL.md` Phase 5 步驟 2 |
| **E** | `/tdd` 必讀 testplan；`/implement` 傳遞格式 | P0 | ✅ 完成 | `tdd/SKILL.md` Phase 1 強制 READ 完整案例；`implement/SKILL.md` Phase 4 已明寫傳 **`{FEATURE_DIR}/testplan.md` 路徑**，並原文傳遞 tasks 的「完成條件」 |
| **F** | testplan §11 AI 自主決策紀錄 | P2 | ✅ 完成 | `templates/testplan.template.md` §11；`testplan/SKILL.md` Phase 3 初始化；`tdd/SKILL.md` RED/GREEN 回寫 |
| **G** | 新 session「快速狀態摘要」 | P2 | ✅ 完成 | `templates/testplan.template.md` §7；`tdd/SKILL.md` Phase 5 步驟 3；`testplan/SKILL.md` Phase 4 |
| **H** | `/tasks` RED 任務「完成條件」（預期紅燈原因） | P1 | ✅ 完成 | `tasks/SKILL.md` Phase 3 步驟 3；`tasks.template.md` 範例與 Format Validation；`tasks.example.md` 全數 RED 任務補上完成條件行；`tdd/SKILL.md` Phase 2 步驟 3 比對完成條件與實際紅燈原因 |
| **I** | 精簡重複防護文字；tdd rules 六併三 | P3 | ✅ 完成 | `tdd/rules/` 由 6 檔合併為 3 檔（`判準-測試品質.md`、`判準-執行流程.md`、`判準-介面邊界.md`），`tdd/SKILL.md` READ 引用同步更新；`testplan.template.md` §3 移除重複 P0/P1/P2/通過失敗區塊 |

### 狀態圖例

- ✅ 完成：提案 SOP／template 要點已寫入對應 md，且可從 Skill 流程執行。
- ⚠️ 部分：核心已做，字面或結構與提案不完全一致。
- ❌ 未完成：提案指定 skill 尚未改動。

---

## 3. 文件落地地圖

```
.agent/
├── reports/
│   ├── tdd-workflow-improvement-proposal.md      ← 原始提案（不變）
│   └── tdd-workflow-improvement-implementation-status.md  ← 本檔
├── skills/
│   ├── testplan/
│   │   ├── SKILL.md
│   │   └── templates/
│   │       ├── testplan.template.md   ← A, D, F, G；I（§3 去重複）
│   │       └── testplan.example.md
│   ├── tdd/
│   │   ├── SKILL.md                   ← B, C, D, E, F, G, H（完成條件比對）
│   │   └── rules/                     ← I：6 檔併為 3 檔
│   │       ├── 判準-測試品質.md       ← 原好測試判準 + 3A 格式 + Mock 邊界
│   │       ├── 判準-執行流程.md       ← 原垂直切片 + 適用時機
│   │       └── 判準-介面邊界.md       ← 原 Seam 與公共介面邊界（更名）
│   ├── implement/
│   │   └── SKILL.md                   ← E：明確傳 testplan.md 路徑 + 完成條件
│   └── tasks/
│       ├── SKILL.md                   ← H：RED 任務完成條件要求
│       └── templates/
│           ├── tasks.template.md      ← H：範例與 Format Validation
│           └── tasks.example.md       ← H：全數 RED 任務示範完成條件
└── constitution/skills/testplan/
    └── testplan.md                    ← A, D, F overlay MUST
```

**Runtime 權威**：Agent 執行時以 `skills/*/SKILL.md` + template + constitution overlay 為準；`reports/` 內提案與本狀態檔供人類審閱與追蹤，不取代 Skill。

---

## 4. 2026-10-22 補完異動明細

本節原為「尚未完全對齊的缺口」；E、H、I 已於 2026-10-22 實作，以下記錄具體改動供日後追溯。

### 4.1 改進 E — `/implement` → `/tdd` 傳遞

**提案要求**（摘要）：向 `/tdd` 傳入 `testplan.md` **路徑**。

**改動**：`implement/SKILL.md` Phase 4 步驟 3 明確加入「**`{FEATURE_DIR}/testplan.md` 路徑**」，並要求 RED 任務的「完成條件」須原文傳遞、不得摘要或改寫。

### 4.2 改進 H — `/tasks` RED 完成條件

**提案要求**：每個 `[TDD:RED]` 多一行「完成條件」，寫明**預期紅燈原因**。

**改動**：
- `tasks/SKILL.md` Phase 3 步驟 3：`[TDD:RED]` 任務須在行下方另起一行「完成條件：…」，依 TP 案例 Assert 寫出預期紅燈原因。
- `tasks.template.md`：範例註解與 Format Validation 清單同步更新。
- `tasks.example.md`：14 個 RED 任務（T003、T005、T007、T010、T012、T014、T016、T018、T020、T022、T024、T026、T028、T030）全數補上「完成條件」行作為示範。
- `tdd/SKILL.md` Phase 2 步驟 3：若呼叫者提供任務完成條件，RED 階段須比對實際紅燈原因與完成條件是否一致，不一致則回報並停止。

### 4.3 改進 I — 精簡與 rules 合併

**提案要求**：

- testplan：通用約束集中（原已完成）。
- tdd rules：六份合併為三份。
- template §3：刪除重複 P0/P1 區塊。

**改動**：
- `tdd/rules/` 由 6 檔（測試結構與3A註解格式、垂直切片與先紅後綠、好測試與壞測試判準、TDD-適用時機與例外、Seam-與公共介面邊界、Mock-僅限系統邊界）合併為 3 檔：
  - `判準-測試品質.md`（好測試判準 + 3A 結構 + Mock 邊界，10 條規則）
  - `判準-執行流程.md`（適用時機 + 垂直切片，6 條規則）
  - `判準-介面邊界.md`（原 Seam 與公共介面邊界，更名保留，3 條規則）
- `tdd/SKILL.md` 內 4 處 READ 引用同步改指向新檔名。
- `testplan.template.md` §3 移除重複的第二組 `{{p0_definition}}`／`{{p1_definition}}`／`{{p2_definition}}` 區塊，保留與 `testplan.example.md` 一致的 P0/P1/P2 + 通過/失敗分行版本。

---

## 5. 既有 feature testplan 遷移備註

以 `specs/001-food-browsing-categories/testplan.md` 為例：

| Template 新節 | 001 現況 |
|---|---|
| §7 快速狀態摘要 | 結構與新 template 不完全一致 |
| §10 執行狀態追蹤 | 有（含回填說明） |
| §11 AI 決策紀錄 | 有（空表） |
| 額外 §12 執行結果 | 舊迭代紀錄，新 template 無對應節 |

**結論**：Skill／template 已支援新結構；**舊 spec 目錄內 testplan 需按需手動對齊 template**，非自動遷移。

---

## 6. 建議後續工作

提案 A–I 已全數落地，無剩餘待辦項。後續建議改為「維護與遷移」而非「補完」：

| 項目 | 建議動作 |
|---|---|
| 舊 feature testplan 遷移 | 視需要將 `specs/001-food-browsing-categories/testplan.md` 等既有產物對齊新 template（§7／§10／§11 結構），非強制自動遷移（見第 5 節） |
| `/analyze` 檢查維度 | 可評估是否新增「testplan §10 狀態與 tasks `[x]` 勾選一致性」「RED 完成條件與實際紅燈原因一致性」作為 `/analyze` 的健檢項目（提案未明確要求，屬延伸建議） |
| Skill 變更同步 | 日後修改 `tdd/rules/`、`testplan` template 或 `tasks` 格式時，同步更新本檔「改進 A–I 對照表」與「2026-10-22 補完異動明細」 |

---

## 附錄：提案風險 R1–R7 與改進對應

| 風險 | 改進 | 落地後預期緩解 |
|---|---|---|
| R1 Assert 語意模糊 | A | ✅ template + SOP 強制驗證層 |
| R2 testplan → tdd 斷層 | B, E | ✅ tdd 必讀 + implement 明確傳路徑 |
| R3 紅燈未對準計畫 | B, H | ✅ Phase 1.5 對齊 + tasks 完成條件 + tdd 比對 |
| R4 綠燈無比對 | C | ✅ Assert 符合度表 |
| R5 無執行狀態回寫 | D | ✅ §10 + Phase 5 |
| R6 AI 決策不持久 | F | ✅ §11 |
| R7 新 session 成本高 | G | ✅ 快速狀態摘要 |

---

*本檔由 2026-10-22 對 `.agent/skills` 與 constitution overlay 靜態對照產生；後續 Skill 變更請同步更新本檔「改進 A–I 對照表」與 Executive Summary。*
