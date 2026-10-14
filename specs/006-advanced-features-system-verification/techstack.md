# 技術堆疊：點餐系統第六迭代－進階功能與系統驗證

## 006 前置（005 依賴）

- **訂單／付款／取消**：005 `paymentService`、merchant 看板、顧客 pay／cancel 已存在；006 不改變付款狀態機，僅 RBAC 包住 merchant 路由。
- **菜單讀取**：現況 `menuRepository` 讀 `menuData.js`；006 migration **006_menu_catalog** 後改讀 DB。
- **供應驗證**：`cartPricing.js`、`orderService.js` 已用 `is_active`；006 補店家寫入與顧客 UI 標示。

## 整體架構

延續 React + Vite（單頁 `MenuPage` 多視圖）、Express REST、MSSQL（cart／order／**menu**）。新增 **merchant menu API** 群組、**RBAC 設定解析**、**錯誤中介層**、**integration 測試**。

## 技術堆疊

| 領域 | 採用技術／決策 | 責任與用途 | 研究決策依據 | 版本或限制 |
|---|---|---|---|---|
| 菜單持久化 | MSSQL + migration 006 | categories／menu_items／options | [菜單資料持久化](./research.md#菜單資料持久化由-menudata-遷移至-mssql) | 種子自 menuData.js |
| Memory 測試 | `memoryDatabase.js` | 006 表 CRUD 模擬 | 同上 | `USE_MEMORY_DB=1` |
| RBAC | `MERCHANT_CREDENTIALS` JSON + legacy `MERCHANT_TOKEN` | token→roles | [店家-rbac設定層-token--roles](./research.md#店家-rbac設定層-token--roles) | roles: orders/menu/admin |
| Merchant Menu API | Express `/api/merchant/...` | CRUD、availability PATCH | [售完供應狀態-api](./research.md#售完供應狀態-api) | 需 menu/admin 角色 |
| Merchant Orders API | 004/005 路由 | 接單／付款欄位 | RBAC 決策 | 需 orders/admin |
| 錯誤處理 | `errorMiddleware` + 404 handler | NOT_FOUND、INTERNAL_ERROR | [集中式-http-例外處理](./research.md#集中式-http-例外處理) | NFR-010 |
| 前端（顧客） | `MenuCard`、購物車 | 售完標示 | [前端店家菜單管理](./research.md#前端店家菜單管理) | `is_active` |
| 前端（店家） | `MerchantMenuPage` | 分類／餐點／售完 | 同上 | `#/merchant/menu` |
| 整合測試 | `node --test` integration 檔 | E2E HTTP | [整合測試與-smoke](./research.md#整合測試與-smoke) | 同 harness |
| Smoke | `smoke-006-advanced.mjs` | 本機一鍵 | 同上 | memory DB |

## 來源規格

- **來源規格**：[spec.md](./spec.md)

## 架構與部署限制

- Production 須設定 **`MERCHANT_CREDENTIALS`** 和／或 **`MERCHANT_TOKEN`**（admin）；僅 orders token 不得暴露於顧客端 bundle。
- **`MERCHANT_CREDENTIALS`** 範例（`.env.example` 文件化，勿 commit 真 secret）：
  `[{"token":"kitchen-secret","roles":["orders"]},{"token":"menu-secret","roles":["menu"]}]`
- 菜單 migration 須在接單系統啟動前完成；rollback 策略：保留 006 表，不 downgrade 生產資料。
## 整合測試

- **預設**：`backend/` 下 **`USE_MEMORY_DB=1 npm test`** **包含** `src/__tests__/integration/`（**FR-019**、**NFR-012**）。
- **可選拆分**：若 CI 時間過長，T019 可新增 `npm run test:integration` 並在 `.github/workflows` 分 job；拆分後須更新本節與 `tasks.md` T019 勾選紀錄。

## 尚未固定的版本與選項

- 餐點硬刪 API：本迭代 **不做**（research）。

## 已確認政策

- Legacy **`MERCHANT_TOKEN`** = **admin**（FR-014、spec 邊界）。
- 分類刪除僅空分類（**409** `CATEGORY_IN_USE`）。
- 停供不刪除歷史訂單快照（BR-002）。

## 006 smoke（本機）

**自動（memory DB）**

1. `backend/`：`npm run verify:migrations`（含 **006** 錨點）。
2. `backend/`：`USE_MEMORY_DB=1 npm test`（含 integration、RBAC、menu CRUD）。
3. `backend/`：`USE_MEMORY_DB=1 npm run smoke:006`（建議 tasks 新增 script）。
4. `frontend/`：`npm test`（含 `merchantMenuApi`、售完 UI）。

**MSSQL**

5. 設定 `MSSQL_*`，執行 migrations 含 006；`GET /api/menu-items` 讀 DB 種子。

**手動 UI**

6. `MERCHANT_TOKEN` 或 menu token；`#/merchant/menu` 售完 → 顧客菜單售完 → 購物車不可用。

<!-- Constitution self-check: pass -->
