# 點餐系統第一迭代測試計畫

## 1. 計畫資訊

- **狀態**：已執行；自動化及瀏覽器案例通過
- **計畫版本／更新日**：v1；2026-10-20
- **審閱狀態／日期**：待審閱
- **需求範圍**：顧客讀取餐點與分類，正確呈現餐點名稱、圖片、價格、分類、空值及空清單狀態
- **需求來源**：`spec.md`（US1、FR-001–FR-002、SC-001–SC-002）
- **系統分析來源**：`plan.md`、`ui-plan.md`、`data-model.dbml`、`http-api.yaml`
- **測試環境來源**：`research.md`、`techstack.md`；backend `src/__tests__/menu-api.test.js`；frontend `src/menuApi.test.js`
- **測試狀態約定**：本次執行結果記於第 10 節

## 2. 測試目標與範圍

需求與驗收語意以 `spec.md` 為準；端點與 UI 測試入口依 `plan.md` 指定的 API contract、UI Plan 及 data model。本計畫不新增購物車、規格選擇、下單或店家維護行為。

### 納入範圍

- `GET /api/categories` 與 `GET /api/menu-items` 的讀取回應及餐點／分類關聯。
- 菜單頁顯示名稱、圖片、價格及分類。
- 缺少資料與空菜單時的顯示狀態，不偽造或隱藏餐點。
- 價格與圖片欄位對應至正確餐點。

### 不納入範圍

- 規格挑選、購物車、訂單、付款、店家管理及資料寫入 API。
- 未由來源定義的價格幣別／精度、圖片載入效能或分類排序門檻。

## 3. 測試策略與優先級

| 測試層級 | 責任介面 | 驗證重點 |
|---|---|---|
| HTTP API | `http-api.yaml` 的 categories 與 menu-items read operations | JSON shape、資料關聯及分類篩選 |
| Frontend unit | `frontend/src/menuApi.test.js` 的公開資料載入入口 | API failure 與不合法 response 不被誤當空菜單 |
| UI 手動驗收 | `ui-plan.md` 的菜單瀏覽頁與分類篩選 | 卡片欄位對應、缺值提示、空清單與分類顯示 |

- **P0**：本迭代無明確 P0 資料安全不變量。
- **P1**：US1 核心瀏覽及資料正確性；交付前須通過。
- **P2**：分類標籤篩選；本次依更新後 UI Plan 驗收通過。
- **通過／失敗**：逐項比對回應欄位或畫面可見資料與 fixture；任何餐點欄位錯配即失敗。

## 4. 非功能需求追溯

本迭代 spec 未定義專屬 NFR；不新增效能或可用性門檻。

## 5. 使用者故事測試案例

### 5.1 使用者故事 1－瀏覽餐點與其分類

**目標／獨立驗收**：顧客能瀏覽餐點，且名稱、圖片、價格及分類均對應正確餐點。

**需求追溯**：US1 情境1–3、FR-001–FR-002、SC-001–SC-002。

| ID | 需求追溯 | 測試層級 | Public seam：system-analysis 測試入口 | 優先級 | Arrange：fixture 與差異 | Act：單一操作 | Assert：精確預期 |
|---|---|---|---|---|---|---|---|
| TP-001 | US1 情境1、FR-001、FR-002、SC-001 | HTTP API | `GET /api/categories` (`listCategories`) | P1 | `FX-CATEGORIES-TWO`；兩個名稱可區分的分類 | 讀取分類列表 | [response] 回 200；回應包含 fixture 中兩個分類及其識別／名稱 |
| TP-002 | US1 情境1–3、FR-001–FR-002、SC-001–SC-002 | HTTP API | `GET /api/menu-items` (`listMenuItems`) | P1 | `FX-MENU-TWO-CATEGORIES`；兩分類各有不同餐點名稱、圖片 URL、價格與 category ID | 讀取餐點列表 | [response] 每筆 `name`、`image_url`、`price`、`category_id`、`category_name` 對應同一 fixture 餐點；API 欄位採 `snake_case` |
| TP-003 | US1 情境1–3、FR-002、SC-002 | UI 手動驗收 | `ui-plan.md` 的菜單瀏覽頁；瀏覽器開啟 `prototype/index.html` 驗收雛形，正式 UI 依 plan 的菜單頁流程 | P1 | `FX-MENU-TWO-CATEGORIES`；卡片圖片與價格均使用彼此可辨識值 | 開啟菜單瀏覽頁 | [response] 每張卡片的名稱、圖片、價格、分類均與該餐點資料相符，不串列 |
| TP-004 | US1 邊界情況、FR-002 | UI 手動驗收 | `ui-plan.md` 的菜單卡片及空值狀態 | P1 | `FX-MENU-MISSING-FIELDS`；分別準備缺圖片、價格、分類的餐點 | 呈現菜單頁 | [response] 餐點卡保留；各缺值顯示明確提示／佔位，不偽造欄位或隱藏整筆餐點 |
| TP-005 | US1 邊界情況、FR-001 | Frontend unit／UI 手動驗收 | `loadMenuData(fetcher)` (`frontend/src/menuApi.js`)；菜單瀏覽頁 | P1 | `FX-MENU-EMPTY`；categories 與 items 均為空陣列 | 載入菜單 | [response] API client 回傳空 categories/items；UI 顯示空狀態且不呈現餐點卡 |
| TP-006 | spec 邊界情況、分類篩選 | Browser UI | `MenuPage` 分類標籤 | P2 | 多分類且每類至少一筆餐點 | 切換分類 | [response] 全部為預設；選取分類只顯示該類；分類標籤依名稱排序。已通過瀏覽器驗收。 |
| TP-007 | API contract `listMenuItems` category filter | HTTP API | `GET /api/menu-items?category_id={category_id}` (`listMenuItems`) | P2 | `FX-MENU-TWO-CATEGORIES`；使用存在的分類 ID | 以 `category_id` 查詢菜單 | [response] 回應只含所選分類的餐點；分類 ID 無效時的 400／空列表語意未固定，該邊界不在此案判定 |

## 6. 具名 Fixture 與環境

| Fixture | 必要狀態、欄位與資料關聯 | 身分／權限 | 隔離與重設方式 |
|---|---|---|---|
| `FX-CATEGORIES-TWO` | 兩個唯一 category ID/name | 公開讀取 | 每個 API case 建立獨立資料 |
| `FX-MENU-TWO-CATEGORIES` | 兩個分類各有一筆餐點；名稱、圖片、價格及 category 關聯均不同 | 公開讀取 | 每案例 seed/reset；數值只作資料比對，不推導幣別政策 |
| `FX-MENU-MISSING-FIELDS` | 三筆餐點各缺 `image_url`、`price` 或 `category_name` 其中一項 | 前端 props/API fixture | 每個缺值情境獨立建立 |
| `FX-MENU-EMPTY` | categories 與 items 均為空陣列 | 公開讀取 | API mock 與 UI empty-state fixture 各自隔離 |

### 執行環境

- Backend：於 `backend/` 執行 `npm test`；Node test runner、Supertest；menu API 測試入口 `src/__tests__/menu-api.test.js`。
- Frontend：於 `frontend/` 執行 `npm test`；Node test runner；資料載入測試 `src/menuApi.test.js`。
- UI 雛形：直接開啟 `prototype/index.html`，依 `ui-plan.md` 驗收；不要求 browser automation。
- **範圍註記**：plan 預期的 `http-api.yaml` 已存在於 feature 根目錄，不在 `contracts/` 子目錄。

## 7. 執行與交接

### 快速狀態摘要

- **最後執行日期**：既有摘要未記逐案日期
- **已完成 TP**：TP-001–TP-007（既有執行摘要記錄通過）
- **進行中 TP**：無
- **未啟動 TP**：無
- **已知阻塞**：無
- **下一步建議**：審閱計畫；需求或分析入口改變時，先更新本計畫再進入 TDD。

### TDD 進入條件

- 本計畫經審閱；API 驗收依 `http-api.yaml`，需求語意依 `spec.md`。
- 分類標籤行為已由本次 UI Plan 定案並通過瀏覽器驗收。

### 新 session 啟動檢查

1. 核對 `spec.md` 的 US1／FR／SC 與本計畫案例。
2. 依 `plan.md` 指定的 `http-api.yaml`、`data-model.dbml`、`ui-plan.md` 核對入口。
3. 依 `research.md`／`techstack.md` 核對 test command；不得把未定幣別或精度寫成 Assert。
4. 遇到篩選語意差異時，先更新／確認 UI Plan，不自行決定排序或篩選方式。

## 8. 需求至測試追溯

| User Story／需求 ID | 本計畫案例 |
|---|---|
| US1、FR-001 | TP-001–TP-003、TP-005 |
| US1、FR-002、SC-001–SC-002 | TP-002–TP-005 |
| 分類標籤篩選 | TP-006 |
| `listMenuItems` category filter | TP-007 |

## 9. 待確認事項

- 無。無效 `category_id` 依現行 API 契約回 400 `INVALID_CATEGORY_ID`，已加入並通過 API 驗收。

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

## 11. AI 自主決策與發現紀錄

| 日期 | TP 案例 | TDD 步驟 | 決策／發現內容 | 處置 |
|---|---|---|---|---|
| — | — | — | — | — |

## 12. 執行結果（既有紀錄）

- TP-001–TP-002、TP-007：後端 API 測試通過，含分類關聯、snake_case 欄位與有效／無效分類篩選。
- TP-003–TP-006：瀏覽器驗收通過，含分類切換、缺圖片／價格／分類 fallback、空菜單、分類預設與排序。
- Backend／Frontend 最終回歸及 production build 通過。

Constitution self-check: pass
