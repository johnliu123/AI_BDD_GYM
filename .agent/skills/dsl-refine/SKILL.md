---
name: dsl-refine
description: 將 spec package 的 acceptance Journey 與 system-analysis 端點分析，衍生成各系統介面的原子化 Gherkin Feature 和可落地 DSL，並維持逐例追溯與覆蓋。
disable-model-invocation: true
---

# SOP

## Phase 1 -- 收斂來源與介面範圍

1. READ `../../references/plan-truth-workflow.md`、`../../references/Rule-Truth-Owner-Inventory-and-Delta.md`；`PLAN_DIR` = 指定 spec package；介面 Feature／DSL 寫入 **`TRUTH_ROOT/features/`**；plan 內 **`traceability.md`**（非 `features/acceptance-to-interface-traceability.md`）。
2. READ 讀取 `PLAN_DIR/features/acceptance/**/*.feature`、`spec.md`、`plan.md`、`truth-delta.md`（若已有上游 Truth 變更）與 `TRUTH_ROOT` 端點／契約產物，確認已驗收的業務流程、介面責任與端點清單。
3. THINK 若 acceptance 尚有未解決的 `[need clarification]`、必要的端點分析輸入缺漏，或來源彼此矛盾，停止受影響範圍並回報；需修改業務驗收時交回 `/spec-by-example` 與 `/clarify`，不得自行推定或改寫來源。
4. READ 讀取 `.agent/skills/gherkin-and-dsl/STANDARDS.md`、`rules/介面功能模組與DSL唯一歸屬判準.md`、`rules/驗收案例原子化與追溯標準.md`，以及 `templates/acceptance-traceability.md`、`templates/acceptance-traceability.example.md`、`templates/interface-feature.feature`、`templates/interface-feature.example.feature`、`templates/interface-dsl.md`、`templates/interface-dsl.example.md`、`templates/scenario-index.template.md` 與 `templates/scenario-index.example.md`；本 Phase 一次載入，後續 Phase 不再重複 READ 上述骨架（僅在需要細部 Good/Bad 範例時按需讀 Rules）。
5. THINK 依本次 system-analysis 識別的所有介面盤點需產生的模組、Feature、介面共用 DSL、模組 DSL 與 acceptance 覆蓋對照；介面類型保持開放，不只限於前端與後端。

## Phase 2 -- 衍生介面 Feature 並建立追溯

1. THINK 逐個 acceptance Example，判斷其涉及的介面與驗證面向；將 acceptance 流程拆為各介面實際負責的原子驗證面向。每條 `Rule` 只描述一個可獨立判定的業務或介面驗證契約（一 Rule = 一可獨立判定的驗證面向），不把整段 Journey 原樣複製到各介面。
2. THINK 將每個 Example 寫成一個 3A 案例：可有多個 `Given`、必須恰有一個 `When`、可有多個 `Then`；`When` 只代表一次被測介面操作（一 Example = 一 When）。後端操作以一次請求或一次命令為界；前端可將完成一個介面層級操作所需的複合 UI 互動抽象為同一個 `When`。
3. EXEC **Truth owner Phase 0–1** 後 WRITE 依 Phase 1 已載入的 `interface-feature` 骨架在 **`TRUTH_ROOT/features/<介面>/<模組>/`** 建立繁體中文 `.feature`；每個 Feature 描述區 MUST 含一句「本 Feature 驗證：…」摘要。DEL 舊 Feature／Example 須 `/clarify`，Apply 後 DELEGATE `/truth-delta`。
4. THINK 同步建立追溯：將每個 acceptance Example 的來源、Rule、驗收面向、spec requirement IDs 與衍生介面案例連結；逐項比對 `spec.md` 範圍內可驗收需求，缺 acceptance 承接者標 unmapped 並交回 `/spec-by-example` 或 `/clarify`。不可因下游切分而遺失來源 Given、Act、預期結果或必須維持不變的條件。
5. WRITE 建立或更新 **`PLAN_DIR/traceability.md`**：先填 **介面情境摘要**（人 Review），再填 **Coverage Matrix**（AI 機械稽核；交付時註明不要求使用者逐行 Review）。可選同步 `TRUTH_ROOT/features/acceptance-to-interface-traceability.md`（累積）。

## Phase 3 -- 收斂介面 DSL 契約

1. THINK 依 Phase 1 已載入 STANDARDS 為每個 step 決定唯一 DSL 權威位置：模組專屬句型放在 `features/<介面>/<模組>/dsl.md`；只有跨模組且完整契約一致的句型才放在 `features/<介面>/dsl.md`。
   - 判準提醒（Rules 按需）：模組邊界與 DSL 唯一歸屬見 `rules/介面功能模組與DSL唯一歸屬判準.md`；acceptance 拆分與追溯見 `rules/驗收案例原子化與追溯標準.md`。
2. WRITE 依 Phase 1 已載入的 DSL 骨架建立或更新 row：模組 `dsl.md` 須含 **業務 DSL（人讀）** 小節（句型、參數、意思）與 **技術 DSL（AI 讀／測試落地參考）** 小節（既有完整欄位表）；Then 句型去重依 STANDARDS.md §1.1。
3. THINK 確認每個衍生 Gherkin step 合併查找介面根及模組 DSL 後恰好命中一個 row；重複文字但契約不同時改成可辨識語意的句型，不得合併或留下 duplicate。

## Phase 4 -- 驗收追溯與可落地性

1. READ 重新讀取 spec、acceptance Feature、所有衍生 Feature、DSL 與 coverage matrix，確認每個衍生案例均有 acceptance 來源、每項上游驗收面向均有去向或明確例外，且每個範圍內可驗收 spec requirement ID 均有對應 acceptance／interface Scenario 或明確阻塞狀態。
2. DELEGATE 對每個含介面 Feature 的目錄分別執行 `uv run .agent/skills/gherkin-and-dsl/scripts/audit_feature_dsl_topology.py --root FEATURE_DIR/features/<介面>`；不可把同時含 acceptance 與介面子目錄的 `FEATURE_DIR/features` 當作 root。保留各介面的拓樸、DSL row 重複及 step 唯一匹配結果。
3. THINK 依機械結果與已載入標準檢查 Rule 是否原子、每個 Example 是否剛好一個 When、Then 是否充分驗證該 Rule、介面邊界是否遵循 system-analysis，以及 DSL 是否足以直接實作；機械稽核不能替代語意檢查。
4. EXEC Apply Truth 後 DELEGATE **`/truth-delta`**（`owner_skill_id: dsl-refine`，本輪完整 `entries[]`）。
5. WRITE 依 Phase 1 已載入的 `scenario-index` 骨架產出 **`PLAN_DIR/scenario-index.md`**（業務情境索引；人 Review 主入口），並修正目標範圍內的覆蓋、拓樸或 DSL 缺口，重跑受影響的稽核。
6. WRITE 交付時回報 `TRUTH_ROOT/features/` 路徑、`traceability.md`（介面情境摘要）、`scenario-index.md`、`truth-delta.md` 新增列、介面/模組、覆蓋缺口、稽核結果及仍待上游處理的事項；Coverage Matrix 僅供 AI 稽核，不要求使用者逐行閱讀。