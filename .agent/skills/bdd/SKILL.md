---
name: bdd
description: 在 dsl-refine 建立 Feature 與 DSL 之後，依既有 Gherkin Example 或 Scenario 執行 BDD/TDD。支援 red、green、refactor 三個單階段入口；每次只處理一個 Example（或 Scenario），不產生或修改 Feature／DSL。
---

# BDD

## SOP

### Phase 1 -- 對齊入口與單一 Example（或 Scenario）

1. READ 讀取使用者要求、repo 指示、相關程式碼與測試設定，解析 `/bdd red`、`/bdd green` 或 `/bdd refactor`；subcommand 無效或未提供，或 Feature／**Example 或 Scenario** 無法唯一辨識時先詢問，不自行猜測目標。若 `/implement` 傳入過渡測試檔路徑，RED 可先接通該 harness；**GREEN／REFACTOR 完成條件 MUST 對齊 `TRUTH_ROOT` 目標 Example 的 Then**（Q2:A），不得以過渡檔断言取代 Truth。
2. READ 讀取 `.agent/skills/gherkin-and-dsl/STANDARDS.md`、`.agent/skills/tdd/SKILL.md` 與 `.agent/skills/tdd/rules/判準-測試品質.md`、`判準-執行流程.md`、`判準-介面邊界.md`，並讀取目標 Feature、其介面根與模組 DSL、Cucumber 設定、相關 step definitions 及測試命令。
3. READ 若使用者提供 `testplan:TP-xxx`，讀取 `testplan.md` 中該案例的完整列，作為本輪測試意圖權威；不得以摘要取代原始案例。
4. READ 讀取 `rules/Rule-BDD-共通範圍與階段前置.md`。
5. THINK 確認目標 Example（或 Scenario）與 DSL 契約一致、每個 step 恰好對應一個 DSL row，並確認該入口所需的前置狀態；Feature 或 DSL 缺漏、重複、矛盾，或需要改變驗收語意時，停止並交回 `/dsl-refine` 或 `/clarify`。

### Phase 2 -- RED：建立有效的行為失敗

1. READ 若入口為 `/bdd red`，讀取 `rules/Rule-BDD-RED-有效紅燈與StepDefinition.md`。
2. WRITE 依 DSL 契約為目標 Scenario 建立或調整 step definitions 與測試支援；不得修改 Feature、DSL 或 production code。
3. READ 執行只選取目標 Scenario 的測試，依 RED 規則確認結果有效；若已有行為本來就通過，記錄無需 production 修改，不製造假紅燈。
4. WRITE 回報目標 Scenario、異動檔案、實際測試命令與紅燈原因；有效 RED 成立後立即停止，不自動進入 GREEN。

### Phase 3 -- GREEN：以最小實作通過測試

1. READ 若入口為 `/bdd green`，讀取 `rules/Rule-BDD-GREEN-最小實作與轉綠.md`。
2. READ 先重跑目標 Scenario，確認它仍因預期行為缺口而有效失敗；前置不成立時停止，不代替使用者補跑 RED。
3. WRITE 只修改讓目標 Scenario 通過所需的最小 production code，接著重跑目標 Scenario 與必要的受影響測試。
4. WRITE 回報實作範圍、測試命令與結果；GREEN 成立後立即停止，不自動進入 REFACTOR。

### Phase 4 -- REFACTOR：保持行為並驗證

1. READ 若入口為 `/bdd refactor`，讀取 `rules/Rule-BDD-REFACTOR-行為保持.md`。
2. READ 先確認目標 Scenario 目前通過；若不是綠燈，停止並回報，不一邊修功能一邊重構。
3. WRITE 只對目標切片進行行為不變的整理，然後重跑目標 Scenario 與必要的受影響測試；沒有值得進行的整理時不改檔。
4. WRITE 回報整理內容、測試命令與結果；REFACTOR 完成後立即停止，不自動選取下一個 Scenario。

### Phase 5 -- testplan 與交付回報

1. WRITE 若本輪有 `testplan:TP-xxx`，依 `.agent/skills/tdd/SKILL.md` 更新該案例的階段執行狀態及自主決策紀錄；未經使用者驗收不得標記為已驗收。
2. WRITE 區分有效 RED、GREEN、REFACTOR、既有行為已通過、未執行及阻塞結果，並回報測試命令、實際結果與剩餘決策；不串接未呼叫的階段。