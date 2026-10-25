---
name: spec-by-example
description: 將 spec.md 的需求與商業規則轉成少量、可供 PM DEMO 的整體驗收 Journey Gherkin，標記待澄清處並立即透過 /clarify 依序收斂；不拆分前後端，也不產生 dsl.md。
disable-model-invocation: true
---

# SOP

## Phase 1 -- 收斂規格輸入、判準與輸出骨架

1. READ 讀取指定 spec package 的 `spec.md` 與既有 `features/acceptance/` 產物，確認需求、商業規則、假設及本輪範圍；若找不到 `spec.md`，停止並請使用者提供有效路徑。
2. READ 一次載入本 Skill 所需判準與骨架：`rules/驗收旅程與澄清標籤標準.md`、`.agent/skills/gherkin-and-dsl/STANDARDS.md`（僅 Gherkin 語言邊界與 Feature / Rule / Example 結構；不套用前後端分檔及 DSL 對照）、`templates/電商範例/電商下單總驗收旅程.feature` 與其 `.example.feature`、`templates/情境地圖.template.md`。**後續 Phase 不再重複 READ 上述檔案**（僅在需要 Rules 內 Good/Bad 細節時按需翻閱）。
3. THINK 依 spec 中有依據的需求整理一個整體可 DEMO 的核心旅程及少量關鍵變體，保留未確認的政策與結果，不自行補成已確認需求。

## Phase 2 -- 建立整體驗收 Feature 與情境地圖

1. WRITE 在 spec package 的 `features/acceptance/` 直接建立一份繁體中文 `.feature`，以少量長 Journey Example 描述整體系統流程、關鍵變體與可觀察的業務結果。
   - 判準提醒（Rule 1）：整份 acceptance Feature 直接放在 `features/acceptance/`，不得切前後端子目錄、不得產 `dsl.md`。
   - 判準提醒（Rule 2）：每 Example 為完整 Journey；末行 `# 驗收結果：<一句話摘要>`。
   - 判準提醒（Rule 4）：`# [need clarification]` 緊鄰受影響的 Given / When / Then。
2. THINK 在不確定的規則或驗收結果旁加入 **1 至 10 個** `# [need clarification]`（Rule 3 品質判準 a/b/c）；若 spec 已足夠明確且無符合判準的問題，可以 **0 個**，但須在交付摘要說明「本輪無需澄清」的依據。
3. WRITE 於 `features/acceptance/` 同目錄產出 `情境地圖.md`（Rule 8；依 Phase 1 已載入的 `情境地圖.template.md`）：樹狀列出核心旅程、關鍵變體、邊界分支與待澄清（✅／❓／⬜）。

## Phase 3 -- 依序澄清並回填驗收結果

1. THINK 若 Feature 含 **0 個**待澄清標籤且符合 `/clarify` 豁免判準，可跳過 `/clarify` 並在交付摘要列出三項判斷依據；若含 **1 個以上**標籤，MUST DELEGATE `/clarify`（Rule 5），依影響範圍與流程順序澄清；每輪 1 至 3 題、單一 session 最多 5 題，超過時完成前一 session 後再開始下一個。
2. READ 讀取使用者回答，逐項整理已確認決策、仍未決定事項及新增限制。
3. WRITE 將已確認決策回填 Feature，移除已解決問題的標籤；使用者明確延後決策時保留標籤及其原位置，並在交付摘要中列出。

## Phase 4 -- 驗收產物並交付

1. READ 重新讀取 `features/acceptance/` 下本輪產物（`.feature`、`情境地圖.md`），確認 Journey 結構及標籤狀態符合 Phase 1 已載入標準。
2. THINK 確認產物只有一份整體驗收 Feature、沒有前後端子目錄、`dsl.md`、step definition 或實作技術細節（Rule 6），且每個已解決的澄清決策都反映在 Gherkin。
3. WRITE 回報 Feature 與 `情境地圖.md` 路徑、涵蓋的主要旅程、Clarify 已收斂／豁免／待決事項，並建議下一步 `/technical-research`。
