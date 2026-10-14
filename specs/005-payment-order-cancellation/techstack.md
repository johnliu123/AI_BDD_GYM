# 技術堆疊：點餐系統第五迭代－付款與取消訂單

## 005 前置（004 依賴）

- **出餐狀態**：`orderStatus.js` 四段狀態機與 merchant POST 已存在；005 新增 `cancelled` 標籤與 merchant 動作拒絕邏輯。
- **訂單讀寫**：`orderRepository` 組裝 `Order`；005 擴充 payment 欄位映射與 `paymentStatus.js`。
- **顧客寫入**：建單 CSRF／Origin 政策沿用 003；pay／cancel 同級。

## 整體架構

延續第四迭代：React + Vite、Express、`/api/orders` 與 `/api/merchant/orders`。本迭代新增 **付款 stub**（程序內同步）、**payment_idempotency_keys**、顧客 **pay／cancel** POST；`orders` 表擴充 payment 與 `cancelled` 出餐狀態。

## 技術堆疊

| 領域 | 採用技術／決策 | 責任與用途 | 研究決策依據 | 版本或限制 |
|---|---|---|---|---|
| 前端（顧客） | React + `orderApi.js` | 付款、取消、查詢顯示 payment 欄位 | [前端](./research.md#前端) | 擴充 `OrderLookupPage`／`MenuPage` 成功區 |
| 前端（店家） | `MerchantOrdersPage.jsx` | 付款狀態欄位與篩選 | 同上 | 擴充 004 看板 |
| API 後端 | Express | `POST …/pay`、`POST …/cancel`；擴充 GET | [延續既有堆疊與訂單持久化](./research.md#延續既有堆疊與訂單持久化) | `paymentService.js`、`routes/orders.js` |
| 模擬金流 | `paymentStub.js` + env | 同步 success／failure | [模擬金流stub](./research.md#模擬金流stub) | `PAYMENT_SIMULATE_OUTCOME`；dev body 須 `ALLOW_PAYMENT_SIMULATE_BODY=true` |
| 付款狀態 | `paymentStatus.js` | 列舉、中文 label、轉換驗證 | [付款狀態機與並發](./research.md#付款狀態機與並發) | `unpaid`／`pending`／`paid`／`failed`／`refunded` |
| 冪等 | `payment_idempotency_keys` | pay POST Idempotency-Key | [付款冪等](./research.md#付款冪等) | TTL 預設 24h（`IDEMPOTENCY_TTL_MS`） |
| 資料庫 | Microsoft SQL Server | payment 欄位、`cancelled` status | [付款狀態機與並發](./research.md#付款狀態機與並發) | migration `005_payment_cancel.mssql.sql` |
| 店家 API | 004 merchant 群組 | list `payment_status` 篩選 | [顧客店家-api-擴充](./research.md#顧客店家-api-擴充) | 401／503 語意不變 |
| 錯誤格式 | `ErrorBody` | 409 付款／取消語意碼 | 003／004 契約 | 見 `contracts/http-api.yaml` |

## 來源規格

- **來源規格**：[spec.md](./spec.md)

## 架構與部署限制

- Production **不得**依賴 `PayOrderRequest.simulate_outcome`；預設 **`PAYMENT_SIMULATE_OUTCOME=success`**。
- pay／cancel **不得**採信 body 內 `total`、明細或 order_number 覆寫（FR-010）。
- **`PAYMENT_PENDING_STALE_SEC`** 預設 **120**；逾時後允許對 stuck `pending` 重入 stub。
- 本迭代不含真實金流、發票、部分退款。
- 測試 `USE_MEMORY_DB=1` 須同步 payment 欄位與 `payment_idempotency_keys`。

## 尚未固定的版本與選項

- 正式金流供應商與 webhook 架構：未決（spec 假設 stub）。
- pending 逾時秒數可調 env，預設 120。

## 已確認政策

- 出餐 `completed` 不代表已付款（BR-002）；付款 `paid` 與出餐狀態正交。
- 取消僅 **`created`**；**非 stale** pending 取消 **409** `PAYMENT_IN_PROGRESS`；**stale pending** 可取消並中止為 `failed`（見 research F1 定案）。

## 005 smoke（本機）

**自動（memory DB，與 CI 相同）**

1. `backend/`：`npm run verify:migrations`（靜態檢查 `001`–`005` migration 與 005 DDL 錨點，**無需 MSSQL**）。
2. `backend/`：`USE_MEMORY_DB=1 npm test`（含 payment／cancel／merchant guard 整合測試）。
3. `backend/`：`USE_MEMORY_DB=1 npm run smoke:005`（建單→pay→merchant 詳情→cancel 一條龍）。
4. `frontend/`：`npm test`（含 `orderApi`、`orderPaymentUi`）。

**MSSQL migration 煙測（本機／CI）**

5. 設定 `backend/.env` 之 `MSSQL_*`（勿設 `USE_MEMORY_DB=1`），資料庫可不存在（腳本會建立）。
6. `backend/`：`npm run smoke:mssql:005` — 執行 `runMigrations` 後 assert `orders.payment_*`／`refunded_at` 與 `payment_idempotency_keys` 存在。
7. **CI**：`.github/workflows/backend-ci.yml` 之 `memory-and-migrations`（步驟 1–3）與 **`mssql-migration-smoke`**（步驟 5–6 對 SQL Server 2022 service container）於 push／PR 觸發。

**瀏覽器手動（對照 ui-plan US1–US5）**

8. 後端：`USE_MEMORY_DB=1`、`MERCHANT_TOKEN=test-merchant-token`；dev 若要 UI「模擬失敗」勾選，另設 **`ALLOW_PAYMENT_SIMULATE_BODY=true`**、`NODE_ENV=development`。
9. 前端：`npm run dev`；建單→付款→查詢雙標籤；勾選 dev 模擬失敗→再付款成功；`created` 訂單取消；店家看板付款篩選／cancelled 無接單鈕。
10. 409（例如已付款再按付款）應出現 **toast** 與表單區錯誤文案。

**備註**

- `PAYMENT_TEST_ABORT_AFTER_PENDING=1` 僅整合測試用（`.env.example`）。
- E2E 瀏覽器自動化留待後續迭代；005 資料層以 **verify:migrations** + **memory 測試** + **CI MSSQL schema smoke** 驗證 migration。

<!-- Constitution self-check: pass -->
