# 系統分析規劃：點餐系統第三迭代－訂單建立與查詢

## 輸入

- 規格：[spec.md](./spec.md)
- 技術研究：[research.md](./research.md)
- 技術堆疊：[techstack.md](./techstack.md)

## 專案結構

### 文件（本功能）

```text
specs/003-order-creation-inquiry/
├── spec.md
├── research.md
├── techstack.md
├── plan.md
├── tasks.md
├── ui-plan.md
├── prototype/
├── data-model.dbml
└── contracts/
    └── http-api.yaml
```

### 原始碼（儲存庫根目錄）

```text
frontend/
├── src/
│   ├── pages/          # CartPage、新增 Checkout／Order 相關頁或區塊
│   ├── cartApi.js
│   └── orderApi.js     # 新增
backend/
├── src/
│   ├── routes/         # orders.js 新增
│   ├── services/       # orderService.js 新增
│   ├── repositories/   # orderRepository.js 新增
│   ├── data/migrations/  # 003_orders.mssql.sql
│   └── __tests__/orders/
```

**結構決策**：不重開專案；訂單 API 與服務層追加至既有 Express app。購物車、session、計價邏輯由 002 提供；03 只新增訂單持久化、冪等與查詢。菜單讀取仍用 `GET /api/menu-items`。

## 設計決策

- 前後端與 MSSQL、訪客 session、CSRF 延續 [research.md](./research.md)「延續既有前後端與訪客工作階段」；訂單端點與 cart 共用 `attachGuestSession` 與寫入請求的 Origin／CSRF 中介層。
- 建立訂單為**單一 DB 交易**：驗證 cart 可用性 → 快照寫入 orders／明細 → 刪除 cart 項目 → commit。依據：[research.md](./research.md)「訂單建立交易與購物車清空」、spec FR-004–FR-006。
- 金額以建立當下伺服器計算快照持久化；查詢不重算。依據：BR-001、FR-011、[research.md](./research.md)「訂單金額快照與查詢權威」。
- 冪等：`Idempotency-Key` + `order_idempotency_keys`；同 session 重送回同一訂單。依據：FR-007、[research.md](./research.md)「冪等鍵與避免重複送單」。
- 查詢：`order_number` + `guest_session_id` 雙條件；否則 404。依據：FR-010、[research.md](./research.md)「訂單查詢授權」。
- 本迭代不含付款、店家狀態流轉、取消；初始狀態 `created`／「已建立」。依據：spec 假設。

### 設計決策·訂單編號

- 格式 `ORD-YYYYMMDD-XXXXXXXX`（8 位 hex）；DB UNIQUE。依據：[research.md](./research.md)「訂單編號產生」、FR-002。

## 分析流程規劃

本段只規劃分析範圍與 Wave；結論見各端點產物。

### 端點盤點

本節為訂單建立與查詢之需求部位與端點對照（tasks 錨點 `plan:端點盤點`）。

| 需求部位 | 涉及的技術端點 |
|---|---|
| 由購物車確認並建立訂單（FR-001–FR-007、BR-001–BR-003） | 前端 UI、訂單 API、MSSQL、Express 訪客 session／CSRF、既有購物車服務 |
| 再次驗證供應狀態、拒絕空車／不可用 cart（FR-004、FR-005） | 訂單 API、購物車讀取／計價服務、MSSQL |
| 冪等防重複送單（FR-007、SC-004） | 訂單 API、MSSQL |
| 建單後清空購物車（FR-006、SC-006） | 訂單 API、cart repository、MSSQL 交易 |
| 以訂單編號查詢狀態與快照明細（FR-008、FR-009、SC-005） | 前端 UI、訂單 API、MSSQL、Express session |
| 跨 session 不得查詢、快照不受菜單漲價影響（FR-010、FR-011、US2 情境 2–4） | 訂單 API、MSSQL、前端呈現 |

本次實際端點：**前端 UI、訂單 API、MSSQL、Express 訪客 session／CSRF**；重用既有購物車 API 與菜單 API，不新增外部服務。

### 訂單建立與查詢：分析 Wave 排程

#### Wave 1：平行分析 UI 流程與訂單資料模型

1. **前端 UI 分析（Skill：`/ui-plan`）**
   - 輸出：`ui-plan.md`、`prototype/`
   - 邊界：購物車確認送單、成功顯示訂單編號、查詢訂單；錯誤態（空車、不可用項目、查無）；不設計 API schema。

2. **資料模型分析（Skill：`/data-plan`）**
   - 輸出：`data-model.dbml`
   - 邊界：orders、明細、規格快照、冪等鍵；與 carts／guest_session 邏輯關聯；交易邊界註記。

#### Wave 2：訂單 API 契約

1. **訂單 API 分析（Skill：`/api-plan`）**
   - 輸出：`contracts/http-api.yaml`
   - 前置：Wave 1 的 ui-plan、data-model
   - 邊界：`POST /orders`、`GET /orders/{order_number}`、ErrorBody、冪等 header、CSRF；不擴充付款或店家 API。

## 委派摘要

| Wave | Skill id | 輸出產物 | 狀態 |
|---|---|---|---|
| Wave 1 | `/ui-plan` | `ui-plan.md`、`prototype/` | 已於本輪產出 |
| Wave 1 | `/data-plan` | `data-model.dbml` | 已於本輪產出 |
| Wave 2 | `/api-plan` | `contracts/http-api.yaml` | 已於本輪產出 |

## 交付前確認

- 需求追溯：FR-001–FR-011、BR-001–BR-003、SC-001–SC-006、User Story 1–2。
- 不新增 spec 未定義的付款或店家管理 API。
- Wave 2 契約與 data-model 欄位一致；tasks 依 openapi／dbml 錨點拆解實作。

## T002 契約對齊紀錄（2026-10-13）

- `CreateOrderRequest`：`additionalProperties: false`，僅空 body（C1）。
- `createOrder`／`getOrder` 之 400／409／404 回應補 `ErrorBody` **examples** 與穩定 `error.code`（C2）。
- `x-contract-metadata.idempotencyPolicy`：24h TTL；僅 201/200 寫入冪等；4xx/5xx 未建單不寫入（F2，spec Q13）。
- `order_number` path pattern 與 `plan`／research `ORD-YYYYMMDD-8HEX` 一致；`data-model.dbml` 無需變更。

Constitution self-check: pass
