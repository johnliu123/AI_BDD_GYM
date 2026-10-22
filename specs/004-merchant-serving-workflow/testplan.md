# 點餐系統第四迭代測試計畫

## 1. 計畫資訊

- **狀態**：已執行；API、整合及瀏覽器案例通過
- **計畫版本／更新日**：v1；2026-10-20
- **審閱狀態／日期**：待審閱
- **需求範圍**：店家訂單列表／詳情、token 授權、接單、出餐狀態前進、快照不可變及顧客查詢同步
- **需求來源**：`spec.md`（US1–US4、FR-001–FR-015、BR-001–BR-003、SC-001–SC-006）
- **系統分析來源**：`plan.md`、`ui-plan.md`、`data-model.dbml`、`contracts/http-api.yaml`；顧客訂單查詢依更新後 `../003-order-creation-inquiry/contracts/http-api.yaml`
- **測試環境來源**：`research.md`、`techstack.md`；backend order tests、共用 `src/__tests__/testHelpers.js`
- **測試狀態約定**：本次執行結果記於第 10 節

## 2. 測試目標與範圍

需求／狀態機語意依 `spec.md`；API method/path、授權與資料欄位依 004 system-analysis 契約；顧客查詢依 plan 指定的 003 更新契約。本計畫不測 menu CRUD、付款或取消。

### 納入範圍

- US1：店家訂單列表、status 篩選、最多 200 筆、詳情快照及 token 保護。
- US2：`created → accepted` 接單、合法時間戳、拒絕重複／非法接單。
- US3：`accepted → preparing → completed`，拒絕跳步／逆向，並發條件更新。
- US4：顧客 `getOrder` 讀到店家持久化最新狀態及原快照。
- FR-012／FR-013：出餐狀態操作不能改變訂單明細或金額。

### 不納入範圍

- 分級 RBAC、菜單維護、付款／取消、訂單建立及跨瀏覽器查詢。
- 真實金流、UI 自動化 E2E、未定義的效能門檻。

## 3. 測試策略與優先級

| 測試層級 | 責任介面（依 system-analysis） | 驗證重點 |
|---|---|---|
| HTTP API | `listMerchantOrders`、`getMerchantOrder`、三個 merchant POST actions、003 `getOrder` | token、篩選、狀態碼、穩定 status／label 及快照 |
| HTTP integration | `backend/src/__tests__/orders/`、Supertest、memory DB | 條件 UPDATE、狀態機、並發、顧客／店家資料一致 |
| UI 手動驗收 | `ui-plan.md` 的 Merchant Orders 看板及 Order Lookup | 列表、詳情、狀態按鈕、錯誤及顧客同步 |

- **P0**：授權拒絕、非法狀態轉換／並發衝突、snapshot 不可變、持久化狀態一致。
- **P1**：訂單列表／詳情與正常出餐旅程。
- **P2**：非必要呈現不列入本迭代。
- **通過／失敗**：比對 contract response、DB status/timestamp、snapshot；競態時僅允許 contract 定義的成功／409 結果。

## 4. 非功能需求追溯

本 spec 未定義專屬 NFR；token、資料隔離及狀態權威以 FR／BR 驗收，不另增效能門檻。

## 5. User Story 測試案例

### 5.1 使用者故事 1－店家檢視訂單佇列與明細

**目標／獨立驗收**：有效店家憑證可查看列表與明細，資料依建立時間／狀態呈現且快照一致。

**需求追溯**：US1 情境1–4、FR-001–FR-003、FR-010–FR-012、BR-001、SC-001、SC-005。

| ID | 需求追溯 | 測試層級 | Public seam：system-analysis 測試入口 | 優先級 | Arrange：fixture 與差異 | Act：單一操作 | Assert：精確預期 |
|---|---|---|---|---|---|---|---|
| TP-001 | US1 情境1、FR-001、FR-003、SC-001 | HTTP API | `GET /api/merchant/orders` (`listMerchantOrders`) | P1 | `FX-MERCHANT-201-ORDERS`；有效 merchant token；201 筆 `created_at` 可排序訂單 | 讀取預設列表 | [response] 回 200；最多 200 筆；依 `created_at` 降序；摘要欄位含 number/status/time/total snapshot |
| TP-002 | US1 情境1、FR-003、SC-001 | HTTP API | `GET /api/merchant/orders?status=accepted` (`listMerchantOrders`) | P1 | `FX-MERCHANT-MIXED-STATUS`；至少 created、accepted、completed 訂單 | 以有效 status 篩選 | [response] 回 200；每筆 status 均為 accepted；排序仍依 contract |
| TP-003 | US1、FR-003、spec 邊界 | HTTP API | `GET /api/merchant/orders?status={status}` (`listMerchantOrders`) | P1 | `FX-MERCHANT-MIXED-STATUS`；有效 token | 以非法 status 篩選 | [response] 回 400 `INVALID_STATUS_FILTER`；不改任何訂單 |
| TP-004 | US1 情境2、FR-002、FR-012、BR-001、SC-001、SC-006 | HTTP API | `GET /api/merchant/orders/{order_number}` (`getMerchantOrder`) | P0 | `FX-ORDER-SNAPSHOT-PRICE-CHANGED`；有效 token；menu price 已不同於 order snapshot | 讀取店家訂單詳情 | [response] 回完整明細／總額快照，與建立當下一致；不讀最新菜單價格重算 |
| TP-005 | US1 情境3、FR-010、SC-005 | HTTP API | `GET /api/merchant/orders`／`GET /api/merchant/orders/{order_number}` | P0 | `FX-MERCHANT-AUTH`；分別缺 token、錯 token；credential 設定有效 | 呼叫受保護讀取 endpoint | [response] 回 401 `MERCHANT_UNAUTHORIZED`；不回傳訂單內容 |
| TP-006 | FR-010、spec 邊界 | HTTP API | `GET /api/merchant/orders` (`listMerchantOrders`) | P0 | `FX-MERCHANT-NOT-CONFIGURED`；程序未設定 `MERCHANT_TOKEN` | 呼叫列表 | [response] 回 503 `MERCHANT_NOT_CONFIGURED`；不回傳訂單內容 |

### 5.2 使用者故事 2－店家接受訂單

**目標／獨立驗收**：僅 `created` 訂單可接單；成功後持久化 `accepted` 與時間戳，snapshot 不變。

**需求追溯**：US2 情境1–4、FR-004–FR-006、FR-010–FR-013、BR-001–BR-003、SC-002、SC-005–SC-006。

| ID | 需求追溯 | 測試層級 | Public seam：system-analysis 測試入口 | 優先級 | Arrange：fixture 與差異 | Act：單一操作 | Assert：精確預期 |
|---|---|---|---|---|---|---|---|
| TP-007 | US2 情境1、FR-004–FR-005、FR-012、BR-001、SC-002、SC-006 | HTTP API | `POST /api/merchant/orders/{order_number}/accept` (`acceptMerchantOrder`) | P0 | `FX-ORDER-CREATED`；有效 merchant token；記錄 status/timestamp/total/items | 接受訂單 | [response] 回 200；status=`accepted`；狀態時間更新；items 與 total snapshot 不變 |
| TP-008 | US2 情境2、FR-006、BR-002、SC-002 | HTTP API | `POST /api/merchant/orders/{order_number}/accept` (`acceptMerchantOrder`) | P0 | `FX-ORDER-NON-CREATED`；status 分別為 accepted、preparing、completed | 再次接單 | [response] 每種狀態回 409 `ORDER_STATUS_CONFLICT`；狀態、時間與 snapshot 不變 |
| TP-009 | US2 情境3、FR-010、SC-005 | HTTP API | `POST /api/merchant/orders/{order_number}/accept` (`acceptMerchantOrder`) | P0 | `FX-ORDER-CREATED`；無效／缺漏 merchant token | 接單 | [response+state] 回 401；order 狀態與資料不變 |

### 5.3 使用者故事 3－店家更新出餐狀態並完成訂單

**目標／獨立驗收**：狀態依序前進，跳步、逆向及並發衝突拒絕，資料仍一致。

**需求追溯**：US3 情境1–5、FR-007–FR-009、FR-010–FR-013、FR-015、BR-001–BR-003、SC-003、SC-005–SC-006。

| ID | 需求追溯 | 測試層級 | Public seam：system-analysis 測試入口 | 優先級 | Arrange：fixture 與差異 | Act：單一操作 | Assert：精確預期 |
|---|---|---|---|---|---|---|---|
| TP-010 | US3 情境1、FR-007、FR-015、BR-002、SC-003 | HTTP API | `POST /api/merchant/orders/{order_number}/start-preparing` (`startPreparingMerchantOrder`) | P0 | `FX-ORDER-ACCEPTED`；有效 token | 開始出餐 | [response] 回 200；status=`preparing`；狀態時間更新；snapshot 不變 |
| TP-011 | US3 情境2、FR-008、FR-015、BR-002、SC-003 | HTTP API | `POST /api/merchant/orders/{order_number}/complete` (`completeMerchantOrder`) | P0 | `FX-ORDER-PREPARING`；有效 token | 完成訂單 | [response] 回 200；status=`completed`；狀態時間更新；金額／明細不變 |
| TP-012 | US3 情境3–4、FR-009、BR-002、SC-003 | HTTP API | `startPreparingMerchantOrder`／`completeMerchantOrder`／`acceptMerchantOrder` | P0 | `FX-ORDER-ILLEGAL-TRANSITIONS`；準備 created→start、created→complete、completed→accept 等非法組合 | 執行一個非法狀態動作 | [response] 每種組合回 409 `ORDER_STATUS_CONFLICT`；狀態與 timestamp 不變 |
| TP-013 | US3 邊界、FR-009、BR-002 | HTTP integration | 兩個並行 `POST /api/merchant/orders/{order_number}/accept` | P0 | `FX-ORDER-CREATED-CONCURRENT`；兩請求同步讀到 created；有效 token | 並行接單 | [response] 一個成功、一個回 409；最終 status=`accepted` 且只有一次狀態轉換 |
| TP-014 | US3 情境5、FR-010、SC-005 | HTTP API | `POST /api/merchant/orders/{order_number}/start-preparing` | P0 | `FX-ORDER-ACCEPTED`；無有效 token；記錄狀態 | 更新出餐狀態 | [response] 回 401；狀態與時間不變 |
| TP-015 | US3、FR-012–FR-013、BR-001、SC-006 | HTTP API | 004 merchant action request body；response contract | P0 | `FX-ORDER-ACCEPTED`；action body 帶偽造 total／item amount | 執行 start-preparing | [response+state] 回 200；僅狀態前進，持久化及 response snapshot 的金額／items 不變；contract 明列忽略欄位。已通過。 |

### 5.4 使用者故事 4－顧客查詢反映店家更新後的訂單狀態

**目標／獨立驗收**：店家狀態更新後，owner session 查詢讀取同一持久化狀態，snapshot 不變。

**需求追溯**：US4 情境1–3、FR-011、FR-014、BR-001、BR-003、SC-004。

| ID | 需求追溯 | 測試層級 | Public seam：system-analysis 測試入口 | 優先級 | Arrange：fixture 與差異 | Act：單一操作 | Assert：精確預期 |
|---|---|---|---|---|---|---|---|
| TP-016 | US4 情境1–3、FR-011、FR-014、SC-004 | HTTP integration | 004 merchant action operation；003 `GET /api/orders/{order_number}` (`getOrder`) | P0 | `FX-ORDER-CREATED`；owner session 與 merchant token；order snapshot 已知 | 店家完成一個合法狀態轉換後，由 owner 查詢 | [response+state] 顧客回應 status/status_label 與店家持久化狀態相同；明細及總額仍為原 snapshot |
| TP-017 | US4 情境3、FR-010、FR-011、SC-004–SC-005 | UI 手動驗收 | `ui-plan.md`「顧客查詢狀態同步」及 `OrderLookupPage` | P1 | `FX-ORDER-COMPLETED`；顧客建立該 order 的 session | 刷新顧客訂單查詢 | [response] 顯示最新 status/status_label 與原快照；不暴露其他 session 訂單 |

## 6. 非功能需求追溯

本 spec 未定義專屬 NFR；憑證、狀態一致及快照規則依 FR／BR 驗收。

## 7. 具名 Fixture 與環境

| Fixture | 必要狀態、欄位與資料關聯 | 身分／權限 | 隔離與重設方式 |
|---|---|---|---|
| `FX-MERCHANT-201-ORDERS` | 201 筆可排序 created_at 訂單 | 有效 merchant token | memory DB 每案例 seed/reset |
| `FX-MERCHANT-MIXED-STATUS` | created／accepted／preparing／completed 訂單 | 有效 merchant token | 每案例 seed/reset |
| `FX-MERCHANT-AUTH` | valid merchant 設定；missing 與 invalid token | 無／錯 token | 每個 auth 情境獨立 request |
| `FX-MERCHANT-NOT-CONFIGURED` | `MERCHANT_TOKEN` 未設定 | 無有效 merchant credential | 隔離程序環境，還原環境變數 |
| `FX-ORDER-CREATED` | created order、有明細及固定 total snapshot | owner guest session | 由 `createSampleOrder` 建立；每案例新 session |
| `FX-ORDER-ACCEPTED` | accepted order，timestamp 已知 | merchant token | 每案例新 order；記錄初始 snapshot |
| `FX-ORDER-PREPARING` | preparing order | merchant token | 每案例新 order |
| `FX-ORDER-NON-CREATED` | accepted／preparing／completed 各狀態 | merchant token | 參數案例各自建立 order |
| `FX-ORDER-ILLEGAL-TRANSITIONS` | 含非法來源／動作組合的初始 order state | merchant token | 每個轉換組合獨立建立／reset |
| `FX-ORDER-CREATED-CONCURRENT` | created order；兩 request barrier 可控 | merchant token | 每案例新 order；同步並發請求 |
| `FX-ORDER-SNAPSHOT-PRICE-CHANGED` | order snapshot 與目前 menu price 不同 | owner session／merchant token | 建單後更新 menu fixture；測後還原 |
| `FX-ORDER-COMPLETED` | completed order 及 owner session | owner guest session | 每案例建立 order 與 merchant transition |

### 執行環境

- Backend：`backend/` 執行 `USE_MEMORY_DB=1 npm test`；Node test runner／Supertest；orders tests 位於 `backend/src/__tests__/orders/`。
- Frontend：`frontend/` 執行 `npm test`；Node test runner；UI 依 `ui-plan.md` 手動走查。
- 測試 helper：`backend/src/__tests__/testHelpers.js` 的 `createSampleOrder`、`merchantGet`、`merchantPost`、`bootstrapCartSession`。
- 不使用真實 merchant token；測試程序必須還原修改的環境變數。

## 8. 執行與交接

### 快速狀態摘要

- **最後執行日期**：既有摘要未記逐案日期
- **已完成 TP**：TP-001–TP-017（既有執行摘要記錄通過）
- **進行中 TP**：無
- **未啟動 TP**：無
- **已知阻塞**：無
- **下一步建議**：審閱計畫；開始 TDD 前核對 004 merchant 契約及 003 顧客查詢契約的狀態欄位一致性。

### TDD 進入條件

- testplan 經審閱；每輪選一個 TP case 與 public seam 開始 TDD。
- TP-015 contract 已明定相容性金額／明細欄位忽略政策。

### 新 session 啟動檢查

1. 核對所選 TP 與 004 spec 的 US／FR／BR／SC。
2. 依 `plan.md` 核對 004 contract、DBML、UI Plan 與 003 更新後顧客 order contract。
3. 確認 memory DB reset、token 設定、狀態 fixture 與競態控制。
4. 只忽略 contract 列出的金額／明細欄位，並驗證快照不可變。

## 9. 需求至測試追溯

| User Story／需求 ID | 本計畫案例 |
|---|---|
| US1；FR-001–FR-003、FR-010–FR-012；BR-001；SC-001、SC-005–SC-006 | TP-001–TP-006 |
| US2；FR-004–FR-006、FR-010–FR-013；BR-001–BR-003；SC-002、SC-005–SC-006 | TP-007–TP-009 |
| US3；FR-007–FR-010、FR-012–FR-013、FR-015；BR-001–BR-002；SC-003、SC-005–SC-006 | TP-010–TP-015 |
| US4；FR-011、FR-014；BR-001、BR-003；SC-004 | TP-016–TP-017 |

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

## 11. AI 自主決策與發現紀錄

| 日期 | TP 案例 | TDD 步驟 | 決策／發現內容 | 處置 |
|---|---|---|---|---|
| — | — | — | — | — |

## 12. 執行結果（既有紀錄）

- TP-001–TP-015：Backend API／integration tests 通過，含 200 筆上限、篩選、授權、狀態機、非法／並行轉換與偽造金額／明細快照保護。
- TP-016–TP-017：瀏覽器完成接單→出餐中→完成；顧客以同一 session 查詢到已完成狀態及不變快照。
- Backend／Frontend 最終回歸通過。

Constitution self-check: pass
