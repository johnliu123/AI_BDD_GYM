# Acceptance to Interface Traceability

## Sources

- Acceptance Feature root: `features/acceptance/`
- System analysis: `plan.md`
- Spec requirements: `spec.md`

## 介面情境摘要（人 Review）

> 覆蓋完整性以下方 Coverage Matrix 與機械稽核為準；人 Review 本節即可。

### frontend / 菜單

| 驗收情境 | 前端驗什麼 | 來源 |
| --- | --- | --- |
| 顧客依分類瀏覽餐點並確認資訊相符 | 分類篩選後餐點欄位對應同一餐點 | AC: 顧客依分類瀏覽餐點並確認資訊相符 |
| 餐點缺少部分資訊時仍保留在菜單 | 缺圖片時保留卡片並顯示佔位圖 | AC: 餐點缺少部分資訊時仍保留在菜單 |
| 顧客開啟尚無餐點的菜單 | 顧客看到空菜單且無虛構餐點 | AC: 顧客開啟尚無餐點的菜單 |
| 多筆相似名稱餐點並列時各卡片資訊不混淆 | 各卡片名稱、圖片、價格、分類不錯置 | AC: 多筆相似名稱餐點並列時各卡片資訊不混淆 |

### backend / 菜單

| 驗收情境 | 後端驗什麼 | 來源 |
| --- | --- | --- |
| 顧客依分類瀏覽餐點並確認資訊相符 | 餐點資料與分類關聯一致 | AC: 顧客依分類瀏覽餐點並確認資訊相符 |
| 餐點缺少部分資訊時仍保留在菜單 | 缺圖片時菜單仍回傳該餐點 | AC: 餐點缺少部分資訊時仍保留在菜單 |
| 顧客開啟尚無餐點的菜單 | 空菜單回傳空餐點集合 | AC: 顧客開啟尚無餐點的菜單 |

### backend; frontend / 菜單

| 驗收情境 | 前端驗什麼 | 來源 |
| --- | --- | --- |
| 餐點缺少部分資訊時仍保留在菜單 | 缺價格或分類時保留餐點並顯示明確空值提示 | AC: 餐點缺少部分資訊時仍保留在菜單 |

## Coverage Matrix（AI 機械稽核 — 不要求使用者逐行 Review）

| Acceptance Feature | Acceptance Rule | Acceptance Example | Spec Requirement IDs | Acceptance assertion / invariant | Status | Interface | Module | Derived Feature | Derived Rule / Example | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `features/acceptance/顧客瀏覽餐點與分類總驗收旅程.feature` | 顧客可瀏覽完整菜單並依分類標籤篩選 | 顧客依分類瀏覽餐點並確認資訊相符 | `FR-001`; `FR-002`; `SC-001`; `SC-002` | 分類篩選後餐點欄位對應同一餐點 | assigned | frontend | 菜單 | `../../truth/features/frontend/菜單/分類篩選.feature` | 顧客依分類瀏覽餐點 / 顧客切換分類並辨識餐點資料 | 驗證標籤篩選及卡片欄位對應 fixture |
| `features/acceptance/顧客瀏覽餐點與分類總驗收旅程.feature` | 顧客可瀏覽完整菜單並依分類標籤篩選 | 顧客依分類瀏覽餐點並確認資訊相符 | `FR-001`; `FR-002`; `SC-001`; `SC-002` | 餐點資料與分類關聯一致 | assigned | backend | 菜單 | `../../truth/features/backend/菜單/依分類讀取餐點.feature` | 菜單餐點必須回傳其正確分類與顯示資料 / 顧客讀取菜單時餐點欄位對應正確分類 | 對照 DB category 關聯及 OpenAPI 欄位 |
| `features/acceptance/顧客瀏覽餐點與分類總驗收旅程.feature` | 資料缺失時仍保留餐點卡片並以明確提示取代空值 | 餐點缺少部分資訊時仍保留在菜單 | `FR-002`; `SC-001`; `SC-002` | 缺圖片時保留卡片並顯示佔位圖 | assigned | frontend | 菜單 | `../../truth/features/frontend/菜單/空菜單與缺圖.feature` | 餐點缺少圖片時仍保留餐點卡並明確提示 / 顧客瀏覽沒有圖片的餐點 | image_url 可為空；UI 顯示佔位圖 |
| `features/acceptance/顧客瀏覽餐點與分類總驗收旅程.feature` | 資料缺失時仍保留餐點卡片並以明確提示取代空值 | 餐點缺少部分資訊時仍保留在菜單 | `FR-002`; `SC-001`; `SC-002` | 缺圖片時菜單仍回傳該餐點 | assigned | backend | 菜單 | `../../truth/features/backend/菜單/缺圖餐點讀取.feature` | 缺少圖片不得導致餐點從菜單結果消失 / 菜單包含沒有圖片的餐點 | OpenAPI image_url nullable |
| `features/acceptance/顧客瀏覽餐點與分類總驗收旅程.feature` | 資料缺失時仍保留餐點卡片並以明確提示取代空值 | 餐點缺少部分資訊時仍保留在菜單 | `FR-002`; `SC-001`; `SC-002` | 缺價格或分類時保留餐點並顯示明確空值提示 | assigned | backend; frontend | 菜單 | `../../truth/features/backend/菜單/缺圖餐點讀取.feature`; `../../truth/features/frontend/菜單/空菜單與缺圖.feature` | 菜單包含沒有價格的餐點；菜單包含沒有分類的餐點 / 顧客瀏覽沒有價格的餐點；顧客瀏覽沒有分類的餐點 | DBML 與 OpenAPI 均允許空值；兩個介面分別驗證保留餐點及明確提示。 |
| `features/acceptance/顧客瀏覽餐點與分類總驗收旅程.feature` | 顧客可瀏覽完整菜單並依分類標籤篩選 | 顧客開啟尚無餐點的菜單 | `FR-001`; `SC-001` | 顧客看到空菜單且無虛構餐點 | assigned | frontend | 菜單 | `../../truth/features/frontend/菜單/空菜單與缺圖.feature` | 沒有餐點時顧客可以辨識空菜單狀態 / 顧客開啟空菜單 | 驗證 UI 空狀態 |
| `features/acceptance/顧客瀏覽餐點與分類總驗收旅程.feature` | 顧客可瀏覽完整菜單並依分類標籤篩選 | 顧客開啟尚無餐點的菜單 | `FR-001`; `SC-001` | 空菜單回傳空餐點集合 | assigned | backend | 菜單 | `../../truth/features/backend/菜單/依分類讀取餐點.feature` | 沒有菜單資料時回傳空的餐點集合 / 顧客檢視尚無餐點的菜單 | 分類存在不代表餐點集合非空 |
| `features/acceptance/顧客瀏覽餐點與分類總驗收旅程.feature` | 顧客能確認每項餐點資訊對應正確項目而非錯置 | 多筆相似名稱餐點並列時各卡片資訊不混淆 | `FR-002`; `SC-002` | 各卡片名稱、圖片、價格、分類不錯置 | assigned | frontend | 菜單 | `../../truth/features/frontend/菜單/分類篩選.feature` | 顧客依分類瀏覽餐點 / 顧客切換分類並辨識餐點資料 | 旅程延伸；與「顧客依分類瀏覽…」共用介面案例 |

## Coverage Summary

- Acceptance Examples: 4
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
