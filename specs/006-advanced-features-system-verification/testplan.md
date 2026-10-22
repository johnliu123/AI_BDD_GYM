# 點餐系統第六迭代測試計畫

## 1. 計畫資訊

- **狀態**：已執行；自動化及瀏覽器驗收通過；TP-028 真實 MSSQL 資料保留 smoke 受環境限制
- **計畫版本／更新日**：v1；2026-10-20
- **審閱狀態／日期**：待審閱
- **需求範圍**：006 迭代的店家菜單維護、餐點／規格供應狀態、顧客購物車與建單護欄、店家 RBAC、錯誤回應及整合驗證
- **需求來源**：`spec.md`（User Story 1–6、FR-001–FR-019、NFR-010–NFR-012、BR-001–BR-004、SC-001–SC-007）
- **系統分析來源**：`plan.md`、`ui-plan.md`、`data-model.dbml`、`contracts/http-api.yaml`；跨迭代 API 依 `plan.md` 指定的 002–005 契約
- **測試環境來源**：`research.md`、`techstack.md`；backend 共用測試 helper：`backend/src/__tests__/testHelpers.js`
- **測試狀態約定**：本次執行結果記於第 9 節

## 2. 測試目標與範圍

本計畫從 `spec.md` 取得需求與驗收語意；系統邊界、端點、API operation、UI seam、資料責任及測試入口依 `plan.md` 與其指定的 system-analysis 產物。此計畫不重新盤點端點或設計系統。

### 納入範圍

- **US1**：菜單分類、餐點、規格群組與選項維護；顧客菜單讀取及已成立訂單快照。
- **US2**：店家切換／恢復餐點與選項供應狀態，以及既有 cart／新加購行為。
- **US3**：顧客 UI、cart unavailable 呈現、建單時最新供應狀態與伺服器計價。
- **US4**：menu、orders、admin、legacy 憑證授權、認證錯誤及客戶端不得自報角色。
- **US5**：穩定 JSON 錯誤結構、未知路由 404、未預期錯誤敏感資訊保護。
- **US6**：memory DB HTTP 整合旅程、冪等、防竄改金額、停供驗證、CI 回歸與 migration 驗證。

### 不納入範圍

- 真實金流、跨瀏覽器 Playwright E2E、顧客帳號、多店 tenant、數量型庫存及進階審計 UI。
- 規格未定義的 NFR 數值門檻；不推導毫秒、吞吐量或可用性數值。

## 3. 測試策略與優先級

| 測試層級 | 責任介面（依 system-analysis） | 驗證重點 |
|---|---|---|
| 前端元件／API client | `MenuPage`、`MenuCard`、`CartPage`、`MerchantMenuPage`、`merchantMenuApi.js`；依 `ui-plan.md` | 售完、購物車金額、權限錯誤提示及互動結果 |
| HTTP API | 006 OpenAPI 與 plan 指定的 002–005 上游契約 | operation、狀態碼、錯誤碼、session／CSRF、RBAC 與持久化副作用 |
| HTTP 整合 | `backend/src/__tests__/integration/system-e2e.test.js`、Supertest、`USE_MEMORY_DB=1` | 顧客／店家跨端點旅程、狀態一致、冪等與資料隔離 |
| Migration／回歸 | `backend/scripts/verify-migrations.mjs`、backend/frontend 測試套件 | migration 相容、舊資料保留及既有行為回歸 |

- **P0**：供應狀態權威、伺服器端金額、角色隔離、訂單／付款冪等、錯誤敏感資訊保護；失敗阻擋交付。
- **P1**：各 User Story 的正常流程、輸入驗證與所需 UI／API 驗收；故事交付前必須通過。
- **P2**：非必要呈現或補充邊界；僅在納入本次交付時排入。
- **通過／失敗**：依案例 Assert 的可觀察結果與資料副作用判定；不得因測試實作不便而改寫需求結果。

## 4. 非功能需求追溯

| NFR | 來源語意 | 適用 User Story | 驗證案例 | 可判定的驗收方式 |
|---|---|---|---|---|
| NFR-010 | API 錯誤須是 `{ error: { code, message } }`；4xx／5xx body 不含 stack、SQL 原文或伺服器路徑 | US5、US6 | TP-017、TP-018、TP-019、TP-023、TP-024 | 驗證錯誤結構、穩定碼與禁止洩漏內容；TP-019 使用環境限定的 test-only 路由 |
| NFR-010 | API 錯誤須是 `{ error: { code, message } }`；4xx／5xx body 不含 stack、SQL 原文或伺服器路徑 | US5、US6 | TP-017、TP-018、TP-019、TP-023、TP-024 | 驗證錯誤結構、穩定碼與禁止洩漏內容；TP-019 須等待 system-analysis 指定觸發 seam |
| NFR-011 | 集中處理可預期業務錯誤不得引入額外遠端呼叫；規格未設時間門檻 | US5 | TP-019 | 以 fetch spy 驗證無遠端呼叫，不新增時間門檻 |
| NFR-012 | 整合測試在預設 CI 環境可完成；若拆 job，需記錄執行方式 | US6 | TP-025 | 依預設 CI 命令完成測試並記錄；不自行設定時間門檻 |

## 5. User Story 測試案例

### 5.1 使用者故事 1－店家維護餐點分類與餐點資料

**目標／獨立驗收**：具 menu/admin 權限者可維護分類、餐點及規格；顧客菜單能讀到變更，既有訂單快照不變。

**需求追溯**：US1 情境1–4、FR-001–FR-003、FR-010、FR-012、BR-002、BR-003、SC-001。

| ID | 需求追溯 | 測試層級 | Public seam：system-analysis 測試入口 | 優先級 | Arrange：fixture 與差異 | Act：單一操作 | Assert：精確預期 |
|---|---|---|---|---|---|---|---|
| TP-001 | US1 情境1、FR-001、SC-001 | HTTP API | `POST /api/merchant/categories` (`createMerchantCategory`)；`GET /api/merchant/categories` (`listMerchantCategories`) | P1 | `FX-CATEGORY-EMPTY`；有效 menu token；使用尚未存在的分類名稱 | 建立一個分類 | [response] 回 201；回應與店家分類列表包含新分類，欄位相符 |
| TP-002 | US1 情境1、FR-002–FR-003、SC-001 | HTTP API | `POST /api/merchant/menu-items` (`createMerchantMenuItem`)；`GET /api/menu-items` (`listMenuItems`) | P1 | `FX-MENU-CATEGORY`；有效 menu token；餐點含有效價格、分類及 option group／options | 建立一個餐點 | [response] 回 201；公開菜單可讀到餐點、分類、規格與正確欄位 |
| TP-003 | US1 情境2、FR-002–FR-003、FR-012、BR-002 | HTTP 整合 | `PATCH /api/merchant/menu-items/{menu_item_id}` (`updateMerchantMenuItem`)；006 `GET /api/menu-items` (`listMenuItems`)；003 `GET /api/orders/{order_number}` (`getOrder`) | P0 | `FX-ORDER-SNAPSHOT-PRICE-CHANGED`；已有訂單快照價格 20.00、目前菜單價格 25.00；餐點有一組選項；有效 menu token 與 owner session | 更新餐點價格及 option group／option 資料 | [response+state] 公開菜單反映新價格與選項資料；既有訂單明細及 total snapshot 仍為建立時金額 |
| TP-004 | US1 情境4、FR-002 | HTTP API | `POST /api/merchant/menu-items` (`createMerchantMenuItem`) | P1 | `FX-MENU-CATEGORY`；有效 menu token；價格欄位為非有效十進位格式 | 建立餐點 | [response+state] 回 400 與契約定義的穩定錯誤碼；不建立餐點或部分規格資料 |
| TP-005 | US1、FR-001 | HTTP API | `POST /api/merchant/categories` (`createMerchantCategory`) | P1 | `FX-CATEGORY-EXISTS`；有效 menu token；同名分類已存在 | 建立同名分類 | [response+state] 回 409 duplicate category error；既有分類及餐點資料不變 |
| TP-006 | US1、FR-001、SC-001 | HTTP API | `DELETE /api/merchant/categories/{category_id}` (`deleteMerchantCategory`) | P1 | `FX-CATEGORY-IN-USE`；分類仍被餐點引用；有效 menu token | 刪除該分類 | [response+state] 回 409 `CATEGORY_IN_USE`；分類與餐點關聯保留 |
| TP-026 | US1、FR-001、SC-001 | HTTP API | `PATCH /api/merchant/categories/{category_id}` (`updateMerchantCategory`)；`GET /api/merchant/categories` (`listMerchantCategories`) | P1 | `FX-CATEGORY-EXISTS`；有效 menu token；目標分類存在，更新名稱不與其他分類衝突 | 更新分類名稱或 sort order | [response] 回 200；店家分類列表回傳更新後欄位 |

### 5.2 使用者故事 2－店家管理餐點售完與規格停供

**目標／獨立驗收**：店家能切換餐點／選項供應狀態；顧客交易依最新持久化狀態判斷。

**需求追溯**：US2 情境1–4、FR-004–FR-006、FR-010–FR-011、FR-013、BR-001、SC-002。

| ID | 需求追溯 | 測試層級 | Public seam：system-analysis 測試入口 | 優先級 | Arrange：fixture 與差異 | Act：單一操作 | Assert：精確預期 |
|---|---|---|---|---|---|---|---|
| TP-007 | US2 情境1、FR-004、FR-006、SC-002 | HTTP API／前端 | `PATCH /api/merchant/menu-items/{menu_item_id}/availability` (`patchMenuItemAvailability`)；顧客 `MenuPage`／`MenuCard` | P0 | `FX-ACTIVE-MENU-ITEM`；餐點供應中；menu token | 將餐點切換為停止供應 | [response+state] API 持久化 `is_active=false`；顧客菜單顯示售完且不能開始有效加購 |
| TP-008 | US2 情境3、FR-005、FR-011、BR-001 | HTTP 整合 | `PATCH /api/merchant/menu-items/{menu_item_id}/options/{option_id}/availability` (`patchMenuOptionAvailability`)；002 `POST /api/cart/items` (`addCartItem`) | P0 | `FX-ACTIVE-MENU-ITEM`；餐點供應中、所選 option 停供；有效 guest session／Origin／CSRF | 加入含停供 option 的 cart item | [response+state] 回 409 `CART_ITEM_UNAVAILABLE`；cart 不新增項目 |
| TP-009 | US2 情境4、FR-004–FR-006、FR-011、BR-001、SC-002 | HTTP 整合 | `PATCH /api/merchant/menu-items/{menu_item_id}/availability` (`patchMenuItemAvailability`)；006 `GET /api/menu-items` (`listMenuItems`)；002 `POST /api/cart/items` (`addCartItem`) | P0 | `FX-ACTIVE-MENU-ITEM`；餐點目前停供；有效 menu token 與 guest session／Origin／CSRF | 恢復餐點供應 | [response+state] PATCH 成功並持久化 `is_active=true`；公開菜單反映供應中；合法加購成功且依最新價格計算 |

### 5.3 使用者故事 3－顧客端反映供應狀態並阻擋無效下單

**目標／獨立驗收**：顧客 UI 清楚標示停供項目；建單使用伺服器最新供應狀態及計價結果。

**需求追溯**：US3 情境1–4、FR-007–FR-008、FR-011–FR-013、BR-001–BR-002、SC-002、SC-005。

| ID | 需求追溯 | 測試層級 | Public seam：system-analysis 測試入口 | 優先級 | Arrange：fixture 與差異 | Act：單一操作 | Assert：精確預期 |
|---|---|---|---|---|---|---|---|
| TP-010 | US3 情境1、FR-007、SC-002 | 前端元件 | `MenuPage`／`MenuCard`（依 `ui-plan.md`「顧客售完標示」） | P1 | `FX-MENU-SOLD-OUT`；菜單含一個停供餐點 | 呈現菜單並操作停供餐點卡片 | [response] 顯示售完標示；不進入有效下單流程，對話框若開啟只能關閉 |
| TP-011 | US3 情境2、FR-007、FR-013、SC-002 | 前端頁面 | `CartPage`；002 `GET /api/cart` (`getCart`) | P0 | `FX-CART-MIXED-AVAILABILITY`；一筆可用、一筆停供項目及已知價格 | 載入購物車 | [response] 停供列顯示不可用且不計總額；總額只包含可用列；無可用項時建單操作不可執行 |
| TP-012 | US3 情境3、FR-008、FR-013、BR-001 | HTTP 整合 | 003 `POST /api/orders` (`createOrder`) | P0 | `FX-ORDER-CREATE-UNAVAILABLE`；cart 同時有可用與停供 item；有效 owner session／Origin／CSRF；記錄建單前 cart 與 order 數量 | 建立訂單 | [response+state] 依 003 契約回 409 `CART_HAS_UNAVAILABLE_ITEMS`；無新訂單編號；cart 保留 |
| TP-013 | US3 情境4、FR-012、BR-001、SC-005 | HTTP 整合 | 003 `POST /api/orders` (`createOrder`) | P0 | 有效 priced cart；body 帶偽造金額 | 建立訂單 | [response] 回 201；response／資料快照只使用 server totals；未知欄位仍拒絕。已通過。 |
| TP-027 | US3 情境4、FR-012、BR-001、SC-005 | HTTP API | 002 `POST /api/cart/items` (`addCartItem`) | P0 | `FX-CART-EMPTY`；有效 guest session／Origin／CSRF；請求 body 夾帶 `unit_price`、`line_total` 或 `total_amount` | 加入餐點時提交金額欄位 | [response+state] 回 400；回應符合 002 error contract；cart 保持不變，沒有任何客戶端金額持久化 |

### 5.4 使用者故事 4－店家 API 角色權限控管

**目標／獨立驗收**：orders、menu、admin 與 legacy 憑證僅能執行授權操作；角色由伺服器設定解析。

**需求追溯**：US4 情境1–4、FR-009–FR-010、FR-014–FR-015、BR-003、SC-004。

| ID | 需求追溯 | 測試層級 | Public seam：system-analysis 測試入口 | 優先級 | Arrange：fixture 與差異 | Act：單一操作 | Assert：精確預期 |
|---|---|---|---|---|---|---|---|
| TP-014 | US4 情境1–3、FR-009–FR-010、FR-014–FR-015、BR-003、SC-004 | HTTP 整合 | 006 `createMerchantCategory`／`patchMenuItemAvailability`；004 `listMerchantOrders`／`acceptMerchantOrder`；005 merchant order routes | P0 | `FX-MERCHANT-ROLE-MATRIX`；menu-only、orders-only、admin、legacy `MERCHANT_TOKEN`；記錄資料初始值；orders-only 請求另夾帶 `X-Merchant-Role: admin` | 對各角色執行其允許與拒絕的 merchant operation | [response+state] menu-only 可寫菜單但不能接單；orders-only 可讀／操作訂單但不能寫菜單；客戶端自報角色不得升權；admin 與 legacy 可執行兩類操作；越權回 403 `MERCHANT_FORBIDDEN` 且資料不變 |
| TP-015 | US4 情境4、FR-009、FR-015 | HTTP API | 任一受保護 006 merchant menu operation | P0 | `FX-MERCHANT-AUTH`；分別準備 missing token 與 invalid token；憑證設定有效 | 呼叫受保護操作 | [response] 兩種情況皆回 401 `MERCHANT_UNAUTHORIZED`；不回傳受保護資料或改動資料 |
| TP-016 | US4 情境4、FR-009 | HTTP API | 任一受保護 006 merchant menu operation | P0 | `FX-MERCHANT-NOT-CONFIGURED`；程序未配置 `MERCHANT_CREDENTIALS` 與 legacy `MERCHANT_TOKEN` | 呼叫受保護操作 | [response] 回 503 `MERCHANT_NOT_CONFIGURED`；不回傳受保護資料 |

### 5.5 使用者故事 5－一致例外處理與錯誤回應

**目標／獨立驗收**：API 錯誤回應結構穩定；未知路由為 JSON；未預期錯誤不洩漏敏感細節。

**需求追溯**：US5 情境1–4、FR-016–FR-017、NFR-010–NFR-011、BR-004、SC-006。

| ID | 需求追溯 | 測試層級 | Public seam：system-analysis 測試入口 | 優先級 | Arrange：fixture 與差異 | Act：單一操作 | Assert：精確預期 |
|---|---|---|---|---|---|---|---|
| TP-017 | US5 情境1、FR-016、NFR-010、BR-004 | HTTP API | 006 `POST /api/merchant/categories` (`createMerchantCategory`)；`ErrorBody` | P1 | `FX-INVALID-MERCHANT-BODY`；有效 menu token；缺少契約必填欄位 | 送出無效 JSON payload | [response+state] 回 400；body 符合 `{ error: { code, message } }`；錯誤處理不改資料 |
| TP-018 | US5 情境2、FR-017、NFR-010、BR-004、SC-006 | HTTP API | 未知 `/api/*` 路徑；006 `NotFound` response | P1 | `FX-UNKNOWN-API-PATH`；正常測試環境 | GET 未知 API 路徑 | [response] 回 404 JSON `NOT_FOUND` 與 `message`；不是 HTML，body 不含 stack／SQL／檔案路徑 |
| TP-019 | US5 情境3、FR-016、NFR-010–NFR-011、BR-004、SC-006 | HTTP 整合 | **待補 system-analysis 測試入口**；目前 plan／API contract 未列可控的未預期錯誤觸發 seam，不得以 test-only route 替代 | P0 | 取得經分析產物確認的安全觸發入口後，再準備含 SQL／password／path 的測試錯誤及 log／fetch spy | 待入口確認後觸發未預期錯誤 | [response+side-effect] 待入口確認後驗證 500 `INTERNAL_ERROR`、body 不洩漏細節、細節依分析規劃記錄且無額外遠端呼叫；入口未補齊前本案阻塞，不判定通過 |

### 5.6 使用者故事 6－整合測試與端到端系統驗證

**目標／獨立驗收**：使用共用 memory DB／harness 重複驗證跨模組旅程、冪等、金額權威、停供護欄及預設 CI 回歸。

**需求追溯**：US6 情境1–5、FR-018–FR-019、NFR-010、NFR-012、BR-001–BR-004、SC-001–SC-007。

| ID | 需求追溯 | 測試層級 | Public seam：system-analysis 測試入口 | 優先級 | Arrange：fixture 與差異 | Act：單一操作 | Assert：精確預期 |
|---|---|---|---|---|---|---|---|
| TP-020 | US6 情境1、FR-018–FR-019、NFR-010、SC-003 | HTTP 整合 | `backend/src/__tests__/integration/system-e2e.test.js`；`USE_MEMORY_DB=1` 共用 harness；003／004／005 contracts | P0 | `FX-E2E-ORDER-LIFECYCLE`；memory DB reset；guest session、active menu、merchant credentials、payment deterministic stub | 執行瀏覽／加購／建單／查詢／付款／accept／start-preparing／complete 旅程 | [response+state] 每步 HTTP 與持久化狀態符合相應契約；顧客與店家讀到相同訂單狀態及金額快照 |
| TP-021 | US6 情境2、FR-018、SC-003 | HTTP 整合 | `system-e2e.test.js`；003 `POST /api/orders` (`createOrder`) | P0 | `FX-ORDER-IDEMPOTENCY`；有效 cart/session；無既有 key mapping | 同一 session 以同一 `Idempotency-Key` 重送建單 | [idempotent] 僅一筆訂單；首次回 201、重送回 200，兩者 order number 相同 |
| TP-022 | US6 情境1、FR-018、SC-003 | HTTP 整合 | `system-e2e.test.js`；005 `POST /api/orders/{order_number}/pay` (`payOrder`) | P0 | `FX-PAYMENT-IDEMPOTENCY`；unpaid order；付款 stub success；固定 key | 以相同付款 `Idempotency-Key` 重送付款 | [idempotent] 回傳相同成功付款結果；僅一筆成功付款冪等映射，不重複付款 |
| TP-023 | US6 情境3、FR-012、NFR-010、BR-001–BR-002、SC-005 | HTTP 整合 | `system-e2e.test.js`；005 `payOrder` | P0 | unpaid order；body 帶偽造金額及明細 | 付款 | [response+state] 回 200；paid result 與資料快照只採用 server total/items。已通過。 |
| TP-024 | US6 情境4、FR-018–FR-019、FR-011、FR-013、NFR-010、BR-001、SC-002 | HTTP 整合 | `system-e2e.test.js`；006 `patchMenuItemAvailability`；003 `createOrder` | P0 | `FX-ACTIVE-ITEM-IN-GUEST-CART`；cart 同時有可用與即將停供項目；menu token 與 guest session 分離 | 停供該餐點後立即建單 | [response+state] 回 409 `CART_HAS_UNAVAILABLE_ITEMS` 且符合 NFR-010 JSON error shape；無新訂單，cart 保留 |
| TP-025 | US6 情境5、FR-018–FR-019、NFR-012、SC-007 | Backend test suite | `USE_MEMORY_DB=1 npm test`（working directory `backend/`）；依 `techstack.md` 預設 CI | P1 | `FX-E2E-ORDER-LIFECYCLE`；memory DB reset；依 techstack 建立預設 CI 環境 | 執行 backend 預設測試套件 | [response] exit code 為 0；預設 suite 包含 integration tests；若 CI 分拆 job，執行方式已記錄；不設定 spec 未定義時間門檻 |
| TP-028 | US6 情境5、FR-018、SC-007 | Migration CLI | `npm run verify:migrations`（working directory `backend/`）；`backend/scripts/verify-migrations.mjs` | P1 | `FX-MIGRATION-PRIOR-ORDER`；舊 schema 有訂單及明細；使用專用可重建 migration DB | 執行 migration 驗證命令 | [response+state] exit code 為 0；既有訂單／明細保留且新欄位預設值符合 migration／data model |

## 6. 具名 Fixture 與環境

| Fixture | 必要狀態、欄位與資料關聯 | 身分／權限 | 隔離與重設方式 |
|---|---|---|---|
| `FX-CATEGORY-EMPTY` | 尚無指定分類名稱 | menu token | 每案例建立唯一名稱，完成後 reset |
| `FX-CATEGORY-EXISTS` | 指定分類名稱已存在 | menu token | 每案例 seed/reset |
| `FX-CATEGORY-IN-USE` | category 被至少一個 menu item 引用 | menu token | 每案例 seed/reset |
| `FX-MENU-CATEGORY` | 有效 category；餐點及 option group payload 欄位已知 | menu token／admin token | 使用共用測試 harness；每案例 reset |
| `FX-INVALID-MERCHANT-BODY` | 建立分類 payload 缺少必填 `name` | menu token | 每案例使用獨立程序狀態，執行後確認 DB 無變更 |
| `FX-ACTIVE-MENU-ITEM` | 餐點與指定 options 初始 `is_active=true`，價格已知 | menu token；顧客使用 guest session | 每案例建立獨立 item/cart |
| `FX-MENU-SOLD-OUT` | 公開菜單含 `is_active=false` 餐點 | 顧客 | 前端測試使用獨立 props/mock data |
| `FX-CART-EMPTY` | 有效 guest session 的 cart 無項目，server menu item 仍供應中 | guest session／Origin／CSRF | 透過 `bootstrapCartSession` 建立；每案例 reset |
| `FX-CART-PRICED` | cart 項目、option 加價、數量及 server-calculated total 均已知 | guest session／Origin／CSRF | 每案例建立獨立 session/cart；reset 後核對 total |
| `FX-CART-MIXED-AVAILABILITY` | 一筆可用及一筆 unavailable item；總額只含可用列 | guest session／Origin／CSRF | 使用 `bootstrapCartSession`；每案例 reset |
| `FX-ORDER-CREATE-UNAVAILABLE` | cart 同時含一筆可用及一筆後續停供項目；order 尚不存在 | guest session／Origin／CSRF | memory DB 每案例 reset；獨立 session |
| `FX-ACTIVE-ITEM-IN-GUEST-CART` | guest cart 含一筆可用目標餐點與另一筆可用項目；目標餐點可獨立停供 | guest session／Origin／CSRF + menu token | 每案例獨立 session/cart；記錄停供前資料及 order 數量 |
| `FX-ORDER-SNAPSHOT-PRICE-CHANGED` | 已建立訂單快照價格與目前菜單價格不同 | owner guest session／menu token | 每案例建立 order，測後確認 snapshot 未變 |
| `FX-MERCHANT-ROLE-MATRIX` | menu-only、orders-only、admin、legacy、missing、invalid credential | 測試 token；不得使用正式 secret | 依 `testHarness.js` 測試環境設定；每案例重設 credentials |
| `FX-MERCHANT-AUTH` | 有效 merchant credentials 已配置；missing 與 invalid token 各一組 | 無效／缺漏 token | 每個情境獨立呼叫，不共用資料副作用 |
| `FX-MERCHANT-NOT-CONFIGURED` | `MERCHANT_CREDENTIALS` 與 legacy `MERCHANT_TOKEN` 均未設定 | 未配置 merchant credentials | 隔離測試程序環境，不修改使用者環境變數 |
| `FX-UNKNOWN-API-PATH` | Express app 已註冊 API router，但指定 `/api` 路徑不存在 | 無需身分 | 每案例使用唯一不存在路徑；不建立資料 |
| `FX-UNEXPECTED-ERROR` | 含 stack／SQL／路徑的可控錯誤及可觀察日誌 | 僅測試環境 | **建立方式受阻**：需 system-analysis 指定安全錯誤觸發 seam；未確認前不執行 |
| `FX-E2E-ORDER-LIFECYCLE` | active menu、guest cart、order、payment stub 及 merchant token | guest session + merchant credentials | `USE_MEMORY_DB=1`；每個旅程 reset DB/session/key |
| `FX-ORDER-IDEMPOTENCY` | cart 可建單、無既有 mapping；同一 session/key | guest session | 每案例使用唯一 session/key；清除 mapping |
| `FX-PAYMENT-IDEMPOTENCY` | unpaid order、payment stub success、無既有 payment mapping | owner guest session | 每案例使用唯一 order/key；清除 mapping |
| `FX-MIGRATION-PRIOR-ORDER` | 舊 schema 中一筆訂單及明細快照 | migration 測試程序 | 可重建專用 migration DB |

### 執行環境

- **Backend 測試**：`backend/` 執行 `USE_MEMORY_DB=1 npm test`；測試框架為 Node test runner 與 Supertest，session／cart／order／merchant helpers 依 `backend/src/__tests__/testHelpers.js`。
- **Frontend 測試**：`frontend/` 執行 `npm test`；沿用既有 Node test runner。UI 測試入口依 `ui-plan.md` 指定的 `MenuCard`、頁面及 `merchantMenuApi.test.js`。
- **Migration 驗證**：`backend/` 執行 `npm run verify:migrations`。
- **Smoke**：依 `techstack.md`，`backend/` 執行 `USE_MEMORY_DB=1 npm run smoke:006`。
- **隔離**：guest session、order number、idempotency key 與測試資料每案例獨立；不依賴案例順序，不呼叫真實金流。
- **秘密**：只使用測試 token；計畫不記錄任何真實 secret。

## 7. 執行與交接
### 快速狀態摘要


- **最後執行日期**：2026-10-22（backend full suite）
- **已完成 TP**：TP-001–TP-018、TP-020–TP-027（TP-025 本次 backend 149/149 通過；其餘依既有執行摘要）
- **進行中 TP**：無
- **未啟動 TP**：TP-019（分析入口缺漏）、TP-028（真實 SQL Server 資料保留未驗證）
- **已知阻塞**：TP-019 須先補 system-analysis seam；TP-028 需專用 MSSQL 環境。
- **下一步建議**：先補 plan／API analysis 並重驗 TP-019；再於有 SQL Server 測試目標的環境執行 TP-028。

### 代表性整合旅程

1. **正常點餐與出餐**：瀏覽菜單 → 加購 → 建單 → 查詢 → stub 付款成功 → 店家接單 → 開始出餐 → 完成；顧客與店家讀取到一致狀態及快照。
2. **供應狀態競態**：餐點加入 cart 後停供，建單拒絕且 cart 保留；恢復供應後使用最新狀態與價格重新建單。
3. **冪等與金額權威**：建單及付款分別重送相同 key，確認不重複建立成功結果；竄改金額不影響持久化 server-calculated total。

### 執行條件

- 金額相容欄位政策已記入 upstream contracts：明列欄位忽略、未知欄位拒絕。
- TP-019 的既有 test-only route 雖有程式實作與歷史測試結果，但未列於 system-analysis 產物；依本技能不得將其作為計畫 seam。須先更新 plan／分析產物，再恢復此案例的可執行驗收。

### 新 session 啟動檢查

1. 讀取本計畫所選 TP 案例及 `spec.md` 對應需求 ID。
2. 依案例引用的 006 與上游 002–005 contracts 核對 operation、錯誤碼、session／CSRF 及授權條件。
3. 核對 `plan.md` 指定的 UI／data／API 入口、fixture、測試命令與 reset 方式。
4. 執行時以 contract、fixture 與資料副作用判定；test-only error route 不進 production。

## 8. 需求至測試追溯

| User Story／需求 ID | 本計畫案例 |
|---|---|
| US1；FR-001–FR-003；FR-010；FR-012；BR-002–BR-003；SC-001 | TP-001–TP-006、TP-026 |
| US2；FR-004–FR-006；FR-010–FR-011；FR-013；BR-001；SC-002 | TP-007–TP-009 |
| US3；FR-007–FR-008；FR-011–FR-013；BR-001–BR-002；SC-002、SC-005 | TP-010–TP-013、TP-027 |
| US4；FR-009–FR-010；FR-014–FR-015；BR-003；SC-004 | TP-014–TP-016 |
| US5；FR-016–FR-017；NFR-010–NFR-011；BR-004；SC-006 | TP-017–TP-019 |
| US6；FR-018–FR-019；NFR-010、NFR-012；BR-001–BR-004；SC-001–SC-007 | TP-020–TP-025、TP-028 |
| 跨故事 NFR-010 | TP-017–TP-020 |

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
| TP-026 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-007 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-008 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-009 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-010 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-011 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-012 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-013 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-027 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-014 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-015 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-016 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-017 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-018 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-019 | ⬜ 未執行 | — | — | — | — | 測試入口未列於 system-analysis；待補來源後重驗 |
| TP-020 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-021 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-022 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-023 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-024 | 🟢 GREEN 通過 | — | — | 既有執行摘要記錄通過 | — |  |
| TP-025 | 🟢 GREEN 通過 | 2026-10-22 | — | `USE_MEMORY_DB=1 npm test`（backend，149/149，exit code 0） | 符合 | 本次完整套件執行 |
| TP-028 | ⬜ 未執行 | 2026-10-22 | — | `npm run verify:migrations` 靜態檢查通過；真實 SQL Server 資料保留未驗證 | — | 需專用 MSSQL 測試目標 |

## 11. AI 自主決策與發現紀錄

| 日期 | TP 案例 | TDD 步驟 | 決策／發現內容 | 處置 |
|---|---|---|---|---|
| — | — | — | — | — |

## 12. 執行結果（既有紀錄）

- TP-001–TP-018、TP-020–TP-024、TP-026–TP-027：歷史 Backend／Frontend 測試或瀏覽器驗收紀錄為通過，涵蓋菜單 CRUD／供應、RBAC、購物車與建單護欄、整合旅程、冪等及金額權威。
- TP-019：歷史紀錄曾以未列於 system-analysis 的 test-only route 驗證並標示通過；依本次入口權威檢查，該結果不作為本計畫案例的核准驗收，待補來源 seam 後重驗。
- TP-025：本次 backend 預設 memory DB suite 149/149 通過（exit code 0）；Frontend full suite 25/25 通過。
- TP-028：本次靜態 migration verifier 通過六個 migration 與 005/006 DDL anchors；真實 SQL Server 舊資料保留 smoke 因 MSSQL_* 未設定而未執行，故不宣稱資料保留已驗證。
- `npm run smoke:006` 與 frontend production build 通過。

Constitution self-check: exceptions — TP-019 的錯誤觸發 seam 未列入 system-analysis；TP-028 真實 MSSQL 資料保留 smoke 因本機無專用 SQL Server 設定而未執行。
