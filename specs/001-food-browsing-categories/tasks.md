# Tasks: 餐點瀏覽與分類

**Feature directory**: `specs/001-food-browsing-categories/`

**Retroactive mapping note**：既有 tasks 均已完成。本次依 testplan 將已存在的測試／行為回溯標上單步 TDD 類型；`[x]` 保留既有完成狀態，標籤不代表本文件證明了歷史 RED 先於 GREEN。TP-006 的分類篩選政策已與 UI Plan、spec 及 testplan 對齊。

**Spec 套件索引**（按需 READ）：

| 文件 | 用途 |
|---|---|
| `spec.md` | User Story、FR、SC 與邊界情況 |
| `testplan.md` | TP-001–TP-007 測試案例與 Assert（唯一測試基線） |
| `research.md`、`techstack.md` | 資料來源、stack 與 test commands |
| `plan.md` | 端點盤點與設計決策 |
| `ui-plan.md`、`prototype/` | 瀏覽、分類呈現及 UI walkthrough |
| `data-model.dbml` | categories 與 menu_items 關聯 |
| `http-api.yaml` | `listCategories`、`listMenuItems` |

**任務規則**：每項行為任務恰有一個 TDD step；同一 TP 先 RED 再 GREEN，必要時另列 REFACTOR。UI 手動走查／上游文件對齊等不改變產品行為的工作用 `[NON-TDD]` 並說明原因。

## Phase 1: Setup

**Purpose**：確認既有前後端測試入口；不新增產品行為。

**Read when executing this phase**：`research.md`、`techstack.md`、`plan.md`、`testplan.md`。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | 執行環境與 API／UI 測試入口 | `testplan:TP-001`; `testplan:TP-003` | 使用已確認的測試命令與入口 |
| `techstack.md` | Frontend／API 技術棧 | `techstack:前端`; `techstack:API` | 沿用既有 test runner |

- [x] T001 [NON-TDD] 確認 backend/frontend `npm test` 與 prototype walkthrough 可執行；本任務只記錄環境，不改產品行為 ← `testplan:TP-001`; `testplan:TP-003`; `techstack:frontend`; `techstack:backend`

## Phase 2: Foundational

**Purpose**：保留既有 categories/menu_items 關聯及只讀 API 前置。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `plan.md` | 需求端點盤點與資料一致性設計 | `plan:端點盤點`; `plan:設計決策` | 菜單只讀，不加入後續迭代功能 |
| `data-model.dbml` | categories／menu_items relation | `dbml:Table categories`; `dbml:Table menu_items` | 餐點分類關聯 |
| `http-api.yaml` | menu read operations | `openapi:listCategories`; `openapi:listMenuItems` | 讀取契約 |

- [x] T002 [NON-TDD] 確認既有資料 fixture 與 GET menu/category API 仍對齊 model／contract；屬基礎契約核對，不改產品行為 ← `testplan:TP-001`; `testplan:TP-002`; `plan:端點盤點`; `dbml:Table categories`; `dbml:Table menu_items`; `openapi:listCategories`; `openapi:listMenuItems`

---

## Phase 3: User Story 1 - 瀏覽餐點與其分類 (Priority: P1)

**Goal**：顧客可瀏覽餐點，且名稱、圖片、價格、分類正確對應。

**端點（對齊 plan.md）**：Frontend、Backend API、relational data.

### User Story 1 任務

依 TP 案例排列；RED／GREEN 是回溯分類。UI walkthrough 為非行為任務。

#### Backend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | categories 與 menu items API cases | `testplan:TP-001`; `testplan:TP-002`; `testplan:TP-007` | lists、餐點資料關聯及 category filter |
| `http-api.yaml` | `listCategories`、`listMenuItems` | `openapi:listCategories`; `openapi:listMenuItems` | response contract |
| `data-model.dbml` | categories、menu_items | `dbml:Table categories`; `dbml:Table menu_items` | 正確 join |

- [x] T003 [US1] [TDD:RED] 在 `backend/src/__tests__/menu-api.test.js` 驗證 TP-001 分類列表欄位與資料 ← `testplan:TP-001`; `spec:US1`; `openapi:listCategories`; `dbml:Table categories`
- [x] T004 [US1] [TDD:GREEN] 實作／維持 `GET /api/categories` 回傳正確 categories ← `testplan:TP-001`; `spec:FR-001`; `openapi:listCategories`; `dbml:Table categories`
- [x] T005 [US1] [TDD:RED] 在 `backend/src/__tests__/menu-api.test.js` 驗證 TP-002 menu items 欄位及 category association ← `testplan:TP-002`; `spec:FR-002`; `openapi:listMenuItems`; `dbml:Table menu_items`; `dbml:Table categories`
- [x] T006 [US1] [TDD:GREEN] 實作／維持 `GET /api/menu-items` 回傳正確名稱、圖片、價格及分類 ← `testplan:TP-002`; `spec:FR-001`; `spec:FR-002`; `openapi:listMenuItems`; `dbml:Table menu_items`
- [x] T007 [US1] [TDD:RED] 為 TP-007 建立有效 `category_id` 篩選測試 ← `testplan:TP-007`; `openapi:listMenuItems`; `dbml:Table menu_items`
- [x] T008 [US1] [TDD:GREEN] 實作／維持 `GET /api/menu-items?category_id=...` 只回傳該分類餐點 ← `testplan:TP-007`; `spec:FR-002`; `openapi:listMenuItems`

#### Frontend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | 卡片呈現、missing fields、empty list | `testplan:TP-003`; `testplan:TP-004`; `testplan:TP-005`; `testplan:TP-006` | UI 欄位、空值及分類篩選 |
| `ui-plan.md` | 瀏覽流程、資料失效狀態、篩選待確認 | `ui-plan:§畫面與流程`; `prototype:index.html` | 依 UI Plan walkthrough |

- [x] T009 [US1] [NON-TDD] 手動走查 TP-003：在 prototype／正式菜單頁確認餐點名稱、圖片、價格、分類正確對應；屬 UI walkthrough，不修改產品行為 ← `testplan:TP-003`; `spec:FR-001`; `spec:FR-002`; `ui-plan:§畫面與流程`; `prototype:index.html`
- [x] T010 [US1] [NON-TDD] 手動走查 TP-004：缺圖／缺價／缺分類時保留卡片並顯示提示；屬驗收走查，不修改產品行為 ← `testplan:TP-004`; `spec:US1`; `spec:FR-002`; `ui-plan:§畫面與流程`; `prototype:index.html`
- [x] T011 [US1] [TDD:RED] 在 `frontend/src/menuApi.test.js` 驗證 TP-005 成功載入空 categories/items 的結果 ← `testplan:TP-005`; `spec:US1`; `spec:FR-001`; `openapi:listCategories`; `openapi:listMenuItems`
- [x] T012 [US1] [TDD:GREEN] 維持 TP-005 空資料呈現為空菜單狀態，不建立餐點卡 ← `testplan:TP-005`; `spec:FR-001`; `ui-plan:§畫面與流程`
- [x] T013 [NON-TDD] 完成 TP-006 分類篩選政策對齊：全部為預設、按分類篩選、分類按名稱排序；已更新 UI Plan 與 testplan，並完成正式前端瀏覽器驗收 ← `testplan:TP-006`; `spec:US1`; `ui-plan:§畫面與流程`

**Checkpoint**：TP-001–TP-006 對照完成；分類預設、篩選及排序政策與 UI Plan、spec、testplan 一致。

## Format Validation

- 每個 TP 至少有一項 task 引用 `testplan:TP-xxx`；行為 task 恰有一個 TDD marker。
- Setup／Foundational／UI walkthrough／上游對齊任務標 `[NON-TDD]` 並說明原因。
- 每個有任務端點小節均有四欄 Binding 表；每列均由任務 `←` 引用。
- 回溯整理不宣稱本文件證明過往 RED 先於 GREEN。

Constitution self-check: pass.
