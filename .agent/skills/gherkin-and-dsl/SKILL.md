---
name: gherkin-and-dsl
description: Evaluate and refine Gherkin feature files and DSL vocabularies so they can be implemented as test code with minimal inference. Use when deriving interface scenarios from acceptance Features and system-analysis, reviewing Given/When/Then sentences, or checking Feature/DSL coverage. Legacy testplan is an optional source only for existing TDD suites.
disable-model-invocation: true
---

# Gherkin And DSL

把 Gherkin 與 DSL 收斂成兩件事同時成立：

- PM / 需求方讀得懂 Gherkin
- AI / 測試作者可以直接把 Gherkin + DSL 落地成 step definitions 與測試程式碼

## Quick Start

1. 先讀目標 acceptance／interface Feature、同模組 `dsl.md`、相關介面根共用 `dsl.md`、spec 與 traceability；legacy TDD 才按需讀 testplan。
2. 先判斷本輪是「建立」、「檢查」還是「重構」。
3. 結構與詞彙一起改，**不要只改 Gherkin 不改 DSL**。
4. 任一 Gherkin 句型若找不到 DSL 對應，先補 DSL，再回填 feature。
5. 最終結果必須同時滿足「業務可讀」與「可直接寫測試」。

## SOP

## Phase 1 -- 收斂輸入、標準與輸出範圍

1. READ 讀取使用者需求、目標 acceptance／interface Feature、同模組 `dsl.md`、相關介面根共用 `dsl.md`、spec、plan、`PLAN_DIR/traceability.md`（若存在）；legacy TDD 才按需讀 testplan。
2. READ 一次載入 [STANDARDS.md](STANDARDS.md) 全文。**後續 Phase 不再重複 READ STANDARDS**（§1 句型與 §1.1 Then 去重、§2 結構、§3 參數、§4 DSL 兩層、§5–§7 實作語意與覆蓋檢查，均依 Phase 1 已載入內容執行）。
3. THINK 判斷本輪是新建、覆蓋驗證、句型收斂、結構重組或嚴格度補強，並盤點要修改的 feature 與 DSL 檔案。
4. WRITE 回報修改範圍與會影響切檔或句型邊界的高影響歧義；若有歧義，先停下確認。

## Phase 2 -- 盤點測試案例與覆蓋缺口

1. THINK 逐一比對每個上游 acceptance Example 與衍生 interface Scenario 的 Arrange / Act / 預期輸出 / 必須維持不變／本案例不驗證，判斷 Gherkin 與 DSL 是否完整覆蓋；步驟在但語意被稀釋也算缺口。
   - 判準提醒：Then 須驗證契約（呈現 + 權威狀態等），不能只停 response（STANDARDS §5.2、§7）。
2. WRITE 列出缺口：缺少句型、句型過胖、DataTable / Background / Rule 邊界錯置、Then 嚴格度不足、或 Gherkin 暴露技術細節。

## Phase 3 -- 收斂 Gherkin 句型

1. THINK 收斂 `Given` / `When` / `Then`：語意相同 MUST 共用；過胖句型拆成可重用步驟；DataTable 僅用於多列或多欄摘要（STANDARDS §1、§3）。
2. WRITE 修改 Gherkin：補 Given / When / Then、業務預設值註解、調整 DataTable；移除技術細節與搬運期註解。

## Phase 4 -- 收斂 DSL 詞彙表

1. THINK 為每個 step 決定唯一 DSL 權威位置：模組 `{介面}/{模組}/dsl.md` 優先；跨模組且契約完全一致才上提 `{介面}/dsl.md`（STANDARDS §2.1）。
   - 判準提醒：Then 去重依 §1.1；模組檔含 **業務 DSL（人 Review）** + **技術 DSL（測試落地參考）**（§4.0）。
2. READ 僅在建立／移動 row 或升格／下放句型時，按需讀取 `../dsl-refine/rules/介面功能模組與DSL唯一歸屬判準.md` 的 Good/Bad 範例。
3. WRITE 在唯一權威 DSL 更新 row；每個 Gherkin step 合併查找介面根 + 模組 DSL 後 MUST 恰好命中一個 row。

## Phase 5 -- 做結構優化

1. THINK 依功能面向切 feature；`Rule` 原子化；`Example` 描述資料情境；Background / Scenario Outline 依 STANDARDS §2 決策。
2. WRITE 重構 feature files：拆檔、抽 Rule、必要時 Scenario Outline；移除被淘汰的單一總表檔。

## Phase 6 -- 檢查可落地性

1. READ 重新讀取**本輪修改過的** feature 與 DSL 檔（非重讀 STANDARDS）。
2. DELEGATE `uv run .agent/skills/gherkin-and-dsl/scripts/audit_feature_dsl_topology.py --root specs/truth/features/<介面>`（`backend` 或 `frontend` 介面根；勿用功能模組子目錄）。
3. THINK 結合稽核與 Phase 1 標準：共用契約語意一致、每 case 覆蓋完整、Gherkin 仍為業務語言、DSL 可落地。
4. WRITE 回報稽核結果、語意決策、待收斂句型與可交 step definition 的範圍。

## Additional Resources

- 詳細標準與決策判準： [STANDARDS.md](STANDARDS.md)
- 完整電商示範： [examples.md](examples.md)
