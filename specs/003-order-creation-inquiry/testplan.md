# 點餐系統第三迭代測試計畫

## 1. 計畫資訊

- **狀態**：已執行；API、整合及瀏覽器案例通過
- **計畫版本／更新日**：v1；2026-10-20
- **審閱狀態／日期**：待審閱
- **需求範圍**：從有效 guest cart 建立訂單、持久化唯一 order number 與金額／明細快照、成功後清空 cart、同 session 冪等及 owner-session 查詢
- **需求來源**：`spec.md`（US1–US2、FR-001–FR-011、BR-001–BR-003、SC-001–SC-006、Q12–Q14）
- **系統分析來源**：`plan.md`、`ui-plan.md`、`data-model.dbml`、`contracts/http-api.yaml`；cart 前置依 `../002-shopping-cart-total-calculation/contracts/http-api.yaml`
- **測試環境來源**：`research.md`、`techstack.md`；backend 共用 `src/__tests__/testHelpers.js`
- **測試狀態約定**：本次執行結果記於第 10 節

## 2. 測試目標與範圍

需求語意由 `spec.md` 定義；建單／查詢 operation、transaction 邊界、資料快照與 UI seam 依 system-analysis 產物。使用已存在的 002 cart／guest session，不重新設計購物車。

### 納入範圍

- US1：有效 cart 建單、order number 唯一、明細與金額快照、成功清空 cart。
- 建單前重驗供應狀態；空車與 unavailable cart 拒絕。
- 同 session `Idempotency-Key` replay、key 過期及失敗後安全重試。
- US2：同一 session 查詢快照、價格變更後快照不變、跨 session／不存在 order 不洩漏。
- 顧客 checkout／成功結果／order lookup UI 流程。
- Origin／CSRF 與 guest session 授權邊界。

### 不納入範圍

- 店家接單、出餐、付款、取消、登入、跨裝置查詢及真實金流。
- 未在來源文件固定的 order number 以外格式、價格政策或額外 response 欄位。

## 3. 測試策略與優先級

| 測試層級 | 責任介面（依 system-analysis） | 驗證重點 |
|---|---|---|
| HTTP API | 003 `createOrder`／`getOrder` 與 002 `getCart`／cart writes | 狀態碼、ErrorBody、CSRF／Origin、session 綁定與冪等 |
| HTTP integration | `backend/src/__tests__/orders/`、Supertest、memory DB harness | transaction、snapshot、cart 清空、競態及 key mapping |
| Frontend API／頁面 | `orderApi.js`、`CartPage`／Checkout、`OrderLookupPage`（依 `ui-plan.md`） | pending／成功／錯誤、重送 key 與查詢呈現 |

- **P0**：快照金額權威、不可用 cart 全筆拒絕、跨 session 授權、冪等防重複及 transaction 原子性。
- **P1**：建單、查詢及顧客操作主要流程。
- **P2**：規格未要求的次要呈現不納入。
- **通過／失敗**：比對 order response 與持久化 order/cart/key 狀態；同一案例不得以多個互斥 response 作為通過條件。

## 4. 非功能需求追溯

本 spec 未定義專屬 NFR；安全隔離、冪等與伺服器權威計價以 FR／BR 驗收，不另增效能門檻。

## 5. User Story 測試案例

### 5.1 使用者故事 1－從購物車確認並建立訂單

**目標／獨立驗收**：有效 cart 成功轉為唯一訂單，明細與金額依建單當下快照，並清空該 session cart。

**需求追溯**：US1 情境1–6、FR-001–FR-007、FR-010–FR-011、BR-001–BR-003、SC-001–SC-004、SC-006。

| ID | 需求追溯 | 測試層級 | Public seam：system-analysis 測試入口 | 優先級 | Arrange：fixture 與差異 | Act：單一操作 | Assert：精確預期 |
|---|---|---|---|---|---|---|---|
| TP-001 | US1 情境1、FR-001–FR-003、FR-006、BR-001、SC-001、SC-006 | HTTP integration | `POST /api/orders` (`createOrder`)；002 `GET /api/cart` (`getCart`) | P0 | `FX-GUEST-CART-AVAILABLE`；有效 session；兩個 available items，option／quantity／價格已知；無既有 order/key | 建立訂單 | [response+state] 回 201；order number 符合 contract pattern 且唯一；items、數量、規格摘要與 total 等於 server snapshot；同 session cart 清空 |
| TP-002 | US1 情境2、FR-004、BR-002、SC-003 | HTTP integration | `POST /api/orders` (`createOrder`) | P0 | `FX-GUEST-CART-MIXED-AVAILABILITY`；至少一筆 available 與一筆 unavailable；記錄 cart/order 初始狀態 | 建立訂單 | [response+state] 回 409 `CART_HAS_UNAVAILABLE_ITEMS`；不寫 order／idempotency success mapping；cart 保留 |
| TP-003 | US1 情境3、FR-005、SC-003 | HTTP API | `POST /api/orders` (`createOrder`) | P1 | `FX-GUEST-CART-EMPTY`；或 cart 僅有 unavailable item（分開參數情境）；無既有 order | 建立訂單 | [response+state] 回 400 `CART_EMPTY`；不寫入訂單資料，cart 狀態不變 |
| TP-004 | US1 情境4、FR-007、BR-003、SC-004 | HTTP integration | `POST /api/orders` (`createOrder`)；`Idempotency-Key` header | P0 | `FX-ORDER-IDEMPOTENCY`；同 guest session；有可用 cart；無 key mapping | 相同 key 重送建單 | [idempotent] 首次回 201；重送回 200 與同一 order number/body；只存在一筆 order 與成功 mapping |
| TP-005 | US1 邊界、FR-007、BR-003 | HTTP integration | `POST /api/orders` (`createOrder`)；受控 idempotency expiry fixture | P1 | `FX-ORDER-IDEMPOTENCY-EXPIRED`；key mapping 已超過預設 24h；cart 可用；時鐘或 expires_at 可控制 | 使用已過期 key 建單 | [response] 視為新請求回 201 並建立新 order；不重用過期映射 |
| TP-006 | US1 情境5、FR-011、BR-001、SC-002 | HTTP integration | `POST /api/orders` (`createOrder`) | P0 | 有效 cart；提交偽造 total／unit／line amount | 建立訂單並提交偽造金額 | [response+state] 回 201；response 與持久化明細／總額仍完全採 server cart snapshot；未知欄位仍回 400。已通過。 |
| TP-007 | US1 邊界、FR-001、FR-007、Q13 | HTTP integration | `POST /api/orders` (`createOrder`)；`Idempotency-Key` header | P1 | `FX-ORDER-IDEMPOTENCY-FAILED`；首次 cart 空，key 無 mapping；之後可新增可用 item | 以同一 key 重試建單 | [response+state] 首次 400 `CART_EMPTY` 不建立成功 mapping；補入 cart 後同 key 可回 201 建單 |
| TP-008 | US1 邊界、FR-001、FR-006、FR-007 | HTTP API／security integration | `POST /api/orders` (`createOrder`)；Origin／`X-CSRF-Token` | P0 | `FX-GUEST-CART-AVAILABLE`；分別缺 Origin、錯 Origin、缺／錯 session-bound CSRF；記錄 cart/order | 送出建單請求 | [response+state] 每種無效來源／token 回 403；不寫 order，不清空 cart，不寫成功 key mapping |
| TP-009 | US1 情境1、BR-003 | HTTP integration | 兩個並行 `POST /api/orders` (`createOrder`)；同 `Idempotency-Key` | P0 | `FX-ORDER-IDEMPOTENCY`；同 session/cart/key；兩請求同步起始 | 並行重送相同 key | [response+state] 一筆 order；兩回應皆指向同 order，狀態為 201／200 組合依 contract；不重複持久化 |

### 5.2 使用者故事 2－查詢訂單狀態與明細

**目標／獨立驗收**：建立 session 可查詢該訂單的狀態與不可變快照；其他 session 不得取得內容。

**需求追溯**：US2 情境1–4、FR-008–FR-011、BR-001、SC-002、SC-005。

| ID | 需求追溯 | 測試層級 | Public seam：system-analysis 測試入口 | 優先級 | Arrange：fixture 與差異 | Act：單一操作 | Assert：精確預期 |
|---|---|---|---|---|---|---|---|
| TP-010 | US2 情境1、FR-008–FR-009、SC-005 | HTTP API | `GET /api/orders/{order_number}` (`getOrder`) | P1 | `FX-ORDER-OWNED-BY-SESSION-A`；同一 owner session 有 order／snapshot | owner session 查詢 order number | [response+state] 回 200；含 status、number、created_at、items、金額快照且欄位與持久化一致 |
| TP-011 | US2 情境2、FR-009、FR-011、BR-001 | HTTP integration | 003 `getOrder`；002 菜單資料來源 | P0 | `FX-ORDER-SNAPSHOT-PRICE-CHANGED`；訂單快照已建立；菜單價格後續變更 | owner session 查詢訂單 | [response] 回應 item unit price、line total 及 order total 仍等於建立當下 snapshot，不按新菜單重算 |
| TP-012 | US2 情境3–4、FR-008、FR-010、SC-005 | HTTP API | `GET /api/orders/{order_number}` (`getOrder`) | P0 | `FX-ORDER-OWNED-BY-SESSION-A`；另 bootstrap session B；另準備格式有效但不存在的 order number | 由 session B 查詢 A 的訂單或不存在編號 | [response] 兩種情況均回 404 `ORDER_NOT_FOUND`；不揭露他 session 訂單是否存在 |
| TP-013 | US2、FR-008 | UI 手動驗收 | `ui-plan.md`「查詢訂單狀態／查無訂單」；`OrderLookupPage` | P1 | `FX-ORDER-OWNED-BY-SESSION-A`；準備 owner／unknown 編號 | 在查詢頁提交訂單編號 | [response] owner 顯示狀態與快照明細；unknown 或切換 session 後顯示查無，不顯示他人資料 |

## 6. 非功能需求追溯

本 spec 未定義專屬 NFR；session 授權、快照及冪等按 FR／BR／SC 驗收。

## 7. 具名 Fixture 與環境

| Fixture | 必要狀態、欄位與資料關聯 | 身分／權限 | 隔離與重設方式 |
|---|---|---|---|
| `FX-GUEST-CART-AVAILABLE` | 有效 session cart 含至少兩筆 available items；價格、選項、數量可精確計算 | owner guest session／CSRF | `bootstrapCartSession`；每案例 reset |
| `FX-GUEST-CART-MIXED-AVAILABILITY` | cart 同時含 available 與 unavailable item | guest session／CSRF | 每案例新 session/cart；記錄 order 數量 |
| `FX-GUEST-CART-EMPTY` | 有效 session 的 cart 為空 | guest session／CSRF | 每案例 bootstrap/reset |
| `FX-ORDER-IDEMPOTENCY` | 可用 cart、無既有 order/key mapping | 同一 guest session/key | 每案例使用唯一 session/key |
| `FX-ORDER-IDEMPOTENCY-EXPIRED` | idempotency mapping `expires_at` 已過期、cart 可用 | owner guest session | 使用可控 clock 或直接設定 expires_at，不 sleep |
| `FX-ORDER-IDEMPOTENCY-FAILED` | 首次空 cart、無 key mapping；後續可加可用 item | 同一 session/key | 每案例獨立 session/key |
| `FX-ORDER-SNAPSHOT-PRICE-CHANGED` | order item snapshot 價格與目前菜單價格不同 | owner guest session | 建單後由 test fixture 更新 menu source，測後還原 |
| `FX-ORDER-OWNED-BY-SESSION-A` | order 僅屬於 session A；另有獨立 session B | owner A／non-owner B | 每案例新建 session/order |

### 執行環境

- Backend：`backend/` 執行 `USE_MEMORY_DB=1 npm test`；Node test runner／Supertest；order tests 在 `src/__tests__/orders/`。
- Frontend：`frontend/` 執行 `npm test`；Node test runner；`orderApi.test.js` 與 UI seam 依 `ui-plan.md` 手動走查。
- 測試 helper：`backend/src/__tests__/testHelpers.js`；session、cart、order、冪等 helper 依該檔實際行為。
- migration／MSSQL：若交付要求 migration smoke，依 `techstack.md` 執行；本案例計畫的 API 行為先用 memory DB harness。

## 8. 執行與交接

### 快速狀態摘要

- **最後執行日期**：既有摘要未記逐案日期
- **已完成 TP**：TP-001–TP-013（既有執行摘要記錄通過）
- **進行中 TP**：無
- **未啟動 TP**：無
- **已知阻塞**：無
- **下一步建議**：審閱計畫；開始 TDD 前核對 003 order contract、002 cart contract 與 session／CSRF fixture。

### TDD 進入條件

- testplan 已審閱；每輪選一個 TP 與 public seam，先 RED 再 GREEN，REFACTOR 僅於測試全綠後。
- TP-006 相容性金額欄位政策已記入 contract，並由精確 API 測試驗證。

### 新 session 啟動檢查

1. 讀取所選 TP 與 spec 的 FR／BR／SC。
2. 核對 003 order contract、002 cart contract、DBML 及 UI Plan 的入口與 response。
3. 確認 session、CSRF、fixture、key／clock 控制與 memory DB reset。
4. 金額相容性欄位只忽略、不採信；驗證 response 與持久化快照一致。

## 9. 需求至測試追溯

| User Story／需求 ID | 本計畫案例 |
|---|---|
| US1、FR-001–FR-007、BR-001–BR-003、SC-001–SC-004、SC-006 | TP-001–TP-009 |
| US2、FR-008–FR-011、BR-001、SC-002、SC-005 | TP-010–TP-013 |

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

## 11. AI 自主決策與發現紀錄

| 日期 | TP 案例 | TDD 步驟 | 決策／發現內容 | 處置 |
|---|---|---|---|---|
| — | — | — | — | — |

## 12. 執行結果（既有紀錄）

- TP-001–TP-012：Backend API／integration tests 通過，含成功／空車／停供／冪等重送與過期 key、失敗後重試、並行建單、session owner、錯誤與 snapshot 保留。
- TP-006：contract、plan 與程式已對齊；精確偽造金額測試通過。
- TP-013：瀏覽器以 owner session 查詢成功；跨 session／未知編號由 API tests 驗證 404。
- Backend／Frontend 最終回歸通過。

Constitution self-check: pass
