# 技術堆疊：點餐系統第三迭代－訂單建立與查詢

## 整體架構

延續第二迭代：React + Vite 前端、Express REST API、**Microsoft SQL Server** 持久化訪客 session、購物車與**新增之訂單／冪等鍵**表。顧客在購物車頁確認送單；後端於單一交易內驗證 cart、寫入訂單快照、清空 cart；查詢僅限建立訂單之同一 `guest_session`。

## 技術堆疊

| 領域 | 採用技術／決策 | 責任與用途 | 研究決策依據 | 版本或限制 |
|---|---|---|---|---|
| 前端 | React + JavaScript + Vite | 購物車確認送單、訂單成功頁、訂單編號查詢 UI | [延續既有前後端與訪客工作階段](./research.md#延續既有前後端與訪客工作階段) | 沿用 `frontend/`；新增 `orderApi.js`、路由或頁面 |
| API 後端 | Node.js + Express + REST JSON | `POST /api/orders`、`GET /api/orders/{order_number}` | 同上 | 沿用 `backend/src/server.js`；CSRF／Origin 同 cart |
| 資料庫 | Microsoft SQL Server | `orders`、`order_items`、`order_item_options`、`order_idempotency_keys` | [訂單建立交易與購物車清空](./research.md#訂單建立交易與購物車清空) | migration `003_orders.mssql.sql`；**`mssql@10.0.4`**（`tedious@16`，Node **18.19–21**／你目前 **20.x**）；升 Node **22+** 可改回 `mssql` 12 |
| 金額表示 | `money.js` + `DECIMAL(10,2)` + API 十進位字串 | 建立時快照；查詢讀快照 | [訂單金額快照與查詢權威](./research.md#訂單金額快照與查詢權威) | 不得用 `Number` 作權威計價 |
| 訪客工作階段 | `guest_session` cookie + `guest_sessions` 表 | 訂單歸屬與查詢授權 | [訂單查詢授權](./research.md#訂單查詢授權) | idle 24h、absolute 7d（002 Q10） |
| 冪等 | `Idempotency-Key` header + DB 表 | 防重複送單 | [冪等鍵與避免重複送單](./research.md#冪等鍵與避免重複送單) | 預設保留 24h（`IDEMPOTENCY_TTL_MS` 可覆寫） |
| 訂單編號 | `ORD-YYYYMMDD-` + 8 hex | 顧客可引用唯一編號 | [訂單編號產生](./research.md#訂單編號產生) | `order_number` UNIQUE |
| 錯誤格式 | 延續 `ErrorBody` | 空車、不可用項目、查無訂單等 | 002 契約 | 見 `contracts/http-api.yaml` |

## 來源規格

- **來源規格**：[spec.md](./spec.md)

## 架構與部署限制

- 不提供登入；訂單查詢不得跨 session（FR-010）。
- `POST /api/orders` 須通過 Origin 與 `X-CSRF-Token`（先 `GET /api/cart` bootstrap）；`GET /api/orders/{order_number}` 為 GET，沿用 session cookie，不修改狀態。
- 建立訂單請求 body **不得**包含權威金額欄位；`CreateOrderRequest` 不允許額外欄位（非法 body → **400**）。
- 前端送單須附 `Idempotency-Key`（建議 `crypto.randomUUID()`）；後端同 session 以 process 內 mutex 序列化建單，降低無 key 並行重複訂單（多實例部署仍應依 key／DB 鎖）。
- 本迭代不含付款、取消、店家狀態更新、稅運費。
- 訂單建立與 002 購物車共用同一 SQL Server 實例；測試環境 `USE_MEMORY_DB=1` 須擴充 memory schema 含訂單表。

## 尚未固定的版本與選項

- 冪等過期清理是否併入 `sessionMaintenance.js` 或獨立 job。
- 前端路由結構（單頁 state vs React Router）由 UI 實作決定，須覆蓋 US1／US2 流程。

## 已確認政策

- 初始訂單狀態 API 顯示「已建立」、內部 `created`。
- 含不可用項目的 cart 不得建單；建單成功後 cart 為空。

## 003 前置（T001）

- **Guest session**：`backend/src/middleware/guestSession.js` 透過 `attachGuestSession` 呼叫 `cartService.ensureSession`；HttpOnly `guest_session` cookie 與 002 相同。
- **購物車讀取／可用性**：`cartService.readCart` → `cartRepository.loadCartRows` + `cartPricing.buildCartState`（`availability: available|unavailable`、伺服器計價 `unit_price`／`line_total`／`total`）。
- **金額**：`money.js` 的 `formatMoney`／`addMoneyStrings` 產生 API 十進位字串（見 `order-prerequisites.test.js`）。
- **CSRF bootstrap**：訂單 `POST` 沿用 002 `GET /api/cart` 回傳之 `csrf_token` 與 `X-CSRF-Token`／`Origin` 政策（002 `openapi:getCart`）。
- **驗證**：`backend/src/__tests__/orders/order-prerequisites.test.js` 於 `USE_MEMORY_DB=1` 下通過。

<!-- Constitution self-check: pass -->
