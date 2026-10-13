# 技術堆疊：點餐系統第二迭代－購物車與金額計算

## 整體架構

延續目前前端專案的 JavaScript 架構：React + JavaScript + Vite 負責購物車介面，Node.js LTS + Express 提供 REST JSON API，**Microsoft SQL Server** 保存訪客工作階段與購物車關聯資料（菜單示範資料仍可由 `menuData.js` 提供）。購物車操作由後端依伺服器端訪客工作階段限定購物車，讀取目前菜單與規格價格後計算金額；本迭代不提供登入或帳號認證。

## 技術堆疊

| 領域 | 採用技術／決策 | 責任與用途 | 研究決策依據 | 版本或限制 |
|---|---|---|---|---|
| 前端 | React + JavaScript + Vite | 延續菜單前端，呈現購物車項目、規格、數量及金額 | [前端與 API 延續](./research.md#前端與-api-延續) | React、Vite 版本尚未固定；沿用 `.jsx`／`.js` 與現有 Vite 設定 |
| API 後端 | Node.js LTS + Express + REST JSON | 沿用既有菜單 API 取得擴充後的餐點規格資料，並提供購物車查詢、新增、數量修改及刪除端點 | [前端與 API 延續](./research.md#前端與-api-延續)、[伺服器權威計價與最新價格](./research.md#伺服器權威計價與最新價格) | Node.js LTS、Express 具體版本尚未固定；購物車端點與錯誤狀態碼已由 `contracts/http-api.yaml` 定義 |
| 資料庫 | Microsoft SQL Server | 保存訪客工作階段、購物車與選項關聯；以交易維持多筆更新一致性 | [關聯式購物車資料與交易](./research.md#關聯式購物車資料與交易) | Node **`mssql`** driver；環境變數 `MSSQL_*`；migration `001_cart_and_session.mssql.sql` |
| 金額表示 | 精確定點／十進位數值；SQL Server `DECIMAL`／`NUMERIC`；API 金額用十進位字串 | 避免貨幣運算的二進位浮點誤差；不以 JavaScript `Number` 計價；幣別與精度沿用菜單資料政策 | [金額精度與表示](./research.md#金額精度與表示) | T002 實作前核對既有菜單欄位的幣別、precision／scale 與映射；Decimal 函式庫由實作分析選定 |
| 訪客工作階段 | 研究建議：`express-session` + `connect-pg-simple`；session ID 放入伺服器簽發的 opaque HttpOnly cookie | 不建置登入；由 PostgreSQL session store 依 session ID 限定單一工作階段購物車 | [訪客工作階段與購物車歸屬](./research.md#訪客工作階段與購物車歸屬) | 候選套件尚待確認與安裝；**idle 24 小時、absolute 7 天**（spec Q10）；逾期後新 session 為空車，舊 cart 列定期清理（spec Q11）；正式 HTTPS 使用 Secure cookie |
| 錯誤格式 | 延續第一迭代 `ErrorBody` JSON 結構 | 回報驗證、授權、資料存取或計價失敗 | [請求輸入與資料驗證](./research.md#請求輸入與資料驗證) | HTTP 狀態碼與錯誤代碼依 `contracts/http-api.yaml` |

## 來源規格

- **來源規格**：[spec.md](./spec.md)

## 架構與部署限制

- 本迭代不提供登入或帳號認證；依 spec Q9，購物車按伺服器簽發的訪客工作階段隔離，不代表已驗證個人身份，不支援跨瀏覽器／裝置同步。
- 既有 `GET /menu-items` 由既有菜單資料來源擴充規格群組與選項；T003 完成來源、契約與驗收前，不得以雛形假資料作為正式規格選項來源。
- Session ID 只從伺服器端驗證過的 session cookie 解析；不得接受 request body、URL、localStorage 或任意 header 中自報的工作階段識別。Session store 失效時購物車操作失敗，不得回退至共用或記憶體購物車。
- Cookie 設為 `HttpOnly`、`SameSite=Lax`、`Path=/`，不設 `Domain`；正式 HTTPS 部署設 `Secure`，session signing secret 從環境設定取得且不得提交至版本控制。SameSite 不單獨作為 CSRF 防護；狀態變更請求須通過精確 Origin 與 session-bound CSRF token 驗證。
- Session cookie 不設持久 `Max-Age`；瀏覽器可能還原 session cookie，伺服器仍須執行 **idle 24 小時、absolute 7 天**（spec Q10）並在逾期後使 session 失效；失效後 API 對使用者只呈現新空購物車，舊 cart 資料列由定期清理移除（spec Q11）。
- 購物車狀態變更（POST／PATCH／DELETE）須先以 `GET /cart` 取得 session-bound `csrf_token`，並以 `X-CSRF-Token` header 與精確 Origin 驗證；契約見 [contracts/http-api.yaml](./contracts/http-api.yaml)（`CartResponse.csrf_token`、403 `CSRF_TOKEN_INVALID`）。
- T002 須確認菜單金額來源的幣別、precision／scale 與資料轉換路徑；未完成前不得實作計價，且不得將金額轉為 JavaScript `Number` 作為計價依據。
- 前端只送出餐點／規格識別碼與數量；餐點供應狀態、最新價格、規格加價與購物車金額由後端讀取及計算。
- 新增購物車項目及所選規格明細需具交易原子性；session／CSRF 驗證失敗或資料庫交易失敗時，不可留下部分變更。
- 第一迭代 DBML 指定 PostgreSQL，但第一迭代技術堆疊摘要稱資料庫供應商尚未指定；此處依資料模型延續 PostgreSQL，後續資料計畫應統一來源文件。
- 本迭代不含訂單建立、付款、稅金、運費、折扣或店家管理；不得將購物車總額描述為含其他費用的最終應付訂單金額。

## 尚未固定的版本與選項

- React、Vite、Node.js、Express、PostgreSQL 的具體版本尚未固定。
- `express-session` + `connect-pg-simple` 是研究建議，尚未確認採用或安裝；PostgreSQL driver 與這些套件的相容版本亦待確認。
- T002 尚須確認幣別與 `NUMERIC` 欄位 precision／scale；Decimal 函式庫由實作分析選定。

## 實作落地紀錄（Phase 1）

### T001 — 訪客 session 邊界（2026-10-13）

| 項目 | 決策／證據 |
|---|---|
| 部署位置 | 本地開發：`backend/src/server.js`（Express）；前端 Vite `http://localhost:5173` |
| Session store（現況） | **`guest_sessions` 表**；**`npm start`** 讀 `backend/.env` 的 **`MSSQL_*`** 連線；**`npm test`** 設 **`USE_MEMORY_DB=1`** 走 memory-sql；正式 **`NODE_ENV=production`** 必須設定 MSSQL 環境變數 |
| Cookie | 名稱 `guest_session`；`HttpOnly`、`SameSite=Lax`、`Path=/`；無 `Max-Age`／`Expires` |
| Timeout（Q10） | 預設 **idle 24h**、**absolute 7d**（`SESSION_IDLE_TIMEOUT_MS`／`SESSION_ABSOLUTE_TIMEOUT_MS` 可覆寫） |
| Cart 清理（Q11） | `runSessionMaintenance`（`backend/src/jobs/sessionMaintenance.js`）定期 prune session 並 **DELETE 孤兒 carts**；測試見 `cart-session-maintenance.test.js`、`cart-session-expiry-api.test.js` |
| Origin／CSRF | `ALLOWED_ORIGINS` 預設含 `http://localhost:5173`；寫入需 `Origin` + `X-CSRF-Token` |
| 驗收測試 | `backend/src/__tests__/session/cart-session-boundary.test.js` |

### T002 — 金額精度（2026-10-13）

| 項目 | 決策／證據 |
|---|---|
| 幣別 | **TWD**（示範資料；無多幣別） |
| 精度 | **scale 2**（`220.00`、`10.00` 等字串） |
| 菜單來源 | `backend/src/data/menuData.js` → `menuRepository.listMenuItems` 序列化為 **十進位字串** |
| 計價路徑 | `backend/src/services/money.js`（`BigInt` 分為單位）；**不得**以 `Number` 作權威計價 |
| DBML 對齊 | `menu_items.price`、`menu_item_options.price_adjustment` → **`NUMERIC(10,2)`**（`data-model.dbml`） |
| API 契約 | `MoneyAmount` 十進位字串；路由前綴實作為 **`/api/cart`**（閘道／001 菜單同 `/api` 前綴） |

### Phase 2–5 實作摘要（2026-10-13）

| 項目 | 證據 |
|---|---|
| 資料層 | `cartRepository.js`、`guestSessionRepository.js`；migration `001_cart_and_session.mssql.sql` |
| API | `routes/cart.js` — GET／POST／PATCH／DELETE `/api/cart…`；OpenAPI 欄位 `availability`、`line_total`、`csrf_token` |
| 前端 | `cartApi.js`、`MealOptionsDialog.jsx`、`CartPage.jsx`、`MenuPage.jsx` |
| 測試 | backend **27**、frontend **8** 全過；T023 瀏覽器手動驗收待本機啟動 `backend` + `frontend` dev server |
| npm 備註 | 測試用 **memory-sql**；本機 SQL Server 需先建立資料庫（預設 `AI_BDD_GYM`）並設定 `backend/.env`（見 `.env.example`） |

## 已確認政策

- 餐點加入後變為未供應或所選規格失效時，既有購物車項目保留並標示不可用；該項目不計價、不計入總額、不可修改數量但允許刪除（spec Q8、FR-008）。
- API 金額固定以精確十進位字串序列化；伺服器不得以 JavaScript `Number` 或浮點轉換作為計價依據。
- 訪客 session **idle 24 小時、absolute 7 天**（spec Q10）；session 失效後使用者只會看到新空購物車，舊 cart 列與 session store 同步週期清理（spec Q11）。
