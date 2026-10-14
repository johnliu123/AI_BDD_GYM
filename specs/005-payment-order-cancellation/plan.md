# 系統分析規劃：點餐系統第五迭代－付款與取消訂單

## 輸入

- 規格：[spec.md](./spec.md)
- 技術研究：[research.md](./research.md)
- 技術堆疊：[techstack.md](./techstack.md)

## 專案結構

### 文件（本功能）

```text
specs/005-payment-order-cancellation/
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
│   ├── orderApi.js                 # 擴充 payOrder、cancelOrder
│   ├── pages/OrderLookupPage.jsx   # 付款／取消 UI
│   ├── pages/MenuPage.jsx          # 成功區塊 payment 欄位
│   └── pages/MerchantOrdersPage.jsx # 付款篩選與欄位
backend/
├── src/
│   ├── lib/paymentStatus.js        # 新增
│   ├── services/paymentStub.js     # 新增
│   ├── services/paymentService.js  # 新增
│   ├── repositories/orderRepository.js  # payment 欄位、cancel、pay UPDATE
│   ├── repositories/paymentIdempotencyRepository.js # 新增
│   ├── routes/orders.js            # pay／cancel 路由
│   ├── services/merchantOrderService.js # cancelled 拒絕接單
│   ├── lib/orderStatus.js          # cancelled 標籤
│   └── data/migrations/005_payment_cancel.mssql.sql
```

**結構決策**：不新增微服務；付款 stub 與訂單更新同一 Express 程序；顧客 pay／cancel 掛於既有 `orders` router。

## 設計決策

- 堆疊與 MSSQL 延續 [research.md](./research.md)「延續既有堆疊與訂單持久化」。
- 付款金額一律讀 `orders.total_amount`；pay body 禁止權威金額。依據：FR-010、BR-001。
- 付款與出餐狀態正交；`Order` 同時暴露 `status` 與 `payment_status`。依據：FR-015、BR-002。
- pay／cancel 使用 **條件 UPDATE** + 單一 transaction（含 paid 取消時 refund）。依據：research「付款狀態機與並發」「顧客取消與 pending 競態」。
- **非 stale** 之 `pending` **不可取消**（**409** `PAYMENT_IN_PROGRESS`）；**stale pending** 可取消並在同一交易將 pending 中止為 **`failed`** 再 **`cancelled`**。依據：FR-013、research「顧客取消與 pending 競態」。
- 模擬金流：`paymentStub` 同步；測試可經 env 或 dev-only body。依據：spec 假設、SC-002。
- 本迭代不含 menu CRUD、真實金流、第六迭代 ACL。依據：spec 邊界。

### 設計決策·付款 pending 逾時

- **`PAYMENT_PENDING_STALE_SEC`** 預設 **120**；逾時後 `POST pay` 可重入 stub。依據：research 失敗處理、techstack。

### 設計決策·出餐 cancelled

- `OrderStatus` 新增 **`cancelled`**；merchant 動作前置檢查。依據：FR-019、research「出餐狀態擴充 cancelled」。

## 分析流程規劃

本段只規劃分析範圍與 Wave；結論見各端點產物。

### 端點盤點

本節為付款與取消之需求部位與端點對照（tasks 錨點 `plan:端點盤點`）。

| 需求部位 | 涉及的技術端點 |
|---|---|
| 顧客發起付款（FR-001–FR-003、SC-001） | 顧客前端、Orders API pay、MSSQL、paymentStub |
| 付款失敗與冪等（FR-004–FR-006、FR-012、SC-002、SC-006） | paymentService、payment_idempotency_keys |
| 顧客取消（FR-007–FR-009、FR-013、SC-003–SC-004） | Orders API cancel、MSSQL |
| 顧客查詢 payment 欄位（FR-016、SC-001） | GET order、前端 OrderLookup |
| 店家 list／detail／拒絕 cancelled 接單（FR-017–FR-020、SC-006） | Merchant Orders API、merchant UI |
| 快照金額不可變（FR-010、SC-005） | paymentService 忽略 body 金額 |

本次實際端點：**顧客前端 UI、Orders API（pay／cancel／get 擴充）、Merchant Orders API（list 擴充）、MSSQL、程序內 payment stub**。

### 付款與取消：分析 Wave 排程

#### Wave 1：平行分析 UI 流程與資料模型

1. **前端 UI 分析（Skill：`/ui-plan`）**
   - 輸出：`ui-plan.md`、`prototype/`
   - 邊界：顧客付款／取消／查詢 payment；店家付款篩選；不含 OpenAPI schema。

2. **資料模型分析（Skill：`/data-plan`）**
   - 輸出：`data-model.dbml`
   - 邊界：`payment_status` 欄位、`cancelled` status、`payment_idempotency_keys`、transaction 註記。

#### Wave 2：HTTP API 契約

1. **API 分析（Skill：`/api-plan`）**
   - 輸出：`contracts/http-api.yaml`
   - 前置：Wave 1 的 ui-plan、data-model
   - 邊界：pay／cancel POST；`PaymentStatus`；擴充 `Order`／merchant list；錯誤碼 409 族；同步更新 003／004 契約之 Order 欄位（T002）。

## 委派摘要

| Wave | Skill id | 輸出產物 | 狀態 |
|---|---|---|---|
| Wave 1 | `/ui-plan` | `ui-plan.md`、`prototype/` | 已於本輪產出 |
| Wave 1 | `/data-plan` | `data-model.dbml` | 已於本輪產出 |
| Wave 2 | `/api-plan` | `contracts/http-api.yaml` | 已於本輪產出 |

## 交付前確認

- 需求追溯：FR-001–FR-020、FR-010–FR-013、FR-015–FR-016 全域、BR-001–BR-004、SC-001–SC-006、User Story 1–5。
- 契約與 data-model 欄位一致；005 契約為 pay／cancel 與 payment 欄位之 implement 錨點。
- tasks 依 openapi／dbml 錨點拆解。

## T002 契約對齊紀錄（2026-10-14）

- `OrderStatus` 新增 `cancelled`；`PaymentStatus` 五值與 `data-model.dbml` 一致。
- `PayOrderRequest`：`additionalProperties: false`；`simulate_outcome` 僅文件化 dev 政策。
- 店家 list 新增 `payment_status` query 與 summary 欄位。
- **OpenAPI 權威**：本迭代以 **`005/contracts/http-api.yaml`** 為 pay／cancel 與 payment 擴充之 implement 錨點。
- **Merchant 出餐 POST**：005 契約含 **`acceptMerchantOrder`**（含 cancelled 護欄描述）；**`startPreparingMerchantOrder`**、**`completeMerchantOrder`** 定義於 **`../004-merchant-serving-workflow/contracts/http-api.yaml`**（005 `x-contract-metadata.priorMerchantApi`；tasks 錨點 **`004-openapi:{operationId}`**）。
- **T002 已完成（2026-10-14）**：已同步 **`003/contracts/http-api.yaml`** 與 **`004/contracts/http-api.yaml`** — `Order`／`OrderStatus`／`PaymentStatus`、`MerchantOrderSummary`、list `payment_status` query、`INVALID_PAYMENT_STATUS_FILTER`、description 交叉引用 005；與 005 契約一致。
- **FR-012 澄清（2026-10-14）**：付款冪等僅 **`paid` 成功**寫入 `payment_idempotency_keys`；`x-contract-metadata.paymentIdempotencyPolicy` 已更新。
- **F1 澄清（2026-10-14）**：cancel 對 **stale `pending`** 允許；契約 `cancelOrder` 描述與 `Order.refunded_at` 已對齊 research。

Constitution self-check: pass
