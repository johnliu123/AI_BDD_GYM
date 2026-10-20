# 點餐系統第六迭代測試計畫

## 1. 計畫資訊

- **狀態**：待審閱；案例均為規劃中，尚未代表已實作或通過
- **更新日**：2026-10-20
- **需求範圍**：006 迭代的菜單維護、供應狀態、顧客購物車與建單驗證、店家 RBAC、錯誤回應及整合測試
- **需求來源**：`specs/006-advanced-features-system-verification/spec.md`
- **系統分析來源**：`plan.md`、`ui-plan.md`、`data-model.dbml`、`contracts/http-api.yaml`；實作環境與測試命令依 `research.md`、`techstack.md`
- **前置契約**：顧客購物車／建單使用 002／003 契約；店家訂單與付款／出餐使用 004／005 契約

## 2. 計畫原則與範圍

本計畫以 `spec.md` 的 User Story、驗收情境、FR、BR、NFR 與 SC 作需求追溯；端點、系統邊界、資料責任、API operation、UI seam 與測試入口，以 system-analysis 產物及其指定的上游契約為準。本計畫不重新盤點或設計系統端點。

### 納入範圍

- **US1**：店家維護分類、餐點與規格；顧客菜單讀取反映資料變更。
- **US2**：店家切換餐點／選項供應狀態及恢復供應。
- **US3**：顧客菜單、購物車及建單以伺服器最新供應狀態與價格為準。
- **US4**：店家 menu、orders、admin 角色授權與相容行為。
- **US5**：一致 JSON 錯誤回應、內部細節保護及錯誤處理邊界。
- **US6**：跨端點整合、冪等、migration 與回歸測試入口。

### 不納入範圍

- 真實金流、顧客帳號、多店 tenant、數量型庫存及跨瀏覽器 UI E2E。
- 規格或 system-analysis 未定義的效能門檻、可用性數值及外部服務行為。

## 3. 測試策略與優先級

| 測試層級 | 依 system-analysis 確認的責任介面 | 驗證重點 |
|---|---|---|
| 元件／頁面 | `ui-plan.md` 所列店家菜單與顧客菜單／購物車頁面 | 供應狀態、錯誤與操作狀態呈現 |
| HTTP API | `contracts/http-api.yaml` 與 002–005 上游契約 | 輸入驗證、RBAC、狀態碼、錯誤 body 與資料副作用 |
| 資料／migration | `data-model.dbml` 與既有 migration 驗證入口 | 菜單持久化、歷史訂單快照與 migration 相容 |
| 整合 | `plan.md` 指定的 backend memory DB／test harness | 顧客與店家跨端點流程、供應狀態競態及冪等 |

- **P0**：金額權威、供應狀態、角色隔離、訂單／付款冪等及錯誤敏感資訊不洩漏；失敗阻擋交付。
- **P1**：各故事的正常流程與必要回歸；故事驗收前必須通過。
- **P2**：非阻擋性呈現或補充邊界；依交付範圍排入。
- **通過**：案例的精確 Assert 成立，且需驗證的持久化副作用正確。
- **失敗**：可觀測結果不符預期；記錄紅燈原因，不以修改預期值掩蓋差異。

## 4. 非功能需求追溯

| NFR | 來源語意 | 適用 User Story | 驗證案例 | 可判定的驗收方式 |
|---|---|---|---|---|
| NFR-010 | API 錯誤採穩定 JSON 結構，body 不含 stack、SQL 原文或伺服器路徑 | US5、US6 | TP-011、TP-012、TP-013 | 對照 status、`error.code`、`message` 與禁止洩漏欄位 |
| NFR-011 | 集中錯誤處理不得引入額外遠端呼叫；未定義時間門檻 | US5 | TP-012 | 使用可觀測的外部呼叫計數器確認錯誤處理未觸發額外遠端呼叫；不自訂毫秒門檻 |
| NFR-012 | 整合測試在預設 CI 環境可完成；若分拆 job，須記錄執行方式 | US6 | TP-015 | 依專案預設 CI／測試命令完成測試並記錄結果；不虛構時間門檻 |

## 5. User Story 測試案例

### 5.1 US1－店家維護餐點分類與餐點資料

**需求追溯**：FR-001–FR-003、FR-010、FR-012；BR-002、BR-003；SC-001。

| ID | 需求追溯 | 層級／測試入口 | 優先級 | Arrange | Act | Assert |
|---|---|---|---|---|---|---|
| TP-001 | US1、FR-001–FR-003、SC-001 | HTTP：`POST /api/merchant/categories` (`createMerchantCategory`)；`POST /api/merchant/menu-items` (`createMerchantMenuItem`)；`GET /api/menu-items` (`listMenuItems`) | P1 | 有效 menu token；尚無指定分類與餐點；建立請求含有效餐點欄位及規格群組 | 建立分類與餐點，接著讀取公開菜單 | 寫入回應成功；公開菜單含新餐點、分類及規格欄位，值與請求一致 |
| TP-002 | US1、FR-002–FR-003、US1 情境4 | HTTP：`POST /api/merchant/menu-items` (`createMerchantMenuItem`) | P1 | 有效 menu token；有效分類；餐點 payload 價格格式錯誤 | 建立餐點 | 回 400 與穩定錯誤碼；餐點及規格均未部分寫入 |
| TP-003 | US1、FR-001、SC-001 | HTTP：`DELETE /api/merchant/categories/{category_id}` (`deleteMerchantCategory`) | P1 | 有效 menu token；分類仍被餐點引用 | 刪除該分類 | 回 409 `CATEGORY_IN_USE`；分類與關聯保留 |

### 5.2 US2－店家管理餐點售完與規格停供

**需求追溯**：FR-004–FR-006、FR-010–FR-011、FR-013；BR-001；SC-002。

| ID | 需求追溯 | 層級／測試入口 | 優先級 | Arrange | Act | Assert |
|---|---|---|---|---|---|---|
| TP-004 | US2、FR-004、FR-006、SC-002 | HTTP：`PATCH /api/merchant/menu-items/{menu_item_id}/availability` (`patchMenuItemAvailability`)；`GET /api/menu-items` (`listMenuItems`) | P0 | 有效 menu token；餐點目前供應中 | 將餐點設為停供並讀取公開菜單 | 回應及公開菜單均反映停供；持久化 `is_active=false` |
| TP-005 | US2、FR-005、FR-011、US2 情境3 | HTTP：`PATCH /api/merchant/menu-items/{menu_item_id}/options/{option_id}/availability` (`patchMenuOptionAvailability`)；`POST /api/cart/items` (`addCartItem`) | P0 | 餐點供應中；指定選項已被顧客選取；有效 guest session／CSRF | 停供該選項後，以含該選項的 payload 加入購物車 | 加購回 409 `CART_ITEM_UNAVAILABLE`；cart 不新增項目；未含停供選項的案例仍可獨立驗證 |

### 5.3 US3－顧客端反映供應狀態並阻擋無效下單

**需求追溯**：FR-007–FR-008、FR-011–FR-013；BR-001–BR-002；SC-002、SC-005。

| ID | 需求追溯 | 層級／測試入口 | 優先級 | Arrange | Act | Assert |
|---|---|---|---|---|---|---|
| TP-006 | US3、FR-007、FR-013、US3 情境2 | HTTP：`GET /api/cart` (`getCart`)；顧客 `CartPage` | P0 | cart 含一個可用項目與一個其後停供的項目 | 讀取 cart 並呈現購物車頁 | 停供列標示不可用且不計入總額；可用列與總額仍正確 |
| TP-007 | US3、FR-008、FR-013、US3 情境3 | HTTP：`POST /api/orders` (`createOrder`) | P0 | 有效 guest session／CSRF；cart 含已停供項目；記錄建單前狀態 | 建立訂單 | 回 409；不產生訂單；cart 保留 |
| TP-008 | US3、FR-012、US3 情境4、SC-005 | HTTP：`POST /api/orders` (`createOrder`) | P0 | cart 伺服器總額可計算；請求 body 夾帶偽造 `total_amount`、`line_total`、`is_active` | 建立訂單 | 持久化金額依伺服器菜單資料計算；客戶端偽造欄位不改變金額或供應判定 |

### 5.4 US4－店家 API 角色權限控管

**需求追溯**：FR-009–FR-010、FR-014–FR-015；BR-003；SC-004。

| ID | 需求追溯 | 層級／測試入口 | 優先級 | Arrange | Act | Assert |
|---|---|---|---|---|---|---|
| TP-009 | US4、FR-009、FR-010、FR-014、FR-015、SC-004 | HTTP：menu write `createMerchantCategory`；merchant order `acceptMerchantOrder` | P0 | 分別準備 menu-only、orders-only、admin 與 legacy admin 憑證 | 對允許及拒絕的 endpoint 發出請求 | 各角色只可執行授權操作；拒絕為 403；legacy token 維持 admin 語意；資料未被拒絕請求改動 |
| TP-010 | US4、FR-009、US4 情境4 | HTTP：受保護的 merchant menu／orders endpoint | P0 | 分別準備缺 token、錯誤 token、未配置任何 merchant credential 的環境 | 呼叫受保護 endpoint | 缺漏／不符 token 回 401；未配置回 503；不回傳受保護資料 |

### 5.5 US5－一致例外處理與錯誤回應

**需求追溯**：FR-016–FR-017、NFR-010–NFR-011；BR-004；SC-006。

| ID | 需求追溯 | 層級／測試入口 | 優先級 | Arrange | Act | Assert |
|---|---|---|---|---|---|---|
| TP-011 | US5、FR-017、NFR-010、US5 情境2 | HTTP：未知 `/api/*` 路徑 | P1 | 測試環境正常啟動 | GET 未知 API 路徑 | 回 404 JSON，含穩定 `error.code` 與 `message`，不是 HTML |
| TP-012 | US5、FR-016、NFR-010–NFR-011、BR-004、US5 情境3 | HTTP：測試環境的預期錯誤觸發入口；集中 error middleware | P0 | 可控錯誤包含測試用 stack／SQL／路徑文字；外部呼叫計數器歸零 | 觸發未預期錯誤 | 回 500 通用 JSON；body 不含 stack、SQL、路徑；必要細節只進伺服器日誌；錯誤處理沒有新增遠端呼叫 |

### 5.6 US6－整合測試與端到端系統驗證

**需求追溯**：FR-018–FR-019、NFR-010、NFR-012；SC-003、SC-005、SC-007。

| ID | 需求追溯 | 層級／測試入口 | 優先級 | Arrange | Act | Assert |
|---|---|---|---|---|---|---|
| TP-013 | US6、FR-018–FR-019、NFR-010、SC-003 | backend `src/__tests__/integration/system-e2e.test.js`；memory DB harness | P0 | reset memory DB；建立菜單、guest session、merchant roles；付款使用 deterministic stub | 執行瀏覽／加購／建單／付款／店家接單／完成旅程 | 每步 status 與持久化狀態符合對應契約；顧客與店家讀到相同狀態及訂單快照 |
| TP-014 | US6、FR-018–FR-019、NFR-010、SC-005 | 整合測試：`POST /api/orders`；付款與訂單冪等入口 | P0 | 建立可用 cart；記錄 order／payment 數量；使用固定冪等鍵與偽造金額 body | 以相同 key 重送建單／付款並夾帶偽造金額 | 僅有一個成功訂單／付款結果；回應指向原結果；持久化金額仍由伺服器計算 |
| TP-015 | US6、FR-018–FR-019、NFR-012、SC-007 | `npm test`（backend 預設 CI working directory）；`npm run verify:migrations` | P1 | 依 `techstack.md` 的預設 CI 環境與 migration fixture 執行 | 執行預設整合／回歸測試及 migration 驗證入口 | 命令成功結束；migration 保留舊訂單資料；記錄實際 CI 執行方式，不套用規格未定義的時間門檻 |

## 6. 具名 Fixture 與環境

| Fixture | 必要狀態 | 身分／隔離 |
|---|---|---|
| `FX-MENU-CRUD` | 無指定分類；有效餐點、價格與選項 payload | 每案例 seed/reset；有效 menu token |
| `FX-CATEGORY-IN-USE` | 分類至少被一筆餐點引用 | 每案例 seed/reset；有效 menu token |
| `FX-ACTIVE-ITEM-AND-OPTION` | 餐點、選項均供應中；可控制停供狀態 | guest session 與 menu token 分離 |
| `FX-CART-MIXED-AVAILABILITY` | 一筆可用及一筆停供 cart item；已知價格與總額 | 獨立 guest session；每案例重設 |
| `FX-ORDER-CREATE-UNAVAILABLE` | cart 含已停供餐點或選項 | guest cookie／CSRF 有效；訂單表初始為空 |
| `FX-MERCHANT-ROLE-MATRIX` | menu、orders、admin、legacy、missing、invalid credentials | 測試專用憑證；不可使用正式 token |
| `FX-ERROR-SANITIZATION` | 可控錯誤含 stack、SQL、路徑標記；外部呼叫 counter 可觀察 | 只在測試環境啟用 |
| `FX-E2E-ORDER-LIFECYCLE` | 可用菜單、空 cart、guest session、merchant role、付款 stub | 共用 memory DB harness；每次 reset |
| `FX-MIGRATION-PRIOR-ORDER` | 舊 schema 中有訂單與明細 | 可重建專用 migration DB |

**執行命令及版本**：依 `techstack.md` 與 `plan.md` 指定的 backend test harness、Node.js 版本、工作目錄和 CI 命令；不得在本計畫另行推測。

## 7. 執行與交接

### TDD 進入條件

- 本計畫完成審閱，來源 spec、分析產物與測試案例沒有未決高影響差異。
- 每輪選一個 TP 案例與 public seam；先依 `/tdd` RED 確認測試失敗原因正確，再進入 GREEN，測試通過後才可選擇 REFACTOR。

### 新 session 啟動檢查

1. 讀取本計畫指定 TP 案例及其 `spec.md` 需求追溯。
2. 從 `plan.md` 與該案例引用的 `ui-plan.md`、`data-model.dbml`、`contracts/http-api.yaml` 核對端點、測試入口及契約；不可自行重規劃。
3. 核對 fixture、測試命令、身分、stub、資料隔離與 reset 方式。
4. 若來源、端點或 public seam 不一致，停止並提出差異；更新／確認 testplan 後再開始 TDD。

## 8. 需求至測試追溯

| 需求 | 測試案例 |
|---|---|
| US1；FR-001–FR-003；SC-001 | TP-001–TP-003 |
| US2；FR-004–FR-006；SC-002 | TP-004–TP-005 |
| US3；FR-007–FR-008、FR-011–FR-013；SC-005 | TP-006–TP-008 |
| US4；FR-009–FR-010、FR-014–FR-015；SC-004 | TP-009–TP-010 |
| US5；FR-016–FR-017；NFR-010–NFR-011；SC-006 | TP-011–TP-012 |
| US6；FR-018–FR-019；NFR-010、NFR-012；SC-003、SC-005、SC-007 | TP-013–TP-015 |

## 9. 待確認事項

- NFR-011 未提供效能時間門檻；僅驗證沒有額外遠端呼叫，不推導延遲數值。
- NFR-012 未提供 CI 時間門檻；依預設 CI／測試命令成功完成驗收，若專案另行分拆 job，須在 `techstack.md` 說明。

Constitution self-check: pass
