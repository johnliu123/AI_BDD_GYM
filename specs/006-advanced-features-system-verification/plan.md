# 系統分析規劃：點餐系統第六迭代－進階功能與系統驗證

## 輸入

- 規格：[spec.md](./spec.md)
- 技術研究：[research.md](./research.md)
- 技術堆疊：[techstack.md](./techstack.md)

## 專案結構

### 文件（本功能）

```text
specs/006-advanced-features-system-verification/
├── spec.md
├── research.md
├── techstack.md
├── plan.md
├── tasks.md
├── ui-plan.md
├── prototype/
├── data-model.dbml
└── contracts/
    └── http-api.yaml
```

### 原始碼（儲存庫根目錄）

```text
frontend/
├── src/
│   ├── merchantMenuApi.js          # 新增
│   ├── pages/MerchantMenuPage.jsx  # 新增
│   ├── pages/MenuPage.jsx          # 售完 UI、#/merchant/menu
│   ├── components/MenuCard.jsx     # is_active 標示
│   └── merchantOrderApi.js         # RBAC 錯誤處理
backend/
├── src/
│   ├── config/merchantCredentials.js  # 新增：解析 MERCHANT_CREDENTIALS
│   ├── middleware/merchantAuth.js       # 擴充 requireMerchantRole
│   ├── middleware/errorMiddleware.js    # 新增
│   ├── routes/merchantMenu.js           # 新增
│   ├── repositories/menuRepository.js   # DB CRUD
│   ├── services/menuAdminService.js     # 新增
│   ├── data/migrations/006_menu_catalog.mssql.sql
│   └── __tests__/integration/system-e2e.test.js
├── scripts/smoke-006-advanced.mjs
```

**結構決策**：菜單寫入獨立 `merchantMenu` router；RBAC 共用 middleware；不新增服務程序。

## 設計決策

- 菜單持久化與 001 表形狀一致；種子來自 `menuData.js`。依據：[research.md](./research.md)「菜單資料持久化」。
- RBAC：`MERCHANT_CREDENTIALS` + legacy `MERCHANT_TOKEN`→admin。依據：FR-009、FR-014、spec 邊界。
- 分類刪除：僅空分類；**409** `CATEGORY_IN_USE`。依據：research「分類刪除策略」。
- 售完：`PATCH …/availability` + 既有 cart/order 驗證。依據：FR-004–FR-013。
- 錯誤：JSON 404 + 集中 error handler；500 無 stack body。依據：NFR-010、FR-016–FR-017。
- 整合測試：memory DB 單檔 E2E + smoke script。依據：FR-018–FR-019、SC-003–SC-007。
- 005 付款／取消、003 建單 CSRF 政策 **不變**；006 契約為 **menu admin + RBAC + 錯誤擴充** 之 implement 錨點。

### 設計決策·契約權威

- 本迭代 OpenAPI 權威：**`006/contracts/http-api.yaml`**（merchant menu、RBAC 錯誤碼、404 政策）。
- 004 merchant 出餐、005 pay/cancel：tasks 錨點仍用 **`004-openapi:`**／**`005-openapi:`**（路徑見 tasks 索引）；006 僅擴充 **security** 描述與 **403** `MERCHANT_FORBIDDEN`。

## 分析流程規劃

本段只規劃分析範圍與 Wave；結論見各端點產物。

### 端點盤點

本節為需求部位與端點對照（tasks 錨點 `plan:端點盤點`）。

| 需求部位 | 涉及的技術端點 |
|---|---|
| 分類／餐點 CRUD（FR-001–FR-003、SC-001） | Merchant Menu API、MSSQL menu 表、merchant UI |
| 售完／停供（FR-004–FR-006、SC-002） | availability PATCH、顧客 GET menu、cart/order 驗證 |
| 顧客售完 UX（FR-007–FR-008） | MenuPage、MenuCard、CartPage |
| RBAC（FR-009–FR-015、SC-004） | merchantAuth、004/005 merchant 路由、menu 路由 |
| 例外處理（FR-016–FR-017、SC-006） | Express middleware、ErrorBody |
| 整合測試（FR-018–FR-019、SC-003、SC-005、SC-007） | node:test integration、smoke script |

本次實際端點：**顧客前端 UI、Merchant Menu API、Merchant Orders API（RBAC 強化）、MSSQL menu 表、Express 錯誤中介、整合測試 harness**。

### 進階功能：分析 Wave 排程

#### Wave 1：平行分析 UI 流程與資料模型

1. **前端 UI 分析（Skill：`/ui-plan`）**
   - 輸出：`ui-plan.md`、`prototype/`
   - 邊界：店家菜單維護、售完 toggle、顧客售完標示；不含 OpenAPI schema。

2. **資料模型分析（Skill：`/data-plan`）**
   - 輸出：`data-model.dbml`
   - 邊界：menu 四表、種子、刪除約束；RBAC 為 env 非表。

#### Wave 2：HTTP API 契約

1. **API 分析（Skill：`/api-plan`）**
   - 輸出：`contracts/http-api.yaml`
   - 前置：Wave 1 的 ui-plan、data-model
   - 邊界：merchant menu CRUD／availability；403/404 錯誤；`x-contract-metadata` 鏈至 004/005。

## 委派摘要

| Wave | Skill id | 輸出產物 | 狀態 |
|---|---|---|---|
| Wave 1 | `/ui-plan` | `ui-plan.md`、`prototype/` | 已於本輪產出 |
| Wave 1 | `/data-plan` | `data-model.dbml` | 已於本輪產出 |
| Wave 2 | `/api-plan` | `contracts/http-api.yaml` | 已於本輪產出 |

## T002 契約對齊紀錄

- **006 OpenAPI 權威**：`contracts/http-api.yaml`（merchant menu CRUD／availability、403 `MERCHANT_FORBIDDEN`、404 `NOT_FOUND`）。
- **data-model.dbml**：四表 `categories`、`menu_items`、`menu_item_option_groups`、`menu_item_options` 與 001 形狀一致；006 migration 須對齊。
- **停供加購錯誤碼**：spec／research 之 `MENU_ITEM_UNAVAILABLE` 與第二迭代既有 **`CART_ITEM_UNAVAILABLE`（409）** 視為等同；測試 assert 以 **`CART_ITEM_UNAVAILABLE`** 為準（002 契約），不在 006 OpenAPI 重複定義 cart 路徑。
- **004／005 契約**：006 不修改 Order schema；RBAC 僅擴充 merchant 端授權描述。pay／cancel／出餐 operationId 仍锚 `005-openapi:`／`004-openapi:`。
- **Analyze 對照（2026-10-14）**：`contracts/http-api.yaml` 與 `data-model.dbml` 無結構性 discrepancies；停供加購錯誤碼政策已寫入上列。
- **Implement 完成紀錄（2026-10-14）**：實作與契約一致；無新增 discrepancies。建單／付款 body 之 `total_amount` 改為**忽略**（非 400），對齊 FR-012／整合測試。
- **Smoke 驗收紀錄（2026-10-14）**：`backend/` 執行 `USE_MEMORY_DB=1 npm test`（132 tests pass）、`npm run verify:migrations`、`npm run smoke:006`；`frontend/` 執行 `npm test`。

## 交付前確認

- 需求追溯：FR-001–FR-019、FR-010–FR-014 全域、NFR-010–NFR-012、BR-001–BR-004、SC-001–SC-007、User Story 1–6。
- data-model 與 001 菜單表一致；006 migration 對齊 dbml。
- tasks 依 openapi／dbml／ui-plan 錨點拆解。

Constitution self-check: pass
