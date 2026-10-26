# Tasks: 點餐系統第六迭代－進階功能與系統驗證

**Plan directory (PLAN_DIR)**：`specs/plans/006-advanced-features-system-verification/`

**Truth root (TRUTH_ROOT)**：`specs/truth/`

**測試工作模式**：BDD（來源為 `specs/truth/features/**` 介面 Feature／DSL 與 `traceability.md`；總驗收 Journey 為 `features/acceptance/進階能力與端到端驗證總驗收旅程.feature`）

**Retroactive mapping note**：既有實作均已完成。本次將 Phase 3 起由 legacy「User Story ＋ testplan TP」改編為「介面 Feature 檔 ＋ Example」；`[x]` 保留完成狀態，任務敘述對齊 Truth Feature、DSL 與 acceptance 錨點。標籤為回溯性 BDD 分類，不代表本文件證明了歷史 RED 先於 GREEN。`testplan.md`（TP-001–TP-028）僅作歷史對照，不作任務切片權威。TP-013／TP-023 契約對齊、TP-019 test-local Express seam（T061）、TP-028 `npm run smoke:mssql:028` 等歷史驗收紀錄併入對應 Phase 之 `[NON-TDD]` 或整合 Phase 說明。

**Spec 套件索引**（按需 READ）：

| 文件 | 位置 | 用途 |
|---|---|---|
| `spec.md` | PLAN_DIR | US1–US6、FR／NFR／BR／SC |
| `truth-delta.md` | PLAN_DIR | 本 plan Truth 變更紀錄（legacy plan 見檔首註記） |
| `traceability.md` | PLAN_DIR | acceptance Example → 介面 Feature 覆蓋 |
| `scenario-index.md` | PLAN_DIR | 15 個業務情境人 Review 索引 |
| `features/acceptance/進階能力與端到端驗證總驗收旅程.feature` | PLAN_DIR | 整體驗收 Journey |
| `specs/truth/features/<介面>/**/*.feature` | TRUTH_ROOT | 原子化 Example 與可驗收行為 |
| `specs/truth/features/<介面>/**/dsl.md` | TRUTH_ROOT | Example step 的實作契約 |
| `testplan.md` | PLAN_DIR | **歷史** TP 對照（本 tasks 不以 TP 切片） |
| `research.md` | PLAN_DIR | memory DB、RBAC、集中式錯誤、整合 harness |
| `specs/truth/techstack.md` | TRUTH_ROOT | CI／migration／整合測試命令 |
| `plan.md` | PLAN_DIR | 端點、Wave、跨迭代契約與 TP-019 seam |
| `ui/ui-plan.md`、`ui/prototype/` | PLAN_DIR | 店家菜單、售完、RBAC、顧客售完 UI |
| `specs/truth/data/data-model.dbml` | TRUTH_ROOT | categories、menu items、options、orders |
| `specs/truth/contracts/http-api.yaml` | TRUTH_ROOT | 006 menu/RBAC/error；002–005 cart/order/payment |

## 情境進度（人 Review）

對照 `scenario-index.md` 15 旅程；任務編號為 BDD 回溯映射。

| 業務情境 | 後端 RED | 後端 GREEN | 前端 RED | 前端 GREEN | 備註 |
| --- | --- | --- | --- | --- | --- |
| 店家建立分類與餐點後顧客可在菜單中看到 | T003、T005 | T004、T006 | T017 | T018 | 回溯完成 `[x]` |
| 店家修改餐點資料不會改寫既有訂單 | T007 | T008 | T017 | T018 | 回溯完成 `[x]` |
| 店家維護餐點規格群組與選項 | T005 | T006 | T017 | T018 | 回溯完成 `[x]` |
| 店家刪除仍有餐點使用的分類 | T013 | T014 | — | — | 回溯完成 `[x]` |
| 餐點售完後禁止新增至購物車與建立訂單 | T019、T029、T031 | T020、T030、T032 | T027、T031a | T028、T032a | 回溯完成 `[x]` |
| 店家恢復供應後顧客可以再次購買 | T023 | T024 | T025、T027 | T026、T028 | 回溯完成 `[x]` |
| 店家停止供應單一規格選項 | T021 | T022 | T025 | T026 | 回溯完成 `[x]` |
| 菜單管理人員與訂單管理人員只能執行各自職責 | T034 | T035 | T040 | T041 | 回溯完成 `[x]` |
| 未授權人員無法使用店家管理功能 | T036 | T037 | T040 | T041 | 回溯完成 `[x]` |
| 用戶端自稱管理員不能提升店家權限 | T034 | T035 | — | — | 回溯完成 `[x]` |
| 可預期的拒絕以一致方式呈現 | T042、T044 | T043、T045 | T047 | T048 | 回溯完成 `[x]` |
| 未預期錯誤不會暴露系統內部資訊 | T044 | T045 | — | — | T061 重驗 seam；回溯 `[x]` |
| 顧客完成點餐後店家完成出餐 | T049 | T050 | — | — | 跨 Example 整合 harness；回溯 `[x]` |
| 建單或付款請求提供不同金額仍以訂單快照為準 | T033d | T033e | — | — | 契約＋整合；回溯 `[x]` |
| 預設整合驗證可在 CI 環境重複執行 | T058 | T059 | — | — | `[NON-TDD]` 命令驗證；回溯 `[x]` |

**Organization**：Phase 3 起每個納入範圍的 Truth 介面 Feature 檔一 Phase（依 `traceability.md` Derived Feature）；各 Example 拆 `[BDD:RED]`、`[BDD:GREEN]`。無對應 Truth Example 之契約對齊、冪等 replay、全 HTTP 串接或 CI 命令標 `[NON-TDD]` 並說明原因。全部 Feature Phase 完成後執行 **NFR 重構** Phase。

## Phase 1: Setup

**Purpose**：核對 005 前置與既有測試入口；不改變產品行為。

**Read when executing this phase**：`truth-delta.md`（全文）、`research.md`、`specs/truth/techstack.md`、`plan.md`、`traceability.md`（Coverage Summary）、`scenario-index.md`。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `specs/truth/techstack.md` | 006 前置、整合測試、migration | `techstack:006 前置（005 依賴）`; `techstack:整合測試` | 沿用既有 test runner |
| `plan.md` | 006 OpenAPI authority、端點盤點 | `plan:端點盤點`; `plan:設計決策·契約權威` | menu/RBAC/error scope |
| `traceability.md` | Coverage Summary | `traceability.md` §Coverage Summary | 15 acceptance Examples 已 assigned |

- [x] T001 [NON-TDD] 核對 005 memory DB suite、006 menu contract、migration verify 與 integration entrypoint；本項為前置驗證，不改產品行為 ← `plan:端點盤點`; `techstack:006 前置（005 依賴）`; `techstack:整合測試`; `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#預設整合驗證可在 CI 環境重複執行`

## Phase 2: Foundational

**Purpose**：保留 migration、RBAC、error middleware、menu repository／route foundation；不含尚未有 RED Example 的產品行為。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `plan.md` | 006 資料一致性、端點 | `plan:端點盤點`; `plan:設計決策` | merchant menu 持久化基礎 |
| `specs/truth/data/data-model.dbml` | menu tables／Project | `dbml:Project advanced_features_menu`; `dbml:Table categories`; `dbml:Table menu_items`; `dbml:Table menu_item_options` | schema ownership |
| `specs/truth/contracts/http-api.yaml` | ErrorBody／merchant operations | `openapi:components.schemas.ErrorBody`; `openapi:components.responses.MerchantForbidden` | shared API error/auth |

- [x] T002 [NON-TDD] 核對既有 006 migration、memory DB schema、merchant credentials fixtures 與 routes；僅為基礎契約核對，不增加產品行為 ← `plan:端點盤點`; `dbml:Project advanced_features_menu`; `research:菜單資料持久化（由 menuData 遷移至 MSSQL）`; `openapi:components.schemas.ErrorBody`

**Checkpoint**：後端／前端測試 harness 可載入；006 menu 表與 contract 對齊。

---

## Phase 2.5: Harness 對齊 Truth 介面拓樸

**Purpose**：legacy plan 雖無 `truth-delta` dsl-refine 列，仍核對 006 相關介面 Feature 與 DSL 可被 step／整合測試解析。

**truth-delta 說明**：006 介面 Truth 已於 legacy 合併完成；本 Phase **刻意不追加** dsl-refine MOD/DEL 列（Rule-Tasks：無 delta 時 omit）。Harness 對齊以 T002a/T002b 與 `traceability.md` 為準，非遺漏。

**Read when executing this phase**：`specs/truth/techstack.md`、`specs/truth/features/backend/菜單/dsl.md`、`specs/truth/features/backend/菜單/*.feature`、`specs/truth/features/backend/授權/dsl.md`、`specs/truth/features/backend/錯誤處理/dsl.md`（若存在）。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `traceability.md` | Derived Feature 列表 | `traceability.md` §Coverage Matrix | 44 derived Examples 可載入 |
| `specs/truth/techstack.md` | 測試命令 | `techstack:backend`; `techstack:整合測試` | 全 suite smoke |

- [x] T002a [BDD:REFACTOR] 核對 backend menu／供應／授權／錯誤處理 step 断言，使 006 Truth Example 的 Given/When/Then 可對應 `backend/**/dsl.md` 列 ← `feature:specs/truth/features/backend/菜單/店家維護菜單.feature#店家建立菜單分類`; `feature:specs/truth/features/backend/授權/店家角色權限.feature#menu-only 憑證允許建立菜單分類`; `feature:specs/truth/features/backend/錯誤處理/API錯誤回應.feature#不符合資料要求的請求以結構化錯誤拒絕`; `spec:FR-001`
- [x] T002b [NON-TDD] 執行 menu／RBAC／error 模組 smoke 或 `audit_feature_dsl_topology.py --root specs/truth/features/backend`（介面根），確認 006 介面 Feature 與 DSL 拓樸無 step 缺 row ← `techstack:backend`; `traceability.md` §Coverage Summary

**Checkpoint**：依 `techstack.md` 執行 backend 測試一次；006 核心介面 Example 相關 case 全綠。

---

## Phase 3: `specs/truth/features/backend/菜單/店家維護菜單.feature` 🎯 MVP

**Goal**：完成此 Feature 檔內所有 Example 的 BDD 循環（分類／餐點 CRUD、快照不變、分類刪除護欄、規格群組）。

**端點（對齊 plan.md）**：Backend merchant menu API、relational data.

**追溯（acceptance traceability）**：Journey Examples「店家建立分類與餐點後顧客可在菜單中看到」「店家修改餐點資料不會改寫既有訂單」「店家維護餐點規格群組與選項」「店家刪除仍有餐點使用的分類」→ `spec:US1`; `spec:FR-001`–`FR-003`; `spec:FR-012`

**Read when executing this phase**：`traceability.md`（菜單列）、`specs/truth/features/backend/菜單/店家維護菜單.feature`、`specs/truth/features/backend/菜單/dsl.md`。

### 店家維護菜單.feature 任務

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `traceability.md` | US1 acceptance → backend Feature | `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#店家建立分類與餐點後顧客可在菜單中看到` | 承接已確認 acceptance 行為 |
| `specs/truth/features/backend/菜單/店家維護菜單.feature` | 五個 Example | `feature:specs/truth/features/backend/菜單/店家維護菜單.feature#店家建立菜單分類`; `feature:specs/truth/features/backend/菜單/店家維護菜單.feature#店家建立隸屬於既有分類的餐點`; `feature:specs/truth/features/backend/菜單/店家維護菜單.feature#店家更新餐點名稱或價格`; `feature:specs/truth/features/backend/菜單/店家維護菜單.feature#店家刪除仍被餐點使用的分類遭拒`; `feature:specs/truth/features/backend/菜單/店家維護菜單.feature#店家更新餐點規格群組與選項` | Then 断言 |
| `specs/truth/features/backend/菜單/dsl.md` | 店家 Given/When/Then | `dsl:specs/truth/features/backend/菜單/dsl.md#店家建立一個分類`; `dsl:specs/truth/features/backend/菜單/dsl.md#店家建立一項包含名稱、價格及所屬分類的餐點`; `dsl:specs/truth/features/backend/菜單/dsl.md#店家更新餐點名稱或價格` | 持久化與公開讀取 |
| `specs/truth/contracts/http-api.yaml` | merchant category/menu | `openapi:createMerchantCategory`; `openapi:createMerchantMenuItem`; `openapi:updateMerchantMenuItem`; `openapi:deleteMerchantCategory`; `openapi:listMenuItems` | request／response/errors |
| `specs/truth/data/data-model.dbml` | categories/menu/options | `dbml:Table categories`; `dbml:Table menu_items`; `dbml:Table menu_item_option_groups`; `dbml:Table menu_item_options` | schema |

- [x] T003 [US1] [BDD:RED] 接通 Example「店家建立菜單分類」← `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#店家建立分類與餐點後顧客可在菜單中看到`; `feature:specs/truth/features/backend/菜單/店家維護菜單.feature#店家建立菜單分類`; `dsl:specs/truth/features/backend/菜單/dsl.md#店家建立一個分類`; `spec:US1`; `openapi:createMerchantCategory`
  完成條件：Example 因分類未持久化或列表讀不到而失敗
- [x] T004 [US1] [BDD:GREEN] 實作／維持 category create/list 讓上述 Example 通過 ← `feature:specs/truth/features/backend/菜單/店家維護菜單.feature#店家建立菜單分類`; `spec:FR-001`; `openapi:createMerchantCategory`
- [x] T005 [US1] [BDD:RED] 接通 Example「店家建立隸屬於既有分類的餐點」與「店家更新餐點規格群組與選項」之 menu item／option 持久化及公開讀取断言 ← `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#店家建立分類與餐點後顧客可在菜單中看到`; `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#店家維護餐點規格群組與選項`; `feature:specs/truth/features/backend/菜單/店家維護菜單.feature#店家建立隸屬於既有分類的餐點`; `feature:specs/truth/features/backend/菜單/店家維護菜單.feature#店家更新餐點規格群組與選項`; `dsl:specs/truth/features/backend/菜單/dsl.md#店家建立一項包含名稱、價格及所屬分類的餐點`; `openapi:createMerchantMenuItem`; `openapi:listMenuItems`
  完成條件：Example 因餐點或規格未序列化至顧客菜單而失敗
- [x] T006 [US1] [BDD:GREEN] 實作／維持餐點與規格持久化及 menu serialization ← `feature:specs/truth/features/backend/菜單/店家維護菜單.feature#店家建立隸屬於既有分類的餐點`; `feature:specs/truth/features/backend/菜單/店家維護菜單.feature#店家更新餐點規格群組與選項`; `spec:FR-002`; `spec:FR-003`; `dbml:Table menu_items`; `dbml:Table menu_item_options`
- [x] T007 [US1] [BDD:RED] 接通 Example「店家更新餐點名稱或價格」之 order snapshot 不變断言 ← `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#店家修改餐點資料不會改寫既有訂單`; `feature:specs/truth/features/backend/菜單/店家維護菜單.feature#店家更新餐點名稱或價格`; `dsl:specs/truth/features/backend/菜單/dsl.md#店家更新餐點名稱或價格`; `openapi:updateMerchantMenuItem`; `003-openapi:getOrder`
  完成條件：Example 因 menu 更新回寫既有 order snapshot 而失敗
- [x] T008 [US1] [BDD:GREEN] 實作／維持 menu update 不回寫既有 order snapshot ← `feature:specs/truth/features/backend/菜單/店家維護菜單.feature#店家更新餐點名稱或價格`; `spec:FR-012`; `spec:BR-002`; `dbml:Table orders`
- [x] T009 [NON-TDD] 完成 legacy 無獨立 Truth Example 之 invalid price／partial write 拒絕驗證（historical TP-004）；行為已由 request validation 測試覆蓋，本任務僅追溯對齊 `API錯誤回應.feature` 之結構化拒絕語意 ← `feature:specs/truth/features/backend/錯誤處理/API錯誤回應.feature#不符合資料要求的請求以結構化錯誤拒絕`; `spec:FR-002`; `openapi:createMerchantMenuItem`
- [x] T010 [NON-TDD] 確認上述 validation 原子寫入 invariant 仍綠；不修改產品行為 ← `dsl:specs/truth/features/backend/菜單/dsl.md#店家建立一項包含名稱、價格及所屬分類的餐點`; `spec:FR-002`
- [x] T011 [NON-TDD] 完成 legacy 無 Truth Example 之 duplicate category 409 驗證（historical TP-005）；對齊 `spec:FR-001` 與 OpenAPI conflict ← `openapi:createMerchantCategory`; `spec:FR-001`
- [x] T012 [NON-TDD] 確認 duplicate category rejection 仍綠 ← `openapi:createMerchantCategory`; `spec:FR-001`
- [x] T013 [US1] [BDD:RED] 接通 Example「店家刪除仍被餐點使用的分類遭拒」← `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#店家刪除仍有餐點使用的分類`; `feature:specs/truth/features/backend/菜單/店家維護菜單.feature#店家刪除仍被餐點使用的分類遭拒`; `dsl:specs/truth/features/backend/菜單/dsl.md#店家嘗試刪除該分類`; `openapi:deleteMerchantCategory`
  完成條件：Example 因引用中分類仍可刪除或關聯被破壞而失敗
- [x] T014 [US1] [BDD:GREEN] 實作／維持 `CATEGORY_IN_USE` category reference guard ← `feature:specs/truth/features/backend/菜單/店家維護菜單.feature#店家刪除仍被餐點使用的分類遭拒`; `spec:FR-001`; `dbml:Table categories`
- [x] T015 [NON-TDD] 完成 legacy 無 Truth Example 之 category PATCH 列表一致性驗證（historical TP-026）← `openapi:updateMerchantCategory`; `openapi:listMerchantCategories`; `spec:FR-001`
- [x] T016 [NON-TDD] 確認 category PATCH 欄位更新後 list 反映；不新增產品行為 ← `openapi:updateMerchantCategory`; `spec:FR-001`

**Checkpoint**：`店家維護菜單.feature` 後端 Example 全綠；legacy validation／duplicate／PATCH 追溯完成。

---

## Phase 4: `specs/truth/features/frontend/店家菜單/菜單維護.feature`

**Goal**：店家 UI 建立／更新分類、餐點與規格，並反映顧客可讀結果。

**端點（對齊 plan.md）**：Frontend merchant menu.

**追溯**：acceptance「店家建立分類與餐點後顧客可在菜單中看到」「店家修改餐點資料不會改寫既有訂單」「店家維護餐點規格群組與選項」

**Read when executing this phase**：`specs/truth/features/frontend/店家菜單/菜單維護.feature`、`specs/truth/features/frontend/店家菜單/dsl.md`、`ui/ui-plan.md`。

### 菜單維護.feature 任務

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `specs/truth/features/frontend/店家菜單/菜單維護.feature` | 三個 Example | `feature:specs/truth/features/frontend/店家菜單/菜單維護.feature#店家建立分類與餐點`; `feature:specs/truth/features/frontend/店家菜單/菜單維護.feature#店家更新餐點資料後既有訂單快照不變`; `feature:specs/truth/features/frontend/店家菜單/菜單維護.feature#店家儲存規格群組與選項` | form payload 與結果 |
| `specs/truth/features/frontend/店家菜單/dsl.md` | 店家 When/Then | `dsl:specs/truth/features/frontend/店家菜單/dsl.md#店家建立分類與餐點`; `dsl:specs/truth/features/frontend/店家菜單/dsl.md#店家儲存規格群組與選項` | UI 操作語意 |
| `ui/ui-plan.md` | 店家菜單維護 | `ui-plan:§畫面與流程→店家菜單維護`; `prototype:index.html` | walkthrough |

- [x] T017 [US1] [BDD:RED] 接通 Example「店家建立分類與餐點」「店家更新餐點資料後既有訂單快照不變」「店家儲存規格群組與選項」之前端／整合測試連接 ← `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#店家建立分類與餐點後顧客可在菜單中看到`; `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#店家修改餐點資料不會改寫既有訂單`; `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#店家維護餐點規格群組與選項`; `feature:specs/truth/features/frontend/店家菜單/菜單維護.feature#店家建立分類與餐點`; `ui-plan:§畫面與流程→店家菜單維護`
  完成條件：Example 因表單提交後 API 結果或顧客菜單未反映而失敗
- [x] T018 [US1] [BDD:GREEN] 實作／維持 MerchantMenuPage category/item forms 與 API result display ← `feature:specs/truth/features/frontend/店家菜單/菜單維護.feature#店家建立分類與餐點`; `feature:specs/truth/features/frontend/店家菜單/菜單維護.feature#店家儲存規格群組與選項`; `spec:FR-001`; `spec:FR-002`; `ui-plan:§畫面與流程→店家菜單維護`

**Checkpoint**：`菜單維護.feature` 前端 Example 全綠。

---

## Phase 5: `specs/truth/features/backend/菜單/供應狀態.feature`

**Goal**：店家 PATCH 餐點／規格選項供應狀態，公開菜單反映最新狀態。

**端點（對齊 plan.md）**：Backend availability PATCH、public menu read.

**追溯**：acceptance「餐點售完…」「店家恢復供應…」「店家停止供應單一規格選項」→ `spec:US2`; `spec:FR-004`–`FR-006`; `spec:FR-011`

**Read when executing this phase**：`specs/truth/features/backend/菜單/供應狀態.feature`、`specs/truth/features/backend/菜單/dsl.md`。

### 供應狀態.feature 任務

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `traceability.md` | 供應狀態 acceptance | `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#餐點售完後禁止新增至購物車與建立訂單` | 停供／恢復 authority |
| `specs/truth/features/backend/菜單/供應狀態.feature` | 三個 Example | `feature:specs/truth/features/backend/菜單/供應狀態.feature#店家將餐點停止供應`; `feature:specs/truth/features/backend/菜單/供應狀態.feature#店家恢復餐點供應`; `feature:specs/truth/features/backend/菜單/供應狀態.feature#店家停止供應單一規格選項` | persistence/public view |
| `specs/truth/contracts/http-api.yaml` | availability operations | `openapi:patchMenuItemAvailability`; `openapi:patchMenuOptionAvailability`; `openapi:listMenuItems` | state on menu |
| `specs/truth/features/backend/菜單/dsl.md` | 停供 When/Then | `dsl:specs/truth/features/backend/菜單/dsl.md#店家將該餐點設為停止供應` | API 語意 |

- [x] T019 [US2] [BDD:RED] 接通 Example「店家將餐點停止供應」之 API／menu response 断言 ← `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#餐點售完後禁止新增至購物車與建立訂單`; `feature:specs/truth/features/backend/菜單/供應狀態.feature#店家將餐點停止供應`; `dsl:specs/truth/features/backend/菜單/dsl.md#店家將該餐點設為停止供應`; `openapi:patchMenuItemAvailability`
  完成條件：Example 因停供後公開菜單仍顯示可供應而失敗
- [x] T020 [US2] [BDD:GREEN] 實作／維持 item availability PATCH 與顧客讀取狀態 ← `feature:specs/truth/features/backend/菜單/供應狀態.feature#店家將餐點停止供應`; `spec:FR-004`; `openapi:listMenuItems`
- [x] T021 [US2] [BDD:RED] 接通 Example「店家停止供應單一規格選項」之 stopped option 加購 409 断言 ← `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#店家停止供應單一規格選項`; `feature:specs/truth/features/backend/菜單/供應狀態.feature#店家停止供應單一規格選項`; `spec:FR-005`; `002-openapi:addCartItem`
  完成條件：Example 因停用選項仍可加購而失敗
- [x] T022 [US2] [BDD:GREEN] 實作／維持 option availability enforcement ← `feature:specs/truth/features/backend/菜單/供應狀態.feature#店家停止供應單一規格選項`; `spec:FR-005`; `openapi:patchMenuOptionAvailability`
- [x] T023 [US2] [BDD:RED] 接通 Example「店家恢復餐點供應」之 public menu 與合法 cart add 恢復断言 ← `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#店家恢復供應後顧客可以再次購買`; `feature:specs/truth/features/backend/菜單/供應狀態.feature#店家恢復餐點供應`; `002-openapi:addCartItem`
  完成條件：Example 因恢復後仍無法以最新價格加購而失敗
- [x] T024 [US2] [BDD:GREEN] 實作／維持 restore availability 與最新價格加購 ← `feature:specs/truth/features/backend/菜單/供應狀態.feature#店家恢復餐點供應`; `spec:BR-001`; `openapi:patchMenuItemAvailability`

**Checkpoint**：`供應狀態.feature` 後端 Example 全綠。

---

## Phase 6: `specs/truth/features/backend/供應驗證/顧客購物車與訂單.feature`

**Goal**：停供餐點不得加購；建單前 revalidate；恢復後可建單；拒絕 client 夾帶 cart 金額欄位。

**端點（對齊 plan.md）**：Cart API、Orders API（002／003 contract）.

**追溯**：acceptance「餐點售完後禁止新增至購物車與建立訂單」「店家恢復供應後顧客可以再次購買」→ `spec:US3`; `spec:FR-008`; `spec:FR-012`–`FR-013`

**Read when executing this phase**：`specs/truth/features/backend/供應驗證/顧客購物車與訂單.feature`、`specs/truth/features/backend/供應驗證/dsl.md`（若存在）.

### 顧客購物車與訂單.feature 任務

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `specs/truth/features/backend/供應驗證/顧客購物車與訂單.feature` | 三個 Example | `feature:specs/truth/features/backend/供應驗證/顧客購物車與訂單.feature#顧客加入時餐點已售完`; `feature:specs/truth/features/backend/供應驗證/顧客購物車與訂單.feature#加購後餐點售完使建立訂單遭拒`; `feature:specs/truth/features/backend/供應驗證/顧客購物車與訂單.feature#餐點恢復供應後可以建立訂單` | cart/order guards |
| `specs/truth/contracts/http-api.yaml` | addCartItem/createOrder | `002-openapi:addCartItem`; `003-openapi:createOrder` | 409／400 |
| `spec.md` | FR-008、FR-012 | `spec:FR-008`; `spec:FR-012`; `spec:FR-013` | server-side validation |

- [x] T029 [US3] [BDD:RED] 接通 Example「加購後餐點售完使建立訂單遭拒」← `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#餐點售完後禁止新增至購物車與建立訂單`; `feature:specs/truth/features/backend/供應驗證/顧客購物車與訂單.feature#加購後餐點售完使建立訂單遭拒`; `003-openapi:createOrder`
  完成條件：Example 因 mixed unavailable cart 仍建單成功或 cart 被清空而失敗
- [x] T030 [US3] [BDD:GREEN] 實作／維持 create order latest availability revalidation ← `feature:specs/truth/features/backend/供應驗證/顧客購物車與訂單.feature#加購後餐點售完使建立訂單遭拒`; `spec:FR-008`; `003-openapi:createOrder`
- [x] T031 [US3] [BDD:RED] 接通 Example「顧客加入時餐點已售完」← `feature:specs/truth/features/backend/供應驗證/顧客購物車與訂單.feature#顧客加入時餐點已售完`; `002-openapi:addCartItem`; `spec:FR-006`
  完成條件：Example 因停供餐點仍可加入 cart 而失敗
- [x] T032 [US3] [BDD:GREEN] 實作／維持停供 item 加購拒絕且 cart 不變 ← `feature:specs/truth/features/backend/供應驗證/顧客購物車與訂單.feature#顧客加入時餐點已售完`; `spec:FR-006`; `002-openapi:addCartItem`
- [x] T033 [US3] [BDD:RED] 接通 Example「餐點恢復供應後可以建立訂單」← `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#店家恢復供應後顧客可以再次購買`; `feature:specs/truth/features/backend/供應驗證/顧客購物車與訂單.feature#餐點恢復供應後可以建立訂單`; `003-openapi:createOrder`
  完成條件：Example 因恢復後建單仍遭拒而失敗
- [x] T033a [US3] [BDD:GREEN] 實作／維持恢復供應後建單成功且 snapshot 依當下菜單 ← `feature:specs/truth/features/backend/供應驗證/顧客購物車與訂單.feature#餐點恢復供應後可以建立訂單`; `spec:BR-001`
- [x] T033b [US3] [NON-TDD] 完成 legacy 無單一 Truth Example 之 cart add body 夾帶價格欄位拒絕（historical TP-027）；對齊 `spec:FR-012` 與 002 contract ← `002-openapi:addCartItem`; `spec:FR-012`
- [x] T033c [US3] [NON-TDD] 確認 cart amount fields 拒絕後 cart 不變；不新增產品行為 ← `002-openapi:addCartItem`; `spec:FR-012`
- [x] T031b [US3] [NON-TDD] 完成 legacy CreateOrderRequest 相容金額欄位忽略政策（historical TP-013）；已由整合測試驗證 snapshot 不受 client 總額影響 ← `003-openapi:components.schemas.CreateOrderRequest`; `spec:FR-012`; `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#建單或付款請求提供不同金額仍以訂單快照為準`

**Checkpoint**：`顧客購物車與訂單.feature` 後端 Example 全綠；cart/order 金額政策追溯完成。

---

## Phase 7: `specs/truth/features/frontend/店家菜單/供應狀態.feature`

**Goal**：店家 UI 切換餐點／規格停供與恢復，驅動後端狀態更新。

**端點（對齊 plan.md）**：Frontend merchant availability toggle.

**追溯**：acceptance「餐點售完…」「店家恢復供應…」「店家停止供應單一規格選項」

**Read when executing this phase**：`specs/truth/features/frontend/店家菜單/供應狀態.feature`、`ui/ui-plan.md`。

### 供應狀態.feature 任務

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `specs/truth/features/frontend/店家菜單/供應狀態.feature` | 三個 Example | `feature:specs/truth/features/frontend/店家菜單/供應狀態.feature#店家將供應中的餐點標記為售完`; `feature:specs/truth/features/frontend/店家菜單/供應狀態.feature#店家恢復已售完餐點供應`; `feature:specs/truth/features/frontend/店家菜單/供應狀態.feature#店家將單一規格選項標記為停止供應` | toggle 與 API |
| `ui/ui-plan.md` | 餐點售完切換 | `ui-plan:§畫面與流程→餐點售完切換` | merchant UX |

- [x] T025 [US2] [BDD:RED] 接通 Example「店家將供應中的餐點標記為售完」「店家將單一規格選項標記為停止供應」之 UI/API test ← `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#餐點售完後禁止新增至購物車與建立訂單`; `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#店家停止供應單一規格選項`; `feature:specs/truth/features/frontend/店家菜單/供應狀態.feature#店家將供應中的餐點標記為售完`; `ui-plan:§畫面與流程→餐點售完切換`
  完成條件：Example 因 toggle 未呼叫 PATCH 或狀態未刷新而失敗
- [x] T026 [US2] [BDD:GREEN] 實作／維持 item／option sold-out toggle 與菜單 refresh ← `feature:specs/truth/features/frontend/店家菜單/供應狀態.feature#店家將單一規格選項標記為停止供應`; `feature:specs/truth/features/frontend/店家菜單/供應狀態.feature#店家恢復已售完餐點供應`; `spec:FR-004`; `spec:FR-005`; `ui-plan:§畫面與流程→餐點售完切換`

**Checkpoint**：店家供應狀態 UI Example 全綠。

---

## Phase 8: `specs/truth/features/frontend/顧客菜單/售完狀態.feature`

**Goal**：顧客菜單售完標示、不可選購；Cart 不可用項目不計價；恢復後可再選。

**端點（對齊 plan.md）**：Frontend customer menu/cart presentation.

**追溯**：acceptance「餐點售完後禁止…」「店家恢復供應後…」→ `spec:FR-007`; `spec:FR-013`

**Read when executing this phase**：`specs/truth/features/frontend/顧客菜單/售完狀態.feature`、`ui/ui-plan.md`。

### 售完狀態.feature 任務

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `specs/truth/features/frontend/顧客菜單/售完狀態.feature` | 兩個 Example | `feature:specs/truth/features/frontend/顧客菜單/售完狀態.feature#菜單中的售完餐點清楚標示且無法選購`; `feature:specs/truth/features/frontend/顧客菜單/售完狀態.feature#餐點恢復供應後可重新選購` | badge、cart total |
| `ui/ui-plan.md` | 顧客售完標示 | `ui-plan:§畫面與流程→顧客售完標示`; `prototype:index.html` | customer presentation |

- [x] T027 [US3] [BDD:RED] 接通 Example「菜單中的售完餐點清楚標示且無法選購」與 Cart 不可用呈現 ← `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#餐點售完後禁止新增至購物車與建立訂單`; `feature:specs/truth/features/frontend/顧客菜單/售完狀態.feature#菜單中的售完餐點清楚標示且無法選購`; `spec:FR-007`; `spec:FR-013`; `ui-plan:§畫面與流程→顧客售完標示`
  完成條件：Example 因售完餐點仍可選或 unavailable 仍計入總額而失敗
- [x] T028 [US3] [BDD:GREEN] 實作／維持 sold-out badge、不可用金額隱藏及 cart total exclusion ← `feature:specs/truth/features/frontend/顧客菜單/售完狀態.feature#菜單中的售完餐點清楚標示且無法選購`; `spec:FR-007`; `spec:FR-013`
- [x] T031a [US3] [BDD:RED] 接通 Example「餐點恢復供應後可重新選購」← `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#店家恢復供應後顧客可以再次購買`; `feature:specs/truth/features/frontend/顧客菜單/售完狀態.feature#餐點恢復供應後可重新選購`; `ui-plan:§畫面與流程→顧客售完標示`
  完成條件：Example 因恢復後 UI 仍鎖定選購而失敗
- [x] T032a [US3] [BDD:GREEN] 實作／維持恢復供應後顧客菜單可重新選購 ← `feature:specs/truth/features/frontend/顧客菜單/售完狀態.feature#餐點恢復供應後可重新選購`; `spec:FR-004`; `ui-plan:§畫面與流程→顧客售完標示`

**Checkpoint**：`售完狀態.feature` 前端 Example 全綠。

---

## Phase 9: `specs/truth/features/backend/授權/店家角色權限.feature`

**Goal**：server-side role matrix、401／403／503、client role spoof 無效。

**端點（對齊 plan.md）**：Backend merchant auth middleware.

**追溯**：acceptance「菜單管理人員與訂單管理人員…」「未授權人員…」「用戶端自稱管理員…」→ `spec:US4`; `spec:FR-009`–`FR-015`; `spec:BR-003`

**Read when executing this phase**：`specs/truth/features/backend/授權/店家角色權限.feature`、`specs/truth/features/backend/授權/dsl.md`（若存在）.

### 店家角色權限.feature 任務

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `traceability.md` | RBAC acceptance | `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#菜單管理人員與訂單管理人員只能執行各自職責` | role separation |
| `specs/truth/features/backend/授權/店家角色權限.feature` | role matrix Examples | `feature:specs/truth/features/backend/授權/店家角色權限.feature#orders-only 憑證允許訂單操作但拒絕菜單寫入`; `feature:specs/truth/features/backend/授權/店家角色權限.feature#menu-only 憑證允許建立菜單分類`; `feature:specs/truth/features/backend/授權/店家角色權限.feature#用戶端自稱管理員不能提升店家權限`; `feature:specs/truth/features/backend/授權/店家角色權限.feature#未提供有效憑證時店家菜單寫入遭拒` | 403/401 invariant |
| `specs/truth/contracts/http-api.yaml` | Merchant responses | `openapi:components.responses.MerchantForbidden`; `openapi:components.responses.MerchantUnauthorized`; `openapi:components.responses.MerchantNotConfigured` | authorization contract |

- [x] T034 [US4] [BDD:RED] 接通 Example「orders-only／menu-only／admin 憑證」矩陣與「用戶端自稱管理員不能提升店家權限」← `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#菜單管理人員與訂單管理人員只能執行各自職責`; `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#用戶端自稱管理員不能提升店家權限`; `feature:specs/truth/features/backend/授權/店家角色權限.feature#用戶端自稱管理員不能提升店家權限`; `spec:FR-009`; `spec:FR-015`; `spec:BR-003`
  完成條件：Example 因錯誤 role 仍可寫入 menu/order 或 spoof 生效而失敗
- [x] T035 [US4] [BDD:GREEN] 實作／維持 server-side role authorization matrix ← `feature:specs/truth/features/backend/授權/店家角色權限.feature#menu-only 憑證允許建立菜單分類`; `spec:FR-009`; `openapi:components.responses.MerchantForbidden`
- [x] T036 [US4] [BDD:RED] 接通 Example「未提供有效憑證時店家菜單寫入遭拒」← `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#未授權人員無法使用店家管理功能`; `feature:specs/truth/features/backend/授權/店家角色權限.feature#未提供有效憑證時店家菜單寫入遭拒`; `spec:FR-015`; `openapi:components.responses.MerchantUnauthorized`
  完成條件：Example 因 missing/invalid token 未回 401 而失敗
- [x] T037 [US4] [BDD:GREEN] 實作／維持 merchant credential validation ← `feature:specs/truth/features/backend/授權/店家角色權限.feature#未提供有效憑證時店家菜單寫入遭拒`; `research:店家 RBAC（設定層 token → roles）`; `openapi:components.responses.MerchantUnauthorized`
- [x] T038 [US4] [BDD:RED] 接通 merchant credentials 未設定時 503 Example（對齊 OpenAPI `MerchantNotConfigured`；Truth Feature 以整合契約表述）← `openapi:components.responses.MerchantNotConfigured`; `spec:FR-014`
  完成條件：Example 因無 credential 設定仍接受寫入而失敗
- [x] T039 [US4] [BDD:GREEN] 實作／維持 `MERCHANT_NOT_CONFIGURED` guard ← `openapi:components.responses.MerchantNotConfigured`

**Checkpoint**：`店家角色權限.feature` 後端 Example 全綠。

---

## Phase 10: `specs/truth/features/frontend/店家權限/角色隔離.feature`

**Goal**：403／未授權時 UI 顯示權限提示，權威狀態不變。

**端點（對齊 plan.md）**：Frontend merchant pages.

**追溯**：acceptance「菜單管理人員與訂單管理人員…」「未授權人員…」

**Read when executing this phase**：`specs/truth/features/frontend/店家權限/角色隔離.feature`、`ui/ui-plan.md`。

### 角色隔離.feature 任務

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `specs/truth/features/frontend/店家權限/角色隔離.feature` | 三個 Example | `feature:specs/truth/features/frontend/店家權限/角色隔離.feature#僅有訂單權限者無法儲存菜單`; `feature:specs/truth/features/frontend/店家權限/角色隔離.feature#僅有菜單權限者無法操作訂單`; `feature:specs/truth/features/frontend/店家權限/角色隔離.feature#無有效權限者無法讀取或修改店家資料` | 403 presentation |
| `ui/ui-plan.md` | RBAC 權限提示 | `ui-plan:§畫面與流程→RBAC 權限提示` | user-facing error |

- [x] T040 [US4] [BDD:RED] 接通 Example「僅有訂單權限者無法儲存菜單」「僅有菜單權限者無法操作訂單」「無有效權限者無法讀取或修改店家資料」← `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#菜單管理人員與訂單管理人員只能執行各自職責`; `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#未授權人員無法使用店家管理功能`; `feature:specs/truth/features/frontend/店家權限/角色隔離.feature#僅有訂單權限者無法儲存菜單`; `feature:specs/truth/features/frontend/店家權限/角色隔離.feature#無有效權限者無法讀取或修改店家資料`; `spec:BR-003`; `ui-plan:§畫面與流程→RBAC 權限提示`
  完成條件：Example 因 403 未顯示可理解提示而失敗
- [x] T041 [US4] [BDD:GREEN] 實作／維持 403 user-facing authorization message ← `feature:specs/truth/features/frontend/店家權限/角色隔離.feature#僅有訂單權限者無法儲存菜單`; `ui-plan:§畫面與流程→RBAC 權限提示`

**Checkpoint**：`角色隔離.feature` 前端 Example 全綠。

---

## Phase 11: `specs/truth/features/backend/錯誤處理/API錯誤回應.feature`

**Goal**：可預期 400/404/業務拒絕一致 ErrorBody；500  sanitized；前端顯示 server message。

**端點（對齊 plan.md）**：Backend error middleware；Frontend error display.

**追溯**：acceptance「可預期的拒絕…」「未預期錯誤…」→ `spec:US5`; `spec:FR-016`–`FR-017`; `spec:NFR-010`–`NFR-011`

**Read when executing this phase**：`specs/truth/features/backend/錯誤處理/API錯誤回應.feature`、`research.md`（集中式 HTTP 例外處理）、`plan.md`（TP-019 seam）.

### API錯誤回應.feature 任務

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `specs/truth/features/backend/錯誤處理/API錯誤回應.feature` | 預期／未預期 Example | `feature:specs/truth/features/backend/錯誤處理/API錯誤回應.feature#不符合資料要求的請求以結構化錯誤拒絕`; `feature:specs/truth/features/backend/錯誤處理/API錯誤回應.feature#未知操作回傳一致的查無錯誤`; `feature:specs/truth/features/backend/錯誤處理/API錯誤回應.feature#預期錯誤處理不依賴外部服務`; `feature:specs/truth/features/backend/錯誤處理/API錯誤回應.feature#未預期錯誤回覆通用訊息` | JSON error structure |
| `specs/truth/contracts/http-api.yaml` | ErrorBody／NotFound | `openapi:components.schemas.ErrorBody`; `openapi:components.responses.NotFound` | stable codes |
| `plan.md` | 未預期錯誤測試入口 | `plan:設計決策·未預期錯誤測試入口` | test-local Express app |

- [x] T042 [US5] [BDD:RED] 接通 Example「不符合資料要求的請求以結構化錯誤拒絕」← `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#可預期的拒絕以一致方式呈現`; `feature:specs/truth/features/backend/錯誤處理/API錯誤回應.feature#不符合資料要求的請求以結構化錯誤拒絕`; `spec:FR-016`; `spec:NFR-010`; `openapi:components.schemas.ErrorBody`
  完成條件：Example 因 invalid body 未回穩定 ErrorBody 或發生部分寫入而失敗
- [x] T043 [US5] [BDD:GREEN] 實作／維持 predictable error response shape ← `feature:specs/truth/features/backend/錯誤處理/API錯誤回應.feature#不符合資料要求的請求以結構化錯誤拒絕`; `research:集中式 HTTP 例外處理`
- [x] T044 [US5] [BDD:RED] 接通 Example「未知操作回傳一致的查無錯誤」與「未預期錯誤回覆通用訊息」← `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#可預期的拒絕以一致方式呈現`; `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#未預期錯誤不會暴露系統內部資訊`; `feature:specs/truth/features/backend/錯誤處理/API錯誤回應.feature#未知操作回傳一致的查無錯誤`; `feature:specs/truth/features/backend/錯誤處理/API錯誤回應.feature#未預期錯誤回覆通用訊息`; `spec:FR-017`; `spec:NFR-010`
  完成條件：Example 因 404 非 JSON、或 500 body 洩漏 stack/SQL/path 而失敗
- [x] T045 [US5] [BDD:GREEN] 實作／維持 JSON `NOT_FOUND` handler 與 sanitized 500 ← `feature:specs/truth/features/backend/錯誤處理/API錯誤回應.feature#未預期錯誤回覆通用訊息`; `research:集中式 HTTP 例外處理`
- [x] T046 [NON-TDD] 歷史紀錄：曾以 `ENABLE_HTTP_ERROR_TEST_ROUTES=1` 驗證 production test-only route；不作為現行驗收入口 ← `plan:設計決策·未預期錯誤測試入口`
- [x] T061 [US5] [NON-TDD] 重驗未預期錯誤 seam：`USE_MEMORY_DB=1 node --test src/__tests__/menu/http-error-handling.test.js`（test-local Express 組裝 production `notFoundHandler`／`errorMiddleware`；涵蓋 NFR-010／NFR-011）← `feature:specs/truth/features/backend/錯誤處理/API錯誤回應.feature#未預期錯誤回覆通用訊息`; `spec:NFR-010`; `spec:NFR-011`; `spec:SC-006`; `plan:設計決策·未預期錯誤測試入口`

#### 前端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `ui/ui-plan.md` | API 錯誤呈現 | `ui-plan:§畫面與流程→RBAC 權限提示` | customer/merchant error message |
| `openapi:components.schemas.ErrorBody` | message 欄位 | `openapi:components.schemas.ErrorBody` | 顯示 server message |

- [x] T047 [US5] [BDD:RED] 接通 acceptance「可預期的拒絕…」之 customer／merchant `error.message` display ← `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#可預期的拒絕以一致方式呈現`; `feature:specs/truth/features/backend/錯誤處理/API錯誤回應.feature#不符合資料要求的請求以結構化錯誤拒絕`; `spec:NFR-010`
  完成條件：Example 因 API 錯誤時 UI 空白或未顯示 server message 而失敗
- [x] T048 [US5] [BDD:GREEN] 實作／維持 frontend 顯示 server `error.message` ← `openapi:components.schemas.ErrorBody`; `spec:NFR-010`

**Checkpoint**：`API錯誤回應.feature` 後端 Example 全綠；TP-019 seam 重驗完成；前端錯誤呈現全綠。

---

## Phase 12: `specs/truth/features/backend/整合驗證/點餐主旅程.feature`

**Goal**：跨模組 HTTP journey、供應 revalidation、快照信任、CI／migration 可重複驗證。

**端點（對齊 plan.md）**：Integration harness（002–005 合併）.

**追溯**：acceptance「顧客完成點餐後店家完成出餐」「建單或付款請求提供不同金額…」「預設整合驗證可在 CI…」→ `spec:US6`; `spec:FR-018`–`FR-019`; `spec:SC-003`–`SC-007`

**Read when executing this phase**：`specs/truth/features/backend/整合驗證/點餐主旅程.feature`、`research.md`（整合測試與 smoke）、`testplan.md`（**歷史** TP-020–TP-028 對照）.

### 點餐主旅程.feature 任務

#### 後端

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `specs/truth/features/backend/整合驗證/點餐主旅程.feature` | journey Examples | `feature:specs/truth/features/backend/整合驗證/點餐主旅程.feature#顧客從菜單完成一筆訂單`; `feature:specs/truth/features/backend/整合驗證/點餐主旅程.feature#顧客完成訂單付款`; `feature:specs/truth/features/backend/整合驗證/點餐主旅程.feature#店家完成出餐中的訂單`; `feature:specs/truth/features/backend/整合驗證/點餐主旅程.feature#餐點售完後建立訂單遭拒`; `feature:specs/truth/features/backend/整合驗證/點餐主旅程.feature#顧客以不同總額建立訂單仍保存伺服器快照`; `feature:specs/truth/features/backend/整合驗證/點餐主旅程.feature#團隊執行預設整合驗證` | 端到端 invariant |
| `specs/truth/techstack.md` | 整合／migration 命令 | `techstack:整合測試`; `techstack:006 smoke（本機）` | default CI entry |
| `research.md` | integration harness | `research:整合測試與 smoke` | memory DB public test entry |

- [x] T049 [US6] [BDD:RED] 接通 acceptance「顧客完成點餐後店家完成出餐」對應之跨 Example HTTP integration（加購→建單→付款→接單→出餐→完成）← `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#顧客完成點餐後店家完成出餐`; `feature:specs/truth/features/backend/整合驗證/點餐主旅程.feature#顧客從菜單完成一筆訂單`; `feature:specs/truth/features/backend/整合驗證/點餐主旅程.feature#店家完成出餐中的訂單`; `spec:FR-018`; `spec:SC-003`
  完成條件：integration 因旅程任一步狀態或 snapshot 不一致而失敗
- [x] T050 [US6] [BDD:GREEN] 補齊／維持 full journey 所需缺漏行為 ← `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#顧客完成點餐後店家完成出餐`; `research:整合測試與 smoke`; `spec:SC-003`
- [x] T051 [US6] [NON-TDD] 完成 legacy 無單一 Truth Example 之 order Idempotency-Key replay 驗證（historical TP-021）；跨 003 contract，以整合測試表述 ← `003-openapi:createOrder`; `spec:FR-018`; `dbml:Table order_idempotency_keys`
- [x] T052 [US6] [NON-TDD] 確認 order idempotency replay 仍綠 ← `003-openapi:createOrder`; `spec:FR-007`
- [x] T053 [US6] [NON-TDD] 完成 legacy 無 Truth Example 之 payment key replay 驗證（historical TP-022）← `005-openapi:payOrder`; `spec:FR-012`; `dbml:Table payment_idempotency_keys`
- [x] T054 [US6] [NON-TDD] 確認 paid-only payment idempotency replay 仍綠 ← `005-openapi:payOrder`; `spec:SC-006`
- [x] T055 [US6] [NON-TDD] 完成 legacy PayOrderRequest 相容金額／items 欄位忽略（historical TP-023）；對齊 acceptance「建單或付款請求提供不同金額仍以訂單快照為準」← `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#建單或付款請求提供不同金額仍以訂單快照為準`; `005-openapi:components.schemas.PayOrderRequest`; `spec:FR-012`; `spec:SC-005`
- [x] T056 [US6] [BDD:RED] 接通 Example「餐點售完後建立訂單遭拒」之 integration 路徑 ← `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#餐點售完後禁止新增至購物車與建立訂單`; `feature:specs/truth/features/backend/整合驗證/點餐主旅程.feature#餐點售完後建立訂單遭拒`; `spec:FR-011`; `spec:SC-002`; `003-openapi:createOrder`
  完成條件：Example 因 stop item 後仍建單成功而失敗
- [x] T057 [US6] [BDD:GREEN] 實作／維持 order create revalidates latest persisted availability ← `feature:specs/truth/features/backend/整合驗證/點餐主旅程.feature#餐點售完後建立訂單遭拒`; `spec:BR-001`; `spec:FR-013`
- [x] T033d [US6] [BDD:RED] 接通 Example「顧客以不同總額建立訂單仍保存伺服器快照」← `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#建單或付款請求提供不同金額仍以訂單快照為準`; `feature:specs/truth/features/backend/整合驗證/點餐主旅程.feature#顧客以不同總額建立訂單仍保存伺服器快照`; `003-openapi:createOrder`; `spec:FR-012`
  完成條件：Example 因 client 總額改變 persisted snapshot 而失敗
- [x] T033e [US6] [BDD:GREEN] 實作／維持建單只採 server 計價 snapshot ← `feature:specs/truth/features/backend/整合驗證/點餐主旅程.feature#顧客以不同總額建立訂單仍保存伺服器快照`; `spec:BR-002`; `spec:SC-005`
- [x] T058 [US6] [NON-TDD] 執行 Example「團隊執行預設整合驗證」對應之 default backend CI suite 並記錄 exit code；屬命令驗證，不改產品行為 ← `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#預設整合驗證可在 CI 環境重複執行`; `feature:specs/truth/features/backend/整合驗證/點餐主旅程.feature#團隊執行預設整合驗證`; `spec:NFR-012`; `techstack:整合測試`
- [x] T059 [US6] [NON-TDD] 執行 migration smoke（historical TP-028）：`npm run verify:migrations` 後 `npm run smoke:mssql:028`；未設定 `MSSQL_*` 時 skip exit 0 ← `feature:specs/truth/features/backend/整合驗證/點餐主旅程.feature#團隊執行預設整合驗證`; `spec:SC-007`; `techstack:006 smoke（本機）`

**Checkpoint**：`點餐主旅程.feature` 可驗收 Example 與整合 harness 全綠；CI／migration 入口已記錄。

---

## Phase 13: NFR 重構

**Purpose**：檢視 **NFR-010–NFR-012** 是否在 Feature Phase 後仍不足；必要時列出跨 Feature 重構。

> 針對所有 User Story 的 NFR 去思考，是否有必要多列一些任務，來重構既有程式，達到 NFR

**Read when executing this phase**：`spec.md`（NFR-010–NFR-012、SC-002–SC-007）、`traceability.md`（Coverage Summary）、`scenario-index.md`。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `spec.md` | US5／US6 與全域 NFR | `spec:NFR-010`; `spec:NFR-011`; `spec:NFR-012`; `spec:SC-005`; `spec:SC-006`; `spec:SC-007` | 可衡量成果 |
| `traceability.md` | 錯誤／整合 acceptance | `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#可預期的拒絕以一致方式呈現`; `acceptance:features/acceptance/進階能力與端到端驗證總驗收旅程.feature#預設整合驗證可在 CI 環境重複執行` | NFR 已由 Feature 覆蓋 |

- [x] T060 [NON-TDD] 核對：NFR-010 已由 Phase 11 `API錯誤回應.feature` 與 T042–T048／T061 覆蓋；NFR-011 由集中式 error middleware 與「預期錯誤不依賴外部服務」Example 覆蓋；NFR-012 由 Phase 12 T058／T059 覆蓋；無額外跨 Feature NFR 重構任務 ← `spec:NFR-010`; `spec:NFR-011`; `spec:NFR-012`; `feature:specs/truth/features/backend/錯誤處理/API錯誤回應.feature#預期錯誤處理不依賴外部服務`; `traceability.md` §Coverage Summary

**Checkpoint**：已檢視 NFR-010–NFR-012／SC；無額外 NFR 任務。

---

## Dependencies & Execution Order

- Phase 3–4（menu CRUD）為 Phase 5–8（供應）前置；Phase 9–10（RBAC）可與 menu 並行但整合 Phase 12 需全部就緒。
- 每個 `[BDD:RED]` 對應至少一個 Truth Example 或 acceptance Journey 子断言；`[NON-TDD]` 用於無單一 Truth Example 之契約、冪等、CI／migration 或 historical testplan 對照。
- 同一 Example 的 RED→GREEN 由任務敘述順序判定；不可集中所有 RED 後再 GREEN。
- `[x]` 為回溯完成狀態；BDD 標籤不證明歷史時序。

## Phase 摘要

| Phase | Truth Feature | 主要 acceptance 旅程（scenario-index） |
| --- | --- | --- |
| 1–2 | — | 環境與 foundation |
| 2.5 | 多模組 harness | 全體 15 旅程可載入 |
| 3 | `backend/菜單/店家維護菜單.feature` | 情境 1–4 |
| 4 | `frontend/店家菜單/菜單維護.feature` | 情境 1–3 |
| 5 | `backend/菜單/供應狀態.feature` | 情境 5–7 |
| 6 | `backend/供應驗證/顧客購物車與訂單.feature` | 情境 5–6、14（cart 金額） |
| 7 | `frontend/店家菜單/供應狀態.feature` | 情境 5–7 |
| 8 | `frontend/顧客菜單/售完狀態.feature` | 情境 5–6 |
| 9 | `backend/授權/店家角色權限.feature` | 情境 8–10 |
| 10 | `frontend/店家權限/角色隔離.feature` | 情境 8–9 |
| 11 | `backend/錯誤處理/API錯誤回應.feature` | 情境 11–12 |
| 12 | `backend/整合驗證/點餐主旅程.feature` | 情境 13–15 |
| 13 | NFR 重構 | NFR-010–012 |

## Format Validation

- Phase 1 必讀含 **`truth-delta.md` 全文**；Phase 3+ 標題為 **`specs/truth/features/…`**；`feature:`／`dsl:` 錨點使用 `specs/truth/features/…`。
- 每個 `####` 小節（含 Setup／Foundational）必有 **必讀對照** 四欄表格。
- 每個 `- [ ] Tnnn` 行尾必有 **`←`** 與至少一個機器錨點；對照表每列至少被一個任務 `←` 引用。
- Phase 3 起以 Truth 介面 Feature 檔為單位；行為任務帶 `[USn]`；依端點分前端／後端小節。
- 全部 Feature File Phase 之後有 **NFR 重構** Phase；Checkpoint 註明覆蓋狀態。
- 同一 Example 的 RED→GREEN 順序可由 T 編號與 Phase 內順序判定。
- 每個納入範圍的 Feature Example 至少有一項 RED 與 GREEN（或 `[NON-TDD]` 並說明無單一 Example 原因）。
- BDD 行為 task 引用 `acceptance:`、`feature:`、`dsl:` 與 `spec:` 錨點；**不以 `testplan:TP-*` 驅動切片**。
- 同一份 tasks 不混用 BDD 與 legacy `[TDD:*]` 行為標籤。
- 每個 RED 任務下方有「完成條件：…」；GREEN 不需此行。
- 純文件／環境／walkthrough／CI 標 `[NON-TDD]` 並寫明原因。

Constitution self-check: pass.
