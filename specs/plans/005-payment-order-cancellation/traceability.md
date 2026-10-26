# Acceptance to Interface Traceability

## Sources

- Acceptance Feature root: `features/acceptance/`
- Journey 錨點：`Example:` 標題 MUST 與本 matrix「Acceptance Example」欄逐字一致（已於 2026-10-25 對齊）
- System analysis: `plan.md`
- Spec requirements: `spec.md`

## 介面情境摘要（人 Review）

> 覆蓋完整性以下方 Coverage Matrix 與機械稽核為準；人 Review 本節即可。

### frontend / 顧客訂單

| 驗收情境 | 前端驗什麼 | 來源 |
| --- | --- | --- |
| 顧客完成付款並查看付款狀態 | 成功付款使用訂單快照並保留出餐狀態 | AC: 顧客完成付款並查看付款狀態 |
| 顧客端提交不同金額不會改變應付金額 | client amount 不會覆寫應付金額或快照 | AC: 顧客端提交不同金額不會改變應付金額 |
| 已付款或付款處理中的訂單不會重複扣款 | paid 或 non-stale pending 不啟動第二次付款 | AC: 已付款或付款處理中的訂單不會重複扣款 |
| 付款失敗後以同一訂單再次付款成功 | failed 可重試並轉 paid，快照不變 | AC: 付款失敗後以同一訂單再次付款成功 |
| 付款中斷後以相同冪等鍵安全重試 | pending 後 5xx 不寫 paid mapping，同 key 重試僅成功一次 | AC: 付款中斷後以相同冪等鍵安全重試（spec US2·情境4） |
| 顧客重送已成功的同一付款請求 | 同 key 重送回原成功結果，不重複扣款 | AC: 顧客重送已成功的同一付款請求 |
| 顧客取消尚未接單且未付款的訂單 | created/unpaid 可取消，保留訂單快照並阻擋後續操作 | AC: 顧客取消尚未接單且未付款的訂單 |
| 顧客取消已付款但尚未接單的訂單 | paid cancel 同步 refunded 並保留快照 | AC: 顧客取消已付款但尚未接單的訂單 |
| 顧客無法取消已進入出餐流程的訂單 | 非 created 訂單取消遭拒且雙狀態不變 | AC: 顧客無法取消已進入出餐流程的訂單 |
| 付款仍有效處理中時不得取消，過期處理才可安全取消 | non-stale pending cancel 拒絕；stale pending 同交易 failed+cancelled | AC: 付款仍有效處理中時不得取消，過期處理才可安全取消 |
| 顧客查詢付款失敗訂單 | 查詢回傳付款失敗標籤、出餐狀態與建立時快照 | AC: 顧客查詢付款失敗訂單 |
| 顧客查詢已取消訂單 | cancelled 與付款標籤及建立快照仍可查詢 | AC: 顧客查詢已取消訂單 |

### backend / 訂單

| 驗收情境 | 後端驗什麼 | 來源 |
| --- | --- | --- |
| 顧客完成付款並查看付款狀態 | 後端保存 paid 並以 total_amount 快照付款 | AC: 顧客完成付款並查看付款狀態 |
| 顧客端提交不同金額不會改變應付金額 | pay result 依 orders.total_amount，不採信 request amount | AC: 顧客端提交不同金額不會改變應付金額 |
| 已付款或付款處理中的訂單不會重複扣款 | 後端不建立第二個 payment attempt | AC: 已付款或付款處理中的訂單不會重複扣款 |
| 付款失敗後以同一訂單再次付款成功 | failed 訂單重試成功，保留前次失敗摘要 | AC: 付款失敗後以同一訂單再次付款成功 |
| 付款中斷後以相同冪等鍵安全重試 | pending 後 5xx 不寫 paid mapping，同 key 重試僅一次成功 | AC: 付款中斷後以相同冪等鍵安全重試 |
| 顧客重送已成功的同一付款請求 | 只有 paid 成功寫入冪等 mapping，重送不二次執行 | AC: 顧客重送已成功的同一付款請求 |
| 顧客取消尚未接單且未付款的訂單 | backend 交易取消 order 且後續 pay/merchant action 拒絕 | AC: 顧客取消尚未接單且未付款的訂單 |
| 顧客取消已付款但尚未接單的訂單 | backend 同一交易 cancelled+refunded 並記 refunded_at | AC: 顧客取消已付款但尚未接單的訂單 |
| 顧客無法取消已進入出餐流程的訂單 | backend 依持久化出餐狀態拒絕並保留付款狀態 | AC: 顧客無法取消已進入出餐流程的訂單 |
| 付款仍有效處理中時不得取消，過期處理才可安全取消 | stale pending 中止、non-stale pending 不變，避免 pending+cancelled | AC: 付款仍有效處理中時不得取消，過期處理才可安全取消 |
| 顧客查詢付款失敗訂單 | API 回傳 failed、標籤及快照 | AC: 顧客查詢付款失敗訂單 |
| 顧客查詢已取消訂單 | API 回傳 cancelled/refunded 狀態與建立快照 | AC: 顧客查詢已取消訂單 |

### frontend / 店家訂單

| 驗收情境 | 前端驗什麼 | 來源 |
| --- | --- | --- |
| 店家依付款狀態篩選訂單 | 店家列表依付款狀態篩選並顯示雙狀態及快照 | AC: 店家依付款狀態篩選訂單 |
| 無效店家憑證無法讀取付款資訊 | 無效憑證拒絕且不揭露訂單內容 | AC: 無效店家憑證無法讀取付款資訊 |
| 店家不能接單已取消訂單 | cancelled 訂單拒絕接單且狀態不變 | AC: 店家不能接單已取消訂單 |
| 店家不能推進已取消訂單 | cancelled 訂單拒絕出餐狀態推進 | AC: 店家不能推進已取消訂單 |
| 店家查看付款失敗訂單詳情 | 詳情含付款狀態、失敗摘要及建立快照 | AC: 店家查看付款失敗訂單詳情 |
| 無效店家憑證無法讀取訂單詳情 | 無效憑證拒絕詳情讀取且不洩漏資料 | AC: 無效店家憑證無法讀取訂單詳情 |
| 店家不能完成已取消訂單 | cancelled 訂單拒絕 complete action 且雙狀態不變 | AC: 店家不能完成已取消訂單 |

### backend / 店家訂單

| 驗收情境 | 後端驗什麼 | 來源 |
| --- | --- | --- |
| 店家依付款狀態篩選訂單 | API 列表與詳情含付款狀態並依 payment_status 篩選 | AC: 店家依付款狀態篩選訂單 |
| 無效店家憑證無法讀取付款資訊 | API 拒絕未授權讀取且不回傳訂單 | AC: 無效店家憑證無法讀取付款資訊 |
| 店家不能接單已取消訂單 | cancelled 訂單拒絕 accept operation | AC: 店家不能接單已取消訂單 |
| 店家不能推進已取消訂單 | cancelled 訂單拒絕 start/complete operation | AC: 店家不能推進已取消訂單 |
| 店家查看付款失敗訂單詳情 | API 詳情含付款狀態與失敗摘要，快照不變 | AC: 店家查看付款失敗訂單詳情 |
| 無效店家憑證無法讀取訂單詳情 | API 拒絕無效憑證讀取單筆詳情 | AC: 無效店家憑證無法讀取訂單詳情 |
| 店家不能完成已取消訂單 | cancelled 訂單拒絕 complete operation 且雙狀態不變 | AC: 店家不能完成已取消訂單 |

## Coverage Matrix（AI 機械稽核 — 不要求使用者逐行 Review）

| Acceptance Feature | Acceptance Rule | Acceptance Example | Spec Requirement IDs | Acceptance assertion / invariant | Status | Interface | Module | Derived Feature | Derived Rule / Example | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | 顧客可使用訂單建立時的應付金額付款 | 顧客完成付款並查看付款狀態 | `FR-001`; `FR-002`; `FR-010`; `FR-015`; `BR-001`; `BR-002`; `SC-001` | 成功付款使用訂單快照並保留出餐狀態 | assigned | frontend | 顧客訂單 | `../../truth/features/frontend/顧客訂單/付款與取消.feature` | 付款結果使用訂單快照金額且不改變出餐狀態 / 顧客成功付款後看到已付款狀態 | UI 顯示兩個正交狀態 |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | 顧客可使用訂單建立時的應付金額付款 | 顧客完成付款並查看付款狀態 | `FR-001`; `FR-002`; `FR-010`; `FR-015`; `BR-001`; `BR-002`; `SC-001` | 後端保存 paid 並以 total_amount 快照付款 | assigned | backend | 訂單 | `../../truth/features/backend/訂單/付款與取消.feature` | 付款金額以訂單快照為準並保存正交付款狀態 / 付款成功後保存 paid 狀態及快照金額 | paid 與出餐 status 分別驗證 |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | 顧客可使用訂單建立時的應付金額付款 | 顧客端提交不同金額不會改變應付金額 | `FR-006`; `FR-010`; `BR-001`; `SC-005` | client amount 不會覆寫應付金額或快照 | assigned | frontend | 顧客訂單 | `../../truth/features/frontend/顧客訂單/付款與取消.feature` | 付款結果使用訂單快照金額且不改變出餐狀態 / 顧客嘗試以錯誤金額付款仍依訂單快照計價 | 驗證金額顯示維持 server snapshot |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | 顧客可使用訂單建立時的應付金額付款 | 顧客端提交不同金額不會改變應付金額 | `FR-006`; `FR-010`; `BR-001`; `SC-005` | pay result 依 orders.total_amount，不採信 request amount | assigned | backend | 訂單 | `../../truth/features/backend/訂單/付款與取消.feature` | 付款金額以訂單快照為準並保存正交付款狀態 / 付款請求金額不會覆寫訂單快照 | 驗證權威計價及快照不變 |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | 顧客可使用訂單建立時的應付金額付款 | 已付款或付款處理中的訂單不會重複扣款 | `FR-003`; `FR-010`; `BR-002`; `SC-001` | paid 或 non-stale pending 不啟動第二次付款 | assigned | frontend | 顧客訂單 | `../../truth/features/frontend/顧客訂單/付款與取消.feature` | 付款結果使用訂單快照金額且不改變出餐狀態 / 已付款訂單或處理中訂單不會重複扣款 | UI 顯示已付款／處理中結果 |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | 顧客可使用訂單建立時的應付金額付款 | 已付款或付款處理中的訂單不會重複扣款 | `FR-003`; `FR-010`; `BR-002`; `SC-001` | 後端不建立第二個 payment attempt | assigned | backend | 訂單 | `../../truth/features/backend/訂單/付款與取消.feature` | 付款金額以訂單快照為準並保存正交付款狀態 / 已付款訂單拒絕再次扣款；非 stale pending 訂單拒絕新付款 | 409 或原結果且狀態不變 |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | 付款失敗後顧客可以安全重試 | 付款失敗後以同一訂單再次付款成功 | `FR-004`; `FR-005`; `FR-010`; `FR-015`; `SC-002` | failed 可重試並轉 paid，快照不變 | assigned | frontend | 顧客訂單 | `../../truth/features/frontend/顧客訂單/付款與取消.feature` | 付款結果使用訂單快照金額且不改變出餐狀態 / 付款失敗後顧客可以重試成功 | UI 顯示可重試及成功結果 |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | 付款失敗後顧客可以安全重試 | 付款失敗後以同一訂單再次付款成功 | `FR-004`; `FR-005`; `FR-010`; `FR-015`; `SC-002` | failed 訂單重試成功，保留前次失敗摘要 | assigned | backend | 訂單 | `../../truth/features/backend/訂單/付款與取消.feature` | 付款失敗可重試且冪等只保護成功結果 / 付款失敗後重試可更新為 paid | 付款狀態及 history 欄位驗證 |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | 付款失敗後顧客可以安全重試 | 顧客重送已成功的同一付款請求 | `FR-012`; `FR-015`; `BR-004`; `SC-006` | 同 key 重送回原成功結果，不重複扣款 | assigned | frontend | 顧客訂單 | `../../truth/features/frontend/顧客訂單/付款與取消.feature` | 付款結果使用訂單快照金額且不改變出餐狀態 / 顧客重送成功付款請求不會重複扣款 | 顯示原結果 |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | 付款失敗後顧客可以安全重試 | 付款中斷後以相同冪等鍵安全重試 | `FR-012`; `FR-015`; `BR-004`; `SC-006` | pending 後 5xx 不寫 paid mapping，同 key 重試僅一次成功扣款 | assigned | backend | 訂單 | `../../truth/features/backend/訂單/付款與取消.feature` | 付款失敗可重試且冪等只保護成功結果 / pending 後 5xx 不寫 paid 冪等且同 key 可安全重試 | 整合測試經 plan 核准 fault seam |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | 付款失敗後顧客可以安全重試 | 顧客重送已成功的同一付款請求 | `FR-012`; `FR-015`; `BR-004`; `SC-006` | 只有 paid 成功寫入冪等 mapping，重送不二次執行 | assigned | backend | 訂單 | `../../truth/features/backend/訂單/付款與取消.feature` | 付款失敗可重試且冪等只保護成功結果 / 已成功付款請求以相同冪等鍵重送 | 驗證 paid mapping 及結果一致 |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | 顧客只能在訂單尚未接單時取消 | 顧客取消尚未接單且未付款的訂單 | `FR-007`; `FR-009`; `FR-011`; `FR-013`; `FR-015`; `BR-003`; `SC-003` | created/unpaid 可取消，保留訂單快照並阻擋後續操作 | assigned | frontend | 顧客訂單 | `../../truth/features/frontend/顧客訂單/付款與取消.feature` | 顧客僅能在允許的狀態取消訂單 / 顧客取消尚未付款且未接單的訂單 | UI 顯示 cancelled，保留明細 |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | 顧客只能在訂單尚未接單時取消 | 顧客取消尚未接單且未付款的訂單 | `FR-007`; `FR-009`; `FR-011`; `FR-013`; `FR-015`; `BR-003`; `SC-003` | backend 交易取消 order 且後續 pay/merchant action 拒絕 | assigned | backend | 訂單 | `../../truth/features/backend/訂單/付款與取消.feature` | 顧客取消與付款狀態在同一權威訂單上協調 / created unpaid 訂單取消後禁止付款及出餐 | 驗證狀態與快照不變 |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | 顧客只能在訂單尚未接單時取消 | 顧客取消已付款但尚未接單的訂單 | `FR-007`; `FR-009`; `FR-011`; `FR-013`; `BR-003`; `BR-004`; `SC-003` | paid cancel 同步 refunded 並保留快照 | assigned | frontend | 顧客訂單 | `../../truth/features/frontend/顧客訂單/付款與取消.feature` | 顧客僅能在允許的狀態取消訂單 / 顧客取消已付款但未接單的訂單後看到退款 | UI 顯示已退款 |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | 顧客只能在訂單尚未接單時取消 | 顧客取消已付款但尚未接單的訂單 | `FR-007`; `FR-009`; `FR-011`; `FR-013`; `BR-003`; `BR-004`; `SC-003` | backend 同一交易 cancelled+refunded 並記 refunded_at | assigned | backend | 訂單 | `../../truth/features/backend/訂單/付款與取消.feature` | 顧客取消與付款狀態在同一權威訂單上協調 / paid 訂單取消時同步標記 refunded | 原子狀態轉換 |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | 顧客只能在訂單尚未接單時取消 | 顧客無法取消已進入出餐流程的訂單 | `FR-008`; `FR-011`; `FR-013`; `BR-003`; `SC-004` | 非 created 訂單取消遭拒且雙狀態不變 | assigned | frontend | 顧客訂單 | `../../truth/features/frontend/顧客訂單/付款與取消.feature` | 顧客僅能在允許的狀態取消訂單 / 已接單後顧客無法取消訂單 | 顯示拒絕結果 |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | 顧客只能在訂單尚未接單時取消 | 顧客無法取消已進入出餐流程的訂單 | `FR-008`; `FR-011`; `FR-013`; `BR-003`; `SC-004` | backend 依持久化出餐狀態拒絕並保留付款狀態 | assigned | backend | 訂單 | `../../truth/features/backend/訂單/付款與取消.feature` | 顧客取消與付款狀態在同一權威訂單上協調 / 非 created 訂單拒絕顧客取消 | 權威狀態及 timestamps 不變 |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | 顧客只能在訂單尚未接單時取消 | 付款仍有效處理中時不得取消，過期處理才可安全取消 | `FR-013`; `FR-015`; `BR-003`; `BR-004`; `SC-004` | non-stale pending cancel 拒絕；stale pending 同交易 failed+cancelled | assigned | frontend | 顧客訂單 | `../../truth/features/frontend/顧客訂單/付款與取消.feature` | 顧客僅能在允許的狀態取消訂單 / 付款仍處理中時取消遭拒；付款處理逾時後取消可安全完成 | 依 API 結果呈現 |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | 顧客只能在訂單尚未接單時取消 | 付款仍有效處理中時不得取消，過期處理才可安全取消 | `FR-013`; `FR-015`; `BR-003`; `BR-004`; `SC-004` | stale pending 中止、non-stale pending 不變，避免 pending+cancelled | assigned | backend | 訂單 | `../../truth/features/backend/訂單/付款與取消.feature` | 顧客取消與付款狀態在同一權威訂單上協調 / 非 stale pending 拒絕取消；stale pending 同一交易中止付款並取消 | 需要資料庫交易驗證 |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | 顧客查詢反映持久化的付款與取消狀態 | 顧客查詢付款失敗訂單 | `FR-016`; `FR-004`; `SC-002` | 查詢回傳付款失敗標籤、出餐狀態與建立時快照 | assigned | frontend | 顧客訂單 | `../../truth/features/frontend/顧客訂單/付款狀態查詢.feature` | 顧客查詢付款失敗訂單 / 顧客看到失敗狀態及快照 | 顯示持久化結果 |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | 顧客查詢反映持久化的付款與取消狀態 | 顧客查詢付款失敗訂單 | `FR-016`; `FR-004`; `SC-002` | API 回傳 failed、標籤及快照 | assigned | backend | 訂單 | `../../truth/features/backend/訂單/付款狀態查詢.feature` | 查詢反映持久化付款狀態 / 查詢付款失敗訂單 | 依訪客 session 限定讀取 |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | 顧客查詢反映持久化的付款與取消狀態 | 顧客查詢已取消訂單 | `FR-016`; `FR-009`; `FR-013`; `BR-003` | cancelled 與付款標籤及建立快照仍可查詢 | assigned | frontend | 顧客訂單 | `../../truth/features/frontend/顧客訂單/付款狀態查詢.feature` | 顧客查詢已取消訂單 / 顧客看到取消及付款狀態 | 不洩漏其他 session 訂單 |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | 顧客查詢反映持久化的付款與取消狀態 | 顧客查詢已取消訂單 | `FR-016`; `FR-009`; `FR-013`; `BR-003` | API 回傳 cancelled/refunded 狀態與建立快照 | assigned | backend | 訂單 | `../../truth/features/backend/訂單/付款狀態查詢.feature` | 查詢反映持久化付款狀態 / 查詢已取消訂單 | 以訂單持久化欄位為權威 |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | 店家可檢視並篩選訂單付款資訊 | 店家依付款狀態篩選訂單 | `FR-017`; `FR-018`; `FR-020`; `FR-015`; `BR-004` | 店家列表依付款狀態篩選並顯示雙狀態及快照 | assigned | frontend | 店家訂單 | `../../truth/features/frontend/店家訂單/付款資訊.feature` | 店家依付款狀態篩選訂單 / 列表顯示付款與出餐資訊 | 有效店家憑證才能查看 |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | 店家可檢視並篩選訂單付款資訊 | 店家依付款狀態篩選訂單 | `FR-017`; `FR-018`; `FR-020`; `FR-015`; `BR-004` | API 列表與詳情含付款狀態並依 payment_status 篩選 | assigned | backend | 店家訂單 | `../../truth/features/backend/店家訂單/付款資訊.feature` | 店家依付款狀態篩選訂單 / 篩選回傳付款狀態訂單 | 對齊 004 店家權限契約 |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | 店家可檢視並篩選訂單付款資訊 | 無效店家憑證無法讀取付款資訊 | `FR-020`; `FR-017` | 無效憑證拒絕且不揭露訂單內容 | assigned | frontend | 店家訂單 | `../../truth/features/frontend/店家訂單/付款資訊.feature` | 無效店家憑證無法讀取付款資訊 / 看板不顯示付款資料 | 401／503 沿用第四迭代政策 |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | 店家可檢視並篩選訂單付款資訊 | 無效店家憑證無法讀取付款資訊 | `FR-020`; `FR-017` | API 拒絕未授權讀取且不回傳訂單 | assigned | backend | 店家訂單 | `../../truth/features/backend/店家訂單/付款資訊.feature` | 無效店家憑證無法讀取付款資訊 / 無效憑證讀取遭拒 | 沿用 004 auth contract |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | 已取消訂單不得再進入店家出餐流程 | 店家不能接單已取消訂單 | `FR-019`; `BR-003`; `SC-003` | cancelled 訂單拒絕接單且狀態不變 | assigned | frontend | 店家訂單 | `../../truth/features/frontend/店家訂單/取消訂單護欄.feature` | 店家不能接單已取消訂單 / 看板拒絕接單 | 維持付款與出餐狀態 |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | 已取消訂單不得再進入店家出餐流程 | 店家不能接單已取消訂單 | `FR-019`; `BR-003`; `SC-003` | cancelled 訂單拒絕 accept operation | assigned | backend | 店家訂單 | `../../truth/features/backend/店家訂單/取消訂單護欄.feature` | 店家不能接單已取消訂單 / API 拒絕接單 | 權威狀態不變 |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | 已取消訂單不得再進入店家出餐流程 | 店家不能推進已取消訂單 | `FR-019`; `BR-003`; `SC-003` | cancelled 訂單拒絕出餐狀態推進 | assigned | frontend | 店家訂單 | `../../truth/features/frontend/店家訂單/取消訂單護欄.feature` | 店家不能推進已取消訂單 / 看板拒絕狀態操作 | 維持付款與出餐狀態 |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | 已取消訂單不得再進入店家出餐流程 | 店家不能推進已取消訂單 | `FR-019`; `BR-003`; `SC-003` | cancelled 訂單拒絕 start/complete operation | assigned | backend | 店家訂單 | `../../truth/features/backend/店家訂單/取消訂單護欄.feature` | 店家不能推進已取消訂單 / API 拒絕狀態轉換 | 權威狀態不變 |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | 店家訂單詳情呈現目前付款資訊 | 店家查看付款失敗訂單詳情 | `FR-017`; `FR-015`; `FR-010`; `BR-004` | 詳情含付款狀態、失敗摘要及建立快照 | assigned | frontend | 店家訂單 | `../../truth/features/frontend/店家訂單/付款資訊.feature` | 店家詳情顯示付款失敗摘要 / 店家查看付款失敗訂單詳情 | 顯示可對外公開的失敗摘要。 |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | 店家訂單詳情呈現目前付款資訊 | 店家查看付款失敗訂單詳情 | `FR-017`; `FR-015`; `FR-010`; `BR-004` | API 詳情含付款狀態與失敗摘要，快照不變 | assigned | backend | 店家訂單 | `../../truth/features/backend/店家訂單/付款資訊.feature` | 店家詳情回傳付款狀態與失敗摘要 / 店家讀取付款失敗訂單詳情 | 對齊 005 getMerchantOrder。 |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | 店家訂單詳情呈現目前付款資訊 | 無效店家憑證無法讀取訂單詳情 | `FR-020`; `FR-017` | 無效憑證拒絕詳情讀取且不洩漏資料 | assigned | frontend | 店家訂單 | `../../truth/features/frontend/店家訂單/付款資訊.feature` | 無效憑證不得顯示訂單詳情 / 無效店家憑證無法讀取訂單詳情 | 顯示授權錯誤但不顯示欄位。 |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | 店家訂單詳情呈現目前付款資訊 | 無效店家憑證無法讀取訂單詳情 | `FR-020`; `FR-017` | API 拒絕無效憑證讀取單筆詳情 | assigned | backend | 店家訂單 | `../../truth/features/backend/店家訂單/付款資訊.feature` | 無效店家憑證不得讀取訂單詳情 / 無效店家憑證無法讀取訂單詳情 | 沿用 004 merchant auth。 |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | 已取消訂單不得再進入店家出餐流程 | 店家不能完成已取消訂單 | `FR-019`; `BR-003`; `SC-003` | cancelled 訂單拒絕 complete action 且雙狀態不變 | assigned | frontend | 店家訂單 | `../../truth/features/frontend/店家訂單/取消訂單護欄.feature` | 已取消訂單不得推進出餐 / 店家不能完成已取消訂單 | 看板呈現拒絕並維持狀態。 |
| `features/acceptance/付款取消與狀態查詢總驗收旅程.feature` | 已取消訂單不得再進入店家出餐流程 | 店家不能完成已取消訂單 | `FR-019`; `BR-003`; `SC-003` | cancelled 訂單拒絕 complete operation 且雙狀態不變 | assigned | backend | 店家訂單 | `../../truth/features/backend/店家訂單/取消訂單護欄.feature` | 店家不得推進已取消訂單 / 店家不能完成已取消訂單 | 權威狀態與時間戳不變。 |

## Coverage Summary

- Acceptance Examples: 19
- In-scope spec requirement IDs: 24
- Requirements mapped to acceptance Examples: 24
- Unmapped spec requirements: 0
- Assigned assertions: 19
- Unmapped assertions: 0
- Blocked assertions: 0
- Derived interface Examples: 40

## Open Decisions

| Acceptance source | Unresolved decision or conflict | Impacted interface / module | Next action |
| --- | --- | --- | --- |
| None | None | None | None |
