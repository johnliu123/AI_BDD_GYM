# BDD Workflow 認知負擔改進提案 — 落地狀態對照

**日期**：2026-10-26（更新：§2.2、§4.4 補齊；範例與 `specs/` 遷移；Truth 購物車 §3.2 Then 去重；001–006 implement 交付前 specs 同步）  
**對照來源**：[bdd-workflow-cognitive-load-improvement-proposal.md](./bdd-workflow-cognitive-load-improvement-proposal.md)（2026-10-26）  
**檢查範圍**：`.agent/skills/spec-by-example/`、`.agent/skills/dsl-refine/`、`.agent/skills/gherkin-and-dsl/`、`.agent/skills/clarify/`、`.agent/skills/tasks/`、`.agent/references/`；靜態 grep／讀檔對照。

> **結論**：提案 §2–§4 可執行改進項 **13/13 ✅**；**§6 範例檔** 與 **§7 `specs/` 既有產物** 已於 2026-10-26 對齊（腳本 `.agent/tmp-migrate-bdd-artifacts.mjs`）。

---

## 目錄

1. [Executive Summary](#1-executive-summary)
2. [提案章節對照表（§2–§4）](#2-提案章節對照表§2§4)
3. [優先級表對照（§5）](#3-優先級表對照§5)
4. [文件落地地圖](#4-文件落地地圖)
5. [2026-10-26 補完異動明細（§2.2、§4.4）](#5-2026-10-26-補完異動明細§22§44)
6. [範例檔與既有產物（非 Skill 阻擋項）](#6-範例檔與既有產物非-skill-阻擋項)
7. [既有 plan／Truth 遷移備註](#7-既有-plantruth-遷移備註)
8. [建議後續工作](#8-建議後續工作)
9. [附錄：核心設計原則落地](#9-附錄核心設計原則落地)

---

## 1. Executive Summary

| 統計 | 數量 |
|---|---|
| 可執行改進項（§2.1–§4.6） | 13 |
| Skill／Template／契約 **已完整落地** | **13** |
| **部分落地**（Skill 層） | **0** |
| **未落地** | **0** |
| §5 優先級表（11 列 + 表外 3 項） | 14 項均 ✅ |

**2026-10-26 第二次更新**：對齊提案 **§2.2**（澄清標籤 **1–10**，例外 **0** + 品質判準）與 **§4.4**（**spec-by-example、tasks、gherkin-and-dsl、dsl-refine** 四 Skill Phase 1 合併 READ + SOP 內嵌判準提醒）。

**Runtime 權威**：`skills/*/SKILL.md` + rules + templates + `references/plan-truth-workflow.md`。

---

## 2. 提案章節對照表（§2–§4）

| ID | 提案小節 | 狀態 | 落地檔案（主要） |
|---|---|---|---|
| **2.1** | 情境地圖摘要 | ✅ | `spec-by-example/SKILL.md` Phase 2；Rule 8；`templates/情境地圖.template.md` |
| **2.2** | 放寬 clarify 標籤門檻 | ✅ | `rules/驗收旅程與澄清標籤標準.md` Rule 3（**1–10**，例外 **0** + a/b/c）；`spec-by-example/SKILL.md` Phase 2 步驟 2 |
| **2.3** | 驗收結果摘要註解 | ✅ | Rule 2；`spec-by-example/SKILL.md` Phase 2 判準提醒 |
| **3.1** | 介面情境摘要 + Matrix 分層 | ✅ | `dsl-refine/templates/acceptance-traceability.*`；`dsl-refine/SKILL.md` |
| **3.2** | Then 句型去重 | ✅ | `gherkin-and-dsl/STANDARDS.md` §1.1；`dsl-refine/SKILL.md` Phase 3 |
| **3.3** | Feature 一句話摘要 | ✅ | `interface-feature.feature`；`dsl-refine/SKILL.md` Phase 2 |
| **3.4** | 合併 Phase 2+3（dsl-refine） | ✅ | `dsl-refine/SKILL.md` Phase 2–4 |
| **4.1** | 業務情境索引 | ✅ | `scenario-index.template.md`；`dsl-refine/SKILL.md` Phase 4 |
| **4.2** | `/clarify` 豁免判準 | ✅ | `clarify/SKILL.md`；`spec-by-example/SKILL.md` Phase 3 |
| **4.3** | DSL 人讀／AI 讀兩層 | ✅ | `STANDARDS.md` §4.0；`interface-dsl.md` |
| **4.4** | Rules 內嵌 SOP、減少 READ | ✅ | 見 [§5](#5-2026-10-26-補完異動明細§22§44) |
| **4.5** | 情境進度表 | ✅ | `tasks/SKILL.md`；`tasks.template.md` |
| **4.6** | 精簡路徑 | ✅ | `sdd-primary-workflow.md` |

---

## 3. 優先級表對照（§5）

| 優先級 | 改進項目 | 狀態 |
|---|---|---|
| P0 | 情境地圖摘要 | ✅ |
| P0 | 介面情境摘要 | ✅ |
| P0 | 業務情境索引 | ✅ |
| P1 | DSL 句型去重 | ✅ |
| P1 | 放寬 clarify 最低門檻 | ✅ |
| P1 | Rules 核心判準內嵌 SOP | ✅ |
| P2 | DSL 兩層 | ✅ |
| P2 | 情境進度表 | ✅ |
| P2 | 精簡路徑 | ✅ |
| P2 | Feature 一句話摘要 | ✅ |

---

## 4. 文件落地地圖

```
.agent/
├── reports/
│   ├── bdd-workflow-cognitive-load-improvement-proposal.md
│   └── bdd-workflow-cognitive-load-improvement-implementation-status.md  ← 本檔
├── references/
│   ├── sdd-primary-workflow.md
│   └── plan-truth-workflow.md
└── skills/
    ├── spec-by-example/
    │   ├── SKILL.md                     ← 2.1–2.3, 4.2, 4.4
    │   └── rules/驗收旅程與澄清標籤標準.md   ← 2.2 Rule 3
    ├── dsl-refine/SKILL.md              ← 3.x, 4.1, 4.3, 4.4
    ├── gherkin-and-dsl/SKILL.md         ← 3.2, 4.3, 4.4
    ├── clarify/SKILL.md                 ← 4.2
    └── tasks/SKILL.md                   ← 4.5, 4.4
```

---

## 5. 2026-10-26 補完異動明細（§2.2、§4.4）

### 5.1 §2.2 — 澄清標籤門檻（對齊提案 Rule 3）

| 項目 | 提案 | 落地 |
|---|---|---|
| 預設數量 | 1 至 10 個待澄清標籤 | Rule 3：`MUST 包含 1 至 10 個`（當仍有符合 a/b/c 的缺口） |
| 例外 | spec 足夠明確可 **0 個** + 交付摘要 | 保留；與豁免 `/clarify` 連動 |
| 品質 | a/b/c 判準；不湊數 | Rule 3 + Bad Example（有缺口卻不標、無關問題湊數） |
| SOP | — | `spec-by-example/SKILL.md` Phase 2 步驟 2 改寫 **1–10（例外 0）** |

### 5.2 §4.4 — Rules 內嵌 SOP、減少 READ

| Skill | 改動摘要 |
|---|---|
| **`spec-by-example`** | Phase 1 合併 READ：`rules` + STANDARDS（Gherkin 章）+ 電商 template + 情境地圖 template；Phase 2 移除重複 READ，步驟內嵌 Rule 1/2/4/8 判準提醒 |
| **`dsl-refine`** | 維持 Phase 1 一次 READ；Phase 3 加 Rules 按需提醒；scenario-index 改「Phase 1 已載入骨架」 |
| **`gherkin-and-dsl`** | Phase 1 READ STANDARDS **全文一次**；Phase 2–5 **不再重複 READ STANDARDS**；各 Phase 內嵌 §1/§2/§4 判準；DSL 歸屬 Rules **僅按需** READ |
| **`tasks`** | Phase 1 合併 READ Rules + `tasks.template.md`；選模式後 READ 一次 bdd/legacy example；Phase 4 不再 READ template；Phase 3 內嵌 RED 交錯／完成條件判準 |

**未改動（刻意）**：憲法 overlay（`CONSTITUTION.md` 等）仍在 `tasks` Phase 4 READ；各 Skill Phase 末「重新讀取本輪產物」保留（驗證產物，非重讀 Rules）。

---

## 6. 範例檔對齊（`.agent/skills`）

| 檔案 | 狀態 |
|---|---|
| `spec-by-example/templates/電商範例/電商下單總驗收旅程.example.feature` | ✅ 三個 Example 已加 `# 驗收結果：…` |
| `dsl-refine/templates/interface-feature.example.feature` | ✅ 已加 `本 Feature 驗證：…` |
| `dsl-refine/templates/interface-dsl.example.md` | ✅ 已加「業務 DSL」+「技術 DSL」小節 |
| `tasks/templates/tasks.bdd.example.md` | ✅ 已加「情境進度」表與 `scenario-index.md` 索引列 |

---

## 7. 既有 plan／Truth 遷移（`specs/`）

| 產物 | 現況（2026-10-26 遷移後） |
|---|---|
| `specs/plans/*/features/acceptance/情境地圖.md` | ✅ **6** 份（各 plan 一份） |
| `specs/plans/*/scenario-index.md` | ✅ **6** 份 |
| `specs/plans/*/traceability.md` | ✅ 已加 **介面情境摘要** + Matrix AI 標題 |
| `specs/plans/*/features/acceptance/*.feature` | ✅ 各 Example 末行 `# 驗收結果：…`（摘要自 Then） |
| `specs/plans/*/tasks.md` | ✅ **情境進度** 表已回填 T 編號（001–006） |
| `specs/truth/features/acceptance-to-interface-traceability.md` | ✅ 跨 plan 累積索引（2026-10-26） |
| `specs/truth/features/**/*.feature` | ✅ 已加 `本 Feature 驗證：…`（若原本無） |
| `specs/truth/features/**/dsl.md` | ✅ 已加 **業務 DSL（人 Review）** + **技術 DSL** 小節 |
| Truth Then 句型語意去重（§3.2 資料層） | ✅ **購物車**（`backend/購物車`、`frontend/購物車`）：`.feature` + `dsl.md` 業務／技術 Then 已合併 canonical 句型（STANDARDS §1.1）；其他 Truth 模組未掃描去重 |

**維護腳本**：`.agent/tmp-migrate-bdd-artifacts.mjs`（可重跑；已存在之摘要／小節會略過）。

---

## 8. 建議後續工作

| 項目 | 建議 |
|---|---|
| 業務 DSL「意思」欄 | 可人工潤飾 Truth `dsl.md` 業務列（目前多為句型導出摘要） |
| 其他模組 Then 去重 | 非購物車 Truth `dsl.md` 仍可能有 §1.1 級相似句型，按需逐模組合併 |
| 情境進度 Tnnn | ✅ 001–006 `tasks.md` 情境進度表已回填 T 編號（2026-10-26） |
| 002–006 tasks BDD 化 | ✅ 與 001 同模式：Feature 檔 Phase、`[BDD:RED/GREEN]`、`acceptance`/`feature`/`dsl` 錨點（2026-10-26） |
| `specs/` 與 git 同步 | ✅ 001–006 plans、`acceptance-to-interface-traceability.md`、005 Truth delta／付款 Example、`techstack.md` 稽核根路徑已對齊；`tmp-migrate-bdd-artifacts.mjs` 可重跑補 `# 驗收結果` |
| 本狀態檔 | Skill 或遷移腳本變更時同步 §2、§5、§7 |

---

## 9. 附錄：核心設計原則落地

> 人只確認「情境對不對」；覆蓋完整性由 AI 機械稽核。

| 人的 Review 入口 | 落地 |
|---|---|
| 漏情境？ | `情境地圖.md` |
| 前後端各驗什麼？ | `traceability.md` 介面情境摘要、`scenario-index.md` |
| 句型語意？ | DSL 業務 DSL 小節 |
| RED/GREEN 進度？ | `tasks.md` 情境進度 |
| AI 機械覆蓋 | Coverage Matrix + `audit_feature_dsl_topology.py` |

---

*本檔由 2026-10-26 靜態對照產生；§2.2、§4.4 補齊；§6–§7 範例與 specs 產物遷移；§7 Truth 購物車 Then 去重於同日完成。*
