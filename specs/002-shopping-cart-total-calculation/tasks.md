# 任務：點餐系統第二迭代－購物車與金額計算

**輸入**：設計文件位於 `specs/002-shopping-cart-total-calculation/`

**Spec 套件索引**（按需 READ；執行到對應 Phase／小節再載入，勿一次讀完）：

| 文件 | 用途 |
|---|---|
| `spec.md` | 功能需求、User Story、驗收情境、商業規則與成功標準 |
| `research.md` | 技術決策、理由、失敗處理與未決事項 |
| `plan.md` | 專案結構、端點盤點、設計決策與分析 Wave |
| `techstack.md` | 技術棧與限制 |
| `ui-plan.md` · `prototype/` | 前端流程、狀態與互動雛形 |
| `data-model.dbml` | PostgreSQL 購物車、餐點及規格關聯 |
| `contracts/http-api.yaml` | 購物車 REST API 與 JSON schema |

**組織方式**：階段 3 起依使用者故事分組；故事內以 **#### 前端／後端** 作為第二層。每小節先讀 **必讀對照** 表格，再執行任務；每個 `Tnnn` 行尾有 `←` 機器錨點，且對照表每一列至少被一個任務引用。

**機器錨點語法**：`spec:FR-001` · `spec:US1` · `research:{決策小節}` · `techstack:{領域列}` · `plan:設計決策·…` · `openapi:{operationId}` · `openapi:components.schemas.{Name}` · `dbml:Table {name}` · `dbml:Project` · `ui-plan:§{章}→{小節}` · `prototype:{file}`

## 階段 1：前置作業

**目的**：確認既有菜單規格資料來源、訪客工作階段與購物車隔離，以及菜單價格精度來源。購物車讀寫 API 必須等 T001、T002、T003 完成後才可實作。

**執行本階段時讀取（Read when executing this phase）**：`research.md`（決策摘要）、`techstack.md`、`plan.md`（設計決策）。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `spec.md` | 全域 FR-004、FR-005、Q7、Q8、Q9 | `spec:FR-004`; `spec:FR-005`; `spec:US1`; `spec:US2` | 不建置登入；購物車依工作階段隔離；每次重複加入建立新項目；價格以伺服器為準 |
| `research.md` | 訪客工作階段與購物車歸屬、伺服器權威計價與最新價格、金額精度與表示 | `research:訪客工作階段與購物車歸屬`; `research:伺服器權威計價與最新價格`; `research:金額精度與表示` | 以伺服器簽發 session ID 限定購物車，並保留精確十進位計價 |
| `techstack.md` | 訪客工作階段、資料庫、金額表示、API 後端 | `techstack:訪客工作階段`; `techstack:資料庫`; `techstack:金額表示`; `techstack:API 後端` | 核對 session middleware、PostgreSQL 連線與菜單欄位 precision/scale |
| `contracts/http-api.yaml` | `listMenuItems`、`ErrorBody`、`CartResponse`、`MoneyAmount` | `openapi:listMenuItems`; `openapi:components.schemas.MoneyAmount`; `openapi:components.schemas.ErrorBody`; `openapi:components.schemas.CartResponse` | 操作前後端必依訪客 session 與十進位字串 contract |
| `../001-food-browsing-categories/data-model.dbml`、`../001-food-browsing-categories/http-api.yaml` | 菜單資料模型與既有 `GET /menu-items` 回應 | `dbml:Table menu_item_option_groups`; `dbml:Table menu_item_options`; `openapi:listMenuItems` | 確認既有菜單來源是否提供完整規格群組、選項與價格字串 |
| `plan.md` | 設計決策與既有能力限制 | `plan:設計決策·PostgreSQL`; `plan:設計決策·伺服器權威計價` | 依訪客 session 與伺服器權威計價實作，不得依賴帳號或前端價格 |

- [x] T001 在 `backend/src/__tests__/session/cart-session-boundary.test.js` 驗證伺服器簽發的 session cookie、`req.sessionID` 綁定、無 cookie 或失效 session 時拒絕讀寫，並確認 `SameSite`／Origin／CSRF 防護需求；將 deployment 位置、session store 套件、**idle 24 小時／absolute 7 天**（spec Q10）及失效後 cart **定期清理**政策（spec Q11）與驗證證據記錄於 `techstack.md`。未完成前不得實作購物車讀寫 API、服務或 client；不得接受客戶端自報 session ID、URL 值或 localStorage 識別 ← `spec:FR-004`; `spec:US1`; `spec:US2`; `research:訪客工作階段與購物車歸屬`; `techstack:訪客工作階段`; `techstack:API 後端`; `openapi:components.schemas.ErrorBody`; `openapi:getCart`; `openapi:addCartItem`; `plan:設計決策·PostgreSQL`
- [x] T002 核對既有餐點價格來源的幣別、precision／scale、PostgreSQL 欄位型別及讀取／序列化轉換路徑，並由菜單資料負責方確認新規格加價沿用的幣別與 precision／scale 政策；將結果記錄於 `techstack.md`，同步更新本功能 `data-model.dbml` 的餐點價格／規格加價欄位型別與 precision／scale。若實際來源與 001 資料模型不一致，記錄差異並同步修正來源模型；不得猜測或靜默捨入。以 T003 驗收十進位字串保真，伺服器計價不得使用 JavaScript `Number` 或浮點轉換 ← `spec:FR-005`; `research:金額精度與表示`; `techstack:金額表示`; `techstack:API 後端`; `openapi:components.schemas.MoneyAmount`; `openapi:listMenuItems`; `dbml:Table menu_items`; `dbml:Table menu_item_options`
- [x] T003 擴充既有菜單資料來源與 `GET /menu-items`，確保回應含餐點供應狀態、所有規格群組／選項及精確十進位字串的價格／加價；在 `backend/src/__tests__/menu/menu-options.test.js` 驗收多群組、無群組、停用選項及依 T002 核實 precision／scale 的字串保真，且不得將此處當成假資料來源。若目前菜單 API 缺少規格欄位，需同步更新 001 資料模型／API 契約，並在本功能中記錄來源更新與驗收證據 ← `spec:FR-002`; `spec:FR-005`; `research:金額精度與表示`; `techstack:金額表示`; `openapi:listMenuItems`; `dbml:Table menu_item_option_groups`; `dbml:Table menu_item_options`; `plan:設計決策·伺服器權威計價`

**Checkpoint**: T001 是所有購物車讀寫 API 的會話綁定前置；T002 是金額資料來源與精度實作前置；T003 是菜單規格資料來源與驗收前置。未完成的前置條件不得由假資料、記憶體車或客戶端金額替代。

---

## 階段 2：共用基礎

**目的**：建立共用的 PostgreSQL 資料、session 綁定、精確計價與 API client 基礎，再供兩個使用者故事共用。

**⚠️** T003 須依 T002 核實結果保留菜單金額精度。T004–T008、T024 的購物車 schema／migration、session store 逾時與孤兒 cart 清理、repository、服務與前端 API client 僅可在 T001 驗證 session 已接合後開始；**T025**（Q10/Q11 的 HTTP 驗收）須在 **T015** 完成後執行。不可用記憶體資料、匿名購物車或前端金額取代規格要求。

**執行本階段時讀取（Read when executing this phase）**：`research.md`（決策摘要）、`techstack.md`、`plan.md`（設計決策）、`data-model.dbml`、`contracts/http-api.yaml`（共用 schema）。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `data-model.dbml` | Project Note、`menu_items`、`menu_item_options`、`carts`、`cart_items`、`cart_item_options` | `dbml:Project`; `dbml:Table menu_items`; `dbml:Table menu_item_options`; `dbml:Table carts`; `dbml:Table cart_items`; `dbml:Table cart_item_options` | PostgreSQL 關聯、供應有效狀態、正整數及每項目每群組至多一選 |
| `contracts/http-api.yaml` | `ErrorBody`、`CartResponse`、共用錯誤回應與 MoneyAmount | `openapi:components.schemas.ErrorBody`; `openapi:components.schemas.CartResponse`; `openapi:components.schemas.MoneyAmount` | 共用錯誤包裝、工作階段失效及最新價格錯誤處理 |
| `research.md` | 決策摘要 → 關聯式購物車資料與交易、伺服器權威計價與最新價格 | `research:關聯式購物車資料與交易`; `research:伺服器權威計價與最新價格` | 原子交易及目前價格為唯一計價來源 |
| `techstack.md` | 資料庫、API 後端、訪客工作階段、金額表示 | `techstack:資料庫`; `techstack:API 後端`; `techstack:訪客工作階段`; `techstack:金額表示` | PostgreSQL、session 接合與精確金額限制 |
| `plan.md` | 專案結構與 PostgreSQL 設計決策 | `plan:設計決策·PostgreSQL` | 資料庫沿用既有 PostgreSQL 決策 |
| `spec.md` | 澄清 Q10、Q11（session timeout 與 cart 清理） | `spec:FR-004`; `spec:US1`; `spec:US2` | idle 24h／absolute 7d；失效後新空車與定期清理 |
| 第一迭代菜單資料模型與 API 契約 | `menu_item_option_groups`、`menu_item_options`、`GET /menu-items` | `dbml:Table menu_item_option_groups`; `dbml:Table menu_item_options`; `openapi:listMenuItems` | 既有菜單來源須供應餐點狀態、完整規格群組／選項與精確十進位字串 |

- [x] T004 在 `backend/src/config/` 與 `backend/src/data/` 建立 PostgreSQL 連線設定及購物車 schema／migration，涵蓋既有菜單資料關聯、`menu_item_options.is_active`、session store 與購物車資料表，並保留每個 session 一個購物車的關聯約束 ← `dbml:Project`; `dbml:Table menu_items`; `dbml:Table menu_item_options`; `dbml:Table carts`; `dbml:Table cart_items`; `dbml:Table cart_item_options`; `techstack:資料庫`; `plan:設計決策·PostgreSQL`
- [x] T005 在 `backend/src/` 接合 T001 確認的伺服器 session 資訊，提供所有購物車路由共用的 session context 與未驗證／失效 session 錯誤處理，禁止客戶端自報 session 值 ← `research:訪客工作階段與購物車歸屬`; `techstack:訪客工作階段`; `techstack:API 後端`; `openapi:components.schemas.ErrorBody`
- [x] T006 在 `backend/src/repositories/` 建立購物車與規格關聯資料存取，確保每次新增都建立獨立項目且項目與選項明細使用同一交易，不以餐點／規格組合唯一限制或合併數量 ← `research:關聯式購物車資料與交易`; `dbml:Table carts`; `dbml:Table cart_items`; `dbml:Table cart_item_options`
- [x] T007 在 `backend/src/services/` 建立精確金額計算共用邏輯；讀取目前餐點價格與規格加價，回傳十進位字串；無價格時回報失敗而不採用舊值 ← `research:伺服器權威計價與最新價格`; `research:金額精度與表示`; `techstack:金額表示`; `openapi:components.schemas.MoneyAmount`
- [x] T008 在 `frontend/src/cartApi.js` 建立購物車 API client 與 request／response mapping，沿用既有 `node --test` 腳本驗證 payload 及錯誤處理；不得自行計算權威金額 ← `techstack:前端`; `openapi:getCart`; `openapi:addCartItem`; `openapi:updateCartItemQuantity`; `openapi:deleteCartItem`; `openapi:components.schemas.CartResponse`
- [x] T024 設定 session store 的 **idle 24 小時、absolute 7 天**（spec Q10），並實作與 store 清理週期對齊的**孤兒 cart 定期清理**（spec Q11）；在 `backend/src/__tests__/session/` 以 store／middleware 層驗證逾時政策與清理 job 會移除孤兒 `carts` 列（**不含** `GET /cart` HTTP 驗收；該部分由 **T025** 負責） ← `spec:FR-004`; `spec:US1`; `spec:US2`; `research:訪客工作階段與購物車歸屬`; `techstack:訪客工作階段`; `techstack:資料庫`; `plan:設計決策·PostgreSQL`; `dbml:Table carts`

**檢查點**：T003 菜單資料來源擴充與驗收完成後，規格選擇才有正式資料可讀；PostgreSQL、訪客 session（含 Q10/Q11）、精確計價及 API client 基礎可供兩個使用者故事共用。T001 未完成時停止所有購物車讀寫 API／服務／client 實作，T002 未完成時停止計價實作。

---

## 階段 3：使用者故事 1－將選擇規格的餐點加入購物車（優先順序：P1，MVP）

**目標**：持有有效工作階段的使用者可選擇供應中餐點規格後加入同一 session 購物車；缺選、未供應或 session 無效時不新增。

**獨立測試**：以多規格群組餐點驗證全選可加入、全未選或部分選擇遭拒、未供應遭拒；不同 session 不能讀取其他 session 購物車。

**端點（對齊 plan.md）**：前端 UI、既有菜單 API、購物車 API、PostgreSQL、Express session / CSRF 防護。

### 使用者故事 1 測試

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `spec.md` | User Story 1、驗收情境 1、2、4；FR-001 至 FR-003 | `spec:US1`; `spec:US1·情境1`; `spec:US1·情境2`; `spec:US1·情境4`; `spec:FR-001`; `spec:FR-002`; `spec:FR-003` | 成功選擇、未供應拒絕及缺少群組拒絕 |
| `ui-plan.md` | §畫面與流程 → 選擇規格並加入供應中餐點、拒絕未供應餐點、狀態與邊界 | `ui-plan:§畫面與流程→選擇規格並加入供應中餐點`; `ui-plan:§畫面與流程→拒絕未供應餐點`; `ui-plan:§畫面與流程→狀態與邊界（雛形須可見）` | 每個群組單選且必選；失敗時購物車不變 |
| `prototype/` | `index.html`、`assets/app.js` 規格選擇及加入流程 | `prototype:index.html`; `prototype:assets/app.js` | 雛形行為作為前端驗收參照 |
| `contracts/http-api.yaml` | `listMenuItems` 與 `MenuItem.option_groups` 回應 | `openapi:listMenuItems`; `openapi:components.schemas.MenuItem`; `openapi:components.schemas.MenuItemOptionGroup`; `openapi:components.schemas.MenuItemOption` | 菜單 API 的群組與有效選項資料可到達規格選擇介面 |

- [x] T009 [US1] 在 `frontend/src/menuApi.test.js` 驗證既有 `GET /menu-items` 回應的 `option_groups`、選項 ID／名稱／加價／有效狀態會完整傳到規格選擇介面；並測試全未選、部分選擇、各群組各選一項、無群組及未供應餐點，失敗不得改變購物車 ← `spec:US1`; `spec:US1·情境1`; `spec:US1·情境2`; `spec:US1·情境4`; `spec:FR-001`; `spec:FR-002`; `spec:FR-003`; `ui-plan:§畫面與流程→選擇規格並加入供應中餐點`; `ui-plan:§畫面與流程→拒絕未供應餐點`; `ui-plan:§畫面與流程→狀態與邊界（雛形須可見）`; `prototype:index.html`; `prototype:assets/app.js`; `openapi:listMenuItems`; `openapi:components.schemas.MenuItemOptionGroup`; `openapi:components.schemas.MenuItemOption`

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `spec.md` | User Story 1 情境 1–4、FR-001 至 FR-005、BR-001、BR-002、SC-001、SC-002、SC-004 | `spec:US1`; `spec:FR-001`; `spec:FR-002`; `spec:FR-003`; `spec:FR-004`; `spec:FR-005`; `spec:BR-001`; `spec:BR-002`; `spec:SC-001`; `spec:SC-002`; `spec:SC-004` | 驗證餐點供應、規格完整性、session 隔離、BR-001 計價及 201 回應 |
| `contracts/http-api.yaml` | `addCartItem`、`getCart`、`AddCartItemRequest`、`CartResponse`、`ErrorBody` | `openapi:addCartItem`; `openapi:getCart`; `openapi:components.schemas.AddCartItemRequest`; `openapi:components.schemas.CartResponse`; `openapi:components.schemas.ErrorBody` | 201 回傳完整購物車與十進位字串金額 |
| `data-model.dbml` | `menu_items`、規格群組／選項、`carts`、`cart_items`、`cart_item_options` | `dbml:Table menu_items`; `dbml:Table menu_item_option_groups`; `dbml:Table menu_item_options`; `dbml:Table carts`; `dbml:Table cart_items`; `dbml:Table cart_item_options` | 所有選項歸屬、每群組至多一選、交易及 session 歸屬 |
| `research.md` | 決策摘要 → 訪客工作階段與購物車歸屬、請求輸入與資料驗證 | `research:訪客工作階段與購物車歸屬`; `research:請求輸入與資料驗證` | 伺服器端 session 授權、語意驗證及失敗時全有或全無 |

**執行順序**：`T010`、`T011` **須於 T015 完成後執行**（任務編號較早，但為 `POST /cart/items` HTTP 整合測試）。

- [x] T010 [US1] 在 `backend/src/__tests__/cart/add-cart-item.test.js`（**須 T015 完成後執行**）驗證供應狀態、數量、必填選項陣列、每個現存群組恰選一項、選項歸屬、重複請求建立不同項目及錯誤時購物車不變；別的 session 不得讀到此項目；成功 **201** 之 `CartResponse` 須符合 **BR-001**（可用項目金額與總額依目前餐點價格、規格加價與數量，十進位字串）← `spec:US1`; `spec:FR-001`; `spec:FR-002`; `spec:FR-003`; `spec:FR-004`; `spec:FR-005`; `spec:BR-001`; `spec:BR-002`; `spec:SC-001`; `spec:SC-002`; `openapi:addCartItem`; `openapi:components.schemas.AddCartItemRequest`; `openapi:components.schemas.CartResponse`; `openapi:components.schemas.ErrorBody`; `dbml:Table menu_items`; `dbml:Table menu_item_option_groups`; `dbml:Table menu_item_options`; `dbml:Table cart_items`; `dbml:Table cart_item_options`; `research:請求輸入與資料驗證`
- [x] T011 [US1] 在 `backend/src/__tests__/cart/cart-session-isolation.test.js`（**須 T015 完成後執行**）以兩個 session 測試新增與讀取均限定同 session 購物車，未授權不得洩漏其他 session 項目 ← `spec:US1·情境3`; `spec:FR-004`; `spec:SC-004`; `openapi:addCartItem`; `openapi:getCart`; `dbml:Table carts`; `dbml:Table cart_items`; `research:訪客工作階段與購物車歸屬`

### 使用者故事 1 實作

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `spec.md` | User Story 1、FR-001、FR-002、FR-003 | `spec:US1`; `spec:FR-001`; `spec:FR-002`; `spec:FR-003` | 提供規格選擇並呈現拒絕回饋 |
| `ui-plan.md` | §畫面與流程 → 選擇規格並加入供應中餐點、拒絕未供應餐點、訪客工作階段、計價錯誤 | `ui-plan:§畫面與流程→選擇規格並加入供應中餐點`; `ui-plan:§畫面與流程→拒絕未供應餐點`; `ui-plan:§畫面與流程→訪客工作階段`; `ui-plan:§畫面與流程→計價錯誤` | 呼叫 API、顯示選項錯誤及維持 session 邊界 |
| `prototype/` | `index.html`、`assets/app.js` | `prototype:index.html`; `prototype:assets/app.js` | 規格對話框及狀態呈現參照 |
| `contracts/http-api.yaml` | `listMenuItems` 回應、`addCartItem`、`AddCartItemRequest` | `openapi:listMenuItems`; `openapi:components.schemas.MenuItemOptionGroup`; `openapi:components.schemas.MenuItemOption`; `openapi:addCartItem`; `openapi:components.schemas.AddCartItemRequest` | 將菜單規格選項傳入選擇介面，加入時只送餐點 ID、選項 ID 陣列與正整數數量 |

**執行順序**：規格 UI 可與 T013–T014 並行開發；**T012 成功加入購物車的 API 整合驗收須 T008 與 T015 完成後**。

- [x] T012 [US1] 在既有 `frontend/src/menuApi.js`、`frontend/src/pages/MenuPage.jsx` 與新建 `frontend/src/components/MealOptionsDialog.jsx` 實作菜單回應到規格選擇介面的資料傳遞，保留 `option_groups`、選項 ID 與有效狀態；建立各群組未預選的單選表單，缺任一群組時阻止提交並標示群組，成功時透過購物車 API client 送選項 ID 與數量（**成功路徑 API 整合須 T008 與 T015 完成後驗收**）← `spec:US1`; `spec:FR-001`; `spec:FR-002`; `spec:FR-003`; `ui-plan:§畫面與流程→選擇規格並加入供應中餐點`; `ui-plan:§畫面與流程→拒絕未供應餐點`; `ui-plan:§畫面與流程→訪客工作階段`; `ui-plan:§畫面與流程→計價錯誤`; `prototype:index.html`; `prototype:assets/app.js`; `openapi:listMenuItems`; `openapi:components.schemas.MenuItemOptionGroup`; `openapi:components.schemas.MenuItemOption`; `openapi:addCartItem`; `openapi:components.schemas.AddCartItemRequest`

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `spec.md` | FR-001、FR-004、FR-005、BR-001、SC-001、SC-002 | `spec:FR-001`; `spec:FR-004`; `spec:FR-005`; `spec:BR-001`; `spec:SC-001`; `spec:SC-002` | 201 回傳完整購物車與 BR-001 計價 |
| `contracts/http-api.yaml` | `addCartItem`、`AddCartItemRequest`、`CartResponse`、`ErrorBody`、Origin／CSRF | `openapi:addCartItem`; `openapi:components.schemas.AddCartItemRequest`; `openapi:components.schemas.CartResponse`; `openapi:components.schemas.ErrorBody` | POST 路由、201／403／409 與 `csrf_token` |
| `data-model.dbml` | `menu_items`、規格群組／選項、`carts`、`cart_items`、`cart_item_options` | `dbml:Table menu_items`; `dbml:Table menu_item_option_groups`; `dbml:Table menu_item_options`; `dbml:Table carts`; `dbml:Table cart_items`; `dbml:Table cart_item_options` | 依有效 session 寫入相符餐點及完整選項 |
| `research.md` | 決策摘要 → 請求輸入與資料驗證、關聯式購物車資料與交易、訪客工作階段與購物車歸屬 | `research:請求輸入與資料驗證`; `research:關聯式購物車資料與交易`; `research:訪客工作階段與購物車歸屬` | 語意驗證、交易原子性、Origin／CSRF |
| `techstack.md` | 訪客工作階段、API 後端 | `techstack:訪客工作階段`; `techstack:API 後端` | session middleware 與寫入防護 |
| `plan.md` | 設計決策 → session 歸屬、最新價格與交易 | `plan:設計決策·PostgreSQL`; `plan:設計決策·伺服器權威計價` | 依 session 授權並由伺服器取價 |

- [x] T013 [US1] 在 `backend/src/services/cartService.js` 實作新增驗證：確認有效 session、餐點供應狀態、正整數數量、每個規格群組恰有一個有效且隸屬該餐點的選項；拒絕客戶端金額 ← `openapi:addCartItem`; `openapi:components.schemas.AddCartItemRequest`; `openapi:components.schemas.ErrorBody`; `dbml:Table menu_items`; `dbml:Table menu_item_option_groups`; `dbml:Table menu_item_options`; `research:請求輸入與資料驗證`; `plan:設計決策·伺服器權威計價`
- [x] T014 [US1] 在 `backend/src/repositories/cartRepository.js` 以單一資料庫交易新增獨立購物車項目及全部選項明細；重複餐點／規格也建立新列，任一驗證或寫入失敗完整回滾 ← `openapi:addCartItem`; `dbml:Table carts`; `dbml:Table cart_items`; `dbml:Table cart_item_options`; `research:關聯式購物車資料與交易`; `plan:設計決策·PostgreSQL`
- [x] T015 [US1] 在 `backend/src/routes/cart.js` 實作 `POST /cart/items`（`openapi:addCartItem`），並於同檔提供 `GET /cart` 的 session bootstrap 與 `csrf_token`（完整讀取／重算可於 T020 擴充）：接 T005 session context、精確 Origin 與 session-bound `X-CSRF-Token` middleware，編排 T013 驗證、T014 持久化與 T007 計價；成功回傳 **201** `CartResponse`（含更新後 `csrf_token`）；403 CSRF／Origin、400／404／409 及 503／500 語意符合契約，驗證或寫入失敗時購物車不變 ← `openapi:getCart`; `spec:FR-001`; `spec:FR-004`; `spec:FR-005`; `spec:BR-001`; `spec:SC-001`; `spec:SC-002`; `openapi:addCartItem`; `openapi:components.schemas.AddCartItemRequest`; `openapi:components.schemas.CartResponse`; `openapi:components.schemas.ErrorBody`; `dbml:Table carts`; `dbml:Table cart_items`; `dbml:Table cart_item_options`; `research:請求輸入與資料驗證`; `research:訪客工作階段與購物車歸屬`; `techstack:訪客工作階段`; `techstack:API 後端`; `plan:設計決策·伺服器權威計價`
- [x] T025 [US1] 在 `backend/src/__tests__/session/cart-session-expiry-api.test.js`（**須 T015 與 T024 完成後執行**）以 `GET /cart` 驗證 spec Q10／Q11：session 過期後取得新空購物車、新 session 無法讀取舊 cart 列；並確認 T024 清理後孤兒 cart 已自資料庫移除 ← `spec:FR-004`; `spec:US1`; `spec:US2`; `research:訪客工作階段與購物車歸屬`; `techstack:訪客工作階段`; `openapi:getCart`; `openapi:components.schemas.CartResponse`; `dbml:Table carts`

**檢查點**：T015 完成後 `POST /cart/items` 可由 T010 整合驗收；T025 完成後 Q10／Q11 的 HTTP 行為與清理可驗收。加入成功回傳服務端目前價格與購物車；缺選、無效選項、未供應、CSRF／Origin 或 session 錯誤均不留下變更。

---

## 階段 4：使用者故事 2－檢視及管理購物車金額（優先順序：P1）

**目標**：持有有效 session 的使用者可檢視同一 session 購物車、修改正整數數量或刪除項目，並取得以目前價格重算的金額。

**獨立測試**：使用多項目購物車檢查項目與總額，修改數量、刪除及變更菜單價格後確認最新結果；空購物車回傳零總額。

**端點（對齊 plan.md）**：前端 UI、購物車 API、PostgreSQL、Express 訪客工作階段與請求來源防護。

### 使用者故事 2 測試

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `spec.md` | User Story 2、驗收情境 1–7、FR-006 至 FR-008、BR-001、BR-003、SC-002、SC-003、SC-005 | `spec:US2`; `spec:FR-006`; `spec:FR-007`; `spec:FR-008`; `spec:BR-001`; `spec:BR-003`; `spec:SC-002`; `spec:SC-003`; `spec:SC-005` | 顯示金額、數量、刪除、最新價格及不可用項目狀態 |
| `ui-plan.md` | §畫面與流程 → 檢視與管理購物車、不可用購物車項目、顯示最新價格、訪客工作階段、計價錯誤、狀態與邊界 | `ui-plan:§畫面與流程→檢視與管理購物車`; `ui-plan:§畫面與流程→不可用購物車項目`; `ui-plan:§畫面與流程→顯示最新價格`; `ui-plan:§畫面與流程→訪客工作階段`; `ui-plan:§畫面與流程→計價錯誤`; `ui-plan:§畫面與流程→狀態與邊界（雛形須可見）` | 不可用狀態、金額省略、禁止改數量及允許刪除 |
| `prototype/` | `index.html`、`assets/app.js` 購物車與價格狀態 | `prototype:index.html`; `prototype:assets/app.js` | 流程級驗收參照 |

- [x] T016 [US2] 在 `frontend/src/cartApi.test.js` 使用 Node.js 內建測試驗證讀取、數量更新、刪除的 request mapping、不可用項目 response 與 PATCH 409 處理；畫面互動情境由 T023 瀏覽器驗收 ← `spec:US2`; `spec:FR-006`; `spec:FR-007`; `spec:FR-008`; `spec:BR-001`; `spec:BR-003`; `spec:SC-002`; `spec:SC-003`; `spec:SC-005`; `ui-plan:§畫面與流程→檢視與管理購物車`; `ui-plan:§畫面與流程→不可用購物車項目`; `ui-plan:§畫面與流程→顯示最新價格`; `ui-plan:§畫面與流程→訪客工作階段`; `ui-plan:§畫面與流程→計價錯誤`; `ui-plan:§畫面與流程→狀態與邊界（雛形須可見）`; `prototype:index.html`; `prototype:assets/app.js`

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `spec.md` | User Story 2 情境 1–7、FR-004 至 FR-008、BR-001、BR-003、SC-002 至 SC-005 | `spec:US2`; `spec:FR-004`; `spec:FR-005`; `spec:FR-006`; `spec:FR-007`; `spec:FR-008`; `spec:BR-001`; `spec:BR-003`; `spec:SC-002`; `spec:SC-003`; `spec:SC-004`; `spec:SC-005` | 所有權限定、最新價格、數量、刪除及不可用狀態 |
| `contracts/http-api.yaml` | `getCart`、`updateCartItemQuantity`、`deleteCartItem`、`CartResponse`、`UpdateCartItemRequest` | `openapi:getCart`; `openapi:updateCartItemQuantity`; `openapi:deleteCartItem`; `openapi:components.schemas.CartResponse`; `openapi:components.schemas.UpdateCartItemRequest` | 查詢／修改／刪除操作及錯誤回應 |
| `data-model.dbml` | `carts`、`cart_items`、`cart_item_options`、`menu_items`、`menu_item_options` | `dbml:Table carts`; `dbml:Table cart_items`; `dbml:Table cart_item_options`; `dbml:Table menu_items`; `dbml:Table menu_item_options` | 同 session 購物車限定與目前價格來源 |
| `research.md` | 決策摘要 → 訪客工作階段與購物車歸屬、伺服器權威計價與最新價格、金額精度與表示 | `research:訪客工作階段與購物車歸屬`; `research:伺服器權威計價與最新價格`; `research:金額精度與表示` | 每請求 session 授權、精確重算及價格讀取失敗語意 |

**執行順序**：`T017` **須於 T020 完成後執行**；`T018` **須於 T021–T022 完成後執行**；`T015` 的 GET bootstrap 不涵蓋本節完整計價與不可用項目語意。

- [x] T017 [US2] 在 `backend/src/__tests__/cart/get-cart.test.js` 驗證空車回傳空 items 與零總額、多項目讀取正確規格，並按最新餐點價格及規格加價計算；使用 T002 確認 scale 可表示的精度敏感案例驗證單價、數量乘算及購物車加總皆精確（例如來源支援兩位小數時，`0.10 + 0.20` 數量 3 應回傳單價 `0.30`、項目金額及總額 `0.90`，不得出現浮點誤差）；餐點停供或所選選項停用時保留項目、標示不可用、省略金額且排除於總額 ← `spec:US2`; `spec:FR-004`; `spec:FR-005`; `spec:FR-006`; `spec:FR-008`; `spec:BR-001`; `spec:SC-002`; `spec:SC-003`; `spec:SC-005`; `openapi:getCart`; `openapi:components.schemas.CartResponse`; `dbml:Table carts`; `dbml:Table cart_items`; `dbml:Table cart_item_options`; `dbml:Table menu_items`; `dbml:Table menu_item_options`; `research:伺服器權威計價與最新價格`; `research:金額精度與表示`
- [x] T018 [US2] 在 `backend/src/__tests__/cart/update-delete-cart-item.test.js`（**須於 T021–T022 完成後執行**）驗證正整數 PATCH、零／負數／非整數拒絕、不可用項目 PATCH 回 409、同 session 項目限定刪除（含不可用項目可刪）、重算及有效項目最新價格失敗時不提交變更 ← `spec:US2`; `spec:FR-004`; `spec:FR-005`; `spec:FR-007`; `spec:FR-008`; `spec:BR-001`; `spec:BR-003`; `spec:SC-003`; `spec:SC-004`; `spec:SC-005`; `openapi:updateCartItemQuantity`; `openapi:deleteCartItem`; `openapi:components.schemas.UpdateCartItemRequest`; `dbml:Table carts`; `dbml:Table cart_items`; `dbml:Table cart_item_options`; `dbml:Table menu_item_options`; `research:訪客工作階段與購物車歸屬`; `research:伺服器權威計價與最新價格`

### 使用者故事 2 實作

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `spec.md` | User Story 2、FR-006 至 FR-008、BR-001、BR-003 | `spec:US2`; `spec:FR-006`; `spec:FR-007`; `spec:FR-008`; `spec:BR-001`; `spec:BR-003` | 呈現購物車、不可用狀態及數量／刪除行為 |
| `ui-plan.md` | §畫面與流程 → 檢視與管理購物車、不可用購物車項目、顯示最新價格、訪客工作階段、計價錯誤 | `ui-plan:§畫面與流程→檢視與管理購物車`; `ui-plan:§畫面與流程→不可用購物車項目`; `ui-plan:§畫面與流程→顯示最新價格`; `ui-plan:§畫面與流程→訪客工作階段`; `ui-plan:§畫面與流程→計價錯誤` | 依伺服器回應呈現不可用狀態、禁用數量並允許刪除 |
| `prototype/` | `index.html`、`assets/app.js` | `prototype:index.html`; `prototype:assets/app.js` | 項目、空車、價格及錯誤呈現參照 |
| `contracts/http-api.yaml` | `getCart`、`updateCartItemQuantity`、`deleteCartItem`、`CartResponse` | `openapi:getCart`; `openapi:updateCartItemQuantity`; `openapi:deleteCartItem`; `openapi:components.schemas.CartResponse` | 前端操作使用契約欄位及伺服器計價結果 |

- [x] T019 [US2] 在 `frontend/src/pages/CartPage.jsx` 實作購物車讀取、餐點／規格／金額呈現、正整數數量更新、明確刪除、空狀態及 session／計價錯誤；不可用項目顯示狀態、不顯示金額、不計總額、停用數量控制但保留刪除；只呈現 API 金額 ← `spec:US2`; `spec:FR-006`; `spec:FR-007`; `spec:FR-008`; `spec:BR-001`; `spec:BR-003`; `spec:SC-005`; `ui-plan:§畫面與流程→檢視與管理購物車`; `ui-plan:§畫面與流程→不可用購物車項目`; `ui-plan:§畫面與流程→顯示最新價格`; `ui-plan:§畫面與流程→訪客工作階段`; `ui-plan:§畫面與流程→計價錯誤`; `prototype:index.html`; `prototype:assets/app.js`; `openapi:getCart`; `openapi:updateCartItemQuantity`; `openapi:deleteCartItem`; `openapi:components.schemas.CartResponse`

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `contracts/http-api.yaml` | `getCart`、`updateCartItemQuantity`、`deleteCartItem` 及相關 schema | `openapi:getCart`; `openapi:updateCartItemQuantity`; `openapi:deleteCartItem`; `openapi:components.schemas.CartResponse`; `openapi:components.schemas.UpdateCartItemRequest` | 每個請求依 session 限定購物車並符合 response/error contract |
| `data-model.dbml` | `carts`、`cart_items`、`cart_item_options`、餐點與規格價格欄位 | `dbml:Table carts`; `dbml:Table cart_items`; `dbml:Table cart_item_options`; `dbml:Table menu_items`; `dbml:Table menu_item_options` | 正整數持久化、規格關聯與即時計價來源 |
| `research.md` | 決策摘要 → 伺服器權威計價與最新價格、金額精度與表示 | `research:伺服器權威計價與最新價格`; `research:金額精度與表示` | 每次讀寫重新取價，精確計算且不得回傳舊值 |
| `plan.md` | 端點盤點與 Wave 2 API 分析邊界 | `plan:端點盤點` | API、資料庫及 session 整合依既定責任分層 |

- [x] T020 [US2] 在 `backend/src/routes/cart.js` 與 `backend/src/services/cartService.js` 擴充 T015 的 `GET /cart`：依 session 識別取出同一 session 購物車並以目前餐點／規格價格計算可用項目；保留不可用項目標記且省略其金額，總額只加總可用項目 ← `openapi:getCart`; `openapi:components.schemas.CartResponse`; `dbml:Table carts`; `dbml:Table cart_items`; `dbml:Table cart_item_options`; `dbml:Table menu_items`; `dbml:Table menu_item_options`; `research:訪客工作階段與購物車歸屬`; `research:伺服器權威計價與最新價格`; `research:金額精度與表示`; `plan:端點盤點`
- [x] T021 [US2] 在 `backend/src/routes/cart.js` 與 `backend/src/services/cartService.js` 實作 `PATCH /cart/items/{item_id}`，只接受正整數數量、限定同一 session 所有權；項目不可用時拒絕更新並回傳 409 `CART_ITEM_UNAVAILABLE` ← `openapi:updateCartItemQuantity`; `openapi:components.schemas.UpdateCartItemRequest`; `openapi:components.schemas.CartResponse`; `dbml:Table carts`; `dbml:Table cart_items`; `dbml:Table menu_items`; `dbml:Table menu_item_options`; `research:訪客工作階段與購物車歸屬`; `research:伺服器權威計價與最新價格`; `research:金額精度與表示`
- [x] T022 [US2] 在 `backend/src/routes/cart.js` 與 `backend/src/services/cartService.js` 實作 `DELETE /cart/items/{item_id}`，限定同一 session 項目並允許刪除不可用項目；回傳剩餘項目及排除不可用項目的總額 ← `openapi:deleteCartItem`; `openapi:components.schemas.CartResponse`; `dbml:Table carts`; `dbml:Table cart_items`; `dbml:Table cart_item_options`; `dbml:Table menu_items`; `dbml:Table menu_item_options`; `research:訪客工作階段與購物車歸屬`; `research:伺服器權威計價與最新價格`; `research:金額精度與表示`

**檢查點**：GET、PATCH、DELETE 均由伺服器端 session 授權及計價；操作完成後 API 回傳的項目金額與總額符合目前菜單價格。

---

## 階段 5：收尾與跨領域事項

**目的**：驗證跨故事流程、錯誤邊界及前後端測試／建置結果。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `spec.md` | User Story 1、2 獨立測試與 SC-001 至 SC-005 | `spec:US1`; `spec:US2`; `spec:SC-001`; `spec:SC-002`; `spec:SC-003`; `spec:SC-004`; `spec:SC-005` | 端到端涵蓋需求成果、跨 session 隔離及不可用項目處理 |
| `contracts/http-api.yaml` | 菜單資料依賴、四個購物車操作與共用錯誤 schema | `openapi:listMenuItems`; `openapi:getCart`; `openapi:addCartItem`; `openapi:updateCartItemQuantity`; `openapi:deleteCartItem`; `openapi:components.schemas.ErrorBody` | 前後端整合不偏離契約及菜單資料來源 |
| `plan.md` | Wave 排程、委派摘要與交付前確認 | `plan:端點盤點` | 驗證涵蓋所有已規劃端點且不擴張至結帳／訂單 |
| `techstack.md` | 前端、API 後端、金額表示及資料庫技術棧 | `techstack:前端`; `techstack:API 後端`; `techstack:金額表示`; `techstack:資料庫` | 執行相符的測試與建置 |
| `ui-plan.md` | §畫面與流程 → 加入餐點、檢視購物車、不可用項目、最新價格、訪客工作階段、計價錯誤、狀態與邊界 | `ui-plan:§畫面與流程→選擇規格並加入供應中餐點`; `ui-plan:§畫面與流程→拒絕未供應餐點`; `ui-plan:§畫面與流程→檢視與管理購物車`; `ui-plan:§畫面與流程→不可用購物車項目`; `ui-plan:§畫面與流程→顯示最新價格`; `ui-plan:§畫面與流程→訪客工作階段`; `ui-plan:§畫面與流程→計價錯誤`; `ui-plan:§畫面與流程→狀態與邊界（雛形須可見）` | 瀏覽器端到端對齊雛形流程 |

- [x] T023 執行 `frontend` 的 `npm test`／`npm run build`、`backend` 的 `npm test`，並在瀏覽器驗收菜單規格資料及完整購物車流程，涵蓋多群組／無群組／停用選項、十進位字串保真、供應與規格拒絕、跨 session 隔離、工作階段更新提示（spec Q10）、最新價格、空車及數量／刪除；再驗證失效項目保留、排除金額、禁改數量但可刪除；記錄失敗與未解整合前置 ← `spec:US1`; `spec:US2`; `spec:SC-001`; `spec:SC-002`; `spec:SC-003`; `spec:SC-004`; `spec:SC-005`; `ui-plan:§畫面與流程→選擇規格並加入供應中餐點`; `ui-plan:§畫面與流程→拒絕未供應餐點`; `ui-plan:§畫面與流程→檢視與管理購物車`; `ui-plan:§畫面與流程→不可用購物車項目`; `ui-plan:§畫面與流程→顯示最新價格`; `ui-plan:§畫面與流程→訪客工作階段`; `ui-plan:§畫面與流程→計價錯誤`; `ui-plan:§畫面與流程→狀態與邊界（雛形須可見）`; `prototype:index.html`; `prototype:assets/app.js`; `openapi:listMenuItems`; `openapi:getCart`; `openapi:addCartItem`; `openapi:updateCartItemQuantity`; `openapi:deleteCartItem`; `openapi:components.schemas.ErrorBody`; `plan:端點盤點`; `techstack:前端`; `techstack:API 後端`; `techstack:金額表示`; `techstack:資料庫`

---

## 依賴與執行順序

- 先完成 Phase 1 的整合前置核對，再完成 Phase 2 共用基礎；T001 是所有購物車讀寫 API／服務／client 實作的硬性阻擋條件，T002 是菜單與購物車金額欄位及計價實作的阻擋條件，T003 擴充並驗收既有菜單規格資料來源。
- 每個 `####` 小節開始前，先 READ 該節必讀對照的每一列（人讀部位與機器錨點），再執行第一個任務。
- User Story 1 的新增流程需依賴 T013–T015（service、repository、`POST /cart/items` 路由）及 Phase 2 的 session／計價基礎；**T010/T011 須在 T015 之後**；**T012 成功加入的 API 整合須 T008 與 T015 之後**；**T024** 設定 Q10/Q11 的 store 與清理，**T025** 須在 T015（與 T024）之後以 HTTP 驗收 Q10/Q11。User Story 2 的 GET／PATCH／DELETE 需依賴同一 session／資料／計價基礎（T020–T022）。**T017 須在 T020 之後執行**；**T018 須在 T021–T022 之後執行**。
- `[P]` 僅用於彼此無檔案衝突且沒有未完成依賴的工作；未標記者預設依 T 編號與各節 **執行順序**、**檢查點** 執行；若 T 編號與執行順序衝突，**以執行順序與檢查點為準**。

## 格式驗證（Format Validation）

- 每個 `#### 前端`／`#### 後端` 小節有固定四欄 **必讀對照** 表；Phase 1、2 及 Polish 若含任務亦有對照表。
- 每個 `- [ ] Tnnn` 描述包含實作或驗證目標路徑，行尾有 `←` 與至少一個機器錨點。
- 每節必讀對照的每一列至少由該節一個任務 `←` 引用；任務錨點只指向既有需求、plan、研究、技術堆疊或分析產物部位。
- User Story 任務標記 `[USn]`，各故事包含前端與後端；後端任務引用 `openapi:`，持久化任務引用 `dbml:`，前端任務引用 `ui-plan:`／`prototype:`。
- 不在 tasks 中新增 FR／NFR／BR；外部身份部署接合與菜單幣別／精度仍是 Phase 1 前置；T003 負責菜單規格資料取得與驗收；十進位字串及重複加入建立獨立項目已定案。

Constitution self-check: pass
