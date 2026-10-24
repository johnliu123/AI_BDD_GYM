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
4. READ 讀取 `.agent/skills/gherkin-and-dsl/STANDARDS.md`、`rules/介面功能模組與DSL唯一歸屬判準.md`、`rules/驗收案例原子化與追溯標準.md`，掌握共用標準與本 Skill 的新增判準。
5. THINK 依本次 system-analysis 識別的所有介面盤點需產生的模組、Feature、介面共用 DSL、模組 DSL 與 acceptance 覆蓋對照；介面類型保持開放，不只限於前端與後端。

## Phase 2 -- 建立 acceptance 覆蓋對照

1. THINK 將每個 acceptance Example 的來源路徑、Rule、Example、驗收面向及其對應的 `spec.md` 需求 ID（FR／NFR／BR／SC／User Story）列入覆蓋矩陣，並依 system-analysis 判斷負責介面與模組；一個上游流程可對應多個下游原子案例。
2. THINK 逐項比對 `spec.md` 中本次範圍內的可驗收需求，確認每個需求 ID 都有 acceptance Example 承接；沒有對應的需求標記為 unmapped 並交回 `/spec-by-example` 或 `/clarify`，不得自行新增驗收行為、NFR 門檻或案例。對每項驗收面向標記為已分配、無對應介面、或待澄清；不可因下游切分而遺失來源 Given、Act、預期結果或必須維持不變的條件。
3. READ 讀取 `templates/acceptance-traceability.md` 與 `templates/acceptance-traceability.example.md`，確認 coverage matrix 的欄位與填寫方式。
4. WRITE 依骨架填寫並參照範例，建立或更新 **`PLAN_DIR/traceability.md`**（本 plan delta）；可選同步更新 `TRUTH_ROOT/features/acceptance-to-interface-traceability.md`（累積）；Truth 變更須經 **`/truth-delta`** 寫入 §dsl-refine。

## Phase 3 -- 衍生介面原子化 Feature

1. THINK 將 acceptance 流程拆為各介面實際負責的原子驗證面向；每條 `Rule` 只描述一個可獨立判定的業務或介面驗證契約，依據不同的規則或結果拆開，不把整段 Journey 原樣複製到各介面。
2. THINK 將每個 Example 寫成一個 3A 案例：可有多個 `Given`、必須恰有一個 `When`、可有多個 `Then`；`When` 只代表一次被測介面操作。後端操作以一次請求或一次命令為界；前端可將完成一個介面層級操作所需的複合 UI 互動抽象為同一個 `When`。
3. READ 讀取 `templates/interface-feature.feature` 與 `templates/interface-feature.example.feature`，確認原子化 Feature 骨架與範例。
4. EXEC **Truth owner Phase 0–1** 後 WRITE 依骨架在 **`TRUTH_ROOT/features/<介面>/<模組>/`** 建立繁體中文 `.feature`；DEL 舊 Feature／Example 須 `/clarify`，Apply 後 DELEGATE `/truth-delta`。
5. THINK 對照覆蓋矩陣，將每項已分配的驗收面向連到一個或多個介面案例，並保留其 spec requirement IDs；若新發現需求無 acceptance 對應、業務行為缺口或衝突，停止受影響案例並交回上游收斂。

## Phase 4 -- 收斂介面 DSL 契約

1. THINK 依 Gherkin Standard 為每個 step 決定唯一 DSL 權威位置：模組專屬句型放在 `features/<介面>/<模組>/dsl.md`；只有跨模組且完整契約一致的句型才放在 `features/<介面>/dsl.md`。
2. READ 讀取 `templates/interface-dsl.md` 與 `templates/interface-dsl.example.md`，確認 DSL 欄位及介面實作語意的承載方式。
3. WRITE 依骨架填寫並參照範例，建立或更新 DSL row，補齊 `DSL 句型`、`Gherkin 參數`、`Data Table 參數`、`預設參數`及介面對應的實作語意；後端寫明權威狀態與驗證，前端寫明 fixture、操作、等待與對權威狀態的對照，其他介面依其責任描述。
4. THINK 確認每個衍生 Gherkin step 合併查找介面根及模組 DSL 後恰好命中一個 row；重複文字但契約不同時改成可辨識語意的句型，不得合併或留下 duplicate。

## Phase 5 -- 驗收追溯與可落地性

1. READ 重新讀取 spec、acceptance Feature、所有衍生 Feature、DSL 與 coverage matrix，確認每個衍生案例均有 acceptance 來源、每項上游驗收面向均有去向或明確例外，且每個範圍內可驗收 spec requirement ID 均有對應 acceptance／interface Scenario 或明確阻塞狀態。
2. DELEGATE 對每個含介面 Feature 的目錄分別執行 `uv run .agent/skills/gherkin-and-dsl/scripts/audit_feature_dsl_topology.py --root FEATURE_DIR/features/<介面>`；不可把同時含 acceptance 與介面子目錄的 `FEATURE_DIR/features` 當作 root。保留各介面的拓樸、DSL row 重複及 step 唯一匹配結果。
3. THINK 依機械結果與已載入標準檢查 Rule 是否原子、每個 Example 是否剛好一個 When、Then 是否充分驗證該 Rule、介面邊界是否遵循 system-analysis，以及 DSL 是否足以直接實作；機械稽核不能替代語意檢查。
4. EXEC Apply Truth 後 DELEGATE **`/truth-delta`**（`owner_skill_id: dsl-refine`，本輪完整 `entries[]`）。
5. WRITE 修正目標範圍內的覆蓋、拓樸或 DSL 缺口，重跑受影響的稽核；交付時回報 `TRUTH_ROOT/features/` 路徑、`traceability.md`、`truth-delta.md` 新增列、介面/模組、覆蓋缺口、稽核結果及仍待上游處理的事項。