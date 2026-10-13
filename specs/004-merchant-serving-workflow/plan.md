# 系統分析規劃：點餐系統第四迭代－店家管理與出餐流程

## 輸入

- 規格：[spec.md](./spec.md)
- 技術研究：[research.md](./research.md)
- 技術堆疊：[techstack.md](./techstack.md)

## 專案結構

### 文件（本功能）

```text
specs/004-merchant-serving-workflow/
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
│   ├── pages/
│   │   ├── MerchantOrdersPage.jsx   # 新增
│   │   └── OrderLookupPage.jsx      # 擴充動態 status_label
│   ├── merchantOrderApi.js          # 新增
│   └── App.jsx                      # 路由或入口至店家頁
backend/
├── src/
│   ├── middleware/merchantAuth.js   # 新增
│   ├── routes/merchantOrders.js     # 新增
│   ├── services/merchantOrderService.js  # 新增（或擴充 orderService）
│   ├── repositories/orderRepository.js   # 擴充 list／transition
│   ├── lib/orderStatus.js           # 列舉與 status_label 映射
│   └── data/migrations/004_order_status.mssql.sql
```

**結構決策**：不重開專案；店家 API 掛載於同一 Express app，路徑前綴 `/api/merchant` 與顧客 `/api/orders` 分離。訂單讀寫共用 `orderRepository` 快照明細組裝邏輯。

## 設計決策

- 堆疊與 MSSQL 延續 [research.md](./research.md)「延續既有堆疊與訂單持久化」；店家驗證見「店家憑證驗證」。
- 狀態轉換採 **條件 UPDATE**（`WHERE status = expected`）；失敗回 409。依據：BR-002、spec 邊界並發、research「訂單狀態機與並發安全」。
- 三個 POST 動作對應三步狀態機；不接受任意 target status。依據：spec 假設、FR-007–FR-009。
- 顧客 `getOrder` 共用 `orderStatus.js` 映射。依據：FR-011、FR-014。
- 本迭代不含 menu CRUD、付款、取消。依據：spec 邊界。

### 設計決策·訂單狀態

- 列舉與標籤：`created`／已建立、`accepted`／已接單、`preparing`／出餐中、`completed`／已完成。依據：spec 邊界情況、SC-002–SC-004。

## 分析流程規劃

本段只規劃分析範圍與 Wave；結論見各端點產物。

### 端點盤點

本節為店家出餐流程之需求部位與端點對照（tasks 錨點 `plan:端點盤點`）。

| 需求部位 | 涉及的技術端點 |
|---|---|
| 店家訂單列表／詳情（FR-001–FR-003、SC-001） | 店家前端 UI、Merchant Orders API、MSSQL |
| 店家憑證（FR-010、SC-005） | Express merchantAuth、環境變數 |
| 接單（FR-004–FR-006、SC-002） | Merchant Orders API、MSSQL |
| 出餐中／完成（FR-007–FR-009、FR-015、SC-003） | Merchant Orders API、MSSQL |
| 快照金額不可變（FR-012–FR-013、SC-006） | Service 層忽略 body 金額欄位 |
| 顧客查詢同步（FR-014、SC-004） | 既有 Orders API、前端 OrderLookup |
| 狀態一致（FR-011） | 共用 `orders.status` 欄位 |

本次實際端點：**店家前端 UI、Merchant Orders API、既有顧客 Orders API（讀取擴充）、MSSQL**；不新增外部服務。

### 店家出餐流程：分析 Wave 排程

#### Wave 1：平行分析 UI 流程與訂單資料模型

1. **前端 UI 分析（Skill：`/ui-plan`）**
   - 輸出：`ui-plan.md`、`prototype/`
   - 邊界：店家訂單看板、狀態篩選、接單／出餐／完成、401 錯誤；顧客查詢狀態更新示意；不含 API schema。

2. **資料模型分析（Skill：`/data-plan`）**
   - 輸出：`data-model.dbml`
   - 邊界：`orders.status` 列舉、`status_updated_at`、狀態轉換 transaction 註記。

#### Wave 2：Merchant API 契約

1. **API 分析（Skill：`/api-plan`）**
   - 輸出：`contracts/http-api.yaml`
   - 前置：Wave 1 的 ui-plan、data-model
   - 邊界：merchant 列表／詳情／三 POST；擴充 `Order.status` enum；ErrorBody 401／409；不含付款。

## 委派摘要

| Wave | Skill id | 輸出產物 | 狀態 |
|---|---|---|---|
| Wave 1 | `/ui-plan` | `ui-plan.md`、`prototype/` | 已於本輪產出 |
| Wave 1 | `/data-plan` | `data-model.dbml` | 已於本輪產出 |
| Wave 2 | `/api-plan` | `contracts/http-api.yaml` | 已於本輪產出 |

## 交付前確認

- 需求追溯：FR-001–FR-015（004 spec）、FR-010–FR-013 全域、BR-001–BR-003、SC-001–SC-006、User Story 1–4。
- 不新增 spec 未定義的 menu 維護或付款 API。
- 契約與 data-model 欄位一致；tasks 依 openapi／dbml 錨點拆解。

## T002 契約對齊紀錄（2026-10-14）

- `OrderStatus` 四值與 spec 邊界、`data-model.dbml` `orders.status` Note 一致。
- 店家動作 POST body 為 `MerchantOrderActionRequest`（`additionalProperties: false`）。
- 列表上限 200 寫入 `x-contract-metadata.listMaxRows` 與 research「店家訂單列表與詳情」。
- **OpenAPI 權威**：本迭代以 **`004/contracts/http-api.yaml`** 為 merchant 與擴充後 `getOrder`／`Order` 的 implement 錨點。
- **T002 已完成（2026-10-14）**：已同步 **`003/contracts/http-api.yaml`** — 新增 `OrderStatus` 四值、`Order.status_updated_at`、`getOrder` 說明；與 004 一致。

Constitution self-check: pass
