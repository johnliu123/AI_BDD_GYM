# Acceptance to Interface Traceability

## Sources

- Acceptance Feature root: `features/acceptance/`
- Journey 錨點：`Example:` 標題 MUST 與本 matrix「Acceptance Example」欄逐字一致；**Journey 內 Example 標題 MUST 唯一**（一列 acceptance Example 對一個 Journey Example）
- System analysis: `plan.md`
- Requirement source: `spec.md`

## 介面情境摘要（人 Review）

> 覆蓋完整性以下方 Coverage Matrix 與機械稽核為準；人 Review 本節即可。

### backend; frontend / 菜單; 店家菜單

| 驗收情境 | 前端驗什麼 | 來源 |
| --- | --- | --- |
| 店家建立分類與餐點後顧客可在菜單中看到 | 分類與餐點保存，顧客菜單可讀到正確資料 | AC: 店家建立分類與餐點後顧客可在菜單中看到 |
| 店家修改餐點資料不會改寫既有訂單 | 顧客菜單反映新值，既有訂單仍保留建立時快照 | AC: 店家修改餐點資料不會改寫既有訂單 |
| 店家維護餐點規格群組與選項 | 店家保存規格群組與選項名稱、加價、供應狀態，顧客菜單反映變更 | AC: 店家維護餐點規格群組與選項 |
| 店家停止供應單一規格選項 | 停用單一規格選項只影響該選項；其他有效選項仍可用 | AC: 店家停止供應單一規格選項 |

### backend / 菜單

| 驗收情境 | 後端驗什麼 | 來源 |
| --- | --- | --- |
| 店家刪除仍有餐點使用的分類 | 引用中分類刪除遭拒且分類與餐點關聯不變 | AC: 店家刪除仍有餐點使用的分類 |

### backend; frontend / 菜單; 供應驗證; 店家菜單; 顧客菜單

| 驗收情境 | 前端驗什麼 | 來源 |
| --- | --- | --- |
| 餐點售完後禁止新增至購物車與建立訂單 | 停供狀態可見；既有 cart item 不計價；新加購與建單拒絕且不破壞 cart | AC: 餐點售完後禁止新增至購物車與建立訂單 |
| 店家恢復供應後顧客可以再次購買 | 恢復後重新讀取可供應，顧客可選擇有效規格並購買 | AC: 店家恢復供應後顧客可以再次購買 |

### backend; frontend / 授權; 店家權限

| 驗收情境 | 前端驗什麼 | 來源 |
| --- | --- | --- |
| 菜單管理人員與訂單管理人員只能執行各自職責 | orders/menu/admin 權限依職責允許或拒絕相應操作，拒絕不改變權威狀態 | AC: 菜單管理人員與訂單管理人員只能執行各自職責 |
| 未授權人員無法使用店家管理功能 | 無有效權限時拒絕存取且菜單與訂單資料不變 | AC: 未授權人員無法使用店家管理功能 |

### backend / 授權

| 驗收情境 | 後端驗什麼 | 來源 |
| --- | --- | --- |
| 用戶端自稱管理員不能提升店家權限 | 用戶端自報管理角色不能提高伺服器依憑證設定判定的權限 | AC: 用戶端自稱管理員不能提升店家權限 |

### backend / 錯誤處理

| 驗收情境 | 後端驗什麼 | 來源 |
| --- | --- | --- |
| 可預期的拒絕以一致方式呈現 | 業務拒絕有穩定錯誤碼與中文訊息、無部分寫入，且不呼叫外部服務 | AC: 可預期的拒絕以一致方式呈現 |
| 未預期錯誤不會暴露系統內部資訊 | 500 通用訊息、body 不洩漏 stack/SQL/path，細節只記錄於服務端 | AC: 未預期錯誤不會暴露系統內部資訊 |

### backend / 整合驗證

| 驗收情境 | 後端驗什麼 | 來源 |
| --- | --- | --- |
| 顧客完成點餐後店家完成出餐 | 加購、建單、付款、店家接單與出餐後狀態一致，金額維持建立時快照 | AC: 顧客完成點餐後店家完成出餐 |
| 建單或付款請求提供不同金額仍以訂單快照為準 | 請求提供不同金額時仍只保存伺服器建立快照 | AC: 建單或付款請求提供不同金額仍以訂單快照為準 |
| 預設整合驗證可在 CI 環境重複執行 | 預設 CI 使用既定入口執行整合驗證並回報結果 | AC: 預設整合驗證可在 CI 環境重複執行 |

## Coverage Matrix（AI 機械稽核 — 不要求使用者逐行 Review）

| Acceptance Feature | Acceptance Rule | Acceptance Example | Spec Requirement IDs | Acceptance assertion / invariant | Status | Interface | Module | Derived Feature | Derived Rule / Example | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `features/acceptance/進階能力與端到端驗證總驗收旅程.feature` | 店家可以維護分類、餐點與規格 | 店家建立分類與餐點後顧客可在菜單中看到 | `US1`; `FR-001`; `FR-002`; `SC-001` | 分類與餐點保存，顧客菜單可讀到正確資料 | assigned | backend; frontend | 菜單; 店家菜單 | `backend/菜單/店家維護菜單.feature`; `frontend/店家菜單/菜單維護.feature` | 建立分類 / 建立餐點 / 店家建立分類與餐點 | — |
| `features/acceptance/進階能力與端到端驗證總驗收旅程.feature` | 店家可以維護分類、餐點與規格 | 店家修改餐點資料不會改寫既有訂單 | `US1`; `FR-012`; `BR-002` | 顧客菜單反映新值，既有訂單仍保留建立時快照 | assigned | backend; frontend | 菜單; 店家菜單 | `backend/菜單/店家維護菜單.feature`; `frontend/店家菜單/菜單維護.feature` | 店家更新餐點名稱或價格 / 店家更新餐點資料後既有訂單快照不變 | — |
| `features/acceptance/進階能力與端到端驗證總驗收旅程.feature` | 店家可以維護分類、餐點與規格 | 店家維護餐點規格群組與選項 | `US1`; `FR-003` | 店家保存規格群組與選項名稱、加價、供應狀態，顧客菜單反映變更 | assigned | backend; frontend | 菜單; 店家菜單 | `backend/菜單/店家維護菜單.feature`; `frontend/店家菜單/菜單維護.feature` | 店家更新餐點規格群組與選項 / 店家儲存規格群組與選項 | Option CRUD 依 006 OpenAPI 的 menu item option_groups 請求欄位。 |
| `features/acceptance/進階能力與端到端驗證總驗收旅程.feature` | 店家可以維護分類、餐點與規格 | 店家刪除仍有餐點使用的分類 | `US1`; `FR-001` | 引用中分類刪除遭拒且分類與餐點關聯不變 | assigned | backend | 菜單 | `../../truth/features/backend/菜單/店家維護菜單.feature` | 店家可以建立分類與餐點資料 / 店家刪除仍被餐點使用的分類遭拒 | 回 409 `CATEGORY_IN_USE`；不 cascade 刪除或自動移轉。 |
| `features/acceptance/進階能力與端到端驗證總驗收旅程.feature` | 店家維護供應狀態後顧客流程立即遵循最新狀態 | 餐點售完後禁止新增至購物車與建立訂單 | `US2`; `US3`; `FR-004`; `FR-006`; `FR-007`; `FR-008`; `FR-011`; `FR-013`; `BR-001`; `SC-002` | 停供狀態可見；既有 cart item 不計價；新加購與建單拒絕且不破壞 cart | assigned | backend; frontend | 菜單; 供應驗證; 店家菜單; 顧客菜單 | `backend/菜單/供應狀態.feature`; `backend/供應驗證/顧客購物車與訂單.feature`; `frontend/店家菜單/供應狀態.feature`; `frontend/顧客菜單/售完狀態.feature` | 停供 / 加購拒絕 / 建單拒絕 / 售完標示 | Acceptance's combined journey is split by interface and single operation. Option-level stop is not included; see `FR-005`. |
| `features/acceptance/進階能力與端到端驗證總驗收旅程.feature` | 店家維護供應狀態後顧客流程立即遵循最新狀態 | 店家恢復供應後顧客可以再次購買 | `US2`; `FR-004`; `FR-006`; `FR-011`; `BR-001`; `SC-002` | 恢復後重新讀取可供應，顧客可選擇有效規格並購買 | assigned | backend; frontend | 菜單; 供應驗證; 店家菜單; 顧客菜單 | `backend/菜單/供應狀態.feature`; `backend/供應驗證/顧客購物車與訂單.feature`; `frontend/店家菜單/供應狀態.feature`; `frontend/顧客菜單/售完狀態.feature` | 恢復供應 / 恢復後建單 / 恢復後重新選購 | — |
| `features/acceptance/進階能力與端到端驗證總驗收旅程.feature` | 店家維護供應狀態後顧客流程立即遵循最新狀態 | 店家停止供應單一規格選項 | `US2`; `FR-005`; `FR-011`; `BR-001`; `SC-002` | 停用單一規格選項只影響該選項；其他有效選項仍可用 | assigned | backend; frontend | 菜單; 店家菜單 | `backend/菜單/供應狀態.feature`; `frontend/店家菜單/供應狀態.feature` | 店家停止供應單一規格選項 / 店家將單一規格選項標記為停止供應 | Option availability 由已分析 PATCH operation 更新。 |
| `features/acceptance/進階能力與端到端驗證總驗收旅程.feature` | 店家權限依職責隔離 | 菜單管理人員與訂單管理人員只能執行各自職責 | `US4`; `FR-009`; `FR-010`; `FR-014`; `BR-003`; `SC-004` | orders/menu/admin 權限依職責允許或拒絕相應操作，拒絕不改變權威狀態 | assigned | backend; frontend | 授權; 店家權限 | `backend/授權/店家角色權限.feature`; `frontend/店家權限/角色隔離.feature` | orders/menu/admin 單一操作案例 / 角色隔離提示 | The acceptance covers role separation; client-supplied role spoof rejection in `FR-015` is not explicit. |
| `features/acceptance/進階能力與端到端驗證總驗收旅程.feature` | 店家權限依職責隔離 | 未授權人員無法使用店家管理功能 | `US4`; `FR-010`; `FR-014`; `SC-004` | 無有效權限時拒絕存取且菜單與訂單資料不變 | assigned | backend; frontend | 授權; 店家權限 | `backend/授權/店家角色權限.feature`; `frontend/店家權限/角色隔離.feature` | 無有效憑證菜單寫入遭拒 / 無有效權限者無法讀改店家資料 | Acceptance does not specify role spoof behavior (`FR-015`). |
| `features/acceptance/進階能力與端到端驗證總驗收旅程.feature` | 店家權限依職責隔離 | 用戶端自稱管理員不能提升店家權限 | `US4`; `FR-015`; `BR-003`; `SC-004` | 用戶端自報管理角色不能提高伺服器依憑證設定判定的權限 | assigned | backend | 授權 | `backend/授權/店家角色權限.feature` | 店家權限依伺服器憑證設定判定 / 用戶端自稱管理員不能提升店家權限 | Role claims are never trusted over server credential mapping. |
| `features/acceptance/進階能力與端到端驗證總驗收旅程.feature` | API 錯誤一致且不洩漏內部細節 | 可預期的拒絕以一致方式呈現 | `US5`; `FR-016`; `FR-017`; `NFR-010`; `NFR-011`; `BR-004`; `SC-006` | 業務拒絕有穩定錯誤碼與中文訊息、無部分寫入，且不呼叫外部服務 | assigned | backend | 錯誤處理 | `backend/錯誤處理/API錯誤回應.feature` | 請求驗證錯誤 / 未知操作 / 業務拒絕 / 預期錯誤不依賴外部服務 | — |
| `features/acceptance/進階能力與端到端驗證總驗收旅程.feature` | API 錯誤一致且不洩漏內部細節 | 未預期錯誤不會暴露系統內部資訊 | `US5`; `FR-016`; `NFR-010`; `BR-004`; `SC-006` | 500 通用訊息、body 不洩漏 stack/SQL/path，細節只記錄於服務端 | assigned | backend | 錯誤處理 | `backend/錯誤處理/API錯誤回應.feature` | 未預期錯誤回覆通用訊息 | TP-019 使用 plan 核准的 test-local Express app seam，不使用 production test route。 |
| `features/acceptance/進階能力與端到端驗證總驗收旅程.feature` | 完整點餐旅程的結果一致 | 顧客完成點餐後店家完成出餐 | `US6`; `FR-018`; `FR-019`; `SC-003`; `SC-007`; `BR-001`; `BR-002`; `BR-003` | 加購、建單、付款、店家接單與出餐後狀態一致，金額維持建立時快照 | assigned | backend | 整合驗證 | `backend/整合驗證/點餐主旅程.feature` | 顧客加購 / 建單 / 付款 / 店家接單 / 出餐 / 完成 | Acceptance journey is represented by separate atomic interface cases. `NFR-012` default-CI execution requirement is not an acceptance assertion. |
| `features/acceptance/進階能力與端到端驗證總驗收旅程.feature` | 完整點餐旅程的結果一致 | 建單或付款請求提供不同金額仍以訂單快照為準 | `US6`; `FR-012`; `BR-002`; `SC-005` | 請求提供不同金額時仍只保存伺服器建立快照 | assigned | backend | 整合驗證 | `backend/整合驗證/點餐主旅程.feature` | 顧客提供不同金額不會影響訂單快照 / 顧客以不同總額建立訂單仍保存伺服器快照 | 003/005 contracts 明定相容金額欄位忽略。 |
| `features/acceptance/進階能力與端到端驗證總驗收旅程.feature` | 完整點餐旅程的結果一致 | 預設整合驗證可在 CI 環境重複執行 | `US6`; `FR-018`; `FR-019`; `NFR-012`; `SC-007` | 預設 CI 使用既定入口執行整合驗證並回報結果 | assigned | backend | 整合驗證 | `backend/整合驗證/點餐主旅程.feature` | 預設整合驗證入口可在 CI 環境執行 / 團隊執行預設整合驗證 | 具體命令與環境依 techstack 記載，不增加未定時限。 |

## Requirement Coverage

本範圍依 `spec.md` 共盤點 39 個 ID：US1–US6、FR-001–FR-019、NFR-010–NFR-012、BR-001–BR-004、SC-001–SC-007。

| Status | Requirement IDs |
| --- | --- |
| Mapped to acceptance | `US1`; `US2`; `US3`; `US4`; `US5`; `US6`; `FR-001`; `FR-002`; `FR-003`; `FR-004`; `FR-005`; `FR-006`; `FR-007`; `FR-008`; `FR-009`; `FR-010`; `FR-011`; `FR-012`; `FR-013`; `FR-014`; `FR-015`; `FR-016`; `FR-017`; `FR-018`; `FR-019`; `NFR-010`; `NFR-011`; `NFR-012`; `BR-001`; `BR-002`; `BR-003`; `BR-004`; `SC-001`; `SC-002`; `SC-003`; `SC-004`; `SC-005`; `SC-006`; `SC-007` |
| Unmapped to acceptance | None |
| Blocked assertion | None |

All in-scope requirement IDs map to acceptance Examples. **FR-001** 分類刪除政策已於 `spec.md` 澄清（拒絕刪除、回傳 `CATEGORY_IN_USE`、不自動移轉／cascade）；對應 acceptance Example「店家刪除仍有餐點使用的分類」、`backend/菜單/店家維護菜單.feature#店家刪除仍被餐點使用的分類遭拒` 與 tasks **T013–T014**（BDD 錨點；legacy `testplan.md` TP-006 僅作歷史對照）。

## Coverage Summary

- Acceptance Examples: 15
- In-scope spec requirement IDs: 39
- Requirements mapped to acceptance Examples: 39
- Unmapped spec requirements: 0
- Assigned acceptance Examples: 15
- Blocked acceptance Examples: 0
- Derived interface Examples: 44

> Acceptance Examples: 15（含分類刪除拒絕，政策見 `spec.md` 澄清紀錄與 `plan.md` 分類刪除決策）。

## Open Decisions

| Acceptance source | Unresolved decision or conflict | Impacted interface / module | Next action |
| --- | --- | --- | --- |
| None | None | None | None |
