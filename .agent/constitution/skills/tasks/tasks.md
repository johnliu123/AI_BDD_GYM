# Artifact: tasks.md

skill: tasks  
overlay: true

## MUST

- 文件含 **Spec 套件索引**（含 **`truth-delta.md`**、Plan／Truth 路徑）與 Phase 1 **Read when executing this phase**（須含 `truth-delta.md` 全文；與 `Rule-Tasks-端點分層與按需讀取.md` 一致）。
- 若 `truth-delta.md` 含 **MOD** 或 **DEL** 資料列，MUST 含 **`Phase 2.5: Harness 對齊 Truth delta`**，且每筆 MOD/DEL 至少一項任務（見 `Rule-Tasks-Truth-Delta-與-Harness-對齊.md`）。
- BDD **GREEN** 須對齊 Truth Example **Then**；過渡測試檔不得作為唯一驗收集。
- 每個有任務的 `####` 端點小節（含 Phase 1–2、NFR 重構若有任務）開頭有 **必讀對照** 四欄表；BDD 主模式 Phase 3 起以介面 Feature 檔為 Phase 單位並依端點分節；Legacy 模式仍以 User Story 分 Phase；不建立空小節或混合 codebase。
- BDD 主模式在全部 Feature File Phase 之後須有 **NFR 重構** Phase，檢視 spec 範圍內 NFR 是否需額外跨 Feature 任務。
- 每個 `- [ ] Tnnn` 行尾含 **`←`** 機器錨點；必讀對照**每一列**至少被一個任務引用。
- BDD 主模式的每個行為任務恰有一個 `[BDD:RED]`、`[BDD:GREEN]` 或 `[BDD:REFACTOR]` 標籤，並追溯至 interface Feature Example（或 Scenario 標題）與 DSL；Phase 3 起以介面 Feature 檔為 Phase 單位；每個納入範圍的 Example 至少有 RED 與 GREEN 任務。
- BDD 主模式中，每個範圍內可驗收的 FR／NFR／BR／SC 都須在 acceptance traceability 對應到 Example，且經 interface Feature 與任務覆蓋；不得留未處理的 unmapped／blocked 項。
- Legacy TDD 模式的每個行為任務恰有一個 `[TDD:RED]`、`[TDD:GREEN]` 或 `[TDD:REFACTOR]` 標籤，且追溯至少一個 `testplan:TP-xxx`；每個 legacy testplan 案例至少被一項任務引用。
- 同一份 tasks 不得混用 BDD 與 legacy TDD 行為任務標籤；非行為任務標 `[NON-TDD]` 並說明原因。
- 純文件／環境準備等非行為任務標示 `[NON-TDD]` 並說明原因；不得以此標示產品行為實作。
- 同一 Feature 檔內（BDD）或同一 User Story 內（Legacy）依 Example／Scenario／TP 交錯 RED、GREEN 與可選 REFACTOR 任務；不得將所有測試任務與所有實作任務分成會破壞逐案例紅綠順序的區塊。

## MUST NOT

- 要求「開始前讀完 spec 套件全文」作為 Prerequisites（須按需 READ）。
- 後端實作任務無 `openapi:` 錨點、持久化任務無 `dbml:` 錨點（若該 US 確有對應契約／模型）。
- 任務不得合併 RED／GREEN／REFACTOR 多個步驟，也不得新增未由所選模式來源（Feature／DSL，或 legacy `testplan.md`）支持的行為任務。

## 交付自檢（Agent）

- [ ] shared（繁中、追溯 ID）已滿足
- [ ] Binding 雙向覆蓋（對照表列 ↔ 任務 `←`）已檢查
- [ ] BDD：Example→RED/GREEN 與 Feature File Phase／NFR Phase 完整；truth-delta MOD/DEL 有 Phase 2.5 覆蓋；Legacy：TP-to-task 覆蓋完整；行為任務步驟標籤與 NON-TDD 豁免均正確
- [ ] Format Validation 段落存在且與 template 一致
