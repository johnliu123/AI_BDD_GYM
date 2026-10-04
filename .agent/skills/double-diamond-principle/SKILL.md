---
name: double-diamond-principle
description: >-
  以 Design Council 雙鑽石（Discover/Define/Develop/Deliver）為核心的問題探索與交付判斷 Skill。
  啟動後依 SOP 盤點證據、判斷階段與發散/收斂、按需載入 rules/templates、協助定義問題與驗證方案，
  並以 Gate 決定前進或退回。使用者不需懂 Double Diamond；資訊不足先問、不猜測。
  觸發：模糊問題、新功能/新專案、使用者研究、原型測試、「先定義問題再談方案」、
  「雙鑽石」「Double Diamond」「Discover/Define/Develop/Deliver」「發散/收斂」「HMW」
  「Problem Statement」「這樣做對嗎」等。
disable-model-invocation: true
---

# Double Diamond — AI Project Ownership Skill

## 定位

讓 AI 具備**判斷力**，Own「理解問題 → 探索 → 定義 → 發展方案 → 驗證 → 交付」。不是教學文件；判斷依**證據**（研究、回饋、測試），不是套公式跑完四階段。

## 核心原則（優先序高於單一規則細節）

1. **Problem First**：先 User 與 Problem，再 Solution。
2. **Evidence First**：先蒐證再收斂。
3. **Diverge → Converge**：先廣度，再依證據刪選。
4. **Project-Aware**：輕量/標準/完整（見 `references/principles.md`）。
5. **Minimal Assumption**：關鍵缺口先問。
6. **Iterate**：假設被推翻則退回（見 `rules/Rule-DoubleDiamond-例外與退回.md`）。

```
   DISCOVER → DEFINE → DEVELOP → DELIVER
   (發散)     (收斂)    (發散)     (收斂)
   └─ 問題空間 ─┘        └─ 解決方案空間 ─┘
```

## SOP 總覽

```
Progress:
- [ ] Phase 1: 啟動與證據盤點（現況摘要）
- [ ] Phase 2: 階段與發散/收斂判斷
- [ ] Phase 3: 執行當前 Stage（Discover/Define/Develop/Deliver）
- [ ] Phase 4: Gate、交付與銜接實作
```

## Phase 1 -- 啟動與證據盤點

1. READ 讀取使用者訊息與專案內 PRD/spec/issue/回饋/研究文件（只讀盤點，不必先問）。
2. READ 讀取 `references/principles.md` 的 Project-Aware 章節，確認嚴謹度分級依據。
3. READ 讀取 `templates/status-snapshot.md` 與 `templates/status-snapshot.example.md`。
4. THINK 判斷專案類型、嚴謹度、已有證據、資訊缺口。
5. WRITE 依骨架產出現況摘要（對話或檔案）；缺口影響下一步時，進 Phase 2 並依已載入規則提問。

## Phase 2 -- 階段與發散收斂判斷

1. READ 讀取 `references/workflow.md` 的 Phase Detection 與 Diverge/Converge 決策樹。
2. READ 讀取 `rules/Rule-DoubleDiamond-階段與發散收斂判斷.md`。
3. READ 若缺口影響是否可直接執行或必須先問，讀取 `rules/Rule-DoubleDiamond-使用者互動.md`。
4. THINK 依已載入規則回答：目前階段、Diverge 或 Converge、是否須先問使用者；每項結論須對應證據。
5. WRITE 向使用者說明判斷與下一步（情境化用語）；同一決策的缺口一次問完。

## Phase 3 -- 執行當前 Stage

1. READ 讀取 `references/workflow.md` 中對應 Stage 1–4 的逐步 SOP。
2. READ 若需選研究/發想/原型/驗證方法，讀取 `references/tools.md`（先偵測專案已在用的工具/資料，不擅自引入新工具鏈）。
3. READ 若處於 Define 或產出 Problem Statement/Brief，讀取 `rules/Rule-DoubleDiamond-ProblemStatement.md`，以及 `templates/design-definition-pack.md` 與 `templates/design-definition-pack.example.md`。
4. READ 若偵測 Solution-First、假發散等風險，讀取 `references/anti-patterns.md`。
5. THINK 依 Stage 決定本輪產出與方法；草稿一律標「待確認」，不得當 sign-off。
6. WRITE 產出本 Stage 產物並記錄證據來源；必要時引導使用者補研究或測試。

## Phase 4 -- Gate、交付與銜接

1. READ 讀取 `rules/Rule-DoubleDiamond-四階段Gate.md`。
2. READ 讀取 `rules/Rule-DoubleDiamond-證據驗證.md`。
3. READ 讀取 `templates/gate-checklist.md` 與 `templates/gate-checklist.example.md`。
4. READ 若跳階段、資源不足、測試推翻假設或關係人分歧，讀取 `rules/Rule-DoubleDiamond-例外與退回.md`。
5. THINK 對照 Gate Exit Criteria 與 Artifact 清單（`references/workflow.md` Gate 表）；決定 Pass、停留或退回哪一階段。
6. WRITE 產出 Gate 檢查結果；Pass 且進入實作時，WRITE 驗收標準與 MVP 範圍摘要。
7. DELEGATE 若進入程式/PR 交付，依專案慣例實作；必要時 READ `/trunk-based-development`、`/git-conventional-commit` 等 sibling skill。

## 資源索引

| 路徑 | 何時讀 |
|---|---|
| `rules/Rule-DoubleDiamond-四階段Gate.md` | Phase 4 Gate 檢查 |
| `rules/Rule-DoubleDiamond-階段與發散收斂判斷.md` | Phase 2 |
| `rules/Rule-DoubleDiamond-證據驗證.md` | Phase 4；Discover/Develop 證據是否足夠 |
| `rules/Rule-DoubleDiamond-使用者互動.md` | 決定先問或直接做 |
| `rules/Rule-DoubleDiamond-例外與退回.md` | 跳階段、退回、分歧 |
| `rules/Rule-DoubleDiamond-ProblemStatement.md` | Define 產出 |
| `references/workflow.md` | 決策樹、Stage 逐步 SOP、Gate Artifact 表 |
| `references/principles.md` | 理念、Project-Aware、向使用者解釋「為什麼」 |
| `references/tools.md` | 方法/工具選擇 |
| `references/anti-patterns.md` | 「這樣做對嗎」、偏離模式 |
| `references/glossary.md` | 術語速查 |
| `references/examples.md` | 行為校準（5 情境） |
| `references/rules.md` | **索引**（規範已遷至 `rules/`） |
