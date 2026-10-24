---
name: spec-by-example
description: 將 spec.md 的需求與商業規則轉成少量、可供 PM DEMO 的整體驗收 Journey Gherkin，標記待澄清處並立即透過 /clarify 依序收斂；不拆分前後端，也不產生 dsl.md。
disable-model-invocation: true
---

# SOP

## Phase 1 -- 收斂規格輸入與驗收範圍

1. READ 讀取指定 spec package 的 `spec.md` 與既有 `features/acceptance/` 產物，確認需求、商業規則、假設及本輪範圍；若找不到 `spec.md`，停止並請使用者提供有效路徑。
2. READ 讀取 `.agent/skills/gherkin-and-dsl/STANDARDS.md` 中的 Gherkin 語言邊界與 Feature / Rule / Example 結構；本 Skill 不套用其前後端分檔及 DSL 對照要求。
3. THINK 依 spec 中有依據的需求整理一個整體可 DEMO 的核心旅程及少量關鍵變體，保留未確認的政策與結果，不自行補成已確認需求。

## Phase 2 -- 建立整體驗收 Feature

1. READ 讀取 `rules/驗收旅程與澄清標籤標準.md`、`templates/電商範例/電商下單總驗收旅程.feature` 與其 `.example.feature`，確認本輪判準及輸出骨架。
2. WRITE 在 spec package 的 `features/acceptance/` 直接建立一份繁體中文 `.feature`，以少量長 Journey Example 描述整體系統流程、關鍵變體與可觀察的業務結果。
3. THINK 在不確定的規則或驗收結果旁加入 3 至 10 個 `# [need clarification]` 問題；若無法從 spec 與上下文找到至少 3 個有根據的問題，停止產出並回報具體缺口，不為湊數編造問題。

## Phase 3 -- 依序澄清並回填驗收結果

1. DELEGATE Feature 與澄清標籤完成後立即呼叫 `/clarify`，依影響範圍與流程順序澄清標籤所列問題；每輪提問遵守 `/clarify` 的 1 至 3 題限制，單一 session 不超過 5 題，超過時完成前一 session 後再開始下一個。
2. READ 讀取使用者回答，逐項整理已確認決策、仍未決定事項及新增限制。
3. WRITE 將已確認決策回填 Feature，移除已解決問題的標籤；使用者明確延後決策時保留標籤及其原位置，並在交付摘要中列出。

## Phase 4 -- 驗收產物並交付

1. READ 重新讀取 `features/acceptance/` 下本輪產物，確認路徑、檔案數、Journey 結構及標籤狀態符合已載入標準。
2. THINK 確認產物只有一份整體驗收 Feature、沒有前後端子目錄、`dsl.md`、step definition 或實作技術細節，且每個已解決的澄清決策都反映在 Gherkin。
3. WRITE 回報 Feature 路徑、涵蓋的主要旅程、Clarify 已收斂與待決事項，並建議下一步 `/technical-research`。