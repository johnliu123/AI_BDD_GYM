# UI Plan：點餐系統第六迭代－進階功能與系統驗證

- **來源規格**：[功能規格：進階功能與系統驗證](./spec.md)
- **系統分析計畫**：[plan.md](./plan.md)
- **互動雛形**：[prototype/index.html](prototype/index.html)

## 範疇

- **分析邊界**：店家菜單維護（分類、餐點、售完）；顧客菜單售完標示；RBAC 錯誤提示；假資料，不設計 OpenAPI schema 或 DBML。
- **涵蓋需求部位**：User Story 1–3、6（UI 部分）；FR-001–FR-008；SC-001–SC-002。
- **設計前提**：
  - 沿用 `MenuPage` hash 導覽：`#/merchant` 訂單看板、`#/merchant/menu` 菜單管理。
  - 售完以 toggle 或按鈕切換 `is_active`（雛形 localStorage 模擬）。
  - 顧客菜單卡片對停供餐點顯示「售完」並禁用加購。

## 畫面與流程

**tasks 機器錨點**：`ui-plan:§畫面與流程→店家菜單維護`、`→餐點售完切換`、`→顧客售完標示`、`→RBAC 權限提示`

| 畫面 | 檔案 | 目的 |
|---|---|---|
| 店家菜單管理 | `index.html` | 分類／餐點表單、售完 toggle |
| 顧客菜單（示意） | `index.html` | 售完 badge、禁用下單 |

### 店家菜單維護

- **觸發**：導覽至 `#/merchant/menu`，輸入有效 menu/admin token。
- **步驟**：選分類 → 新增／編輯餐點名稱與價格 → 儲存 → 顧客端（雛形另一區）刷新可見。
- **追溯**：US1、FR-001–FR-003、SC-001。

### 餐點售完切換

- **觸發**：列表每筆餐點「售完／恢復供應」。
- **步驟**：toggle 後該餐點 `is_active=false` → 顧客區顯示售完；購物車示意標 unavailable。
- **追溯**：US2、FR-004–FR-006、SC-002。

### 顧客售完標示

- **觸發**：菜單載入含停供餐點。
- **步驟**：卡片 overlay「售完」；點擊不開啟規格對話框或對話框僅關閉。
- **追溯**：US3、FR-007、SC-002。

### RBAC 權限提示

- **觸發**：orders-only token 嘗試儲存菜單。
- **步驟**：顯示「權限不足」toast（對應 **403** `MERCHANT_FORBIDDEN`）。
- **追溯**：US4、SC-004。

## 實作

- **技術取向**：React 元件 `MerchantMenuPage.jsx`；API 封裝 `merchantMenuApi.js`；與 004 `merchantOrderApi.js` 共用 token 來源。
- **路由**：`MenuPage` 監聽 hash，`merchant/menu` 子視圖。
- **狀態**：菜單列表 server state；售完後 `loadMenuData()` 刷新顧客區。
- **非目標**：完整 CRUD 表格分頁、圖片上傳、多 token 帳號管理 UI。

## 驗證

- 雛形：切換售完後顧客區即時反映；orders token 儲存被拒絕提示。
- 正式前端：`MenuCard` 單元／整合測試；`merchantMenuApi.test.js` mock 403。
- 對齊 [plan.md](./plan.md) 設計決策·RBAC 與售完 PATCH。

<!-- Constitution self-check: pass -->
