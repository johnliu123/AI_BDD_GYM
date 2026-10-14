# 任務：點餐系統第六迭代－進階功能與系統驗證

**輸入**：設計文件位於 `specs/006-advanced-features-system-verification/`

**Spec 套件索引**（按需 READ；執行到對應 Phase／小節再載入，勿一次讀完）：

| 文件 | 用途 |
|---|---|
| `spec.md` | 功能需求、User Story、商業規則與成功標準 |
| `research.md` | 菜單持久化、RBAC、錯誤處理、整合測試 |
| `plan.md` | 專案結構、端點盤點、設計決策 |
| `techstack.md` | migration 006、env、smoke |
| `ui-plan.md` · `prototype/` | 店家菜單／售完 UI |
| `data-model.dbml` | menu 四表 |
| `contracts/http-api.yaml` | merchant menu、RBAC 403 |
| `../005-payment-order-cancellation/contracts/http-api.yaml` | pay／cancel（整合測試） |
| `../004-merchant-serving-workflow/contracts/http-api.yaml` | merchant 出餐（RBAC／E2E） |

**機器錨點慣例（G3）**：本目錄 **`openapi:{operationId}`** 指 **`contracts/http-api.yaml`**（006 權威）。005／004 使用 **`005-openapi:`**／**`004-openapi:`** 前綴。

**組織方式**：階段 3 起依使用者故事分組；故事內以 **#### 前端／後端** 作為第二層。

## 階段 1：前置作業

**目的**：確認 005 交付物可跑；核對 006 契約與 dbml。

**執行本階段時讀取**：`research.md`、`techstack.md`、`plan.md`。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `spec.md` | 假設、邊界 RBAC | `spec:FR-010`; `spec:FR-014`; `spec:BR-003` | 005 已交付 |
| `techstack.md` | 006 前置 | `techstack:006 前置（005 依賴）` | migration 006 |
| `plan.md` | 端點盤點 | `plan:端點盤點`; `plan:設計決策·契約權威` | menu API 邊界 |
| `contracts/http-api.yaml` | MerchantMenu | `openapi:components.schemas.ErrorBody`; `openapi:components.responses.MerchantForbidden` | 006 契約 |
| `data-model.dbml` | menu 表 | `dbml:Table categories`; `dbml:Table menu_items` | 表形狀 |

- [x] T001 在 `backend/` 執行 `USE_MEMORY_DB=1 npm test` 確認 005 測試全綠；於 `techstack.md` 補「006 前置」小節若缺漏 ← `techstack:006 前置（005 依賴）`; `plan:端點盤點`; `005-openapi:payOrder`; `spec:FR-010`; `spec:FR-014`; `spec:BR-003`
- [x] T002 對照 `contracts/http-api.yaml` 與 `data-model.dbml`；更新 `plan.md`「**T002 契約對齊紀錄**」（已列停供加購 **`CART_ITEM_UNAVAILABLE`** 政策；implement 時補 discrepancies 與日期）← `plan:設計決策·契約權威`; `plan:T002 契約對齊紀錄`; `openapi:createMerchantCategory`; `openapi:patchMenuItemAvailability`; `openapi:deleteMerchantCategory`; `openapi:components.schemas.ErrorBody`; `openapi:components.responses.MerchantForbidden`; `dbml:Table categories`; `dbml:Table menu_items`; `dbml:Table menu_item_options`; `research:菜單資料持久化（由 menuData 遷移至 MSSQL）`; `research:店家 RBAC（設定層 token → roles）`; `research:分類刪除策略`; `research:售完／供應狀態 API`; `spec:FR-001`; `spec:FR-010`

**Checkpoint**：T001 通過後才開始 migration 006。

---

## 階段 2：共用基礎

**目的**：006 schema、RBAC、錯誤中介、menu repository／路由骨架。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `data-model.dbml` | Project Note、四表 | `dbml:Project advanced_features_menu`; `dbml:Table menu_item_option_groups` | CRUD + 種子 |
| `contracts/http-api.yaml` | merchant paths | `openapi:listMerchantCategories`; `openapi:createMerchantMenuItem` | 路由註冊 |
| `research.md` | 例外處理 | `research:集中式 HTTP 例外處理` | 404/500 |
| `techstack.md` | MERCHANT_CREDENTIALS | `techstack:技術堆疊` | env 範例 |

- [x] T003 新增 `backend/src/data/migrations/006_menu_catalog.mssql.sql`（四表 + 種子自 menuData）；更新 `memoryDatabase.js` 支援 menu SQL；更新 `verify-migrations.mjs` 006 錨點 ← `dbml:Project advanced_features_menu`; `dbml:Table categories`; `dbml:Table menu_items`; `dbml:Table menu_item_option_groups`; `research:菜單資料持久化（由 menuData 遷移至 MSSQL）`; `techstack:菜單持久化`
- [x] T004 新增 `config/merchantCredentials.js`；擴充 `middleware/merchantAuth.js`（`requireMerchantRole`、**403** `MERCHANT_FORBIDDEN`）；套用至 `merchantOrdersRouter` 與新 menu 路由 ← `research:店家 RBAC（設定層 token → roles）`; `openapi:components.responses.MerchantForbidden`; `spec:FR-009`; `spec:FR-014`; `spec:FR-015`; `spec:BR-003`; `techstack:技術堆疊`
- [x] T005 新增 `middleware/errorMiddleware.js` 與 404 handler；於 `server.js` 註冊（維持 **500** 無 stack body；集中處理不引入額外遠端呼叫，**NFR-011**）← `research:集中式 HTTP 例外處理`; `openapi:components.responses.NotFound`; `spec:FR-016`; `spec:FR-017`; `spec:NFR-010`; `spec:NFR-011`; `spec:BR-004`
- [x] T006 重構 `menuRepository.js`／`menu-service.js` 讀寫 DB；新增 `services/menuAdminService.js`、`routes/merchantMenu.js` 並掛載 `server.js`（含 list/update category 路由）← `openapi:listMerchantCategories`; `openapi:createMerchantCategory`; `openapi:updateMerchantCategory`; `openapi:updateMerchantMenuItem`; `openapi:deleteMerchantCategory`; `openapi:createMerchantMenuItem`; `spec:FR-010`; `spec:BR-003`
- [x] T007 更新 `backend/.env.example`（`MERCHANT_CREDENTIALS` 範例）；`testHarness.js` 支援多 token 測試 ← `techstack:架構與部署限制`; `techstack:技術堆疊`; `research:店家 RBAC（設定層 token → roles）`

**Checkpoint**：T003–T006 完成後才執行各 US 端對端測試。

---

## 階段 3：使用者故事 1－店家維護餐點分類與餐點資料（P1）

**目標**：menu/admin 可 CRUD 分類與餐點；orders token **403**；顧客 GET 可見變更。

**端點**：Merchant Menu API、MSSQL、merchant UI。

### 使用者故事 1 測試

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節須對齊 |
|---|---|---|---|
| `spec.md` | US1 情境 | `spec:US1`; `spec:US1·情境1`; `spec:US1·情境2`; `spec:US1·情境3`; `spec:US1·情境4`; `spec:FR-001`; `spec:FR-002`; `spec:FR-003`; `spec:SC-001` | CRUD |

- [x] T008 [US1] 新增 `backend/src/__tests__/menu/merchant-menu-crud.test.js`：建立分類＋餐點（含 **option_groups**）；更新價格後 `GET /api/menu-items` 反映；**建單後再 PATCH 餐點價格，`getOrder` 之 `total_amount` 與明細快照不變**（**BR-002**）；orders-only token → **403**；缺欄位 **400**；刪除含餐點分類 → **409** `CATEGORY_IN_USE` ← `spec:US1·情境1`; `spec:US1·情境2`; `spec:US1·情境3`; `spec:US1·情境4`; `spec:FR-001`; `spec:FR-002`; `spec:FR-003`; `spec:FR-012`; `spec:BR-002`; `spec:SC-001`; `openapi:createMerchantCategory`; `openapi:updateMerchantCategory`; `openapi:createMerchantMenuItem`; `openapi:updateMerchantMenuItem`; `openapi:deleteMerchantCategory`; `openapi:listMenuItems`; `005-openapi:getOrder`; `dbml:Table categories`; `dbml:Table menu_items`; `dbml:Table menu_item_option_groups`

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節須對齊 |
|---|---|---|---|
| `ui-plan.md` | 店家菜單維護 | `ui-plan:§畫面與流程→店家菜單維護`; `prototype:index.html` | 表單 |

- [x] T009 [US1] 新增 `merchantMenuApi.js`、`MerchantMenuPage.jsx`；`MenuPage` 支援 `#/merchant/menu`；分類建立／更新／刪除；餐點建立與編輯（含 **option_groups** 維護，**FR-003**）← `spec:US1`; `spec:FR-001`; `spec:FR-002`; `spec:FR-003`; `ui-plan:§畫面與流程→店家菜單維護`; `openapi:listMerchantCategories`; `openapi:createMerchantCategory`; `openapi:updateMerchantCategory`; `openapi:deleteMerchantCategory`; `openapi:createMerchantMenuItem`; `openapi:updateMerchantMenuItem`

**Checkpoint US1**：T008、T009 通過。

---

## 階段 4：使用者故事 2－店家管理餐點售完與規格停供（P1）

**目標**：PATCH availability；停供後加購 **409**；購物車 unavailable。

**端點**：availability PATCH、cart、menu 讀取。

### 使用者故事 2 測試

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節須對齊 |
|---|---|---|---|
| `spec.md` | US2 | `spec:US2`; `spec:US2·情境1`; `spec:US2·情境2`; `spec:US2·情境3`; `spec:US2·情境4`; `spec:FR-004`; `spec:FR-005`; `spec:FR-006`; `spec:SC-002` | 售完 |

- [x] T010 [US2] 新增 `merchant-menu-availability.test.js`：餐點停供 → add cart **409** **`CART_ITEM_UNAVAILABLE`**（spec `MENU_ITEM_UNAVAILABLE` 等同）；購物車 GET unavailable；選項停供組合拒絕；恢復後可加購 ← `spec:US2·情境1`; `spec:US2·情境2`; `spec:US2·情境3`; `spec:US2·情境4`; `spec:FR-004`; `spec:FR-005`; `spec:FR-011`; `spec:FR-013`; `spec:SC-002`; `openapi:patchMenuItemAvailability`; `openapi:patchMenuOptionAvailability`; `research:售完／供應狀態 API`

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節須對齊 |
|---|---|---|---|
| `ui-plan.md` | 售完切換 | `ui-plan:§畫面與流程→餐點售完切換` | toggle |

- [x] T011 [US2] `MerchantMenuPage` 餐點售完／恢復（`patchMenuItemAvailability`）與**規格選項**停供／恢復（`patchMenuOptionAvailability`）；成功後刷新顧客菜單 ← `spec:US2`; `spec:FR-005`; `spec:FR-006`; `ui-plan:§畫面與流程→餐點售完切換`; `openapi:patchMenuItemAvailability`; `openapi:patchMenuOptionAvailability`

**Checkpoint US2**：T010、T011 通過。

---

## 階段 5：使用者故事 3－顧客端反映供應狀態（P1）

**目標**：Menu 售完 UI；建單前停供拒絕；忽略 body 假金額。

**端點**：顧客前端、cart、orders create。

### 使用者故事 3 測試

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節須對齊 |
|---|---|---|---|
| `spec.md` | US3 | `spec:US3`; `spec:US3·情境1`; `spec:US3·情境2`; `spec:US3·情境3`; `spec:US3·情境4`; `spec:FR-007`; `spec:FR-008`; `spec:FR-012` | 建單護欄 |

- [x] T012 [US3] 擴充 `create-order.test.js`：停供後建單 **409** 無 order_number；PATCH cart 夾假 `total_amount` 不採信（**情境1、2 為 UI**，後端不 duplicated，見 **T013**）← `spec:US3`; `spec:US3·情境1`; `spec:US3·情境2`; `spec:US3·情境3`; `spec:US3·情境4`; `spec:FR-008`; `spec:FR-012`; `spec:FR-013`; `spec:BR-001`

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節須對齊 |
|---|---|---|---|
| `ui-plan.md` | 顧客售完 | `ui-plan:§畫面與流程→顧客售完標示` | MenuCard |

- [x] T013 [US3] 擴充 `MenuCard.jsx`／`MealOptionsDialog.jsx`：`is_active=false` 顯示售完且不可加購；`CartPage` 混合可用／不可用僅計可用總額、無可用項時禁用建單 ← `spec:US3`; `spec:US3·情境1`; `spec:US3·情境2`; `spec:FR-007`; `ui-plan:§畫面與流程→顧客售完標示`; `spec:SC-002`

**Checkpoint US3**：T012、T013 通過。

---

## 階段 6：使用者故事 4－店家 API RBAC（P1）

**目標**：orders/menu/admin 矩陣；legacy MERCHANT_TOKEN=admin；401/503 不變。

**端點**：merchantAuth、004/005 merchant、006 menu。

### 使用者故事 4 測試

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節須對齊 |
|---|---|---|---|
| `spec.md` | US4 | `spec:US4`; `spec:US4·情境1`; `spec:US4·情境2`; `spec:US4·情境3`; `spec:US4·情境4`; `spec:FR-009`; `spec:FR-015`; `spec:SC-004` | RBAC |

- [x] T014 [US4] 新增 `merchant-rbac.test.js`：admin/legacy 可 menu+accept；orders-only menu POST **403**；menu-only accept **403**；無 token **401**；無 env **503**；**不得**接受客戶端自報角色 header ← `spec:US4·情境1`; `spec:US4·情境2`; `spec:US4·情境3`; `spec:US4·情境4`; `spec:FR-009`; `spec:FR-014`; `spec:FR-015`; `spec:BR-003`; `spec:SC-004`; `openapi:components.responses.MerchantForbidden`; `004-openapi:acceptMerchantOrder`; `openapi:createMerchantMenuItem`

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節須對齊 |
|---|---|---|---|
| `ui-plan.md` | RBAC 提示 | `ui-plan:§畫面與流程→RBAC 權限提示` | toast |

- [x] T015 [US4] `merchantMenuApi`／`merchantOrderApi` 對 **403** 顯示權限不足文案 ← `spec:US4`; `ui-plan:§畫面與流程→RBAC 權限提示`; `openapi:components.responses.MerchantForbidden`

**Checkpoint US4**：T014、T015 通過。

---

## 階段 7：使用者故事 5－一致例外處理（P1）

**目標**：未知路由 JSON 404；500 無 stack；業務碼不更名。

**端點**：Express middleware。

### 使用者故事 5 測試

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節須對齊 |
|---|---|---|---|
| `spec.md` | US5 | `spec:US5`; `spec:US5·情境1`; `spec:US5·情境2`; `spec:US5·情境3`; `spec:US5·情境4`; `spec:NFR-010`; `spec:NFR-011`; `spec:SC-006` | 錯誤 JSON |

- [x] T016 [US5] 新增 `http-error-handling.test.js`：`GET /api/no-such-route` → **404** `NOT_FOUND`；非法 JSON body → **400**；模擬 throw → **500** body 無 stack；`ORDER_STATUS_CONFLICT` 仍存 ← `spec:US5·情境1`; `spec:US5·情境2`; `spec:US5·情境3`; `spec:US5·情境4`; `spec:NFR-010`; `spec:NFR-011`; `spec:BR-004`; `spec:SC-006`; `openapi:components.responses.NotFound`; `research:集中式 HTTP 例外處理`

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節須對齊 |
|---|---|---|---|
| `spec.md` | NFR-010 | `spec:NFR-010` | 錯誤顯示 |

- [x] T017 [US5] 確認顧客／店家 API 錯誤皆讀 `error.message`（不回歸空白）；必要時集中 `apiErrorMessage` helper ← `spec:US5`; `spec:NFR-010`; `spec:NFR-011`; `spec:BR-004`; `openapi:components.schemas.ErrorBody`

**Checkpoint US5**：T016、T017 通過。

---

## 階段 8：使用者故事 6－整合測試與系統驗證（P1）

**目標**：E2E HTTP 旅程；冪等；竄改 total；全 suite 綠。

**端點**：integration test、smoke script。

### 使用者故事 6 測試

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節須對齊 |
|---|---|---|---|
| `spec.md` | US6、SC | `spec:US6`; `spec:US6·情境1`; `spec:US6·情境2`; `spec:US6·情境3`; `spec:US6·情境4`; `spec:US6·情境5`; `spec:FR-018`; `spec:FR-019`; `spec:SC-003`; `spec:SC-005`; `spec:SC-007` | E2E |

- [x] T018 [US6] 新增 `backend/src/__tests__/integration/system-e2e.test.js`（**`USE_MEMORY_DB=1`** harness，**FR-019**）：加購→建單→pay→accept→complete；Idempotency 重送；建單／**pay** body 竄改 `total_amount` 不變快照；停供建單失敗；**005 全 suite 回歸** ← `spec:US6·情境1`; `spec:US6·情境2`; `spec:US6·情境3`; `spec:US6·情境4`; `spec:US6·情境5`; `spec:FR-018`; `spec:FR-019`; `spec:SC-003`; `spec:SC-005`; `spec:SC-007`; `005-openapi:payOrder`; `004-openapi:acceptMerchantOrder`; `004-openapi:completeMerchantOrder`; `research:整合測試與 smoke`
- [x] T019 [US6] 新增 `scripts/smoke-006-advanced.mjs` 與 `package.json` script `smoke:006`；確認 **`npm test` 含 integration**（預設依 `techstack:整合測試`）；僅在變慢時另增 `test:integration` 並更新 techstack ← `spec:FR-018`; `spec:FR-019`; `spec:NFR-012`; `techstack:整合測試`; `techstack:006 smoke（本機）`

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節須對齊 |
|---|---|---|---|
| `techstack.md` | frontend test | `techstack:整合測試`; `techstack:006 smoke（本機）` | 單元 |

- [x] T020 [US6] 補 `merchantMenuApi.test.js` 與 Menu 售完 UI 測試；`npm test` 全綠 ← `spec:SC-007`; `techstack:整合測試`; `techstack:006 smoke（本機）`; `ui-plan:§驗證`

**Checkpoint US6**：T018–T020 通過。

---

## 階段 9：收尾

- [x] T021 執行 `verify:migrations`、backend／frontend 全 suite；005 回歸無失敗；**SC-001–SC-007** 由 T008–T020 覆蓋 ← `spec:SC-001`; `spec:SC-002`; `spec:SC-003`; `spec:SC-004`; `spec:SC-005`; `spec:SC-006`; `spec:SC-007`
- [x] T022 於 `plan.md`「T002 契約對齊紀錄」補 **implement 完成日期**與任何新 discrepancies；新增 **Smoke 驗收紀錄**區塊（對照 005 tasks）← `plan:T002 契約對齊紀錄`; `plan:設計決策·契約權威`; `techstack:006 smoke（本機）`

## Format Validation

文件結構（analyze 第三輪已驗；**執行結果**於 implement **T021** 再確認）：

- [x] 每 User Story 含前端／後端小節與必讀對照表
- [x] 每任務行尾含 `←` 錨點
- [x] 對照表列均被至少一任務引用
- [x] openapi operationId 與 dbml Table 錨點覆蓋 merchant menu 與 RBAC

<!-- Constitution self-check: pass -->
