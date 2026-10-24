# Acceptance to Interface Traceability

## Sources

- Acceptance Feature root: `features/acceptance/`
- Journey 錨點：`Example:` 標題 MUST 與本 matrix「Acceptance Example」欄逐字一致（已於 2026-10-25 對齊）
- System analysis: `plan.md`
- Spec requirements: `spec.md`

## Coverage Matrix

| Acceptance Feature | Acceptance Rule | Acceptance Example | Spec Requirement IDs | Acceptance assertion / invariant | Status | Interface | Module | Derived Feature | Derived Rule / Example | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `features/acceptance/店家出餐與顧客同步總驗收旅程.feature` | 店家可以檢視訂單佇列與訂單快照 | 店家查看待處理訂單及其明細 | `FR-001`; `FR-002`; `FR-003`; `FR-012`; `BR-001`; `SC-001`; `SC-006` | 店家列表及詳情使用建立時快照 | assigned | frontend | 店家訂單 | `../../truth/features/frontend/店家訂單/訂單看板.feature` | 店家可依狀態檢視訂單與建立時快照 / 店家查看待處理訂單列表；店家查看單筆訂單明細 | 列表與詳情分開操作 |
| `features/acceptance/店家出餐與顧客同步總驗收旅程.feature` | 店家可以檢視訂單佇列與訂單快照 | 店家查看待處理訂單及其明細 | `FR-001`; `FR-002`; `FR-003`; `FR-012`; `BR-001`; `SC-001`; `SC-006` | API 回傳正確摘要欄位與完整快照 | assigned | backend | 訂單 | `../../truth/features/backend/訂單/店家訂單與出餐.feature` | 有權限的店家可以讀取訂單列表與快照詳情 / 店家依狀態篩選訂單列表；店家讀取單筆訂單快照 | 按端點契約及 DB 權威快照驗證 |
| `features/acceptance/店家出餐與顧客同步總驗收旅程.feature` | 店家可以檢視訂單佇列與訂單快照 | 未獲授權的人員無法查看訂單 | `FR-010`; `SC-005` | 未授權請求不讀取或洩漏訂單資料 | assigned | frontend | 店家訂單 | `../../truth/features/frontend/店家訂單/訂單看板.feature` | 有權限的店家可以讀取訂單列表與快照詳情 / 未授權店家看不到訂單 | UI 不呈現列表 |
| `features/acceptance/店家出餐與顧客同步總驗收旅程.feature` | 店家可以檢視訂單佇列與訂單快照 | 未獲授權的人員無法查看訂單 | `FR-010`; `SC-005` | 店家憑證錯誤時拒絕讀取 | assigned | backend | 訂單 | `../../truth/features/backend/訂單/店家訂單與出餐.feature` | 有權限的店家可以讀取訂單列表與快照詳情 / 未授權請求無法讀取訂單 | 授權失敗不得返回資料 |
| `features/acceptance/店家出餐與顧客同步總驗收旅程.feature` | 訂單依店家出餐流程逐步前進 | 店家接單、開始出餐並完成訂單 | `FR-004`; `FR-005`; `FR-006`; `FR-007`; `FR-008`; `FR-009`; `FR-012`; `FR-013`; `FR-015`; `BR-001`; `BR-002`; `SC-002`; `SC-003`; `SC-006` | 三個前進 transition 逐步保存且快照不變 | assigned | frontend | 店家訂單 | `../../truth/features/frontend/店家訂單/訂單看板.feature` | 店家只能按流程推進訂單狀態 / 店家接受已建立訂單；店家開始準備已接單訂單；店家完成出餐中的訂單 | 每個操作獨立呈現 |
| `features/acceptance/店家出餐與顧客同步總驗收旅程.feature` | 訂單依店家出餐流程逐步前進 | 店家接單、開始出餐並完成訂單 | `FR-004`; `FR-005`; `FR-006`; `FR-007`; `FR-008`; `FR-009`; `FR-012`; `FR-013`; `FR-015`; `BR-001`; `BR-002`; `SC-002`; `SC-003`; `SC-006` | 狀態更新依 expected state 條件寫入且不改快照 | assigned | backend | 訂單 | `../../truth/features/backend/訂單/店家訂單與出餐.feature` | 店家狀態操作只能依有限狀態機前進 / created 訂單接受後持久化為 accepted；accepted 訂單開始出餐後持久化為 preparing；preparing 訂單完成後持久化為 completed | 分別驗證三個 operation |
| `features/acceptance/店家出餐與顧客同步總驗收旅程.feature` | 訂單依店家出餐流程逐步前進 | 店家無法跳過流程或倒退已完成訂單 | `FR-006`; `FR-009`; `BR-002`; `SC-003` | 非法或倒退轉換拒絕且狀態不變 | assigned | frontend | 店家訂單 | `../../truth/features/frontend/店家訂單/訂單看板.feature` | 店家只能按流程推進訂單狀態 / 非法狀態操作遭拒且畫面維持原狀 | 看板錯誤狀態及原值 |
| `features/acceptance/店家出餐與顧客同步總驗收旅程.feature` | 訂單依店家出餐流程逐步前進 | 店家無法跳過流程或倒退已完成訂單 | `FR-006`; `FR-009`; `BR-002`; `SC-003` | 非法 transition 不寫入且不改快照 | assigned | backend | 訂單 | `../../truth/features/backend/訂單/店家訂單與出餐.feature` | 店家狀態操作只能依有限狀態機前進 / 非法狀態轉換被拒絕且持久化狀態不變 | 期待 409 與重新讀取不變 |
| `features/acceptance/店家出餐與顧客同步總驗收旅程.feature` | 訂單依店家出餐流程逐步前進 | 店家接單、開始出餐並完成訂單 | `FR-011`; `FR-014`; `BR-003`; `SC-004` | 顧客 query 反映店家寫入同一持久化狀態 | assigned | frontend | 顧客訂單 | `../../truth/features/frontend/顧客訂單/查詢狀態.feature` | 顧客查詢呈現持久化的最新出餐狀態 / 顧客看到店家接單後的狀態；顧客看到店家完成出餐後的狀態 | 顧客呈現標籤 |
| `features/acceptance/店家出餐與顧客同步總驗收旅程.feature` | 訂單依店家出餐流程逐步前進 | 店家接單、開始出餐並完成訂單 | `FR-011`; `FR-014`; `BR-003`; `SC-004` | 顧客與店家讀取同一權威 status | assigned | backend | 訂單 | `../../truth/features/backend/訂單/店家訂單與出餐.feature` | 顧客查詢與店家讀取同一個持久化狀態 / 顧客查詢反映店家已更新的狀態 | 使用 003 session ownership 查詢同一 order |

## Coverage Summary

- Acceptance Examples: 4
- In-scope spec requirement IDs: 18
- Requirements mapped to acceptance Examples: 18
- Unmapped spec requirements: 0
- Assigned assertions: 7
- Unmapped assertions: 0
- Blocked assertions: 0
- Derived interface Examples: 17

## Open Decisions

| Acceptance source | Unresolved decision or conflict | Impacted interface / module | Next action |
| --- | --- | --- | --- |
| None | None | None | None |
