---
name: plan-with-class-diagram
description: >-
  在撰寫或修改程式前，先依需求與既有程式碼收斂 Mermaid 類別圖提案，向使用者確認後再依賴順序實作。使用者不必會畫 UML；AI 負責建模、說明取捨與施工順序。觸發：開發前先畫
  類別圖、class diagram、Mermaid classDiagram、架構提案、依圖施工、plan-with-class-diagram、
  「先給我看類別再寫程式」等。
---

# Plan with Class Diagram — 類別圖提案後再開發

## 定位

這不是 UML 教學，而是 **先提案、後施工** 的 Workflow Skill：用 Mermaid `classDiagram` 呈現即將開發的類別與關係，**取得使用者確認後** 才寫入或修改程式碼，並依類別依賴排定實作順序。

**Skill 根目錄**（`rules/`、`templates/`、`references/` 均相對此路徑）：優先 `.agent/skills/plan-with-class-diagram/`，其次 `.cursor/skills/plan-with-class-diagram/`。

## 核心原則

| 原則 | 一句話 |
|---|---|
| Diagram Before Code | 未通過確認閘，不建立新類別／不大幅改結構 |
| Scope to Task | 只畫本次開發需要的類別，不畫整個系統地圖 |
| Match Project | 命名、分層、檔案慣例對齊既有 repo |
| Revise on Feedback | 使用者改圖意見優先於已寫的程式 |
| Traceable Build | 施工時標示對應圖中哪個類別／關係 |

## SOP

執行時複製 checklist（**Phase 1–3 在確認前不可跳過；使用者已明確確認現行類別圖時，可從 Phase 4 開始**）：

```
Progress:
- [ ] Phase 1: 蒐集情境與程式脈絡
- [ ] Phase 2: 收斂並產出類別圖提案
- [ ] Phase 3: 確認閘（同意／修訂／暫停）
- [ ] Phase 4: 依圖與依賴順序實作
- [ ] Phase 5: 對照圖完成度回報
```

## Phase 1 -- 蒐集情境與程式脈絡

1. READ 讀取使用者本次目標、驗收條件、已知限制（語言、框架、測試要求）。
2. READ 若 repo 已有相關程式，只讀盤點命名空間、分層與既有類別，不先改碼。
3. THINK 界定本次類別圖邊界（in scope / out of scope）；關鍵缺口影響建模時，向使用者一次問清。

## Phase 2 -- 收斂並產出類別圖提案

1. READ 讀取 `rules/Rule-PlanClassDiagram-類別圖設計.md`。
2. READ 讀取 `templates/class-diagram-proposal.md` 與 `templates/class-diagram-proposal.example.md`。
3. READ 若 Mermaid 語法不確定，讀取 `references/mermaid-class-diagram.md`。
4. THINK 依已載入規則收斂類別、關鍵方法／屬性（僅提案層級）、關係（繼承、實作、組合、依賴）。
5. WRITE 依模板產出提案：含 Mermaid 區塊、簡短設計說明、假設與 out of scope。

## Phase 3 -- 確認閘

1. READ 讀取 `rules/Rule-PlanClassDiagram-開發前確認.md`。
2. WRITE 向使用者呈現 Phase 2 提案，並明確請其 **同意依此圖施工**、**要求修訂類別圖**，或 **暫停／縮小範圍**。
3. THINK 若使用者要求修訂，更新 Mermaid 與說明後再次 WRITE 請確認；未收到同意前不得進 Phase 4。
4. READ 若使用者僅想調整圖、尚未同意開發，停留在 Phase 2–3，不寫業務程式。

## Phase 4 -- 依圖與依賴順序實作

1. READ 讀取 `rules/Rule-PlanClassDiagram-依圖施工.md`。
2. THINK 依已確認類別圖排出實作順序（先被依賴者、介面／抽象、再實作與整合）；記錄順序供 Phase 5。
3. WRITE 依順序實作：每完成一個類別或一組緊耦合類別，簡述對應圖中節點；若實作中發現圖不合理，停下來 WRITE 說明偏差並回到 Phase 3 修圖後再繼續。
4. READ 若專案有測試慣例，在適當步驟補上或更新測試，並對照圖中公開行為。

## Phase 5 -- 對照圖完成度回報

1. THINK 對照已確認類別圖，列出已實作、刻意延後、與圖不一致且已修圖說明的項目。
2. WRITE 回報：類別圖（或連結）、施工順序摘要、已變更檔案、剩餘工作與風險。

## 資源索引

| 路徑 | 何時讀 |
|---|---|
| `rules/Rule-PlanClassDiagram-開發前確認.md` | Phase 3；施工前 |
| `rules/Rule-PlanClassDiagram-類別圖設計.md` | Phase 2 |
| `rules/Rule-PlanClassDiagram-依圖施工.md` | Phase 4 |
| `templates/class-diagram-proposal.md` | Phase 2 產出格式 |
| `templates/class-diagram-proposal.example.md` | Phase 2 校準 |
| `references/mermaid-class-diagram.md` | Mermaid 語法速查 |
| `references/anti-patterns.md` | 偏離「先圖後碼」時 |
