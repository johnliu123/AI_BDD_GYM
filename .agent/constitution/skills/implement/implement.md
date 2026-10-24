# Skill: implement（執行契約 overlay）

skill: implement  
overlay: true

## MUST

- 開始時 READ `PLAN_DIR/tasks.md`、`PLAN_DIR/truth-delta.md` 全文，以及使用者提供的 plan 上下文；spec／Truth 依 Phase **Read when executing**、小節 **必讀對照**、任務行 **`←`** 按需 READ（不得開場讀完整包）。
- `PLAN_DIR` = `tasks.md` 所在目錄（`specs/plans/...`）；`TRUTH_ROOT` = `specs/truth/`。歷史名 **FEATURE_DIR** 同義 `PLAN_DIR`。
- 依 `tasks.md` **Phase 編號**順序執行；BDD 模式 Phase 3 起每 Phase 對應一個介面 Feature 檔（路徑在 `TRUTH_ROOT/features/`）；Legacy 模式依 User Story Phase。
- 同一 Phase 內依 **T 編號升序**；同一 Example（或 Scenario）的 BDD 任務須 RED → GREEN → 可選 REFACTOR；Legacy 依同一 TP 的 RED → GREEN → 可選 REFACTOR。`[NON-TDD]` 依 T 編號插入，不替代同 Example 未完成的 RED／GREEN 前置。
- `[BDD:*]` 任務每次只派送一個 `/bdd` subcommand，並傳遞 tasks 中的 **Example（或 Scenario）標題**、`feature:`／`acceptance:`／`dsl:` 錨點及 RED 的「完成條件」原文；`[TDD:*]` 每次只派送一個 `/tdd` requested step。
- **NFR 重構** Phase 若無 `- [ ] Tnnn`，仍須 READ 該 Phase 必讀對照與 Checkpoint 引導，完成檢視後進下一 Phase，不派送 `/bdd`／`/tdd`。
- 錨點解析依 `skills/implement/references/anchor-resolver.md`；`feature:#` 須能匹配 Gherkin **Example**、**Scenario** 或 **Scenario Outline** 標題；零筆或多筆匹配時 STOP。
- `truth-delta.md` 含 **MOD/DEL** 時：`tasks.md` MUST 有 **Phase 2.5**；Implement MUST **baseline 全 suite**（Phase 4 前）與 **交付前全 suite**（見 `Rule-Implement-Truth-Delta-Harness-Gates.md`）。
- BDD **GREEN** 須對齊 Truth Example **Then**；僅過渡測試檔通過不足以標 `[x]`。
- 驗收通過後才將 `tasks.md` 對應行改為 `[x]`；錨點與程式衝突時 STOP，不得自行改驗收。
- 全部任務完成後輸出 **Plan Delivery Summary**（含 `truth-delta.md` 摘要），**詢問**使用者是否 git commit；僅在使用者同意時 DELEGATE `/git-conventional-commit`，不得自行 commit。

## MUST NOT

- 混用 BDD 與 legacy TDD 行為標籤的 tasks 上繼續 implement。
- 在未完成對應 RED 有效紅燈前執行 GREEN；在未確認 Example 已綠前執行 REFACTOR。
- 自動猜測 plan 路徑；未提供 `tasks.md` 路徑或 plan 目錄時 STOP。
- 在未經使用者同意時執行 `git commit`。

## 交付自檢（Agent）

- [ ] Phase／T 順序與 Checkpoint 已對照 tasks
- [ ] BDD 完成項可回指 Example 標題與 traceability；Legacy 可回指 TP
- [ ] NFR Phase（若有）已檢視並記錄於 Completion Report
- [ ] truth-delta MOD/DEL 時：Phase 2.5 已執行；baseline／交付前全 suite 已記錄
- [ ] 已詢問 commit；若 commit 已執行則回報訊息摘要
