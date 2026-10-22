# 任務：點餐系統第六迭代－進階功能與系統驗證

**輸入**：設計文件位於 `specs/006-advanced-features-system-verification/`

**測試基線**：`testplan.md`（TP-001–TP-015）；任務依測試計畫切片，不另行推導測試範圍。

**Spec 套件索引**（按需 READ）：

| 文件 | 用途 |
|---|---|
| `spec.md` | User Story、驗收、FR／NFR／BR／SC |
| `testplan.md` | TP 案例、測試入口、fixture、Assert |
| `research.md`、`techstack.md` | 技術決策、工具及版本 |
| `plan.md` | 系統邊界、端點盤點與設計決策 |
| `ui-plan.md`、`prototype/` | 前端流程與測試入口 |
| `data-model.dbml` | 資料責任與 schema |
| `contracts/http-api.yaml` | 006 API 契約；004／005 契約依 plan 引用 |

**任務規則**：每個行為任務只標一個 TDD 步驟。`[TDD:RED]` 只建立一個 TP 案例的測試；`[TDD:GREEN]` 只實作讓該紅燈轉綠的最小行為；`[TDD:REFACTOR]` 只整理已綠行為。未列 refactor 表示該切片不需重構。純文件／環境準備標 `[NON-TDD]` 並說明原因。每個 TP 案例至少被一個任務引用 `testplan:TP-xxx`。

## Phase 1: Setup

**Purpose**：確認研究決策與測試入口；此處僅為不改變產品行為的準備工作。

**Read when executing this phase**：`research.md`、`techstack.md`、`plan.md`、`testplan.md`。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | 執行命令及環境 | `testplan:TP-015` | 預設 CI／測試入口 |
| `techstack.md` | backend/frontend test commands | `techstack:整合測試` | 工作目錄與 runtime |

- [ ] T001 [NON-TDD] 確認 Node.js、測試命令、memory DB harness 與環境設定符合 testplan；記錄差異，不修改產品行為 ← `testplan:TP-015`; `techstack:整合測試`; `plan:端點盤點`

---

## Phase 2: Foundational

**Purpose**：準備獨立測試資料與既有測試 harness；不包含尚未有 RED 案例的產品行為實作。

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | 具名 Fixture 與隔離方式 | `testplan:TP-013`; `testplan:TP-015` | memory DB reset 與 migration fixture |
| `plan.md` | 測試環境與資料端點 | `plan:端點盤點` | 使用已確認 harness |

- [ ] T002 [NON-TDD] 建立 fixture reset／隔離支援；不得新增未由 TP 案例要求的產品行為 ← `testplan:TP-013`; `testplan:TP-015`; `plan:端點盤點`

**Checkpoint**：fixture 可獨立建立與清理。

---

## Phase 3: User Story 1－店家維護分類與餐點（P1）

**Goal**：menu/admin 可建立分類與餐點，驗證輸入及分類刪除限制。

### 測試與實作任務

#### Backend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | US1 TP-001–TP-003 | `testplan:TP-001`; `testplan:TP-002`; `testplan:TP-003` | 建立、輸入驗證、分類限制 |
| `spec.md` | US1、FR-001–FR-003 | `spec:US1`; `spec:FR-001`; `spec:FR-002`; `spec:FR-003` | 菜單規則 |
| `contracts/http-api.yaml` | Merchant category/menu operations | `openapi:createMerchantCategory`; `openapi:createMerchantMenuItem`; `openapi:deleteMerchantCategory` | API response 與錯誤契約 |

- [ ] T003 [US1] [TDD:RED] 為 TP-001 建立分類／餐點寫入與公開菜單可讀的測試 ← `testplan:TP-001`; `spec:US1`; `openapi:createMerchantCategory`; `openapi:createMerchantMenuItem`; `openapi:listMenuItems`
  完成條件：測試因分類與餐點尚未建立、公開菜單缺少對應欄位而失敗
- [ ] T004 [US1] [TDD:GREEN] 實作 TP-001 所需的分類／餐點建立行為 ← `testplan:TP-001`; `spec:FR-001`; `spec:FR-002`; `openapi:createMerchantCategory`; `openapi:createMerchantMenuItem`
- [ ] T005 [US1] [TDD:RED] 為 TP-002 建立非法價格時拒絕且不部分寫入的測試 ← `testplan:TP-002`; `spec:US1·情境4`; `openapi:createMerchantMenuItem`
  完成條件：測試因價格格式驗證尚未實作、請求仍回 2xx 或部分寫入而失敗
- [ ] T006 [US1] [TDD:GREEN] 實作 TP-002 所需的 payload 驗證與原子性 ← `testplan:TP-002`; `spec:FR-002`; `openapi:createMerchantMenuItem`
- [ ] T007 [US1] [TDD:RED] 為 TP-003 建立刪除使用中分類回 409 的測試 ← `testplan:TP-003`; `spec:FR-001`; `openapi:deleteMerchantCategory`
  完成條件：測試因刪除使用中分類未被拒絕（未回 409 `CATEGORY_IN_USE`）而失敗
- [ ] T008 [US1] [TDD:GREEN] 實作 TP-003 所需的 `CATEGORY_IN_USE` 拒絕行為 ← `testplan:TP-003`; `spec:FR-001`; `openapi:deleteMerchantCategory`
- [ ] T009 [US1] [TDD:REFACTOR] 在 TP-001–TP-003 測試保持綠燈下整理菜單寫入程式；不得改變契約 ← `testplan:TP-001`; `testplan:TP-002`; `testplan:TP-003`; `openapi:createMerchantMenuItem`

---

## Phase 4: User Story 2－管理餐點與規格供應狀態（P1）

**Goal**：店家切換供應狀態後，菜單與加購驗證使用最新持久化狀態。

#### Backend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | US2 TP-004–TP-005 | `testplan:TP-004`; `testplan:TP-005` | 停供餐點／選項 |
| `spec.md` | US2、FR-004–FR-006、FR-011 | `spec:US2`; `spec:FR-004`; `spec:FR-005`; `spec:FR-006`; `spec:FR-011` | 供應狀態權威 |
| `contracts/http-api.yaml` | Availability operations | `openapi:patchMenuItemAvailability`; `openapi:patchMenuOptionAvailability` | PATCH 行為 |

- [ ] T010 [US2] [TDD:RED] 為 TP-004 建立餐點停供後 API／公開菜單反映狀態的測試 ← `testplan:TP-004`; `spec:US2`; `openapi:patchMenuItemAvailability`; `openapi:listMenuItems`
  完成條件：測試因停供狀態未被持久化、公開菜單仍顯示可供應而失敗
- [ ] T011 [US2] [TDD:GREEN] 實作 TP-004 的餐點停供與恢復供應行為 ← `testplan:TP-004`; `spec:FR-004`; `spec:FR-006`; `openapi:patchMenuItemAvailability`
- [ ] T012 [US2] [TDD:RED] 為 TP-005 建立停供選項不能加入 cart 的測試 ← `testplan:TP-005`; `spec:FR-005`; `spec:FR-011`; `openapi:patchMenuOptionAvailability`; `002-openapi:addCartItem`
  完成條件：測試因停供選項仍可被加入購物車而失敗
- [ ] T013 [US2] [TDD:GREEN] 實作 TP-005 的選項供應狀態驗證 ← `testplan:TP-005`; `spec:FR-005`; `spec:FR-011`; `openapi:patchMenuOptionAvailability`; `002-openapi:addCartItem`

**Checkpoint**：TP-004、TP-005 通過；若需整理才新增獨立 REFACTOR 任務。

---

## Phase 5: User Story 3－阻擋顧客無效下單（P1，精簡）

**Story binding**：`testplan:TP-006`–`testplan:TP-008`；只保留各案例的單步任務對照。

#### Frontend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | US3 cart 不可用項目呈現 | `testplan:TP-006` | UI 狀態與總額 |
| `ui-plan.md` | 顧客售完標示 | `ui-plan:§顧客售完標示` | 項目呈現 |

- [ ] T014 [US3] [TDD:RED] 建立 TP-006 購物車停供項目呈現與金額測試 ← `testplan:TP-006`; `spec:FR-007`; `ui-plan:§顧客售完標示`
  完成條件：測試因購物車未呈現停供項目與正確總額而失敗
- [ ] T015 [US3] [TDD:GREEN] 實作 TP-006 購物車不可用項目呈現 ← `testplan:TP-006`; `spec:FR-013`; `ui-plan:§顧客售完標示`

#### Backend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | US3 建單拒絕與金額權威 | `testplan:TP-007`; `testplan:TP-008` | API outcome 與持久化 |
| `contracts/http-api.yaml` | create order | `003-openapi:createOrder` | 供應驗證與計價 |

- [ ] T016 [US3] [TDD:RED] 建立 TP-007 停供 cart 建單拒絕且保留 cart 的測試 ← `testplan:TP-007`; `spec:FR-008`; `003-openapi:createOrder`
  完成條件：測試因建單未驗證供應狀態、仍接受停供項目而失敗
- [ ] T017 [US3] [TDD:GREEN] 實作 TP-007 建單前供應狀態驗證 ← `testplan:TP-007`; `spec:FR-008`; `spec:FR-013`; `003-openapi:createOrder`
- [ ] T018 [US3] [TDD:RED] 建立 TP-008 偽造金額／供應欄位不影響持久化的測試 ← `testplan:TP-008`; `spec:FR-012`; `spec:SC-005`; `003-openapi:createOrder`
  完成條件：測試因伺服器未以自身權威金額／供應狀態覆寫用戶端偽造欄位而失敗
- [ ] T019 [US3] [TDD:GREEN] 實作 TP-008 伺服器端金額與供應狀態權威 ← `testplan:TP-008`; `spec:FR-012`; `spec:BR-001`; `003-openapi:createOrder`

---

## Phase 6: User Story 4－店家 API 角色控管（P1，精簡）

#### Backend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | US4 role matrix 與 credential errors | `testplan:TP-009`; `testplan:TP-010` | 角色及認證回應 |
| `contracts/http-api.yaml` | merchant authorization errors | `openapi:components.responses.MerchantForbidden`; `openapi:components.responses.MerchantUnauthorized` | 錯誤契約 |

- [ ] T020 [US4] [TDD:RED] 建立 TP-009 角色允許／拒絕矩陣測試 ← `testplan:TP-009`; `spec:FR-009`; `spec:FR-010`; `spec:FR-014`; `openapi:components.responses.MerchantForbidden`
  完成條件：測試因角色授權矩陣尚未實作、未依角色正確回應 403／200 而失敗
- [ ] T021 [US4] [TDD:GREEN] 實作 TP-009 menu／orders／admin 授權矩陣 ← `testplan:TP-009`; `spec:BR-003`; `openapi:components.responses.MerchantForbidden`
- [ ] T022 [US4] [TDD:RED] 建立 TP-010 未授權／未配置憑證回應測試 ← `testplan:TP-010`; `spec:US4·情境4`; `openapi:components.responses.MerchantUnauthorized`; `openapi:components.responses.MerchantNotConfigured`
  完成條件：測試因缺少／未配置憑證時未回 401／503 而失敗
- [ ] T023 [US4] [TDD:GREEN] 實作 TP-010 的 401／503 回應行為 ← `testplan:TP-010`; `spec:FR-015`; `openapi:components.responses.MerchantUnauthorized`; `openapi:components.responses.MerchantNotConfigured`

---

## Phase 7: User Story 5－一致錯誤回應（P1，精簡）

#### Backend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | US5 404／500 與 NFR 驗證 | `testplan:TP-011`; `testplan:TP-012` | 錯誤格式、安全與遠端呼叫 |
| `research.md` | 集中式 HTTP 例外處理 | `research:集中式 HTTP 例外處理` | middleware 行為 |

- [ ] T024 [US5] [TDD:RED] 建立 TP-011 未知 API 路徑回 JSON 404 的測試 ← `testplan:TP-011`; `spec:FR-017`; `spec:NFR-010`; `openapi:components.responses.NotFound`
  完成條件：測試因未知路徑未回 JSON 格式 404 而失敗
- [ ] T025 [US5] [TDD:GREEN] 實作 TP-011 JSON 404 handler ← `testplan:TP-011`; `spec:FR-017`; `openapi:components.responses.NotFound`
- [ ] T026 [US5] [TDD:RED] 建立 TP-012 500 body 不洩漏且無額外遠端呼叫的測試 ← `testplan:TP-012`; `spec:FR-016`; `spec:NFR-010`; `spec:NFR-011`
  完成條件：測試因 500 回應仍洩漏內部細節，或集中錯誤處理觸發額外遠端呼叫而失敗
- [ ] T027 [US5] [TDD:GREEN] 實作 TP-012 集中錯誤處理與安全日誌 ← `testplan:TP-012`; `spec:FR-016`; `spec:NFR-010`; `spec:NFR-011`; `research:集中式 HTTP 例外處理`

---

## Phase 8: User Story 6－整合與系統驗證（P1，精簡）

#### Backend

**必讀對照**

| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |
|---|---|---|---|
| `testplan.md` | US6 lifecycle、idempotency、CI | `testplan:TP-013`; `testplan:TP-014`; `testplan:TP-015` | 整合與預設驗證 |
| `research.md` | 整合測試與 smoke | `research:整合測試與 smoke` | 測試環境 |

- [ ] T028 [US6] [TDD:RED] 建立 TP-013 顧客至店家完成訂單的整合測試 ← `testplan:TP-013`; `spec:FR-018`; `spec:FR-019`; `004-openapi:completeMerchantOrder`
  完成條件：測試因跨端點訂單生命週期尚未串接完整而失敗
- [ ] T029 [US6] [TDD:GREEN] 實作 TP-013 整合流程所需的缺漏行為 ← `testplan:TP-013`; `spec:SC-003`; `research:整合測試與 smoke`
- [ ] T030 [US6] [TDD:RED] 建立 TP-014 冪等重送與竄改金額整合測試 ← `testplan:TP-014`; `spec:SC-005`; `003-openapi:createOrder`; `005-openapi:payOrder`
  完成條件：測試因重送相同 idempotency key 仍新增訂單，或竄改金額未被伺服器覆寫而失敗
- [ ] T031 [US6] [TDD:GREEN] 實作 TP-014 所需的冪等與伺服器計價行為 ← `testplan:TP-014`; `spec:FR-012`; `spec:SC-005`
- [ ] T032 [US6] [NON-TDD] 執行 TP-015 指定的預設 CI／migration 命令並記錄結果；這是環境驗證，不改變產品行為 ← `testplan:TP-015`; `spec:NFR-012`; `spec:SC-007`; `techstack:整合測試`

---

## Dependencies & Execution Order

- 每個 `[TDD:RED]` 必須先單獨通過預期紅燈驗證，對應的 `[TDD:GREEN]` 才可開始；GREEN 只能通過該案例所需的最小行為。
- `[TDD:REFACTOR]` 僅能在對應案例全綠後執行；未需要重構可省略。
- 依 T 編號與前置依賴執行；`[NON-TDD]` 僅限無產品行為變更的準備、文件或環境任務，必須附原因。

## Format Validation

- 每個 User Story 依 testplan 分組；所有 testplan TP ID 至少出現在一項 task 的 `testplan:TP-xxx` 錨點中。
- 每個行為任務恰有一個 `[TDD:RED]`、`[TDD:GREEN]` 或 `[TDD:REFACTOR]` 標籤；多步驟工作必須拆成多項任務。
- 每個 `[TDD:RED]` 任務下方皆有「完成條件：…」一行，寫出依 TP 案例 Assert 推導的預期紅燈原因。
- 無 TDD 標籤的非行為任務須標 `[NON-TDD]` 並說明原因；不得將產品行為實作標為 NON-TDD。
- `####` 小節須有必讀對照表，且每列至少由一個任務的 `←` 錨點引用；各 T 任務至少引用一個機器錨點。
- 後端 HTTP 任務引用 `openapi:`；持久化任務引用 `dbml:`；前端任務引用 `ui-plan:`／`prototype:`；spec 追溯使用 `spec:`。
- RED task 對應 testplan 案例的測試入口；GREEN／REFACTOR task 引用同一 TP 案例，不得改寫案例意圖。

Constitution self-check: pass
