# Acceptance to Interface Traceability

## Sources

- Acceptance Feature root: `features/acceptance/`
- Journey 錨點：`Example:` 標題 MUST 與本 matrix「Acceptance Example」欄逐字一致（已於 2026-10-25 對齊）
- System analysis: `plan.md`
- Spec requirements: `spec.md`

## 介面情境摘要（人 Review）

> 覆蓋完整性以下方 Coverage Matrix 與機械稽核為準；人 Review 本節即可。

### frontend / 購物車

| 驗收情境 | 前端驗什麼 | 來源 |
| --- | --- | --- |
| 顧客選完每個規格群組後加入餐點 | 有效規格加入 session cart 並以權威價格計算 | AC: 顧客選完每個規格群組後加入餐點 |
| 顧客無法加入未供應餐點或未選完整規格的餐點 | 不可用餐點或未完成規格均拒絕且購物車不變 | AC: 顧客無法加入未供應餐點或未選完整規格的餐點 |
| 顧客修改數量與刪除項目後看到最新總額 | 讀取、數量變更與刪除後總額等於剩餘可用項目 | AC: 顧客修改數量與刪除項目後看到最新總額 |
| 菜單價格變更後以目前價格更新購物車 | 舊 cart 項目讀取時採新價格 | AC: 菜單價格變更後以目前價格更新購物車 |
| 餐點或規格停止供應後仍可移除購物車項目 | 不可用項目保留、不給金額且排除總額；數量變更拒絕、刪除允許 | AC: 餐點或規格停止供應後仍可移除購物車項目 |
| 不同顧客無法看到彼此的購物車 | 每個 session 僅能讀取自己的購物車 | AC: 不同顧客無法看到彼此的購物車 |

### backend / 購物車

| 驗收情境 | 後端驗什麼 | 來源 |
| --- | --- | --- |
| 顧客選完每個規格群組後加入餐點 | 有效選項完整、正確持久化且不合併工作階段 | AC: 顧客選完每個規格群組後加入餐點 |
| 顧客無法加入未供應餐點或未選完整規格的餐點 | 失敗新增不留部分項目或規格關聯 | AC: 顧客無法加入未供應餐點或未選完整規格的餐點 |
| 顧客修改數量與刪除項目後看到最新總額 | 後端保存正整數數量並從目前價格重算 | AC: 顧客修改數量與刪除項目後看到最新總額 |
| 菜單價格變更後以目前價格更新購物車 | API 不保存舊價格快照且使用最新權威資料 | AC: 菜單價格變更後以目前價格更新購物車 |
| 顧客端提供的金額不能改變系統計價 | client 金額不是持久化或計價權威 | AC: 顧客端提供的金額不能改變系統計價 |
| 餐點或規格停止供應後仍可移除購物車項目 | unavailable row 保留、不可計價／修改但可刪除 | AC: 餐點或規格停止供應後仍可移除購物車項目 |
| 不同顧客無法看到彼此的購物車 | session A cart 不可由 session B 讀取或修改 | AC: 不同顧客無法看到彼此的購物車 |

### frontend; backend / 購物車

| 驗收情境 | 前端驗什麼 | 來源 |
| --- | --- | --- |
| 顧客開啟空購物車看到零總額 | 空購物車顯示空狀態，總金額為零 | AC: 顧客開啟空購物車看到零總額 |

## Coverage Matrix（AI 機械稽核 — 不要求使用者逐行 Review）

| Acceptance Feature | Acceptance Rule | Acceptance Example | Spec Requirement IDs | Acceptance assertion / invariant | Status | Interface | Module | Derived Feature | Derived Rule / Example | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `features/acceptance/訪客購物車與金額計算總驗收旅程.feature` | 顧客可以將依規格選擇的供應中餐點加入購物車 | 顧客選完每個規格群組後加入餐點 | `FR-001`; `FR-002`; `FR-004`; `FR-005`; `BR-001`; `BR-002`; `SC-001`; `SC-002`; `SC-004` | 有效規格加入 session cart 並以權威價格計算 | assigned | frontend | 購物車 | `../../truth/features/frontend/購物車/餐點與購物車操作.feature` | 顧客依規格選擇加入供應中的餐點 / 顧客選完每個規格群組後加入餐點 | 互動與顯示規格選擇結果 |
| `features/acceptance/訪客購物車與金額計算總驗收旅程.feature` | 顧客可以將依規格選擇的供應中餐點加入購物車 | 顧客選完每個規格群組後加入餐點 | `FR-001`; `FR-002`; `FR-004`; `FR-005`; `BR-001`; `BR-002`; `SC-001`; `SC-002`; `SC-004` | 有效選項完整、正確持久化且不合併工作階段 | assigned | backend | 購物車 | `../../truth/features/backend/購物車/新增與隔離.feature` | 每個規格群組恰選一個有效選項後才能新增項目 / 供應中餐點依完整規格選擇加入目前工作階段購物車 | 交易驗證群組選項歸屬及權威金額 |
| `features/acceptance/訪客購物車與金額計算總驗收旅程.feature` | 顧客可以將依規格選擇的供應中餐點加入購物車 | 顧客無法加入未供應餐點或未選完整規格的餐點 | `FR-002`; `FR-003`; `BR-002`; `SC-004` | 不可用餐點或未完成規格均拒絕且購物車不變 | assigned | frontend | 購物車 | `../../truth/features/frontend/購物車/餐點與購物車操作.feature` | 顧客依規格選擇加入供應中的餐點 / 未供應餐點加入遭拒；未完成規格選擇時加入遭拒 | 分成兩個單一操作案例 |
| `features/acceptance/訪客購物車與金額計算總驗收旅程.feature` | 顧客可以將依規格選擇的供應中餐點加入購物車 | 顧客無法加入未供應餐點或未選完整規格的餐點 | `FR-002`; `FR-003`; `BR-002`; `SC-004` | 失敗新增不留部分項目或規格關聯 | assigned | backend | 購物車 | `../../truth/features/backend/購物車/新增與隔離.feature` | 每個規格群組恰選一個有效選項後才能新增項目 / 未供應餐點加入遭拒；規格群組未選完整時新增遭拒 | 驗證 response 及 cart 權威狀態不變 |
| `features/acceptance/訪客購物車與金額計算總驗收旅程.feature` | 顧客管理購物車後金額依目前可用項目重新計算 | 顧客修改數量與刪除項目後看到最新總額 | `FR-004`; `FR-005`; `FR-006`; `FR-007`; `BR-001`; `BR-003`; `SC-002`; `SC-003` | 讀取、數量變更與刪除後總額等於剩餘可用項目 | assigned | frontend | 購物車 | `../../truth/features/frontend/購物車/餐點與購物車操作.feature` | 顧客調整購物車後看到依目前資料計算的金額 / 顧客修改可用項目數量；顧客刪除購物車項目 | UI 顯示與操作結果 |
| `features/acceptance/訪客購物車與金額計算總驗收旅程.feature` | 顧客管理購物車後金額依目前可用項目重新計算 | 顧客修改數量與刪除項目後看到最新總額 | `FR-004`; `FR-005`; `FR-006`; `FR-007`; `BR-001`; `BR-003`; `SC-002`; `SC-003` | 後端保存正整數數量並從目前價格重算 | assigned | backend | 購物車 | `../../truth/features/backend/購物車/查詢與維護.feature` | 修改與刪除項目後購物車狀態保持一致 / 修改數量後重算項目與總金額；刪除項目後依剩餘項目重算總額 | 驗證 DB 狀態及重讀結果 |
| `features/acceptance/訪客購物車與金額計算總驗收旅程.feature` | 顧客管理購物車後金額依目前可用項目重新計算 | 菜單價格變更後以目前價格更新購物車 | `FR-005`; `FR-006`; `FR-007`; `BR-001`; `SC-002`; `SC-003` | 舊 cart 項目讀取時採新價格 | assigned | frontend | 購物車 | `../../truth/features/frontend/購物車/餐點與購物車操作.feature` | 顧客調整購物車後看到依目前資料計算的金額 / 菜單價格變更後顧客看到最新金額 | UI 顯示新價格提示與總額 |
| `features/acceptance/訪客購物車與金額計算總驗收旅程.feature` | 顧客管理購物車後金額依目前可用項目重新計算 | 菜單價格變更後以目前價格更新購物車 | `FR-005`; `FR-006`; `FR-007`; `BR-001`; `SC-002`; `SC-003` | API 不保存舊價格快照且使用最新權威資料 | assigned | backend | 購物車 | `../../truth/features/backend/購物車/查詢與維護.feature` | 購物車金額必須依權威菜單資料計算 / 菜單價格更新後重新讀取購物車 | 重讀 menu／options 資料後重算 |
| `features/acceptance/訪客購物車與金額計算總驗收旅程.feature` | 顧客管理購物車後金額依目前可用項目重新計算 | 顧客端提供的金額不能改變系統計價 | `FR-005`; `BR-001`; `SC-002` | client 金額不是持久化或計價權威 | assigned | backend | 購物車 | `../../truth/features/backend/購物車/查詢與維護.feature` | 購物車金額必須依權威菜單資料計算 / 顧客端提供的金額不能成為計價依據 | 驗證權威資料計價，不寫入 client amount |
| `features/acceptance/訪客購物車與金額計算總驗收旅程.feature` | 不可用購物車項目須保留並排除於總額 | 餐點或規格停止供應後仍可移除購物車項目 | `FR-008`; `SC-005` | 不可用項目保留、不給金額且排除總額；數量變更拒絕、刪除允許 | assigned | frontend | 購物車 | `../../truth/features/frontend/購物車/餐點與購物車操作.feature` | 不可用項目保留供顧客確認及移除 / 停供項目不顯示金額且不計入總額；顧客無法修改不可用項目數量；顧客仍可刪除不可用項目 | 拆分檢視、PATCH、DELETE 行為 |
| `features/acceptance/訪客購物車與金額計算總驗收旅程.feature` | 不可用購物車項目須保留並排除於總額 | 餐點或規格停止供應後仍可移除購物車項目 | `FR-008`; `SC-005` | unavailable row 保留、不可計價／修改但可刪除 | assigned | backend | 購物車 | `../../truth/features/backend/購物車/查詢與維護.feature` | 不可用項目保留但不得計價或修改數量 / 讀取購物車時保留不可用項目但排除金額；不可用項目數量更新遭拒；刪除不可用項目仍獲允許 | 驗證持久化狀態與錯誤後不變量 |
| `features/acceptance/訪客購物車與金額計算總驗收旅程.feature` | 不同訪客工作階段的購物車互相隔離 | 不同顧客無法看到彼此的購物車 | `FR-004`; `SC-004` | 每個 session 僅能讀取自己的購物車 | assigned | frontend | 購物車 | `../../truth/features/frontend/購物車/餐點與購物車操作.feature` | 不同工作階段的購物車互相隔離 / 顧客只看到目前工作階段的購物車 | 兩個瀏覽器工作階段互相隔離 |
| `features/acceptance/訪客購物車與金額計算總驗收旅程.feature` | 不同訪客工作階段的購物車互相隔離 | 不同顧客無法看到彼此的購物車 | `FR-004`; `SC-004` | session A cart 不可由 session B 讀取或修改 | assigned | backend | 購物車 | `../../truth/features/backend/購物車/新增與隔離.feature` | 每筆購物車只能由建立該購物車的訪客工作階段讀取 / 第二個工作階段讀取不到第一個工作階段的項目 | 使用不同 server-signed sessions 驗證隔離 |
| `features/acceptance/訪客購物車與金額計算總驗收旅程.feature` | 空購物車仍呈現清楚狀態 | 顧客開啟空購物車看到零總額 | `US2`; `FR-006` | 空購物車顯示空狀態，總金額為零 | assigned | frontend; backend | 購物車 | `../../truth/features/frontend/購物車/餐點與購物車操作.feature`; `../../truth/features/backend/購物車/查詢與維護.feature` | 顧客在空車時可辨識購物車狀態 / 顧客開啟空購物車；空購物車讀取回傳零總額 / 顧客讀取空購物車 | Spec 邊界情況明定空車狀態與零總額。 |

## Coverage Summary

- Acceptance Examples: 8
- In-scope spec requirement IDs: 12
- Requirements mapped to acceptance Examples: 12
- Unmapped spec requirements: 0
- Assigned assertions: 14
- Unmapped assertions: 0
- Blocked assertions: 0
- Derived interface Examples: 24

## Open Decisions

| Acceptance source | Unresolved decision or conflict | Impacted interface / module | Next action |
| --- | --- | --- | --- |
| None | None | None | None |
