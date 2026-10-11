# Tasks: 餐點瀏覽與分類

**Input**: 設計文件位於 `specs/001-food-browsing-categories/`

**Spec 套件索引**（按需 READ；執行到對應 Phase／小節再載入，勿一次讀完）：

| 文件 | 用途 |
|---|---|
| `spec.md` | 需求、User Story、驗收 |
| `research.md` | 技術決策、理由與替代方案（Setup／Foundational、對齊 plan 時） |
| `plan.md` | 專案結構、端點盤點、設計決策 |
| `techstack.md` | 技術棧與版本（Setup；摘要自 research） |
| `ui-plan.md` · `prototype/` | 前端（前端小節前 READ 對照表列） |
| `data-model.dbml` | 資料與儲存（後端小節前 READ 對照表列） |
| `contracts/http-api.yaml` | API（後端小節前 READ 對照表列） |

**Organization**: Phase 3 起依 User Story；故事內 **#### 前端／後端** 第二層。每小節先 **必讀對照** 表格（人讀部位 + 機器錨點），再執行任務；每個 `Tnnn` 行尾 **`←` 錨點**，且對照表每一列至少被一個任務引用。

**機器錨點語法**：`spec:FR-001` · `spec:US1` · `spec:US1·情境1` · `research:前端顯示與資料取得` · `research:API 契約與資料形狀` · `research:資料儲存與關聯` · `plan:端點盤點` · `plan:設計決策` · `techstack:frontend` · `techstack:backend` · `openapi:listCategories` · `openapi:listMenuItems` · `dbml:Table categories` · `dbml:Table menu_items` · `ui-plan:§畫面與流程` · `prototype:index.html`

## Phase 1: Setup

**Purpose**: 建立前端與後端基礎專案骨架，並讓後續分析與實作皆以規格、研究與計畫一致的技術約定為基準。

**Read when executing this phase**: `research.md`（決策摘要）、`techstack.md`、`plan.md`（僅本 Phase 章節）。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `research.md` | 決策摘要 → 前端顯示與資料取得 | `research:前端顯示與資料取得` | 前端使用 React + TypeScript + Vite |
| `techstack.md` | 前端／API／資料層摘要 | `techstack:frontend`; `techstack:backend` | 技術棧與版本範圍 |
| `plan.md` | 專案結構、設計決策 | `plan:端點盤點`; `plan:設計決策` | 範圍與目錄約定 |

- [x] T001 [P] 建立 `frontend/package.json`、Vite 啟動腳本與基本入口頁面 ← `research:前端顯示與資料取得`; `techstack:frontend`; `plan:設計決策`
- [x] T002 [P] 建立 `backend/package.json`、Express 啟動腳本與 API 基本設定 ← `research:API 契約與資料形狀`; `techstack:backend`; `plan:設計決策`
- [x] T003 建立 `.gitignore`、環境設定範本與必要資料夾結構 ← `plan:端點盤點`; `plan:設計決策`

---

## Phase 2: Foundational

**Purpose**: 補齊共用資料契約、資料模型與 API 基礎，讓 User Story 1 可以依賴一致的資料和錯誤處理規則來實作。

**⚠️ 所有使用者故事都依賴此階段完成。**

**Read when executing this phase**: `research.md`（決策摘要）、`data-model.dbml`、`http-api.yaml`（共通 schema）、`plan.md`（設計決策）。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `research.md` | 決策摘要 → 資料儲存與關聯 | `research:資料儲存與關聯` | 關聯式資料、餐點與分類對應 |
| `data-model.dbml` | `Table categories`、`Table menu_items` | `dbml:Table categories`; `dbml:Table menu_items` | 餐點與分類欄位與關聯 |
| `http-api.yaml` | `listCategories`、`listMenuItems` 與 `ErrorBody` | `openapi:listCategories`; `openapi:listMenuItems`; `openapi:components.schemas.ErrorBody` | API 契約與錯誤格式 |
| `plan.md` | 設計決策：資料一致性、缺失資料處理 | `plan:設計決策` | 維持資料與 UI 一致 |

- [x] T004 建立 `backend/src/config/db.js` 與資料連線模組 ← `research:資料儲存與關聯`; `dbml:Table categories`; `dbml:Table menu_items`
- [x] T005 建立 `backend/src/services/menu-service.js` 讀取分類與餐點資料 ← `openapi:listCategories`; `openapi:listMenuItems`; `research:API 契約與資料形狀`
- [x] T006 建立 API 錯誤處理與通用錯誤格式 ← `openapi:components.schemas.ErrorBody`; `plan:設計決策`
- [x] T007 建立 `backend/src/routes/menu.js` 與 `/api/categories`、`/api/menu-items` 端點骨架 ← `openapi:listCategories`; `openapi:listMenuItems`; `plan:端點盤點`

**Checkpoint**: 後端資料讀取基礎、共用錯誤處理與 API 契約就緒。

---

## Phase 3: User Story 1 - 瀏覽餐點與其分類 (Priority: P1) 🎯 MVP

**Goal**: 讓顧客能開啟菜單頁，看到所有餐點及其名稱、圖片、價格與分類，並確保資訊與正確餐點對應。

**Independent Test**: 使用多筆餐點與分類測試資料，開啟餐點瀏覽頁，逐項確認名稱、圖片、價格與分類皆呈現，且每筆資料正確對應。

**端點（對齊 plan.md）**: 前端、後端 API、關聯式資料庫

### Tests for User Story 1

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `spec.md` | User Story 1、FR-001、FR-002、SC-001、SC-002 | `spec:US1`; `spec:FR-001`; `spec:FR-002` | 菜單頁顯示與正確對應 |
| `ui-plan.md` | §畫面與流程 → 餐點瀏覽流程 | `ui-plan:§畫面與流程` | 餐點卡片與分類篩選 |
| `prototype/index.html` | 菜單瀏覽頁與分類切換 | `prototype:index.html` | 雛形 UI 版面與狀態 |

- [x] T008 [US1] 走查前端菜單展示與篩選流程，確認 UI 能對應 spec 之 FR-001、FR-002 ← `spec:US1`; `spec:FR-001`; `spec:FR-002`; `ui-plan:§畫面與流程`; `prototype:index.html`
- [x] T009 [US1] 驗證缺失資料狀態（缺圖／缺價／缺分類）在雛形中以明確提示呈現，不偽造錯誤資料 ← `spec:US1`; `ui-plan:§畫面與流程`; `prototype:index.html`

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `spec.md` | User Story 1、FR-001、FR-002 | `spec:US1`; `spec:FR-001`; `spec:FR-002` | 菜單 API 回應內容 |
| `research.md` | 決策摘要 → API 契約與資料形狀 | `research:API 契約與資料形狀` | REST JSON shape |
| `data-model.dbml` | `Table menu_items`、`Table categories` | `dbml:Table menu_items`; `dbml:Table categories` | 資料欄位與關聯 |
| `http-api.yaml` | `listMenuItems`、`listCategories` | `openapi:listMenuItems`; `openapi:listCategories` | API 契約與狀態碼 |

- [x] T010 [P] [US1] 建立菜單列表 API 測試，確認餐點名稱、價格、圖片與分類回傳正確 ← `spec:FR-001`; `spec:FR-002`; `openapi:listMenuItems`; `dbml:Table menu_items`
- [x] T011 [US1] 建立分類列表 API 測試，確認分類資料與餐點關聯正確 ← `spec:FR-002`; `openapi:listCategories`; `dbml:Table categories`

### Implementation for User Story 1

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `ui-plan.md` | §範疇、§畫面與流程、§實作 | `ui-plan:§畫面與流程`; `ui-plan:§實作` | 單頁菜單渲染與狀態 |
| `prototype/index.html` | `menuGrid`、`categoryFilters` 互動 | `prototype:index.html` | UI 行為與顯示骨架 |
| `http-api.yaml` | `listMenuItems` / `listCategories` 回應欄位 | `openapi:listMenuItems`; `openapi:listCategories` | 前端資料對接 |

- [x] T012 [US1] `frontend/src/pages/MenuPage.jsx` 或等價實作：渲染分類與餐點卡片 ← `openapi:listMenuItems`; `openapi:listCategories`; `ui-plan:§畫面與流程`; `prototype:index.html`
- [x] T013 [US1] 建立 `frontend/src/components/MenuCard.jsx` 與分類切換邏輯 ← `ui-plan:§畫面與流程`; `prototype:index.html`; `spec:FR-002`
- [x] T014 [P] [US1] 建立缺失資料提示與空狀態 UI ← `spec:US1`; `ui-plan:§畫面與流程`; `prototype:index.html`

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `spec.md` | FR-001、FR-002、SC-001、SC-002 | `spec:FR-001`; `spec:FR-002`; `spec:SC-001` | API 給出正確資料 |
| `research.md` | API 契約與資料形狀、資料儲存與關聯 | `research:API 契約與資料形狀`; `research:資料儲存與關聯` | 資料與 API 一致 |
| `data-model.dbml` | `Table categories`、`Table menu_items` | `dbml:Table categories`; `dbml:Table menu_items` | 資料欄位與關聯 |
| `http-api.yaml` | `listMenuItems`、`listCategories` | `openapi:listMenuItems`; `openapi:listCategories` | contract compliance |

- [x] T015 [US1] `backend/src/routes/menu.js` 實作 `GET /api/categories` ← `openapi:listCategories`; `dbml:Table categories`; `spec:FR-002`
- [x] T016 [US1] `backend/src/routes/menu.js` 實作 `GET /api/menu-items`，回傳 `name`、`image_url`、`price`、`category_name` ← `openapi:listMenuItems`; `dbml:Table menu_items`; `spec:FR-002`
- [x] T017 [P] [US1] 建立 `backend/src/repositories/menuRepository.js` 以關聯查詢讀取分類與餐點資料 ← `research:資料儲存與關聯`; `dbml:Table categories`; `dbml:Table menu_items`
- [x] T018 [P] [US1] 處理缺失資料與錯誤分類條件，保持 API 免於返回錯誤綁定資料 ← `plan:設計決策`; `spec:US1`; `openapi:listMenuItems`

**Checkpoint**: 餐點列表與分類 API 已能支援前端顯示，且資料與 UI 對應正確。

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: 輕量驗證、跨功能一致性與最終 smoke 檢查，確保本迭代僅限於餐點瀏覽與分類範圍。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `spec.md` | User Story 1、邊界情況、假設 | `spec:US1`; `spec:US1·情境1` | 模組範圍與未決事項 |
| `plan.md` | 設計決策、端點盤點 | `plan:端點盤點`; `plan:設計決策` | 不擴大範圍 |
| `ui-plan.md` | §驗證 | `ui-plan:§驗證` | UI 驗證層次 |

- [x] T019 [P] 執行前端與後端 smoke 測試，確認菜單頁可正常開啟與資料展示 ← `spec:US1`; `ui-plan:§驗證`; `openapi:listMenuItems`
- [x] T020 [P] 檢查本迭代範圍未擴張至購物車、訂單或後台管理，並確保未引入未澄清需求 ← `spec:US1`; `plan:端點盤點`; `spec:邊界情況`

---

## Format Validation

- 每個 `####` 小節（含 Setup／Foundational 若有任務表）必有 **必讀對照** 四欄表格。
- 每個 `- [ ] Tnnn` 行尾必有 **`←`** 與至少一個機器錨點；對照表每列至少被一個任務 `←` 引用。
- User Story 任務帶 `[USn]`；含前端／後端第二層；禁止僅列檔案名而不列部位／錨點。
- 缺 openapi／dbml／ui-plan 錨點時不得發明實作任務；Setup／Foundational 及受 research 驅動的任務須含對應 `research:{決策小節}`。

Constitution self-check: pass
