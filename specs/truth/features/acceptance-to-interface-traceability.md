# Acceptance → Interface 追溯（累積索引）

> **權威覆蓋**仍以各 plan 的 `traceability.md` Coverage Matrix 與 `specs/truth/features/**` 為準。  
> 本檔僅供跨 plan 快速導覽；由 `/dsl-refine` 產出之 plan 內 `traceability.md` 為各迭代 Review 入口。

## Plan 索引

| Plan | Acceptance Feature | 人 Review | 機械 Matrix |
| --- | --- | --- | --- |
| 001-food-browsing-categories | `specs/plans/001-food-browsing-categories/features/acceptance/顧客瀏覽餐點與分類總驗收旅程.feature` | [traceability.md](../../plans/001-food-browsing-categories/traceability.md) · [scenario-index.md](../../plans/001-food-browsing-categories/scenario-index.md) | 同 traceability |
| 002-shopping-cart-total-calculation | `specs/plans/002-shopping-cart-total-calculation/features/acceptance/訪客購物車與金額計算總驗收旅程.feature` | [traceability.md](../../plans/002-shopping-cart-total-calculation/traceability.md) · [scenario-index.md](../../plans/002-shopping-cart-total-calculation/scenario-index.md) | 同 traceability |
| 003-order-creation-inquiry | `specs/plans/003-order-creation-inquiry/features/acceptance/訪客建立與查詢訂單總驗收旅程.feature` | [traceability.md](../../plans/003-order-creation-inquiry/traceability.md) · [scenario-index.md](../../plans/003-order-creation-inquiry/scenario-index.md) | 同 traceability |
| 004-merchant-serving-workflow | `specs/plans/004-merchant-serving-workflow/features/acceptance/店家出餐與顧客同步總驗收旅程.feature` | [traceability.md](../../plans/004-merchant-serving-workflow/traceability.md) · [scenario-index.md](../../plans/004-merchant-serving-workflow/scenario-index.md) | 同 traceability |
| 005-payment-order-cancellation | `specs/plans/005-payment-order-cancellation/features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | [traceability.md](../../plans/005-payment-order-cancellation/traceability.md) · [scenario-index.md](../../plans/005-payment-order-cancellation/scenario-index.md) | 同 traceability |
| 006-advanced-features-system-verification | `specs/plans/006-advanced-features-system-verification/features/acceptance/進階能力與端到端驗證總驗收旅程.feature` | [traceability.md](../../plans/006-advanced-features-system-verification/traceability.md) · [scenario-index.md](../../plans/006-advanced-features-system-verification/scenario-index.md) | 同 traceability |

## Truth 介面 Feature 根目錄

- 後端：`specs/truth/features/backend/`
- 前端：`specs/truth/features/frontend/`

## 實作進度（tasks 情境進度表）

各 plan `tasks.md` 頂部 **情境進度** 表已對齊主要 RED/GREEN 任務編號（001–006）。

**tasks 模式（2026-10-26）**：**001–006 均為 BDD 主模式**（Truth Feature + `traceability.md`；`/implement` 派送 `/bdd`）。`testplan.md` 僅作歷史 TP 對照，不作為行為任務錨點。

## DSL 拓樸稽核（`audit_feature_dsl_topology.py`）

- **`--root` MUST 為介面根**：`specs/truth/features/backend` 或 `specs/truth/features/frontend`（其下為 `<功能模組>/*.feature` + `<功能模組>/dsl.md`）。
- **勿** 以功能模組子目錄（例如 `backend/菜單`、`backend/訂單`）為 root，否則會誤報「介面根禁止直接放置 feature」。

## 已知 plan 層保留（非 dsl-refine 缺口）

- 無（005 TP-010 seam 已列入 `005/plan.md`；tasks Constitution pass）。
