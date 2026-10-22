# 點餐系統第五迭代測試計畫

## 1. 計畫資訊

- **狀態**：已執行；API、整合及瀏覽器案例通過；MSSQL migration smoke 未執行
- **計畫版本／更新日**：v1；2026-10-20
- **審閱狀態／日期**：待審閱
- **需求範圍**：付款成功／失敗／重試、付款冪等、顧客取消／退款、stale pending 競態、顧客／店家查詢擴充及 cancelled 出餐護欄
- **需求來源**：`spec.md`（US1–US5、FR-001–FR-020、BR-001–BR-004、SC-001–SC-006；FR-014 明確保留不用）
- **系統分析來源**：`plan.md`、`ui-plan.md`、`data-model.dbml`、`contracts/http-api.yaml`；004 merchant actions 及 003 顧客訂單行為依 plan 指定 contracts
- **測試環境來源**：`research.md`、`techstack.md`；backend `src/__tests__/orders/`、`src/__tests__/payment/` 及 `testHelpers.js`
- **測試狀態約定**：本次執行結果記於第 10 節

## 2. 測試目標與範圍

需求語意以 spec 為準；API、交易、state transition、payment stub、冪等與 UI seams 依 system-analysis 產物及其引用契約。本計畫不連接真實金流，也不新增訂單／付款架構。

### 納入範圍

- US1：對 owner session 的 eligible order 發起付款，採 server total snapshot。
- US2：stub failure、failed retry、付款 Idempotency-Key replay 及 5xx 後安全重試。
- US3：created order 取消、已付款模擬退款、不可取消狀態及 pending fresh/stale 競態。
- US4：顧客查詢支付／取消欄位及 labels。
- US5：店家列表付款欄位／篩選、詳情失敗資訊、cancelled 狀態拒絕出餐操作及 merchant auth。
- `PAYMENT_PENDING_STALE_SEC` 預設 120 秒；測試以可控時間或直接設定資料驗證，不使用 sleep。

### 不納入範圍

- 真實金流、PCI、部分退款、chargeback、付款 SLA、登入或付款 webhooks。
- 規格未定義的效能門檻及外部金流可用性指標。

## 3. 測試策略與優先級

| 測試層級 | 責任介面（依 system-analysis） | 驗證重點 |
|---|---|---|
| HTTP API | 005 pay／cancel／get；005 merchant list/detail；004 merchant actions | response code、payment/status labels、session/token、idempotency 與交易結果 |
| HTTP integration | `backend/src/__tests__/orders/`、`payment/`、Supertest、memory DB | payment state machine、cancel/refund atomicity、重試、冪等及跨 API 一致性 |
| Frontend API/UI | `orderApi.js`、`OrderLookupPage`、`MerchantOrdersPage`、`orderPaymentUi.test.js` | loading／error／success、支付／取消按鈕、merchant filters 與 status labels |
| Migration／回歸 | `verify-migrations.mjs`、`USE_MEMORY_DB=1 npm test`、005 smoke | payment columns、idempotency table、舊 order 保留與全套件回歸 |

- **P0**：session ownership、snapshot 金額權威、冪等、防重複付款、cancel/pending 原子性、已取消訂單不可再付款／出餐。
- **P1**：正常付款／取消流程、失敗重試、顧客與店家狀態呈現及 merchant authorization。
- **P2**：非阻擋性文字／呈現不納入此計畫。
- **通過／失敗**：精確比對 HTTP status/error code、DB payment/order 狀態、timestamp、idempotency rows 及不可變 snapshot；不以 UI 訊息替代資料驗證。

## 4. 非功能需求追溯

本 spec 未定義專屬 NFR；金額權威、狀態一致、敏感錯誤資訊等依 FR／BR 驗收，不另加延遲或金流 SLA 門檻。

## 5. User Story 測試案例

### 5.1 使用者故事 1－顧客對訂單發起付款

**目標／獨立驗收**：同一 guest session 對未取消且未付款的訂單付款；應付額等於 order total snapshot。

**需求追溯**：US1 情境1–4、FR-001–FR-003、FR-010–FR-012、FR-015、BR-001–BR-002、SC-001、SC-005。

| ID | 需求追溯 | 測試層級 | Public seam：system-analysis 測試入口 | 優先級 | Arrange：fixture 與差異 | Act：單一操作 | Assert：精確預期 |
|---|---|---|---|---|---|---|---|
| TP-001 | US1 情境1、FR-001–FR-002、FR-010、BR-001、SC-001 | HTTP API | `POST /api/orders/{order_number}/pay` (`payOrder`) | P0 | `FX-ORDER-CREATED-UNPAID`；owner guest session；payment stub success；total snapshot 已知 | 發起付款 | [response+state] 回 200；payment_status=`paid`；`paid_at` 有值；回應金額等於 order snapshot |
| TP-002 | US1 情境2、FR-003、BR-004 | HTTP API | `POST /api/orders/{order_number}/pay` (`payOrder`) | P0 | `FX-ORDER-ALREADY-PAID`；owner session；已存在 paid result | 再次付款 | [response+state] 回 409 `ORDER_ALREADY_PAID`；不產生第二次付款結果，snapshot 不變 |
| TP-003 | US1 FR-003、spec pending policy | HTTP API | `POST /api/orders/{order_number}/pay` (`payOrder`) | P0 | `FX-ORDER-PAYMENT-PENDING-FRESH`；owner session；pending age < 120s；可控 clock | 再次付款 | [response+state] 回 409 `PAYMENT_IN_PROGRESS`；付款仍為 pending；不新增 paid idempotency mapping |
| TP-004 | US1 FR-003、spec stale policy | HTTP integration | `POST /api/orders/{order_number}/pay` (`payOrder`) | P0 | `FX-ORDER-PAYMENT-PENDING-STALE`；owner session；pending age > 120s；stub success | 重入付款 | [response+state] 回 200；payment_status=`paid`；只存在一筆成功付款結果／冪等 mapping |
| TP-005 | US1 情境4、FR-001、FR-011 | HTTP API | `POST /api/orders/{order_number}/pay` (`payOrder`) | P0 | `FX-ORDER-OWNED-BY-SESSION-A`；另建立 session B | session B 發起 A 訂單付款 | [response] 回 404 `ORDER_NOT_FOUND`；A 訂單 payment/status/total 均不變 |
| TP-006 | US1 情境3、FR-010、BR-001、SC-005 | HTTP integration | `POST /api/orders/{order_number}/pay` (`payOrder`) | P0 | unpaid order；body 帶偽造金額及 items | 以偽造金額／明細發起付款 | [response+state] 回 200；只依 server snapshot 付款；response／持久化 items 與總額不變。Contract 列明相容欄位會被忽略；已通過。 |

### 5.2 使用者故事 2－付款失敗與重試

**目標／獨立驗收**：付款失敗留下 failed 結果及對外原因，可再次付款；冪等只記錄 paid 成功。

**需求追溯**：US2 情境1–4、FR-002、FR-004–FR-006、FR-012、BR-001、BR-004、SC-002、SC-006。

| ID | 需求追溯 | 測試層級 | Public seam：system-analysis 測試入口 | 優先級 | Arrange：fixture 與差異 | Act：單一操作 | Assert：精確預期 |
|---|---|---|---|---|---|---|---|
| TP-007 | US2 情境1、FR-002、FR-004、FR-012、SC-002 | HTTP API | `POST /api/orders/{order_number}/pay` (`payOrder`)；dev-only `simulate_outcome` 依 research／techstack 設定 | P1 | `FX-ORDER-CREATED-UNPAID`；非 production；明確啟用 `ALLOW_PAYMENT_SIMULATE_BODY`；stub outcome=failure | 發起模擬失敗付款 | [response+state] 回 200；payment_status=`failed`；失敗時間／可顯示原因存在；出餐狀態與 snapshot 不變；不寫 success mapping |
| TP-008 | US2 情境2、FR-005、BR-001、SC-002 | HTTP API | `POST /api/orders/{order_number}/pay` (`payOrder`) | P1 | `FX-ORDER-PAYMENT-FAILED`；owner session；首次 payment failed、無 paid mapping；第二次 stub success | 重試付款 | [response+state] 回 200；payment_status=`paid`；total snapshot 不變；保留規格要求的最後失敗摘要／時間 |
| TP-009 | US2 情境3、FR-012、SC-006 | HTTP integration | `POST /api/orders/{order_number}/pay` (`payOrder`)；`Idempotency-Key` | P0 | `FX-PAYMENT-IDEMPOTENCY`；同 owner session/order/key；首次 stub success | 以相同 key 重送付款 | [idempotent] 首次與重送均回相同 paid order；只新增一筆 payment idempotency row；不重複扣款狀態 |
| TP-010 | US2 情境4、FR-012、SC-006 | HTTP integration | 缺少經 system-analysis 確認的故障注入入口；目前僅 `techstack.md` 提及該測試設定 | P0 | `FX-PAYMENT-5XX-RETRY`；待分析來源確認安全 fault seam 後，準備 pending 後、paid 持久化前的可控故障 | 待 seam 確認後以 key 發起故障付款 | [response+state] 待分析來源確認故障注入 seam 後，驗證回 500、不寫 paid mapping，移除 fault 後同 key 僅成功一次；來源未補齊前本案阻塞，不判定通過 |
| TP-027 | US2 邊界、FR-006 | HTTP API | `POST /api/orders/{order_number}/pay` (`payOrder`)；005 `PayOrderRequest` | P0 | `FX-ORDER-CREATED-UNPAID`；owner guest session；body 分別帶未定義的 currency 欄位或替代 order identifier，使用契約允許格式 | 以不可信幣別或訂單識別欄位發起付款 | [response+state] 每種未定義欄位均依 `additionalProperties: false` 回 400；路徑指定的訂單付款狀態、金額快照及明細不變 |

### 5.3 使用者故事 3－顧客取消訂單

**目標／獨立驗收**：只可取消 created order；paid order 退款，fresh pending 阻止取消，stale pending 原子中止後取消。

**需求追溯**：US3 情境1–5、FR-007–FR-009、FR-011、FR-013、BR-002–BR-004、SC-003–SC-004。

| ID | 需求追溯 | 測試層級 | Public seam：system-analysis 測試入口 | 優先級 | Arrange：fixture 與差異 | Act：單一操作 | Assert：精確預期 |
|---|---|---|---|---|---|---|---|
| TP-011 | US3 情境1、FR-007、FR-009、FR-011、FR-013、SC-003 | HTTP API | `POST /api/orders/{order_number}/cancel` (`cancelOrder`) | P0 | `FX-ORDER-CREATED-UNPAID`；owner guest session | 取消訂單 | [response+state] 回 200；status=`cancelled`、`cancelled_at` 有值；payment status 維持 unpaid；items／total snapshot 保留 |
| TP-012 | US3 情境1、FR-013、SC-003 | HTTP API | `POST /api/orders/{order_number}/cancel` (`cancelOrder`) | P0 | `FX-ORDER-CREATED-FAILED`；owner session；payment failed | 取消訂單 | [response+state] 回 200；status=`cancelled`；payment status 仍 failed；snapshot 保留 |
| TP-013 | US3 情境1、FR-013、BR-002–BR-003、SC-003 | HTTP integration | `POST /api/orders/{order_number}/cancel` (`cancelOrder`)；pay operation 建立 paid order | P0 | `FX-ORDER-CREATED-PAID`；owner session；stub success | 取消已付款訂單 | [response+state] 回 200；status=`cancelled`、payment_status=`refunded`、`refunded_at` 有值；snapshot 不變；不呼叫真實金流 |
| TP-014 | US3 情境2、FR-008、SC-004 | HTTP API | `POST /api/orders/{order_number}/cancel` (`cancelOrder`) | P0 | `FX-ORDER-ACCEPTED`；order status accepted | 取消訂單 | [response] 回 409 `ORDER_NOT_CANCELLABLE`；status/payment/snapshot 不變 |
| TP-015 | US3 情境5、FR-013、BR-004 | HTTP API | `POST /api/orders/{order_number}/cancel` (`cancelOrder`) | P0 | `FX-ORDER-PAYMENT-PENDING-FRESH`；owner session；pending age < 120s；可控 clock | 取消訂單 | [response] 回 409 `PAYMENT_IN_PROGRESS`；status/payment 不變 |
| TP-016 | US3 情境5、FR-013、BR-003–BR-004、SC-003 | HTTP integration | `POST /api/orders/{order_number}/cancel` (`cancelOrder`) | P0 | `FX-ORDER-PAYMENT-PENDING-STALE`；owner session；pending age > 120s；可控 clock | 取消訂單 | [response] 同一交易後 status=`cancelled`、payment_status=`failed`；不得存在 pending+cancelled 組合；`cancelled_at` 有值 |
| TP-017 | US3 情境3、FR-007–FR-009、BR-003 | HTTP API | `POST /api/orders/{order_number}/cancel` (`cancelOrder`) | P0 | `FX-ORDER-CANCELLED`；order 已 cancelled；owner session | 再次取消 | [idempotent] 依 005 cancel contract 回應；不新增狀態變更或時間戳，既有 snapshot 保留 |
| TP-018 | US3 情境4、FR-011 | HTTP API | `POST /api/orders/{order_number}/cancel` (`cancelOrder`) | P0 | `FX-ORDER-OWNED-BY-SESSION-A`；session B 不同於 owner A | session B 取消 A 訂單 | [response+state] 回 404 `ORDER_NOT_FOUND`；A 訂單狀態不變 |

### 5.4 使用者故事 4－顧客查詢反映付款與取消狀態

**需求追溯**：US4 情境1–4、FR-011、FR-015–FR-016、BR-002、BR-004、SC-001。

| ID | 需求追溯 | 測試層級 | Public seam：system-analysis 測試入口 | 優先級 | Arrange：fixture 與差異 | Act：單一操作 | Assert：精確預期 |
|---|---|---|---|---|---|---|---|
| TP-019 | US4 情境1–3、FR-016、FR-011、SC-001 | HTTP API | `GET /api/orders/{order_number}` (`getOrder`) | P1 | `FX-ORDER-PAYMENT-STATE-MATRIX`；owner session；paid、failed、cancelled/refunded 結果各自 fixture | 查詢訂單 | [response+state] 回傳持久化 `status`／`status_label`、`payment_status`／`payment_status_label` 及建立時 snapshot；failed reason 若有依 contract 回傳 |
| TP-020 | US4 情境4、FR-011、BR-004 | HTTP API | `GET /api/orders/{order_number}` (`getOrder`) | P0 | `FX-ORDER-OWNED-BY-SESSION-A`；使用 session B 或不存在 order number | 查詢訂單 | [response] 回 404 `ORDER_NOT_FOUND`；不洩露他人 order |

### 5.5 使用者故事 5－店家檢視訂單付款與取消資訊

**需求追溯**：US5 情境1–4、FR-017–FR-020、BR-002–BR-004、SC-006。

| ID | 需求追溯 | 測試層級 | Public seam：system-analysis 測試入口 | 優先級 | Arrange：fixture 與差異 | Act：單一操作 | Assert：精確預期 |
|---|---|---|---|---|---|---|---|
| TP-021 | US5 情境1、FR-017–FR-018、FR-020、SC-006 | HTTP API | `GET /api/merchant/orders?payment_status=paid` (`listMerchantOrders`) | P1 | `FX-MERCHANT-PAYMENT-MIX`；有效 merchant token；unpaid／paid／failed orders | 以 payment_status 篩選列表 | [response] 回 200；僅回 contract 定義的 paid records；每列含付款狀態／label 及 snapshot 欄位 |
| TP-022 | US5 情境1、FR-018、FR-020 | HTTP API | `GET /api/merchant/orders?payment_status=invalid` (`listMerchantOrders`) | P1 | `FX-MERCHANT-PAYMENT-MIX`；有效 token | 使用非法 payment_status filter | [response+state] 回 400 `INVALID_PAYMENT_STATUS_FILTER`；資料不變 |
| TP-023 | US5 情境2、FR-017、FR-020、BR-004 | HTTP API | `GET /api/merchant/orders/{order_number}` (`getMerchantOrder`) | P1 | `FX-ORDER-PAYMENT-FAILED`；有效 merchant token；payment_failure_reason 已保存 | 讀取詳情 | [response] 回 payment status／label 及失敗原因摘要（若 contract 欄位存在）；order snapshot 保持不變 |
| TP-024 | US5 情境3、FR-019–FR-020、BR-003、SC-003 | HTTP API | 004 `POST /api/merchant/orders/{order_number}/accept` (`acceptMerchantOrder`)；004 start-preparing／complete actions | P0 | `FX-ORDER-CANCELLED`；有效 merchant token | 接單或推進 cancelled order（分開操作） | [response] 每個 operation 回 409 `ORDER_STATUS_CONFLICT`；order 保持 cancelled，payment/snapshot 不變 |
| TP-025 | US5 情境4、FR-020、SC-005 | HTTP API | 005 `GET /api/merchant/orders`／`GET /api/merchant/orders/{order_number}` | P0 | `FX-MERCHANT-AUTH`；missing／invalid token；另有未配置 credential 情境 | 呼叫店家 endpoint | [response] missing／invalid 回 401 `MERCHANT_UNAUTHORIZED`；未配置回 503 `MERCHANT_NOT_CONFIGURED`；不回訂單資料 |
| TP-026 | US3 情境3、FR-001、FR-003、BR-003 | HTTP API | `POST /api/orders/{order_number}/pay` (`payOrder`) | P0 | `FX-ORDER-CANCELLED`；order 已 cancelled；owner session | 對已取消訂單發起付款 | [response+state] 回 409 `ORDER_CANCELLED`；status/payment/snapshot 不變 |

## 6. 非功能需求追溯

本 spec 未定義專屬 NFR；付款狀態、快照、授權及敏感失敗原因依 FR／BR 驗收，不自訂金流 SLA 或效能門檻。

## 7. 具名 Fixture 與環境

| Fixture | 必要狀態、欄位與資料關聯 | 身分／權限 | 隔離與重設方式 |
|---|---|---|---|
| `FX-ORDER-CREATED-UNPAID` | created／unpaid order、已知 total/items snapshot | owner guest session | 共用 `createSampleOrder`；每案例獨立 order/session |
| `FX-ORDER-ALREADY-PAID` | created 或合法出餐狀態、payment_status=paid、paid_at | owner guest session | 由 payment stub 建立 paid order |
| `FX-ORDER-PAYMENT-FAILED` | payment_status=failed、failure reason、無 paid idempotency row | owner guest session | stub failure；每案例 reset |
| `FX-ORDER-CREATED-FAILED` | status=created、payment_status=failed、snapshot 已知、無成功 mapping | owner guest session | 每案例新建 order；不共用 idempotency key |
| `FX-ORDER-PAYMENT-PENDING-FRESH` | payment_status=pending、age < 120s | owner guest session | `forceOrderPaymentStatus` + 可控時間 |
| `FX-ORDER-PAYMENT-PENDING-STALE` | payment_status=pending、age > 120s | owner guest session | `forceOrderPaymentStatus`；不 sleep |
| `FX-ORDER-PAYMENT-STATE-MATRIX` | paid、failed、cancelled/refunded orders；各自 status／label／snapshot 已知 | 每筆訂單 owner session | 每個 payment state 獨立建立並查詢 |
| `FX-ORDER-CREATED-PAID` | status=created、payment_status=paid、snapshot 已知 | owner guest session | 先成功 pay，再 cancel |
| `FX-ORDER-ACCEPTED` | status=accepted | owner guest + merchant token | 建單後由 merchant action 建立 |
| `FX-ORDER-CANCELLED` | status=cancelled，payment status 可 unpaid/failed/refunded | owner guest + merchant token | 每案例獨立 order |
| `FX-ORDER-OWNED-BY-SESSION-A` | order 綁定 session A；獨立 session B | A owner／B non-owner | 每案例建立 session pair |
| `FX-PAYMENT-IDEMPOTENCY` | paid result；session/order/key mapping 已知 | owner guest session | 唯一 key；比較 payment_idempotency_keys row count |
| `FX-PAYMENT-5XX-RETRY` | fault 在 pending 後、paid 前；key 未映射 | owner guest session | 僅測試程序使用 `PAYMENT_TEST_ABORT_AFTER_PENDING`；finally 還原 env |
| `FX-MERCHANT-PAYMENT-MIX` | unpaid、paid、failed 訂單及可辨識 payment status | merchant token | memory DB 每案例 seed/reset |
| `FX-MERCHANT-AUTH` | missing／invalid token；有效 credential configured | merchant endpoint | 測試 token；獨立 auth requests |

### 執行環境

- Backend：`backend/` 執行 `USE_MEMORY_DB=1 npm test`；包含 orders、payment、merchant guards 及 memory DB。
- Frontend：`frontend/` 執行 `npm test`；包括 `orderApi.test.js`、`orderPaymentUi.test.js`。
- Migration：`backend/` 執行 `npm run verify:migrations`；MSSQL smoke 依 `techstack.md` `npm run smoke:mssql:005`，不以此取代 memory DB tests。
- Mock：payment 使用 deterministic in-process stub；不呼叫真實金流；時間以 `forceOrderPaymentStatus`／可控資料建立，不 sleep。
- Secrets：僅用測試 token；測試必須還原被修改的環境變數。

## 8. 執行與交接

### 快速狀態摘要

- **最後執行日期**：既有摘要未記逐案日期
- **已完成 TP**：TP-001–TP-009、TP-011–TP-027（TP-001–TP-026 依既有摘要；TP-027 本次執行通過）
- **進行中 TP**：無
- **未啟動 TP**：TP-010（故障注入入口尚未列入 system-analysis）
- **已知阻塞**：TP-010 需先補 plan／API analysis seam；真實 SQL Server 資料保留 smoke 未執行。
- **下一步建議**：先更新 system-analysis 來源並重驗 TP-010，再把 MSSQL migration smoke 排入有專用 SQL Server 的環境。

### TDD 進入條件

- 本計畫經審閱；每輪選一個 TP 與 public seam，先 RED，再 GREEN；REFACTOR 僅於測試全綠後。
- TP-006 contract 已明定相容性金額／明細欄位只忽略、不採信。

### 新 session 啟動檢查

1. 讀取所選 TP 與 spec 的 FR／BR／SC。
2. 核對 005 contract、plan 指定的 003／004 upstream operations、payment fields 及 error codes。
3. 核對 fixture、session owner、stub outcome、clock、key mapping 與 test command。
4. 驗證 payment／cancel response 與持久化快照一致；不呼叫真實金流。

## 9. 需求至測試追溯

| User Story／需求 ID | 本計畫案例 |
|---|---|
| US1；FR-001–FR-003、FR-010–FR-012；BR-001–BR-002；SC-001、SC-005 | TP-001–TP-006 |
| US2；FR-002、FR-004–FR-006、FR-012；BR-001、BR-004；SC-002、SC-006 | TP-007–TP-010、TP-027 |
| US3；FR-007–FR-009、FR-011、FR-013；BR-002–BR-004；SC-003–SC-004 | TP-011–TP-018、TP-026 |
| US4；FR-011、FR-015–FR-016；BR-002、BR-004；SC-001 | TP-019–TP-020 |
| US5；FR-017–FR-020；BR-002–BR-004；SC-003、SC-006 | TP-021–TP-025 |
| Cross-story FR-010 | TP-001、TP-006 |

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
| TP-010 | ⬜ 未執行 | — | — | — | — | 測試入口未列於 system-analysis；待補來源後重驗 |
| TP-011 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-012 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-013 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-014 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-015 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-016 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-017 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-018 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-019 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-020 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-021 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-022 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-023 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-024 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-025 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-026 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-027 | 🟢 驗證通過 | 2026-10-22 | — | `node --test src/__tests__/orders/payment-pay.test.js`（8/8）；currency／order_id 各回 400，訂單狀態、snapshot 與冪等記錄不變 | 符合 | 本次參數化回歸測試 |

## 11. AI 自主決策與發現紀錄

| 日期 | TP 案例 | TDD 步驟 | 決策／發現內容 | 處置 |
|---|---|---|---|---|
| — | — | — | — | — |

## 12. 執行結果（既有紀錄）

- TP-001–TP-009、TP-011–TP-026：Backend payment／cancel／query／merchant tests 的歷史紀錄為通過，含 owner 隔離、paid／failed／pending、冪等、退款、重複／跨 session 取消及 merchant filters/auth。
- TP-010：歷史測試曾通過，但其故障注入入口未列於 system-analysis；依本次 seam 權威檢查不視為本計畫核准驗收，待補來源後重驗。
- TP-006：contract 已列出並允許忽略相容性金額／items 欄位；response 與 snapshot 測試通過。
- Browser：付款成功、取消 unpaid、paid 後退款、顧客查詢狀態及金額快照均通過。
- `npm run verify:migrations` 通過；`smoke:mssql:005` 因未設定 MSSQL 環境變數而安全 skip，未驗證真實 SQL Server 資料保留。

Constitution self-check: exceptions — TP-010 測試 seam 未列入 system-analysis；本機亦無專用 MSSQL 測試目標，未執行真實 migration／資料保留 smoke。
