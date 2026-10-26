> **Legacy**：本 plan 於 Plan/Truth 工作流導入前完成；Truth 已合併至 specs/truth/。以下表格供後續 plan 格式參考；歷史變更未逐 skill 回填。

# Truth Delta 紀錄

**Plan**：`specs/plans/005-payment-order-cancellation`  
**Truth root**：`specs/truth/`

本文件記錄本 plan 執行過程中，各 **Truth owner skill** 對 `specs/truth/` 的 ADD / MOD / DEL。  
下游 skill（`/tasks`、`/analyze`、`/implement`）MUST 在 Phase 1 前 READ 全文；並依表格中的路徑／錨點按需 READ Truth 檔案。

表格列 **僅能** 由 **`/truth-delta`** 追加（Truth owner Apply 後 DELEGATE）。

---

## technical-research

| Op | 路徑／錨點 | 摘要 | 原因 | Spec 追溯 |
| --- | --- | --- | --- | --- |
| *(尚無)* | | | | |

## data-plan

| Op | 路徑／錨點 | 摘要 | 原因 | Spec 追溯 |
| --- | --- | --- | --- | --- |
| *(尚無)* | | | | |

## api-plan

| Op | 路徑／錨點 | 摘要 | 原因 | Spec 追溯 |
| --- | --- | --- | --- | --- |
| *(尚無)* | | | | |

## dsl-refine

| Op | 路徑／錨點 | 摘要 | 原因 | Spec 追溯 |
| --- | --- | --- | --- | --- |
| ADD | `specs/truth/features/backend/訂單/付款與取消.feature#pending 後 5xx 不寫 paid 冪等且同 key 可安全重試` | US2·情境4 後端 Example；對應 acceptance「付款中斷後以相同冪等鍵安全重試」 | analyze Findings E1/G1；TP-010 seam 補齊 | FR-012；US2·情境4 |
| MOD | `specs/truth/features/backend/訂單/dsl.md` | 5xx fault／重試 step 列 | 同上 | FR-012 |
| *(harness)* | `tasks.md` Phase 2.5 T002a–T002b | DSL／整合測試對齊上述 ADD/MOD | Rule-Tasks Phase 2.5 | FR-012 |
