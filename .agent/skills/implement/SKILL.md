---
name: implement
description: "依 feature 目錄 tasks.md 逐項實作；BDD 標籤派送 /bdd 的單一階段，legacy TDD 標籤派送 /tdd。主流程在 /analyze 之後執行。"
license: MIT
license-file: LICENSE.txt
attribution: "SDD workflow informed by github/spec-kit (MIT, Copyright GitHub, Inc.)"
---

# Implement

依 **`tasks.md`** 逐步完成開發：**按需 READ** spec 套件（必讀對照 + `←` 機器錨點）、**依 Phase 與 T 編號順序**執行。遇到 `[BDD:RED]`／`[BDD:GREEN]`／`[BDD:REFACTOR]` 任務時，以該單一階段呼叫 `/bdd`；遇到 legacy `[TDD:RED]`／`[TDD:GREEN]`／`[TDD:REFACTOR]` 任務時呼叫 `/tdd`。驗收通過後更新 **`tasks.md` `[x]`**。不依賴 `.specify/` 或 speckit 腳本。

**相關規則**：`rules/Rule-Implement-必讀對照與錨點解析.md`、`rules/Rule-Implement-執行順序.md`、`rules/Rule-Implement-Truth-Delta-Harness-Gates.md`；錨點解析見 `references/anchor-resolver.md`。Tasks 格式見 `../tasks/rules/Rule-Tasks-端點分層與按需讀取.md` 與 `../tasks/rules/Rule-Tasks-Truth-Delta-與-Harness-對齊.md`。執行 MUST 另見 `../../constitution/skills/implement/implement.md`。

## SOP

### Phase 1 -- 定位 feature 與 tasks

1. READ 使用者輸入；**必須**取得 `tasks.md` 路徑或含 `tasks.md` 的 **plan 目錄**（`specs/plans/...`）。未提供則 STOP，請使用者提供，**不得**自動偵測路徑。
2. READ `../../references/plan-truth-workflow.md`；令 `PLAN_DIR` = `FEATURE_DIR` = `tasks.md` 所在目錄，`TRUTH_ROOT` = `specs/truth/`。
3. THINK 確認 `PLAN_DIR` 存在 `spec.md`、`plan.md`、`tasks.md`、`truth-delta.md`；READ `truth-delta.md` 全文後按需 READ Truth；解析 tasks 模式：BDD 需 `traceability.md` + `TRUTH_ROOT/features/**`；legacy 需 `testplan.md`。缺件或混用標籤時 STOP。
4. READ `rules/Rule-Implement-Truth-Delta-Harness-Gates.md`；若 delta 含 MOD/DEL 而 `tasks.md` 缺 **Phase 2.5**，STOP（建議 `/tasks` 或 `/analyze`）。
5. THINK 主流程為 `/tasks` → **`/analyze`** → `/implement`（見 `../../references/sdd-primary-workflow.md`）。若使用者未明示已 analyze、未附 analyze 結論（含 CRITICAL 數）、且未要求 skip analyze，**WARN** 建議先對 `PLAN_DIR` 執行 **`/analyze`**；使用者回覆 proceed／skip analyze／continue 則進入步驟 6；若對話中已存在同 plan 的 analyze 報告且含 CRITICAL，**STOP** 並建議先修復產物再 implement
6. READ 讀 `PLAN_DIR/tasks.md` 全文（任務清單本身可一次讀；**plan／truth 仍按需讀**）
7. READ `../../constitution/skills/implement/implement.md`（執行 MUST overlay）

### Phase 2 -- Checklist 閘門（有則啟用）

1. READ 若 `{FEATURE_DIR}/checklists/` 存在，掃描各檔 checkbox 統計；不存在則跳過本 Phase
2. THINK 若有未勾選項，展示 status 表並詢問是否繼續；使用者 no/wait/stop 則 STOP
3. WRITE 使用者 yes/proceed/continue 則進入 Phase 3

### Phase 3 -- 解析執行計畫

1. THINK 從 `tasks.md` 提取：Phase 順序、Checkpoint、`Tnnn`、`[P]`、`[USn]`、模式（BDD 或 legacy TDD）、恰一個任務類型標籤（`[BDD:RED]`／`[BDD:GREEN]`／`[BDD:REFACTOR]`、legacy `[TDD:RED]`／`[TDD:GREEN]`／`[TDD:REFACTOR]` 或 `[NON-TDD]`）、小節結構、必讀對照表與 `←` 錨點。
2. THINK 若單一 tasks 混用 BDD 與 legacy TDD 行為標籤、行為任務缺少所選模式標籤／錨點、同時有多個階段標籤，或以 `[NON-TDD]` 標記產品行為，STOP 並要求先修正 tasks；BDD task 必須有可唯一解析的 `feature:#` Example（或 Scenario）與 DSL 錨點，legacy TDD task 必須有 `testplan:TP-xxx`。
3. READ `tasks.md` 中 **Dependencies & Execution Order**（若有），與 `Rule-Implement-執行順序.md` 合併
4. THINK 識別當前應執行的 Phase；若使用者指定範圍（Legacy：如「只做 US1」；BDD：如「只做 Phase 3」或「只做 `features/.../xxx.feature` Phase」），僅在該範圍內執行，並說明未覆蓋 Phase

### Phase 3.5 -- Baseline 全 suite（truth-delta MOD/DEL 時）

1. THINK 若 Harness 閘門啟用（見 Rule-Implement-Truth-Delta-Harness-Gates），且尚未完成 Phase 2.5 任務，優先執行 Phase 2.5。
2. EXEC 進入 Phase 4 前 RUN **baseline 全 suite**（命令自 `techstack.md` 或 Phase 2.5 Checkpoint）；記錄結果；失敗時 STOP 或消化 Phase 2.5，不得跳過去新 Feature GREEN。

### Phase 4 -- 按 Phase 執行任務

1. READ 進入新 Phase 時：若 Phase 有 **Read when executing this phase** 或 **必讀對照**，依 `anchor-resolver.md` READ 對應錨點
2. THINK 進入每個 `#### 前端` / `#### 後端` 小節前：READ 該小節 **必讀對照** 每一列的機器錨點
3. THINK 對每個 `- [ ] Tnnn`（按 T 編號與 Dependencies，尊重 `[P]` 與同檔案約束）：
   - READ 該行 `←` 錨點（`anchor-resolver.md`）
   - 若標 `[BDD:RED]`、`[BDD:GREEN]` 或 `[BDD:REFACTOR]`，分別向 `/bdd red`、`/bdd green` 或 `/bdd refactor` 派送；提供 T 編號、上游 acceptance Example 錨點、Feature 相對路徑與 **Example（或 Scenario）標題**（與 tasks 內「接通 Example「…」」一致）、相關 DSL 錨點、spec 需求追溯、任務描述及「完成條件」（RED 須原文傳遞，不得摘要或改寫）。若 T 描述指定過渡測試檔（如 `*.test.js`），一併傳給 `/bdd` 作為 harness 提示。每次只呼叫一個 subcommand，不自動連續執行其他階段。
   - 若標 `[TDD:RED]`、`[TDD:GREEN]` 或 `[TDD:REFACTOR]`，明確向 `/tdd` 傳入 requested step 分別為 `RED`、`GREEN` 或 `REFACTOR`；同時提供 T 編號、**`{FEATURE_DIR}/testplan.md` 路徑**、`testplan:TP-xxx` 案例、public seam、任務描述與完成條件。不得改成 `FULL` 或一口氣代跑其餘 TDD 步驟。
   - GREEN 前確認對應 RED task 已完成且有效紅燈成立；REFACTOR 前確認對應案例已綠。前置不成立時讓對應 `/bdd` 或 `/tdd` 停止，不自行跳步。
   - 若標 `[NON-TDD]`，核對其理由確為文件／環境等非行為工作，再依一般任務方式完成；若任務實際改變產品行為則停止並要求拆成 TDD tasks。
   - 若該 T 描述要求執行命令或走查，執行並記錄結果
   - 該步驟與任務驗收通過後才 WRITE 將 `tasks.md` 中該行改為 `- [x]`
4. THINK 非 `[P]` 任務失敗則 halt 該 Phase 依賴鏈；`[P]` 失敗繼續並報告
5. THINK Phase 末尾對照 **Checkpoint** 執行 `tasks.md` 記載的最小驗證；**NFR 重構** Phase 若無 checkbox 任務，仍須 READ 必讀對照、完成 Checkpoint 敘述檢視，並在 Completion Report 記錄「無額外 NFR 任務」或所列任務結果
6. THINK Feature File Phase 內 `[NON-TDD]`（walkthrough、政策對齊等）依 T 編號執行，不跳過同 Example 尚未完成的 RED／GREEN

### Phase 5 -- Polish 與收尾

1. READ 執行 Polish Phase 時依 tasks 必讀對照 READ `quickstart.md` 等
2. THINK 執行 tasks 列出的 build／smoke（若存在）
3. EXEC 若 Harness 閘門啟用，RUN **交付前全 suite**（同 baseline 命令）；Completion Report MUST 附 baseline 與交付前兩次結果摘要。
4. WRITE **Completion Report**：已完成 T 列表及各 BDD subcommand／legacy TDD requested step、未完成 T、依 tasks 執行的驗證命令與結果；BDD 模式列出完成的 **Feature Example**（或 Scenario）與 traceability 對照、NFR Phase 檢視結論，legacy 模式列出 testplan TP 與 `spec.md` Independent Test 對照，並列剩餘風險。
5. THINK 若錨點無法解析或實作與 spec／Truth 衝突且未澄清，不得宣稱全部完成；**僅過渡 harness 通過而 Truth Then 未對齊** 視同未完成 GREEN。

### Phase 6 -- Plan 交付與 commit 詢問（Q6:A）

1. WRITE **Plan Delivery Summary**：`PLAN_DIR`、tasks 完成度、`truth-delta.md` 各 skill 小節摘要、主要程式變更範圍。
2. WRITE **詢問使用者**：是否以 git commit 交付本迭代（預設單一 commit：`specs/plans/` + `specs/truth/` + 程式碼，除非使用者要求拆分）。
3. THINK 使用者同意 commit 時，DELEGATE **`/git-conventional-commit`**；使用者拒絕或未回覆時 **不得** 自行 `git commit`。
4. WRITE 若 commit 完成，回報 commit hash／訊息摘要；可建議更新 `plan.meta.yaml` 的 `status: delivered`（僅在使用者同意時）。

## 自 speckit-implement 採納與排除

| 採納 | 排除 |
|---|---|
| Phase 順序、[P]／同檔規則、失敗 halt、tasks 打 `[x]`、checklist 有則掃描 | TDD／強制 Tests 先於 Implementation、`check_prerequisites.py`、一次讀完整包 spec、extensions.yml hooks、ignore 矩陣自動產生、`.specify/constitution` 硬依賴 |
