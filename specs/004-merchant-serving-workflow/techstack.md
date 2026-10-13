# 技術堆疊：點餐系統第四迭代－店家管理與出餐流程

## 004 前置（003 依賴）

- **訂單持久化**：`orderRepository.insertOrderHeader`／`insertOrderItemRow` 寫入 `orders`／`order_items`／`order_item_options` 快照；`loadOrderByNumberAndSession` 供顧客 `GET /api/orders/{order_number}`；004 新增 `loadOrderByOrderNumber`（店家詳情）與 `listOrdersForMerchant`。
- **組裝**：`assembleOrder` 回傳 `status`、`status_label`（`orderStatus.js`）、`total`、明細；狀態轉換不得改變金額與明細（BR-001）。
- **契約**：003 `getOrder` 之 `Order.status` enum 已與 004 四值對齊（T002）。

## 整體架構

延續第三迭代：React + Vite 顧客端、Express REST API、**Microsoft SQL Server** 訂單表。新增**店家後台**路由與 `/api/merchant/orders` API 群組；以 **`X-Merchant-Token`** 與 **`MERCHANT_TOKEN`** 保護。訂單狀態在同一 `orders` 列更新；顧客 `GET /api/orders/{order_number}` 讀取更新後 `status`／`status_label`。

## 技術堆疊

| 領域 | 採用技術／決策 | 責任與用途 | 研究決策依據 | 版本或限制 |
|---|---|---|---|---|
| 前端（顧客） | React + JavaScript + Vite | 訂單查詢顯示動態狀態 | [顧客查詢同步](./research.md#顧客查詢同步) | 擴充 `OrderLookupPage`／成功頁 |
| 前端（店家） | React + `merchantOrderApi.js` + `MerchantOrdersPage` | 訂單佇列、接單、出餐、完成 | [店家管理介面（前端）](./research.md#店家管理介面前端) | `VITE_MERCHANT_TOKEN` 僅 dev 注入 |
| API 後端 | Node.js + Express | 店家列表／詳情／狀態 POST；擴充顧客 `getOrder` 映射 | [延續既有堆疊與訂單持久化](./research.md#延續既有堆疊與訂單持久化) | `routes/merchantOrders.js`、`middleware/merchantAuth.js` |
| 店家驗證 | `X-Merchant-Token` header | 401／503 | [店家憑證驗證](./research.md#店家憑證驗證) | 常數時間比對；與 CSRF／guest session 分離 |
| 資料庫 | Microsoft SQL Server | `orders.status`、`orders.status_updated_at` | [訂單狀態機與並發安全](./research.md#訂單狀態機與並發安全) | migration `004_order_status.mssql.sql`；memory DB 同步 |
| 狀態機 | `created`→`accepted`→`preparing`→`completed` | POST 動作端點 | 同上 | 409 `ORDER_STATUS_CONFLICT` |
| 錯誤格式 | 延續 `ErrorBody` | 401／404／409 | 003 契約 | 見 `contracts/http-api.yaml` |

## 來源規格

- **來源規格**：[spec.md](./spec.md)

## 架構與部署限制

- **Production 禁止** `VITE_MERCHANT_TOKEN`：Vite 會將變數編進 client bundle，等同公開 secret。正式環境請以反向代理、BFF 或內網後台注入 `X-Merchant-Token`；前端 production build 僅顯示設定指引（`resolveMerchantToken` 在非 `DEV` 不讀 Vite env）。
- 店家 API **不得**接受訪客 cookie 作為授權；顧客 API **不得**用 merchant token 查他人 session 訂單。
- 狀態更新請求 body 為空或固定 schema，**不得**含金額或明細（FR-013）。
- 本迭代不含餐點 CRUD、付款、取消（spec 邊界）。
- 測試 `USE_MEMORY_DB=1` 須支援 `status_updated_at` 與條件 UPDATE。
- 列表預設上限 **200** 筆（契約註記）；無分頁。

### 本機店家看板 smoke

1. 後端：在 `backend/.env` 設定 `MERCHANT_TOKEN`（與前端相同字串）。
2. 前端：在 `frontend/.env` 設定 `VITE_MERCHANT_TOKEN`；`npm run dev` 後開啟 `#/merchant`。
3. 另開顧客分頁送單，於店家看板重新整理後接單→出餐→完成；顧客「查詢訂單」按「重新查詢」確認 `status_label` 同步。

## 尚未固定的版本與選項

- 正式環境 merchant token 注入方式（反向代理 header、Secrets Manager）由部署 tasks 決定。
- **SCA**：`backend` 使用 **`mssql@^12.7.5`**；以 `npm run audit:sca` 追蹤（**0 moderate+**）。**Node 20** 連 MSSQL 時載入 `polyfills/nodePromiseWithResolvers.js`（`tedious@20` 需 `Promise.withResolvers`）；**Node 22+** 原生支援。CI／建議本機版本見 `backend/.nvmrc`（22）。
- 是否新增 React Router：`App.jsx` 目前僅 `MenuPage`；可 URL hash 或輕量 router 區分 `/merchant`。

## 已確認政策

- 快照金額與明細在狀態轉換中不可變（BR-001）。
- 「已完成」不代表已付款（spec 假設）。

<!-- Constitution self-check: pass -->
