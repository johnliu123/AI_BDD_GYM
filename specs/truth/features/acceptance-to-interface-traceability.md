# Acceptance to Interface Traceability (Truth)

Interface features live under `specs/truth/features/`.

## Plan deltas

Per-iteration matrices: `specs/plans/<plan-id>/traceability.md`.

## Cumulative coverage by plan

### 001-food-browsing-categories

## Sources

- Acceptance Feature root: `features/acceptance/`
- System analysis: `plan.md`
- Spec requirements: `spec.md`

## Coverage Matrix

| Acceptance Feature | Acceptance Rule | Acceptance Example | Spec Requirement IDs | Acceptance assertion / invariant | Status | Interface | Module | Derived Feature | Derived Rule / Example | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `features/acceptance/顧客瀏覽餐點與分類.feature` | 顧客可以從菜單辨識餐點及其資訊 | 顧客依分類瀏覽餐點並確認資訊相符 | `FR-001`; `FR-002`; `SC-001`; `SC-002` | 分類篩選後餐點欄位對應同一餐點 | assigned | frontend | 菜單 | `features/frontend/菜單/分類篩選.feature` | 顧客依分類瀏覽餐點 / 顧客切換分類並辨識餐點資料 | 驗證標籤篩選及卡片欄位對應 fixture |
| `features/acceptance/顧客瀏覽餐點與分類.feature` | 顧客可以從菜單辨識餐點及其資訊 | 顧客依分類瀏覽餐點並確認資訊相符 | `FR-001`; `FR-002`; `SC-001`; `SC-002` | 餐點資料與分類關聯一致 | assigned | backend | 菜單 | `features/backend/菜單/依分類讀取餐點.feature` | 菜單餐點必須回傳其正確分類與顯示資料 / 顧客讀取菜單時餐點欄位對應正確分類 | 對照 DB category 關聯及 OpenAPI 欄位 |
| `features/acceptance/顧客瀏覽餐點與分類.feature` | 缺少餐點資料時仍須明確呈現 | 餐點缺少部分資訊時仍保留在菜單 | `FR-002`; `SC-001`; `SC-002` | 缺圖片時保留卡片並顯示佔位圖 | assigned | frontend | 菜單 | `features/frontend/菜單/空菜單與缺圖.feature` | 餐點缺少圖片時仍保留餐點卡並明確提示 / 顧客瀏覽沒有圖片的餐點 | image_url 可為空；UI 顯示佔位圖 |
| `features/acceptance/顧客瀏覽餐點與分類.feature` | 缺少餐點資料時仍須明確呈現 | 餐點缺少部分資訊時仍保留在菜單 | `FR-002`; `SC-001`; `SC-002` | 缺圖片時菜單仍回傳該餐點 | assigned | backend | 菜單 | `features/backend/菜單/缺圖餐點讀取.feature` | 缺少圖片不得導致餐點從菜單結果消失 / 菜單包含沒有圖片的餐點 | OpenAPI image_url nullable |
| `features/acceptance/顧客瀏覽餐點與分類.feature` | 缺少餐點資料時仍須明確呈現 | 餐點缺少部分資訊時仍保留在菜單 | `FR-002`; `SC-001`; `SC-002` | 缺價格或分類時保留餐點並顯示明確空值提示 | assigned | backend; frontend | 菜單 | `features/backend/菜單/缺圖餐點讀取.feature`; `features/frontend/菜單/空菜單與缺圖.feature` | 菜單包含沒有價格的餐點；菜單包含沒有分類的餐點 / 顧客瀏覽沒有價格的餐點；顧客瀏覽沒有分類的餐點 | DBML 與 OpenAPI 均允許空值；兩個介面分別驗證保留餐點及明確提示。 |
| `features/acceptance/顧客瀏覽餐點與分類.feature` | 沒有餐點時顧客仍能辨識菜單狀態 | 顧客開啟尚無餐點的菜單 | `FR-001`; `SC-001` | 顧客看到空菜單且無虛構餐點 | assigned | frontend | 菜單 | `features/frontend/菜單/空菜單與缺圖.feature` | 沒有餐點時顧客可以辨識空菜單狀態 / 顧客開啟空菜單 | 驗證 UI 空狀態 |
| `features/acceptance/顧客瀏覽餐點與分類.feature` | 沒有餐點時顧客仍能辨識菜單狀態 | 顧客開啟尚無餐點的菜單 | `FR-001`; `SC-001` | 空菜單回傳空餐點集合 | assigned | backend | 菜單 | `features/backend/菜單/依分類讀取餐點.feature` | 沒有菜單資料時回傳空的餐點集合 / 顧客檢視尚無餐點的菜單 | 分類存在不代表餐點集合非空 |

## Coverage Summary

- Acceptance Examples: 3
- In-scope spec requirement IDs: 4
- Requirements mapped to acceptance Examples: 4
- Unmapped spec requirements: 0
- Assigned assertions: 7
- Unmapped assertions: 0
- Blocked assertions: 0
- Derived interface Examples: 11

## Open Decisions

| Acceptance source | Unresolved decision or conflict | Impacted interface / module | Next action |
| --- | --- | --- | --- |
| None | None | None | None |

---

### 002-shopping-cart-total-calculation

## Sources

- Acceptance Feature root: `features/acceptance/`
- System analysis: `plan.md`
- Spec requirements: `spec.md`

## Coverage Matrix

| Acceptance Feature | Acceptance Rule | Acceptance Example | Spec Requirement IDs | Acceptance assertion / invariant | Status | Interface | Module | Derived Feature | Derived Rule / Example | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `features/acceptance/顧客管理購物車與金額.feature` | 顧客可以將依規格選擇的供應中餐點加入購物車 | 顧客選完每個規格群組後加入餐點 | `FR-001`; `FR-002`; `FR-004`; `FR-005`; `BR-001`; `BR-002`; `SC-001`; `SC-002`; `SC-004` | 有效規格加入 session cart 並以權威價格計算 | assigned | frontend | 購物車 | `features/frontend/購物車/餐點與購物車操作.feature` | 顧客依規格選擇加入供應中的餐點 / 顧客選完每個規格群組後加入餐點 | 互動與顯示規格選擇結果 |
| `features/acceptance/顧客管理購物車與金額.feature` | 顧客可以將依規格選擇的供應中餐點加入購物車 | 顧客選完每個規格群組後加入餐點 | `FR-001`; `FR-002`; `FR-004`; `FR-005`; `BR-001`; `BR-002`; `SC-001`; `SC-002`; `SC-004` | 有效選項完整、正確持久化且不合併工作階段 | assigned | backend | 購物車 | `features/backend/購物車/新增與隔離.feature` | 每個規格群組恰選一個有效選項後才能新增項目 / 供應中餐點依完整規格選擇加入目前工作階段購物車 | 交易驗證群組選項歸屬及權威金額 |
| `features/acceptance/顧客管理購物車與金額.feature` | 顧客可以將依規格選擇的供應中餐點加入購物車 | 顧客無法加入未供應餐點或未選完整規格的餐點 | `FR-002`; `FR-003`; `BR-002`; `SC-004` | 不可用餐點或未完成規格均拒絕且購物車不變 | assigned | frontend | 購物車 | `features/frontend/購物車/餐點與購物車操作.feature` | 顧客依規格選擇加入供應中的餐點 / 未供應餐點加入遭拒；未完成規格選擇時加入遭拒 | 分成兩個單一操作案例 |
| `features/acceptance/顧客管理購物車與金額.feature` | 顧客可以將依規格選擇的供應中餐點加入購物車 | 顧客無法加入未供應餐點或未選完整規格的餐點 | `FR-002`; `FR-003`; `BR-002`; `SC-004` | 失敗新增不留部分項目或規格關聯 | assigned | backend | 購物車 | `features/backend/購物車/新增與隔離.feature` | 每個規格群組恰選一個有效選項後才能新增項目 / 未供應餐點加入遭拒；規格群組未選完整時新增遭拒 | 驗證 response 及 cart 權威狀態不變 |
| `features/acceptance/顧客管理購物車與金額.feature` | 顧客管理購物車後金額依目前可用項目重新計算 | 顧客修改數量與刪除項目後看到最新總額 | `FR-004`; `FR-005`; `FR-006`; `FR-007`; `BR-001`; `BR-003`; `SC-002`; `SC-003` | 讀取、數量變更與刪除後總額等於剩餘可用項目 | assigned | frontend | 購物車 | `features/frontend/購物車/餐點與購物車操作.feature` | 顧客調整購物車後看到依目前資料計算的金額 / 顧客修改可用項目數量；顧客刪除購物車項目 | UI 顯示與操作結果 |
| `features/acceptance/顧客管理購物車與金額.feature` | 顧客管理購物車後金額依目前可用項目重新計算 | 顧客修改數量與刪除項目後看到最新總額 | `FR-004`; `FR-005`; `FR-006`; `FR-007`; `BR-001`; `BR-003`; `SC-002`; `SC-003` | 後端保存正整數數量並從目前價格重算 | assigned | backend | 購物車 | `features/backend/購物車/查詢與維護.feature` | 修改與刪除項目後購物車狀態保持一致 / 修改數量後重算項目與總金額；刪除項目後依剩餘項目重算總額 | 驗證 DB 狀態及重讀結果 |
| `features/acceptance/顧客管理購物車與金額.feature` | 顧客管理購物車後金額依目前可用項目重新計算 | 菜單價格變更後以目前價格更新購物車 | `FR-005`; `FR-006`; `FR-007`; `BR-001`; `SC-002`; `SC-003` | 舊 cart 項目讀取時採新價格 | assigned | frontend | 購物車 | `features/frontend/購物車/餐點與購物車操作.feature` | 顧客調整購物車後看到依目前資料計算的金額 / 菜單價格變更後顧客看到最新金額 | UI 顯示新價格提示與總額 |
| `features/acceptance/顧客管理購物車與金額.feature` | 顧客管理購物車後金額依目前可用項目重新計算 | 菜單價格變更後以目前價格更新購物車 | `FR-005`; `FR-006`; `FR-007`; `BR-001`; `SC-002`; `SC-003` | API 不保存舊價格快照且使用最新權威資料 | assigned | backend | 購物車 | `features/backend/購物車/查詢與維護.feature` | 購物車金額必須依權威菜單資料計算 / 菜單價格更新後重新讀取購物車 | 重讀 menu／options 資料後重算 |
| `features/acceptance/顧客管理購物車與金額.feature` | 顧客管理購物車後金額依目前可用項目重新計算 | 顧客端提供的金額不能改變系統計價 | `FR-005`; `BR-001`; `SC-002` | client 金額不是持久化或計價權威 | assigned | backend | 購物車 | `features/backend/購物車/查詢與維護.feature` | 購物車金額必須依權威菜單資料計算 / 顧客端提供的金額不能成為計價依據 | 驗證權威資料計價，不寫入 client amount |
| `features/acceptance/顧客管理購物車與金額.feature` | 不可用購物車項目須保留並排除於總額 | 餐點或規格停止供應後仍可移除購物車項目 | `FR-008`; `SC-005` | 不可用項目保留、不給金額且排除總額；數量變更拒絕、刪除允許 | assigned | frontend | 購物車 | `features/frontend/購物車/餐點與購物車操作.feature` | 不可用項目保留供顧客確認及移除 / 停供項目不顯示金額且不計入總額；顧客無法修改不可用項目數量；顧客仍可刪除不可用項目 | 拆分檢視、PATCH、DELETE 行為 |
| `features/acceptance/顧客管理購物車與金額.feature` | 不可用購物車項目須保留並排除於總額 | 餐點或規格停止供應後仍可移除購物車項目 | `FR-008`; `SC-005` | unavailable row 保留、不可計價／修改但可刪除 | assigned | backend | 購物車 | `features/backend/購物車/查詢與維護.feature` | 不可用項目保留但不得計價或修改數量 / 讀取購物車時保留不可用項目但排除金額；不可用項目數量更新遭拒；刪除不可用項目仍獲允許 | 驗證持久化狀態與錯誤後不變量 |
| `features/acceptance/顧客管理購物車與金額.feature` | 不同訪客工作階段的購物車互相隔離 | 不同顧客無法看到彼此的購物車 | `FR-004`; `SC-004` | 每個 session 僅能讀取自己的購物車 | assigned | frontend | 購物車 | `features/frontend/購物車/餐點與購物車操作.feature` | 不同工作階段的購物車互相隔離 / 顧客只看到目前工作階段的購物車 | 兩個瀏覽器工作階段互相隔離 |
| `features/acceptance/顧客管理購物車與金額.feature` | 不同訪客工作階段的購物車互相隔離 | 不同顧客無法看到彼此的購物車 | `FR-004`; `SC-004` | session A cart 不可由 session B 讀取或修改 | assigned | backend | 購物車 | `features/backend/購物車/新增與隔離.feature` | 每筆購物車只能由建立該購物車的訪客工作階段讀取 / 第二個工作階段讀取不到第一個工作階段的項目 | 使用不同 server-signed sessions 驗證隔離 |
| `features/acceptance/顧客管理購物車與金額.feature` | 空購物車仍呈現清楚狀態 | 顧客開啟空購物車看到零總額 | `US2`; `FR-006` | 空購物車顯示空狀態，總金額為零 | assigned | frontend; backend | 購物車 | `features/frontend/購物車/餐點與購物車操作.feature`; `features/backend/購物車/查詢與維護.feature` | 顧客在空車時可辨識購物車狀態 / 顧客開啟空購物車；空購物車讀取回傳零總額 / 顧客讀取空購物車 | Spec 邊界情況明定空車狀態與零總額。 |

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

---

### 003-order-creation-inquiry

## Sources

- Acceptance Feature root: `features/acceptance/`
- System analysis: `plan.md`
- Spec requirements: `spec.md`

## Coverage Matrix

| Acceptance Feature | Acceptance Rule | Acceptance Example | Spec Requirement IDs | Acceptance assertion / invariant | Status | Interface | Module | Derived Feature | Derived Rule / Example | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `features/acceptance/顧客建立與查詢訂單.feature` | 顧客可將可用購物車建立為訂單 | 顧客確認購物車後取得訂單紀錄 | `FR-001`; `FR-002`; `FR-003`; `FR-006`; `FR-010`; `FR-011`; `BR-001`; `BR-003`; `SC-001`; `SC-002`; `SC-006` | 建立唯一訂單、快照金額與明細並清空同 session 購物車 | assigned | frontend | 訂單 | `features/frontend/訂單/確認與查詢訂單.feature` | 顧客確認可用購物車後取得訂單結果 / 顧客確認購物車並看到訂單明細 | 顯示伺服器建立的訂單結果 |
| `features/acceptance/顧客建立與查詢訂單.feature` | 顧客可將可用購物車建立為訂單 | 顧客確認購物車後取得訂單紀錄 | `FR-001`; `FR-002`; `FR-003`; `FR-004`; `FR-006`; `FR-007`; `FR-010`; `FR-011`; `BR-001`; `BR-002`; `BR-003`; `SC-001`; `SC-002`; `SC-004`; `SC-006` | 原子建單、供應驗證、冪等及快照寫入 | assigned | backend | 訂單 | `features/backend/訂單/建立與查詢訂單.feature` | 建立訂單時保存唯一訂單編號及建立時明細快照 / 可用購物車建立一筆訂單並清空購物車 | 單一交易寫入 order/items/options 並清 cart |
| `features/acceptance/顧客建立與查詢訂單.feature` | 顧客可將可用購物車建立為訂單 | 顧客端金額不會覆寫訂單快照 | `FR-003`; `FR-011`; `BR-001`; `SC-002` | 伺服器只依建立當下菜單價格持久化金額，不採信請求金額 | assigned | backend | 訂單 | `features/backend/訂單/建立與查詢訂單.feature` | 建立訂單時保存唯一訂單編號及建立時明細快照 / 顧客端金額不會覆寫訂單快照 | API contract 接受相容金額欄位但忽略其計價作用。 |
| `features/acceptance/顧客建立與查詢訂單.feature` | 不符合建立條件的購物車不得建立訂單 | 空購物車或含不可用項目時建立訂單被拒絕 | `FR-004`; `FR-005`; `BR-002`; `SC-003` | 無可用項目時拒絕且保留購物車、不寫入訂單 | assigned | frontend | 訂單 | `features/frontend/訂單/確認與查詢訂單.feature` | 不符合建立條件的購物車不得建立訂單 / 購物車沒有可用項目時無法送單 | 顯示拒絕狀態並保留 cart |
| `features/acceptance/顧客建立與查詢訂單.feature` | 不符合建立條件的購物車不得建立訂單 | 空購物車或含不可用項目時建立訂單被拒絕 | `FR-004`; `FR-005`; `BR-002`; `SC-003` | 重驗供應狀態並拒絕空／不可用 cart | assigned | backend | 訂單 | `features/backend/訂單/建立與查詢訂單.feature` | 建立訂單時保存唯一訂單編號及建立時明細快照 / 購物車沒有可用項目時拒絕且保留購物車 | 不提交訂單或 cart 清空 |
| `features/acceptance/顧客建立與查詢訂單.feature` | 不符合建立條件的購物車不得建立訂單 | 顧客因未收到首次結果而再次送出同一筆訂單 | `FR-007`; `BR-003`; `SC-004` | 同一 session/key 重送回原訂單，不建立第二筆 | assigned | backend | 訂單 | `features/backend/訂單/建立與查詢訂單.feature` | 建立訂單時保存唯一訂單編號及建立時明細快照 / 相同冪等請求重送回傳原訂單 | 命中有效冪等 mapping |
| `features/acceptance/顧客建立與查詢訂單.feature` | 顧客只能查詢自己建立的訂單與建立時金額 | 顧客使用訂單編號查詢自己的訂單 | `FR-008`; `FR-009`; `FR-010`; `FR-011`; `SC-005` | 同 session 查詢取得持久化狀態、明細與建立時金額快照 | assigned | frontend | 訂單 | `features/frontend/訂單/確認與查詢訂單.feature` | 顧客只能查詢自己建立的訂單快照 / 顧客查詢自己建立的訂單 | 顯示查詢結果快照 |
| `features/acceptance/顧客建立與查詢訂單.feature` | 顧客只能查詢自己建立的訂單與建立時金額 | 顧客使用訂單編號查詢自己的訂單 | `FR-008`; `FR-009`; `FR-010`; `FR-011`; `SC-005` | 訂單查詢回傳原快照、不依新菜單價格重算 | assigned | backend | 訂單 | `features/backend/訂單/建立與查詢訂單.feature` | 訂單查詢限建立訂單的訪客工作階段 / 同一工作階段查詢訂單回傳保存的快照 | SQL query 以 order_number 與 session 同時限定 |
| `features/acceptance/顧客建立與查詢訂單.feature` | 顧客只能查詢自己建立的訂單與建立時金額 | 其他訪客無法查詢該訂單 | `FR-010`; `SC-005` | 跨 session 查詢不洩漏訂單內容或存在性 | assigned | frontend | 訂單 | `features/frontend/訂單/確認與查詢訂單.feature` | 顧客只能查詢自己建立的訂單快照 / 其他工作階段查不到該訂單 | 統一查無呈現 |
| `features/acceptance/顧客建立與查詢訂單.feature` | 顧客只能查詢自己建立的訂單與建立時金額 | 其他訪客無法查詢該訂單 | `FR-010`; `SC-005` | 跨 session query 使用與不存在 order 相同的結果 | assigned | backend | 訂單 | `features/backend/訂單/建立與查詢訂單.feature` | 訂單查詢限建立訂單的訪客工作階段 / 不同工作階段查詢訂單不洩漏存在性 | 不洩漏 order existence |

## Coverage Summary

- Acceptance Examples: 6
- In-scope spec requirement IDs: 14
- Requirements mapped to acceptance Examples: 14
- Unmapped spec requirements: 0
- Assigned assertions: 6
- Unmapped assertions: 0
- Blocked assertions: 0
- Derived interface Examples: 10

## Open Decisions

| Acceptance source | Unresolved decision or conflict | Impacted interface / module | Next action |
| --- | --- | --- | --- |
| None | None | None | None |

---

### 004-merchant-serving-workflow

## Sources

- Acceptance Feature root: `features/acceptance/`
- System analysis: `plan.md`
- Spec requirements: `spec.md`

## Coverage Matrix

| Acceptance Feature | Acceptance Rule | Acceptance Example | Spec Requirement IDs | Acceptance assertion / invariant | Status | Interface | Module | Derived Feature | Derived Rule / Example | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `features/acceptance/店家處理訂單與出餐.feature` | 店家可以檢視訂單佇列與訂單快照 | 店家查看待處理訂單及其明細 | `FR-001`; `FR-002`; `FR-003`; `FR-012`; `BR-001`; `SC-001`; `SC-006` | 店家列表及詳情使用建立時快照 | assigned | frontend | 店家訂單 | `features/frontend/店家訂單/訂單看板.feature` | 店家可依狀態檢視訂單與建立時快照 / 店家查看待處理訂單列表；店家查看單筆訂單明細 | 列表與詳情分開操作 |
| `features/acceptance/店家處理訂單與出餐.feature` | 店家可以檢視訂單佇列與訂單快照 | 店家查看待處理訂單及其明細 | `FR-001`; `FR-002`; `FR-003`; `FR-012`; `BR-001`; `SC-001`; `SC-006` | API 回傳正確摘要欄位與完整快照 | assigned | backend | 訂單 | `features/backend/訂單/店家訂單與出餐.feature` | 有權限的店家可以讀取訂單列表與快照詳情 / 店家依狀態篩選訂單列表；店家讀取單筆訂單快照 | 按端點契約及 DB 權威快照驗證 |
| `features/acceptance/店家處理訂單與出餐.feature` | 店家可以檢視訂單佇列與訂單快照 | 未獲授權的人員無法查看訂單 | `FR-010`; `SC-005` | 未授權請求不讀取或洩漏訂單資料 | assigned | frontend | 店家訂單 | `features/frontend/店家訂單/訂單看板.feature` | 有權限的店家可以讀取訂單列表與快照詳情 / 未授權店家看不到訂單 | UI 不呈現列表 |
| `features/acceptance/店家處理訂單與出餐.feature` | 店家可以檢視訂單佇列與訂單快照 | 未獲授權的人員無法查看訂單 | `FR-010`; `SC-005` | 店家憑證錯誤時拒絕讀取 | assigned | backend | 訂單 | `features/backend/訂單/店家訂單與出餐.feature` | 有權限的店家可以讀取訂單列表與快照詳情 / 未授權請求無法讀取訂單 | 授權失敗不得返回資料 |
| `features/acceptance/店家處理訂單與出餐.feature` | 訂單依店家出餐流程逐步前進 | 店家接單、開始出餐並完成訂單 | `FR-004`; `FR-005`; `FR-006`; `FR-007`; `FR-008`; `FR-009`; `FR-012`; `FR-013`; `FR-015`; `BR-001`; `BR-002`; `SC-002`; `SC-003`; `SC-006` | 三個前進 transition 逐步保存且快照不變 | assigned | frontend | 店家訂單 | `features/frontend/店家訂單/訂單看板.feature` | 店家只能按流程推進訂單狀態 / 店家接受已建立訂單；店家開始準備已接單訂單；店家完成出餐中的訂單 | 每個操作獨立呈現 |
| `features/acceptance/店家處理訂單與出餐.feature` | 訂單依店家出餐流程逐步前進 | 店家接單、開始出餐並完成訂單 | `FR-004`; `FR-005`; `FR-006`; `FR-007`; `FR-008`; `FR-009`; `FR-012`; `FR-013`; `FR-015`; `BR-001`; `BR-002`; `SC-002`; `SC-003`; `SC-006` | 狀態更新依 expected state 條件寫入且不改快照 | assigned | backend | 訂單 | `features/backend/訂單/店家訂單與出餐.feature` | 店家狀態操作只能依有限狀態機前進 / created 訂單接受後持久化為 accepted；accepted 訂單開始出餐後持久化為 preparing；preparing 訂單完成後持久化為 completed | 分別驗證三個 operation |
| `features/acceptance/店家處理訂單與出餐.feature` | 訂單依店家出餐流程逐步前進 | 店家無法跳過流程或倒退已完成訂單 | `FR-006`; `FR-009`; `BR-002`; `SC-003` | 非法或倒退轉換拒絕且狀態不變 | assigned | frontend | 店家訂單 | `features/frontend/店家訂單/訂單看板.feature` | 店家只能按流程推進訂單狀態 / 非法狀態操作遭拒且畫面維持原狀 | 看板錯誤狀態及原值 |
| `features/acceptance/店家處理訂單與出餐.feature` | 訂單依店家出餐流程逐步前進 | 店家無法跳過流程或倒退已完成訂單 | `FR-006`; `FR-009`; `BR-002`; `SC-003` | 非法 transition 不寫入且不改快照 | assigned | backend | 訂單 | `features/backend/訂單/店家訂單與出餐.feature` | 店家狀態操作只能依有限狀態機前進 / 非法狀態轉換被拒絕且持久化狀態不變 | 期待 409 與重新讀取不變 |
| `features/acceptance/店家處理訂單與出餐.feature` | 訂單依店家出餐流程逐步前進 | 店家接單、開始出餐並完成訂單 | `FR-011`; `FR-014`; `BR-003`; `SC-004` | 顧客 query 反映店家寫入同一持久化狀態 | assigned | frontend | 顧客訂單 | `features/frontend/顧客訂單/查詢狀態.feature` | 顧客查詢呈現持久化的最新出餐狀態 / 顧客看到店家接單後的狀態；顧客看到店家完成出餐後的狀態 | 顧客呈現標籤 |
| `features/acceptance/店家處理訂單與出餐.feature` | 訂單依店家出餐流程逐步前進 | 店家接單、開始出餐並完成訂單 | `FR-011`; `FR-014`; `BR-003`; `SC-004` | 顧客與店家讀取同一權威 status | assigned | backend | 訂單 | `features/backend/訂單/店家訂單與出餐.feature` | 顧客查詢與店家讀取同一個持久化狀態 / 顧客查詢反映店家已更新的狀態 | 使用 003 session ownership 查詢同一 order |

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

---

### 005-payment-order-cancellation

## Sources

- Acceptance Feature root: `features/acceptance/`
- System analysis: `plan.md`
- Spec requirements: `spec.md`

## Coverage Matrix

| Acceptance Feature | Acceptance Rule | Acceptance Example | Spec Requirement IDs | Acceptance assertion / invariant | Status | Interface | Module | Derived Feature | Derived Rule / Example | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `features/acceptance/顧客付款與取消訂單.feature` | 顧客可使用訂單建立時的應付金額付款 | 顧客完成付款並查看付款狀態 | `FR-001`; `FR-002`; `FR-010`; `FR-015`; `BR-001`; `BR-002`; `SC-001` | 成功付款使用訂單快照並保留出餐狀態 | assigned | frontend | 顧客訂單 | `features/frontend/顧客訂單/付款與取消.feature` | 付款結果使用訂單快照金額且不改變出餐狀態 / 顧客成功付款後看到已付款狀態 | UI 顯示兩個正交狀態 |
| `features/acceptance/顧客付款與取消訂單.feature` | 顧客可使用訂單建立時的應付金額付款 | 顧客完成付款並查看付款狀態 | `FR-001`; `FR-002`; `FR-010`; `FR-015`; `BR-001`; `BR-002`; `SC-001` | 後端保存 paid 並以 total_amount 快照付款 | assigned | backend | 訂單 | `features/backend/訂單/付款與取消.feature` | 付款金額以訂單快照為準並保存正交付款狀態 / 付款成功後保存 paid 狀態及快照金額 | paid 與出餐 status 分別驗證 |
| `features/acceptance/顧客付款與取消訂單.feature` | 顧客可使用訂單建立時的應付金額付款 | 顧客端提交不同金額不會改變應付金額 | `FR-006`; `FR-010`; `BR-001`; `SC-005` | client amount 不會覆寫應付金額或快照 | assigned | frontend | 顧客訂單 | `features/frontend/顧客訂單/付款與取消.feature` | 付款結果使用訂單快照金額且不改變出餐狀態 / 顧客嘗試以錯誤金額付款仍依訂單快照計價 | 驗證金額顯示維持 server snapshot |
| `features/acceptance/顧客付款與取消訂單.feature` | 顧客可使用訂單建立時的應付金額付款 | 顧客端提交不同金額不會改變應付金額 | `FR-006`; `FR-010`; `BR-001`; `SC-005` | pay result 依 orders.total_amount，不採信 request amount | assigned | backend | 訂單 | `features/backend/訂單/付款與取消.feature` | 付款金額以訂單快照為準並保存正交付款狀態 / 付款請求金額不會覆寫訂單快照 | 驗證權威計價及快照不變 |
| `features/acceptance/顧客付款與取消訂單.feature` | 顧客可使用訂單建立時的應付金額付款 | 已付款或付款處理中的訂單不會重複扣款 | `FR-003`; `FR-010`; `BR-002`; `SC-001` | paid 或 non-stale pending 不啟動第二次付款 | assigned | frontend | 顧客訂單 | `features/frontend/顧客訂單/付款與取消.feature` | 付款結果使用訂單快照金額且不改變出餐狀態 / 已付款訂單或處理中訂單不會重複扣款 | UI 顯示已付款／處理中結果 |
| `features/acceptance/顧客付款與取消訂單.feature` | 顧客可使用訂單建立時的應付金額付款 | 已付款或付款處理中的訂單不會重複扣款 | `FR-003`; `FR-010`; `BR-002`; `SC-001` | 後端不建立第二個 payment attempt | assigned | backend | 訂單 | `features/backend/訂單/付款與取消.feature` | 付款金額以訂單快照為準並保存正交付款狀態 / 已付款訂單拒絕再次扣款；非 stale pending 訂單拒絕新付款 | 409 或原結果且狀態不變 |
| `features/acceptance/顧客付款與取消訂單.feature` | 付款失敗後顧客可以安全重試 | 付款失敗後以同一訂單再次付款成功 | `FR-004`; `FR-005`; `FR-010`; `FR-015`; `SC-002` | failed 可重試並轉 paid，快照不變 | assigned | frontend | 顧客訂單 | `features/frontend/顧客訂單/付款與取消.feature` | 付款結果使用訂單快照金額且不改變出餐狀態 / 付款失敗後顧客可以重試成功 | UI 顯示可重試及成功結果 |
| `features/acceptance/顧客付款與取消訂單.feature` | 付款失敗後顧客可以安全重試 | 付款失敗後以同一訂單再次付款成功 | `FR-004`; `FR-005`; `FR-010`; `FR-015`; `SC-002` | failed 訂單重試成功，保留前次失敗摘要 | assigned | backend | 訂單 | `features/backend/訂單/付款與取消.feature` | 付款失敗可重試且冪等只保護成功結果 / 付款失敗後重試可更新為 paid | 付款狀態及 history 欄位驗證 |
| `features/acceptance/顧客付款與取消訂單.feature` | 付款失敗後顧客可以安全重試 | 顧客重送已成功的同一付款請求 | `FR-012`; `FR-015`; `BR-004`; `SC-006` | 同 key 重送回原成功結果，不重複扣款 | assigned | frontend | 顧客訂單 | `features/frontend/顧客訂單/付款與取消.feature` | 付款結果使用訂單快照金額且不改變出餐狀態 / 顧客重送成功付款請求不會重複扣款 | 顯示原結果 |
| `features/acceptance/顧客付款與取消訂單.feature` | 付款失敗後顧客可以安全重試 | 顧客重送已成功的同一付款請求 | `FR-012`; `FR-015`; `BR-004`; `SC-006` | 只有 paid 成功寫入冪等 mapping，重送不二次執行 | assigned | backend | 訂單 | `features/backend/訂單/付款與取消.feature` | 付款失敗可重試且冪等只保護成功結果 / 已成功付款請求以相同冪等鍵重送 | 驗證 paid mapping 及結果一致 |
| `features/acceptance/顧客付款與取消訂單.feature` | 顧客只能在訂單尚未接單時取消 | 顧客取消尚未接單且未付款的訂單 | `FR-007`; `FR-009`; `FR-011`; `FR-013`; `FR-015`; `BR-003`; `SC-003` | created/unpaid 可取消，保留訂單快照並阻擋後續操作 | assigned | frontend | 顧客訂單 | `features/frontend/顧客訂單/付款與取消.feature` | 顧客僅能在允許的狀態取消訂單 / 顧客取消尚未付款且未接單的訂單 | UI 顯示 cancelled，保留明細 |
| `features/acceptance/顧客付款與取消訂單.feature` | 顧客只能在訂單尚未接單時取消 | 顧客取消尚未接單且未付款的訂單 | `FR-007`; `FR-009`; `FR-011`; `FR-013`; `FR-015`; `BR-003`; `SC-003` | backend 交易取消 order 且後續 pay/merchant action 拒絕 | assigned | backend | 訂單 | `features/backend/訂單/付款與取消.feature` | 顧客取消與付款狀態在同一權威訂單上協調 / created unpaid 訂單取消後禁止付款及出餐 | 驗證狀態與快照不變 |
| `features/acceptance/顧客付款與取消訂單.feature` | 顧客只能在訂單尚未接單時取消 | 顧客取消已付款但尚未接單的訂單 | `FR-007`; `FR-009`; `FR-011`; `FR-013`; `BR-003`; `BR-004`; `SC-003` | paid cancel 同步 refunded 並保留快照 | assigned | frontend | 顧客訂單 | `features/frontend/顧客訂單/付款與取消.feature` | 顧客僅能在允許的狀態取消訂單 / 顧客取消已付款但未接單的訂單後看到退款 | UI 顯示已退款 |
| `features/acceptance/顧客付款與取消訂單.feature` | 顧客只能在訂單尚未接單時取消 | 顧客取消已付款但尚未接單的訂單 | `FR-007`; `FR-009`; `FR-011`; `FR-013`; `BR-003`; `BR-004`; `SC-003` | backend 同一交易 cancelled+refunded 並記 refunded_at | assigned | backend | 訂單 | `features/backend/訂單/付款與取消.feature` | 顧客取消與付款狀態在同一權威訂單上協調 / paid 訂單取消時同步標記 refunded | 原子狀態轉換 |
| `features/acceptance/顧客付款與取消訂單.feature` | 顧客只能在訂單尚未接單時取消 | 顧客無法取消已進入出餐流程的訂單 | `FR-008`; `FR-011`; `FR-013`; `BR-003`; `SC-004` | 非 created 訂單取消遭拒且雙狀態不變 | assigned | frontend | 顧客訂單 | `features/frontend/顧客訂單/付款與取消.feature` | 顧客僅能在允許的狀態取消訂單 / 已接單後顧客無法取消訂單 | 顯示拒絕結果 |
| `features/acceptance/顧客付款與取消訂單.feature` | 顧客只能在訂單尚未接單時取消 | 顧客無法取消已進入出餐流程的訂單 | `FR-008`; `FR-011`; `FR-013`; `BR-003`; `SC-004` | backend 依持久化出餐狀態拒絕並保留付款狀態 | assigned | backend | 訂單 | `features/backend/訂單/付款與取消.feature` | 顧客取消與付款狀態在同一權威訂單上協調 / 非 created 訂單拒絕顧客取消 | 權威狀態及 timestamps 不變 |
| `features/acceptance/顧客付款與取消訂單.feature` | 顧客只能在訂單尚未接單時取消 | 付款仍有效處理中時不得取消，過期處理才可安全取消 | `FR-013`; `FR-015`; `BR-003`; `BR-004`; `SC-004` | non-stale pending cancel 拒絕；stale pending 同交易 failed+cancelled | assigned | frontend | 顧客訂單 | `features/frontend/顧客訂單/付款與取消.feature` | 顧客僅能在允許的狀態取消訂單 / 付款仍處理中時取消遭拒；付款處理逾時後取消可安全完成 | 依 API 結果呈現 |
| `features/acceptance/顧客付款與取消訂單.feature` | 顧客只能在訂單尚未接單時取消 | 付款仍有效處理中時不得取消，過期處理才可安全取消 | `FR-013`; `FR-015`; `BR-003`; `BR-004`; `SC-004` | stale pending 中止、non-stale pending 不變，避免 pending+cancelled | assigned | backend | 訂單 | `features/backend/訂單/付款與取消.feature` | 顧客取消與付款狀態在同一權威訂單上協調 / 非 stale pending 拒絕取消；stale pending 同一交易中止付款並取消 | 需要資料庫交易驗證 |
| `features/acceptance/顧客付款與取消訂單.feature` | 顧客查詢反映持久化的付款與取消狀態 | 顧客查詢付款失敗訂單 | `FR-016`; `FR-004`; `SC-002` | 查詢回傳付款失敗標籤、出餐狀態與建立時快照 | assigned | frontend | 顧客訂單 | `features/frontend/顧客訂單/付款狀態查詢.feature` | 顧客查詢付款失敗訂單 / 顧客看到失敗狀態及快照 | 顯示持久化結果 |
| `features/acceptance/顧客付款與取消訂單.feature` | 顧客查詢反映持久化的付款與取消狀態 | 顧客查詢付款失敗訂單 | `FR-016`; `FR-004`; `SC-002` | API 回傳 failed、標籤及快照 | assigned | backend | 訂單 | `features/backend/訂單/付款狀態查詢.feature` | 查詢反映持久化付款狀態 / 查詢付款失敗訂單 | 依訪客 session 限定讀取 |
| `features/acceptance/顧客付款與取消訂單.feature` | 顧客查詢反映持久化的付款與取消狀態 | 顧客查詢已取消訂單 | `FR-016`; `FR-009`; `FR-013`; `BR-003` | cancelled 與付款標籤及建立快照仍可查詢 | assigned | frontend | 顧客訂單 | `features/frontend/顧客訂單/付款狀態查詢.feature` | 顧客查詢已取消訂單 / 顧客看到取消及付款狀態 | 不洩漏其他 session 訂單 |
| `features/acceptance/顧客付款與取消訂單.feature` | 顧客查詢反映持久化的付款與取消狀態 | 顧客查詢已取消訂單 | `FR-016`; `FR-009`; `FR-013`; `BR-003` | API 回傳 cancelled/refunded 狀態與建立快照 | assigned | backend | 訂單 | `features/backend/訂單/付款狀態查詢.feature` | 查詢反映持久化付款狀態 / 查詢已取消訂單 | 以訂單持久化欄位為權威 |
| `features/acceptance/顧客付款與取消訂單.feature` | 店家可檢視並篩選訂單付款資訊 | 店家依付款狀態篩選訂單 | `FR-017`; `FR-018`; `FR-020`; `FR-015`; `BR-004` | 店家列表依付款狀態篩選並顯示雙狀態及快照 | assigned | frontend | 店家訂單 | `features/frontend/店家訂單/付款資訊.feature` | 店家依付款狀態篩選訂單 / 列表顯示付款與出餐資訊 | 有效店家憑證才能查看 |
| `features/acceptance/顧客付款與取消訂單.feature` | 店家可檢視並篩選訂單付款資訊 | 店家依付款狀態篩選訂單 | `FR-017`; `FR-018`; `FR-020`; `FR-015`; `BR-004` | API 列表與詳情含付款狀態並依 payment_status 篩選 | assigned | backend | 店家訂單 | `features/backend/店家訂單/付款資訊.feature` | 店家依付款狀態篩選訂單 / 篩選回傳付款狀態訂單 | 對齊 004 店家權限契約 |
| `features/acceptance/顧客付款與取消訂單.feature` | 店家可檢視並篩選訂單付款資訊 | 無效店家憑證無法讀取付款資訊 | `FR-020`; `FR-017` | 無效憑證拒絕且不揭露訂單內容 | assigned | frontend | 店家訂單 | `features/frontend/店家訂單/付款資訊.feature` | 無效店家憑證無法讀取付款資訊 / 看板不顯示付款資料 | 401／503 沿用第四迭代政策 |
| `features/acceptance/顧客付款與取消訂單.feature` | 店家可檢視並篩選訂單付款資訊 | 無效店家憑證無法讀取付款資訊 | `FR-020`; `FR-017` | API 拒絕未授權讀取且不回傳訂單 | assigned | backend | 店家訂單 | `features/backend/店家訂單/付款資訊.feature` | 無效店家憑證無法讀取付款資訊 / 無效憑證讀取遭拒 | 沿用 004 auth contract |
| `features/acceptance/顧客付款與取消訂單.feature` | 已取消訂單不得再進入店家出餐流程 | 店家不能接單已取消訂單 | `FR-019`; `BR-003`; `SC-003` | cancelled 訂單拒絕接單且狀態不變 | assigned | frontend | 店家訂單 | `features/frontend/店家訂單/取消訂單護欄.feature` | 店家不能接單已取消訂單 / 看板拒絕接單 | 維持付款與出餐狀態 |
| `features/acceptance/顧客付款與取消訂單.feature` | 已取消訂單不得再進入店家出餐流程 | 店家不能接單已取消訂單 | `FR-019`; `BR-003`; `SC-003` | cancelled 訂單拒絕 accept operation | assigned | backend | 店家訂單 | `features/backend/店家訂單/取消訂單護欄.feature` | 店家不能接單已取消訂單 / API 拒絕接單 | 權威狀態不變 |
| `features/acceptance/顧客付款與取消訂單.feature` | 已取消訂單不得再進入店家出餐流程 | 店家不能推進已取消訂單 | `FR-019`; `BR-003`; `SC-003` | cancelled 訂單拒絕出餐狀態推進 | assigned | frontend | 店家訂單 | `features/frontend/店家訂單/取消訂單護欄.feature` | 店家不能推進已取消訂單 / 看板拒絕狀態操作 | 維持付款與出餐狀態 |
| `features/acceptance/顧客付款與取消訂單.feature` | 已取消訂單不得再進入店家出餐流程 | 店家不能推進已取消訂單 | `FR-019`; `BR-003`; `SC-003` | cancelled 訂單拒絕 start/complete operation | assigned | backend | 店家訂單 | `features/backend/店家訂單/取消訂單護欄.feature` | 店家不能推進已取消訂單 / API 拒絕狀態轉換 | 權威狀態不變 |
| `features/acceptance/顧客付款與取消訂單.feature` | 店家訂單詳情呈現目前付款資訊 | 店家查看付款失敗訂單詳情 | `FR-017`; `FR-015`; `FR-010`; `BR-004` | 詳情含付款狀態、失敗摘要及建立快照 | assigned | frontend | 店家訂單 | `features/frontend/店家訂單/付款資訊.feature` | 店家詳情顯示付款失敗摘要 / 店家查看付款失敗訂單詳情 | 顯示可對外公開的失敗摘要。 |
| `features/acceptance/顧客付款與取消訂單.feature` | 店家訂單詳情呈現目前付款資訊 | 店家查看付款失敗訂單詳情 | `FR-017`; `FR-015`; `FR-010`; `BR-004` | API 詳情含付款狀態與失敗摘要，快照不變 | assigned | backend | 店家訂單 | `features/backend/店家訂單/付款資訊.feature` | 店家詳情回傳付款狀態與失敗摘要 / 店家讀取付款失敗訂單詳情 | 對齊 005 getMerchantOrder。 |
| `features/acceptance/顧客付款與取消訂單.feature` | 店家訂單詳情呈現目前付款資訊 | 無效店家憑證無法讀取訂單詳情 | `FR-020`; `FR-017` | 無效憑證拒絕詳情讀取且不洩漏資料 | assigned | frontend | 店家訂單 | `features/frontend/店家訂單/付款資訊.feature` | 無效憑證不得顯示訂單詳情 / 無效店家憑證無法讀取訂單詳情 | 顯示授權錯誤但不顯示欄位。 |
| `features/acceptance/顧客付款與取消訂單.feature` | 店家訂單詳情呈現目前付款資訊 | 無效店家憑證無法讀取訂單詳情 | `FR-020`; `FR-017` | API 拒絕無效憑證讀取單筆詳情 | assigned | backend | 店家訂單 | `features/backend/店家訂單/付款資訊.feature` | 無效店家憑證不得讀取訂單詳情 / 無效店家憑證無法讀取訂單詳情 | 沿用 004 merchant auth。 |
| `features/acceptance/顧客付款與取消訂單.feature` | 已取消訂單不得再進入店家出餐流程 | 店家不能完成已取消訂單 | `FR-019`; `BR-003`; `SC-003` | cancelled 訂單拒絕 complete action 且雙狀態不變 | assigned | frontend | 店家訂單 | `features/frontend/店家訂單/取消訂單護欄.feature` | 已取消訂單不得推進出餐 / 店家不能完成已取消訂單 | 看板呈現拒絕並維持狀態。 |
| `features/acceptance/顧客付款與取消訂單.feature` | 已取消訂單不得再進入店家出餐流程 | 店家不能完成已取消訂單 | `FR-019`; `BR-003`; `SC-003` | cancelled 訂單拒絕 complete operation 且雙狀態不變 | assigned | backend | 店家訂單 | `features/backend/店家訂單/取消訂單護欄.feature` | 店家不得推進已取消訂單 / 店家不能完成已取消訂單 | 權威狀態與時間戳不變。 |

## Coverage Summary

- Acceptance Examples: 18
- In-scope spec requirement IDs: 24
- Requirements mapped to acceptance Examples: 24
- Unmapped spec requirements: 0
- Assigned assertions: 18
- Unmapped assertions: 0
- Blocked assertions: 0
- Derived interface Examples: 39

## Open Decisions

| Acceptance source | Unresolved decision or conflict | Impacted interface / module | Next action |
| --- | --- | --- | --- |
| None | None | None | None |

---

### 006-advanced-features-system-verification

## Sources

- Acceptance Feature root: `features/acceptance/`
- System analysis: `plan.md`
- Requirement source: `spec.md`

## Coverage Matrix

| Acceptance Feature | Acceptance Rule | Acceptance Example | Spec Requirement IDs | Acceptance assertion / invariant | Status | Interface | Module | Derived Feature | Derived Rule / Example | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `店家菜單管理與整合驗證.feature` | 店家可以維護分類、餐點與規格 | 店家建立分類與餐點後顧客可在菜單中看到 | `US1`; `FR-001`; `FR-002`; `SC-001` | 分類與餐點保存，顧客菜單可讀到正確資料 | assigned | backend; frontend | 菜單; 店家菜單 | `backend/菜單/店家維護菜單.feature`; `frontend/店家菜單/菜單維護.feature` | 建立分類 / 建立餐點 / 店家建立分類與餐點 | — |
| `店家菜單管理與整合驗證.feature` | 店家可以維護分類、餐點與規格 | 店家修改餐點資料不會改寫既有訂單 | `US1`; `FR-012`; `BR-002` | 顧客菜單反映新值，既有訂單仍保留建立時快照 | assigned | backend; frontend | 菜單; 店家菜單 | `backend/菜單/店家維護菜單.feature`; `frontend/店家菜單/菜單維護.feature` | 店家更新餐點名稱或價格 / 店家更新餐點資料後既有訂單快照不變 | — |
| `店家菜單管理與整合驗證.feature` | 店家可以維護分類、餐點與規格 | 店家維護餐點規格群組與選項 | `US1`; `FR-003` | 店家保存規格群組與選項名稱、加價、供應狀態，顧客菜單反映變更 | assigned | backend; frontend | 菜單; 店家菜單 | `backend/菜單/店家維護菜單.feature`; `frontend/店家菜單/菜單維護.feature` | 店家更新餐點規格群組與選項 / 店家儲存規格群組與選項 | Option CRUD 依 006 OpenAPI 的 menu item option_groups 請求欄位。 |
| `店家菜單管理與整合驗證.feature` | 店家可以維護分類、餐點與規格 | 店家刪除仍有餐點使用的分類 | `US1`; `FR-001` | 引用中分類刪除遭拒且分類與餐點關聯不變 | assigned | backend | 菜單 | `features/backend/菜單/店家維護菜單.feature` | 店家可以建立分類與餐點資料 / 店家刪除仍被餐點使用的分類遭拒 | 回 409 `CATEGORY_IN_USE`；不 cascade 刪除或自動移轉。 |
| `店家菜單管理與整合驗證.feature` | 店家維護供應狀態後顧客流程立即遵循最新狀態 | 餐點售完後禁止新增至購物車與建立訂單 | `US2`; `US3`; `FR-004`; `FR-006`; `FR-007`; `FR-008`; `FR-011`; `FR-013`; `BR-001`; `SC-002` | 停供狀態可見；既有 cart item 不計價；新加購與建單拒絕且不破壞 cart | assigned | backend; frontend | 菜單; 供應驗證; 店家菜單; 顧客菜單 | `backend/菜單/供應狀態.feature`; `backend/供應驗證/顧客購物車與訂單.feature`; `frontend/店家菜單/供應狀態.feature`; `frontend/顧客菜單/售完狀態.feature` | 停供 / 加購拒絕 / 建單拒絕 / 售完標示 | Acceptance's combined journey is split by interface and single operation. Option-level stop is not included; see `FR-005`. |
| `店家菜單管理與整合驗證.feature` | 店家維護供應狀態後顧客流程立即遵循最新狀態 | 店家恢復供應後顧客可以再次購買 | `US2`; `FR-004`; `FR-006`; `FR-011`; `BR-001`; `SC-002` | 恢復後重新讀取可供應，顧客可選擇有效規格並購買 | assigned | backend; frontend | 菜單; 供應驗證; 店家菜單; 顧客菜單 | `backend/菜單/供應狀態.feature`; `backend/供應驗證/顧客購物車與訂單.feature`; `frontend/店家菜單/供應狀態.feature`; `frontend/顧客菜單/售完狀態.feature` | 恢復供應 / 恢復後建單 / 恢復後重新選購 | — |
| `店家菜單管理與整合驗證.feature` | 店家維護供應狀態後顧客流程立即遵循最新狀態 | 店家停止供應單一規格選項 | `US2`; `FR-005`; `FR-011`; `BR-001`; `SC-002` | 停用單一規格選項只影響該選項；其他有效選項仍可用 | assigned | backend; frontend | 菜單; 店家菜單 | `backend/菜單/供應狀態.feature`; `frontend/店家菜單/供應狀態.feature` | 店家停止供應單一規格選項 / 店家將單一規格選項標記為停止供應 | Option availability 由已分析 PATCH operation 更新。 |
| `店家菜單管理與整合驗證.feature` | 店家權限依職責隔離 | 菜單管理人員與訂單管理人員只能執行各自職責 | `US4`; `FR-009`; `FR-010`; `FR-014`; `BR-003`; `SC-004` | orders/menu/admin 權限依職責允許或拒絕相應操作，拒絕不改變權威狀態 | assigned | backend; frontend | 授權; 店家權限 | `backend/授權/店家角色權限.feature`; `frontend/店家權限/角色隔離.feature` | orders/menu/admin 單一操作案例 / 角色隔離提示 | The acceptance covers role separation; client-supplied role spoof rejection in `FR-015` is not explicit. |
| `店家菜單管理與整合驗證.feature` | 店家權限依職責隔離 | 未授權人員無法使用店家管理功能 | `US4`; `FR-010`; `FR-014`; `SC-004` | 無有效權限時拒絕存取且菜單與訂單資料不變 | assigned | backend; frontend | 授權; 店家權限 | `backend/授權/店家角色權限.feature`; `frontend/店家權限/角色隔離.feature` | 無有效憑證菜單寫入遭拒 / 無有效權限者無法讀改店家資料 | Acceptance does not specify role spoof behavior (`FR-015`). |
| `店家菜單管理與整合驗證.feature` | 店家權限依職責隔離 | 菜單管理人員與訂單管理人員只能執行各自職責 | `US4`; `FR-015`; `BR-003`; `SC-004` | 用戶端自報管理角色不能提高伺服器依憑證設定判定的權限 | assigned | backend | 授權 | `backend/授權/店家角色權限.feature` | 店家權限依伺服器憑證設定判定 / 用戶端自稱管理員不能提升店家權限 | Role claims are never trusted over server credential mapping. |
| `店家菜單管理與整合驗證.feature` | API 錯誤一致且不洩漏內部細節 | 可預期的拒絕以一致方式呈現 | `US5`; `FR-016`; `FR-017`; `NFR-010`; `NFR-011`; `BR-004`; `SC-006` | 業務拒絕有穩定錯誤碼與中文訊息、無部分寫入，且不呼叫外部服務 | assigned | backend | 錯誤處理 | `backend/錯誤處理/API錯誤回應.feature` | 請求驗證錯誤 / 未知操作 / 業務拒絕 / 預期錯誤不依賴外部服務 | — |
| `店家菜單管理與整合驗證.feature` | API 錯誤一致且不洩漏內部細節 | 未預期錯誤不會暴露系統內部資訊 | `US5`; `FR-016`; `NFR-010`; `BR-004`; `SC-006` | 500 通用訊息、body 不洩漏 stack/SQL/path，細節只記錄於服務端 | assigned | backend | 錯誤處理 | `backend/錯誤處理/API錯誤回應.feature` | 未預期錯誤回覆通用訊息 | TP-019 使用 plan 核准的 test-local Express app seam，不使用 production test route。 |
| `店家菜單管理與整合驗證.feature` | 完整點餐旅程的結果一致 | 顧客完成點餐後店家完成出餐 | `US6`; `FR-018`; `FR-019`; `SC-003`; `SC-007`; `BR-001`; `BR-002`; `BR-003` | 加購、建單、付款、店家接單與出餐後狀態一致，金額維持建立時快照 | assigned | backend | 整合驗證 | `backend/整合驗證/點餐主旅程.feature` | 顧客加購 / 建單 / 付款 / 店家接單 / 出餐 / 完成 | Acceptance journey is represented by separate atomic interface cases. `NFR-012` default-CI execution requirement is not an acceptance assertion. |
| `店家菜單管理與整合驗證.feature` | 完整點餐旅程的結果一致 | 建單或付款請求提供不同金額仍以訂單快照為準 | `US6`; `FR-012`; `BR-002`; `SC-005` | 請求提供不同金額時仍只保存伺服器建立快照 | assigned | backend | 整合驗證 | `backend/整合驗證/點餐主旅程.feature` | 顧客提供不同金額不會影響訂單快照 / 顧客以不同總額建立訂單仍保存伺服器快照 | 003/005 contracts 明定相容金額欄位忽略。 |
| `店家菜單管理與整合驗證.feature` | 完整點餐旅程的結果一致 | 預設整合驗證可在 CI 環境重複執行 | `US6`; `FR-018`; `FR-019`; `NFR-012`; `SC-007` | 預設 CI 使用既定入口執行整合驗證並回報結果 | assigned | backend | 整合驗證 | `backend/整合驗證/點餐主旅程.feature` | 預設整合驗證入口可在 CI 環境執行 / 團隊執行預設整合驗證 | 具體命令與環境依 techstack 記載，不增加未定時限。 |

## Requirement Coverage

本範圍依 `spec.md` 共盤點 39 個 ID：US1–US6、FR-001–FR-019、NFR-010–NFR-012、BR-001–BR-004、SC-001–SC-007。

| Status | Requirement IDs |
| --- | --- |
| Mapped to acceptance | `US1`; `US2`; `US3`; `US4`; `US5`; `US6`; `FR-001`; `FR-002`; `FR-003`; `FR-004`; `FR-005`; `FR-006`; `FR-007`; `FR-008`; `FR-009`; `FR-010`; `FR-011`; `FR-012`; `FR-013`; `FR-014`; `FR-015`; `FR-016`; `FR-017`; `FR-018`; `FR-019`; `NFR-010`; `NFR-011`; `NFR-012`; `BR-001`; `BR-002`; `BR-003`; `BR-004`; `SC-001`; `SC-002`; `SC-003`; `SC-004`; `SC-005`; `SC-006`; `SC-007` |
| Unmapped to acceptance | None |
| Mapped but affected by blocked assertion | `FR-001` (category deletion policy only) |

All in-scope requirement IDs now map to acceptance Examples. Category deletion remains a blocked assertion because its policy is not confirmed; no downstream deletion behavior is inferred from the current API implementation.

## Coverage Summary

- Acceptance Examples: 15
- In-scope spec requirement IDs: 39
- Requirements mapped to acceptance Examples: 39
- Unmapped spec requirements: 0
- Assigned acceptance Examples: 15
- Blocked acceptance Examples: 0
- Derived interface Examples: 44

> Counts include the existing ten acceptance Examples and five newly mapped Examples; the category-deletion Example is assigned under the decision recorded in `spec.md`.

## Open Decisions

| Acceptance source | Unresolved decision or conflict | Impacted interface / module | Next action |
| --- | --- | --- | --- |
| None | None | None | None |

---
