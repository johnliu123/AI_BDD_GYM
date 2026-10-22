# 點餐系統第二迭代測試計畫

## 1. 計畫資訊

- **狀態**：已執行；後端、前端及瀏覽器案例通過
- **計畫版本／更新日**：v1；2026-10-20
- **審閱狀態／日期**：待審閱
- **需求範圍**：訪客 session cart、規格選擇、供應驗證、項目 CRUD、伺服器權威計價、價格變更及不可用項目處理
- **需求來源**：`spec.md`（US1–US2、FR-001–FR-008、FR-004–FR-005、BR-001–BR-003、SC-001–SC-005、Q9–Q11）
- **系統分析來源**：`plan.md`、`ui-plan.md`、`data-model.dbml`、`contracts/http-api.yaml`
- **測試環境來源**：`research.md`、`techstack.md`；backend `src/__tests__/testHelpers.js` 及各 cart／session tests
- **測試狀態約定**：本次執行結果記於第 10 節

## 2. 測試目標與範圍

需求與 Assert 以 `spec.md` 為準；API、session／CSRF、資料及 UI seams 僅依 system-analysis 產物與其指向的 001 菜單契約。計價只驗證服務端結果，不在 testplan 中重新定義資料庫、幣別或架構。

### 納入範圍

- US1：供應中餐點、規格群組／選項與訪客 cart 新增。
- US2：cart 讀取、空狀態、改數量、刪除、最新價格、不可用項目。
- FR-004：伺服器簽發 guest session 隔離及失效後呈現新空 cart。
- FR-005／BR-001：server-side price／option adjustment／quantity 計價與金額字串。
- Origin／CSRF、無效輸入與不可信 client amount 防護。

### 不納入範圍

- 訂單建立、付款、店家管理、跨裝置同步、登入、稅金、運費、折扣或多幣別。
- 研究／堆疊文件未固定的套件版本與幣別門檻。

## 3. 測試策略與優先級

| 測試層級 | 責任介面（依 system-analysis） | 驗證重點 |
|---|---|---|
| HTTP API | 002 `contracts/http-api.yaml`；菜單依 001 `http-api.yaml` | GET／POST／PATCH／DELETE、錯誤碼、Origin／CSRF、cookie 與 cart ownership |
| Backend unit／integration | `backend/src/__tests__/cart/`、`session/`、共用 `testHelpers.js`；Supertest + memory DB | 精確價格、交易原子性、session 隔離、失效與重設 |
| Frontend unit | `frontend/src/menuApi.test.js`、`cartApi.test.js` | selection/payload、API error 與回應資料處理 |
| UI 驗收 | `ui-plan.md` 指定的菜單規格流程與 `CartPage` | 規格未選阻止加入、數量／刪除、空車及 unavailable 呈現 |

- **P0**：session／CSRF 隔離、server-side 價格權威、供應狀態、規格群組驗證及不可用項目規則。
- **P1**：加入、檢視、更新、刪除及空狀態等故事主要流程。
- **P2**：純呈現或非阻擋性邊界。
- **通過／失敗**：比較 API/UI 觀察結果與精確金額字串、資料副作用；失敗操作不得留下部分 cart 變更。

## 4. 非功能需求追溯

本迭代 spec 未定義專屬 NFR；session 隔離、Origin／CSRF 與金額權威按 FR／BR 驗證，不另造效能門檻。

## 5. 使用者故事測試案例

### 5.1 使用者故事 1－將選擇規格的餐點加入購物車

**目標／獨立驗收**：有效訪客可加入供應中餐點與合法選項；購物車只屬於該 session。

**需求追溯**：US1 情境1–4、FR-001–FR-005、FR-004、BR-001–BR-002、BR-003、SC-001、SC-004。

| ID | 需求追溯 | 測試層級 | Public seam：system-analysis 測試入口 | 優先級 | Arrange：fixture 與差異 | Act：單一操作 | Assert：精確預期 |
|---|---|---|---|---|---|---|---|
| TP-001 | FR-002、FR-005、BR-002 | HTTP API | 001 `GET /api/menu-items` (`listMenuItems`) | P0 | `FX-MENU-MULTI-GROUPS`；一個餐點有兩組各兩個有效選項、價格／加價為十進位字串 | 讀取菜單 | [response] 回應列出每群組與選項 ID/name/price adjustment/is_active；價格保持字串且精確 |
| TP-002 | US1 情境1、FR-001–FR-002、FR-005、BR-001–BR-002、SC-001 | HTTP API | `GET /api/cart` (`getCart`)；`POST /api/cart/items` (`addCartItem`) | P0 | `FX-GUEST-CART-EMPTY`；有效 guest cookie／Origin／CSRF；供應中且無規格群組的餐點；數量 2 | 加入該餐點 | [response+state] 回 201；cart 含餐點、數量及正確項目／總金額；每次新增有獨立 cart item ID |
| TP-003 | US1 情境1、FR-001–FR-002、BR-002、SC-001 | HTTP API | `POST /api/cart/items` (`addCartItem`) | P0 | `FX-GUEST-CART-EMPTY`；供應中餐點有兩組；每組各提供一個有效選項 ID；有效 session／Origin／CSRF | 加入指定規格餐點 | [response+state] 回 201；cart item 保存兩個所選 option；金額依餐點價格、兩項加價及數量計算 |
| TP-004 | US1 情境4、FR-002、BR-002 | HTTP API | `POST /api/cart/items` (`addCartItem`) | P0 | `FX-GUEST-CART-EMPTY`；兩組規格僅選第一組；有效 session／Origin／CSRF | 提交不完整規格加入請求 | [response+state] 回 400；cart items 與 total 不變 |
| TP-005 | US1 情境2、FR-003、BR-001 | HTTP API | `POST /api/cart/items` (`addCartItem`) | P0 | `FX-GUEST-CART-EMPTY`；餐點 `is_active=false`；有效 session／Origin／CSRF | 加入停供餐點 | [response+state] 回 409 `CART_ITEM_UNAVAILABLE`；cart 不新增項目 |
| TP-006 | US1 情境3、FR-004、SC-004 | HTTP 整合 | `GET /api/cart` (`getCart`)；002 `POST /api/cart/items` (`addCartItem`) | P0 | `FX-GUEST-SESSION-PAIR`；session A 有 cart item；session B 由 server bootstrap 且 cookie／CSRF 不同 | 以 session B 讀取 cart | [response+state] 只回 B 的空 cart，不含 A item；不得接受 body／URL 自報 session ID 讀取 A cart |
| TP-007 | FR-001、FR-002、FR-004、SC-004 | HTTP API | `GET /api/cart` (`getCart`)；`POST /api/cart/items` (`addCartItem`) | P0 | `FX-GUEST-CART-EMPTY`；cart 不變前置狀態；有效 guest cookie | 以缺失／不允許的 Origin 或無效 CSRF token 發出寫入 | [response+state] 回 403；cart 與 item 數量不變 |
| TP-008 | US1、FR-001、FR-004、SC-004 | HTTP API | `GET /api/cart` (`getCart`) | P1 | `FX-EXPIRED-GUEST-SESSION`；舊 session 已超過 idle 24h 或 absolute 7d 且舊 cart 有 item；使用可控時鐘 | 使用舊 cookie 讀取 cart | [response+state] 簽發新 session；回新空 cart；不恢復舊 cart，不依賴 sleep |

### 5.2 使用者故事 2－檢視及管理購物車金額

**目標／獨立驗收**：顧客能讀取 cart、修改正整數數量、刪除項目；金額依最新 server menu 資料重算，不可用項目保留但不計價。

**需求追溯**：US2 情境1–7、FR-004–FR-008、FR-005、BR-001、BR-003、SC-002–SC-005、Q10–Q11。

| ID | 需求追溯 | 測試層級 | Public seam：system-analysis 測試入口 | 優先級 | Arrange：fixture 與差異 | Act：單一操作 | Assert：精確預期 |
|---|---|---|---|---|---|---|---|
| TP-009 | US2 邊界、FR-006、BR-001 | HTTP API | `GET /api/cart` (`getCart`) | P1 | `FX-GUEST-CART-EMPTY`；有效 session；cart item set 為空 | 讀取 cart | [response] 回 200、`items=[]`、總額為零的契約格式；不得產生虛構 item |
| TP-010 | US2 情境1–2、FR-006–FR-007、BR-001、BR-003、SC-002–SC-003 | HTTP API | `PATCH /api/cart/items/{item_id}` (`updateCartItemQuantity`) | P0 | `FX-CART-ONE-AVAILABLE-ITEM`；單價與 option 加價已知；原 quantity=1 | 更新 quantity 為 3 | [response+state] 回 200；quantity=3；line total 與 cart total 等於最新單價／加價乘 3 |
| TP-011 | US2 邊界、FR-007、BR-003 | HTTP API | `PATCH /api/cart/items/{item_id}` (`updateCartItemQuantity`) | P1 | `FX-CART-ONE-AVAILABLE-ITEM`；保存更新前 cart response | 將 quantity 設為 0、負數或非整數（分開案例或同一參數化輸入類別） | [response+state] 每個輸入回 400；cart 與金額維持原值；移除須使用 DELETE |
| TP-012 | US2 情境3、FR-007、BR-001、SC-003 | HTTP API | `DELETE /api/cart/items/{item_id}` (`deleteCartItem`) | P1 | `FX-CART-MULTI-AVAILABLE-ITEMS`；至少兩項且金額可區分 | 刪除其中一個 item ID | [response] 回 200；指定項目移除；剩餘項目及總額重新計算正確 |
| TP-013 | US2 情境4、FR-005–FR-007、BR-001、SC-003 | HTTP API | `GET /api/cart` (`getCart`) | P0 | `FX-CART-PRICE-CHANGED`；cart 已有 item；menu fixture 的最新餐點價或 option 加價已變更 | 重新讀取 cart | [response] 回應使用目前價格重算項目金額與總額，不沿用加入時舊價 |
| TP-014 | US2 情境6、FR-008、BR-001、SC-005 | HTTP API | `GET /api/cart` (`getCart`) | P0 | `FX-CART-MIXED-AVAILABILITY`；一個可用項目及一個餐點／選項已失效項目 | 讀取 cart | [response+state] 不可用項保留並標 `availability=unavailable`；不回傳該項目單價／line total、不計入總額；可用項仍正確計價 |
| TP-015 | US2 情境7、FR-008、BR-003、SC-005 | HTTP API | `PATCH /api/cart/items/{item_id}` (`updateCartItemQuantity`) | P0 | `FX-CART-UNAVAILABLE-ITEM`；item 因餐點或 option 停用而 unavailable | 修改 unavailable item 數量 | [response+state] 回 409 `CART_ITEM_UNAVAILABLE`；item、quantity 與總額不變 |
| TP-016 | US2 情境7、FR-008、BR-001、SC-005 | HTTP API | `DELETE /api/cart/items/{item_id}` (`deleteCartItem`) | P0 | `FX-CART-MIXED-AVAILABILITY`；指定 unavailable item ID，另有可用 item | 刪除 unavailable item | [response+state] 回 200；只移除指定 unavailable item；可用項保留且總額正確 |
| TP-017 | US2 情境5、FR-005、BR-001、SC-002 | HTTP API | `POST /api/cart/items` (`addCartItem`) | P0 | `FX-GUEST-CART-EMPTY`；有效 menu item／session；body 夾帶 `unit_price`、`line_total` 或 `total_amount` | 加入餐點並提交 client amount 欄位 | [response+state] 依 contract 回 400；cart 無新增項目；客戶端金額不得持久化或作計價依據 |
| TP-018 | US2 情境1、FR-006–FR-008、SC-002 | UI 手動驗收 | `ui-plan.md`「檢視與管理購物車」與「不可用購物車項目」流程；`CartPage` | P1 | `FX-CART-MIXED-AVAILABILITY`；有可用與不可用項目 | 開啟購物車並操作數量／刪除控制 | [response] 顯示規格、數量及可用項總額；不可用項省略金額、禁用數量但可刪除；最後項目刪除後呈空車 |
| TP-019 | US1 情境4、FR-002、BR-002 | UI 手動驗收 | `ui-plan.md`「選擇規格並加入供應中餐點」流程；`MealOptionsDialog` | P1 | `FX-MENU-MULTI-GROUPS`；兩組規格皆未選 | 未選齊所有群組即按加入 | [response] UI 拒絕操作並標示缺少選項；cart 不增加 item |

## 6. 非功能需求追溯

本 spec 未定義專屬 NFR；session、CSRF、供應與計價要求以 FR／BR 驗收，不新增數值門檻。

## 7. 具名 Fixture 與環境

| Fixture | 必要狀態、欄位與資料關聯 | 身分／權限 | 隔離與重設方式 |
|---|---|---|---|
| `FX-MENU-MULTI-GROUPS` | 餐點有兩個規格群組；每組有兩個有效選項；price／adjustment 是十進位字串 | 公開菜單 | menu fixture；每測試獨立讀取 |
| `FX-GUEST-CART-EMPTY` | server bootstrap 的有效 guest session、空 cart、CSRF token | guest + Origin／CSRF | `bootstrapCartSession(app)`；每案例新 session |
| `FX-GUEST-SESSION-PAIR` | session A 有 cart item；session B 為新空 cart；cookie／token 不同 | 兩個匿名 guest session | 每案例 bootstrap 兩個 session；不依執行順序 |
| `FX-EXPIRED-GUEST-SESSION` | 可控 clock 下過 idle 24h 或 absolute 7d 的 session；舊 cart 曾有 item | 舊 guest cookie | 可控時間，不使用 sleep；新 session 獨立建立 |
| `FX-CART-ONE-AVAILABLE-ITEM` | 一項 available item；price、selected option adjustment、quantity=1 已知 | guest session | memory DB 每案例 reset |
| `FX-CART-MULTI-AVAILABLE-ITEMS` | 至少兩個可用 item；金額彼此可辨識 | guest session | 每案例 reset cart |
| `FX-CART-PRICE-CHANGED` | cart 有 item；最新菜單價格與加入時不同 | guest session | 先建 cart，再由測試 fixture 更新 menu source；GET cart 重新計價 |
| `FX-CART-MIXED-AVAILABILITY` | 一筆 available、一筆 unavailable；明確預期總額僅含 available | guest session | 每案例 seed/reset；menu 與 cart 狀態獨立 |
| `FX-CART-UNAVAILABLE-ITEM` | cart item 因 menu item 或 selected option 停用而 unavailable | guest session | 每案例 reset；分別可覆蓋 item／option 停用 |

### 執行環境

- Backend：`backend/` 執行 `USE_MEMORY_DB=1 npm test`；Node test runner／Supertest；使用 `backend/src/__tests__/testHelpers.js` 的 session、cart helpers。
- Frontend：`frontend/` 執行 `npm test`；Node test runner；既有 `menuApi.test.js`、`cartApi.test.js`。
- UI 雛形：`prototype/index.html` 依 `ui-plan.md` 手動驗收；雛形 localStorage 不代表正式 session 機制。
- 資料金額以 002 contract／techstack 的精確十進位字串為準；測試不得以 JavaScript `Number` 推導期望值。
- 外部服務：不呼叫真實金流或其他第三方服務。

## 8. 執行與交接

### 快速狀態摘要

- **最後執行日期**：既有摘要未記逐案日期
- **已完成 TP**：TP-001–TP-019（既有執行摘要記錄通過）
- **進行中 TP**：無
- **未啟動 TP**：無
- **已知阻塞**：無；幣別與精度沿用已確認的 002 contract／techstack 政策。
- **下一步建議**：審閱計畫；若開始 TDD，先核對 002 與 001 菜單契約及 session／CSRF fixture。

### TDD 進入條件

- testplan 經審閱，並由單一 TP 案例與 public seam 開始；RED／GREEN／REFACTOR 依 `/tdd` 執行。
- 失效 session 測試使用可控時鐘；不得以 wall-clock sleep 驗收 timeout。

### 新 session 啟動檢查

1. 讀取所選 TP 案例與 `spec.md` 對應的 FR／BR／SC。
2. 核對 `contracts/http-api.yaml`、001 `http-api.yaml` 的 method/path/operationId、session／CSRF 與錯誤碼。
3. 核對 fixture 狀態、reset、memory DB、命令與非敏感環境設定。
4. 發現資料庫／精度或 contract 差異時，停下受影響案例並先更新來源／計畫，不自行改 Assert。

## 9. 需求至測試追溯

| User Story／需求 ID | 本計畫案例 |
|---|---|
| US1、FR-001、FR-003 | TP-002–TP-005 |
| US1、FR-002、BR-002 | TP-001、TP-003–TP-004、TP-019 |
| US1／US2、FR-004、SC-004 | TP-006–TP-008 |
| US2、FR-005、BR-001、SC-002–SC-003 | TP-002–TP-003、TP-008–TP-014、TP-017 |
| US2、FR-006–FR-007、BR-003 | TP-009–TP-013、TP-018 |
| US2、FR-008、SC-005 | TP-014–TP-016、TP-018 |

## 10. 待確認事項

- 金額幣別／precision／scale 沿用 002 contract／techstack 的已確認政策；本計畫不新增政策。
- 如本地 session store／Origin 部署設定與 test fixture 不一致，先修正測試環境設定；不得關閉安全驗證來讓案例通過。

## 10. 執行狀態追蹤

> 狀態依文件既有執行摘要回填；未記錄的逐案日期與 Assert 覆蓋度不推定。

| TP ID | 狀態 | 執行日期 | 紅燈驗證 | 綠燈驗證 | Assert 符合度 | 備註 |
|---|---|---|---|---|---|---|
| TP-001 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-002 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-003 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-004 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-005 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-006 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-007 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-008 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-009 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-010 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-011 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-012 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-013 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-014 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-015 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-016 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-017 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-018 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-019 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |

## 11. AI 自主決策與發現紀錄

| 日期 | TP 案例 | TDD 步驟 | 決策／發現內容 | 處置 |
|---|---|---|---|---|
| — | — | — | — | — |

## 12. 執行結果（既有紀錄）

- TP-001–TP-017：Backend cart／session／price tests 通過，涵蓋規格驗證、session 隔離、Origin／CSRF、伺服器計價、available/unavailable、價格更新、項目 CRUD 與 client amount 拒絕。
- TP-018–TP-019：瀏覽器驗收通過，不可用列省略金額、停用數量且可移除；未選齊規格時加入按鈕 disabled。
- Backend／Frontend 最終回歸通過。

Constitution self-check: pass
