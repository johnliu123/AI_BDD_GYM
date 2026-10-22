# 001–006 測試計畫、任務與實際結果

- **更新日**：2026-10-22
- **本次執行**：Backend full suite **149/149**、Frontend full suite **25/25**；新增 TP-027 focused test 8/8；`verify:migrations` 靜態檢查通過（6 個 migration）。
- **歷史驗收**：既有 `smoke:006`、frontend production build 與正式 React 前端瀏覽器驗收紀錄維持原狀；本次未重跑這些項目。
- **MSSQL 限制**：目前沒有設定 `MSSQL_*` 測試目標；未執行真實 SQL Server migration，故未驗證既有訂單／明細資料保留。

| 迭代／測試計畫 | 對應任務 | 實際測試結果 | 狀態 |
|---|---|---|---|
| **001 餐點瀏覽與分類** ([testplan](001-food-browsing-categories/testplan.md))<br>TP-001–TP-007：分類／菜單 API、欄位關聯、空值、空菜單、分類篩選 | [tasks](001-food-browsing-categories/tasks.md)：T001–T013 已勾選 | API 驗證分類關聯、有效／無效 `category_id` 篩選；單元測試覆蓋缺圖片、價格、分類 fallback；瀏覽器驗收分類切換、空菜單及餐點顯示。 | 通過 |
| **002 購物車與計價** ([testplan](002-shopping-cart-total-calculation/testplan.md))<br>TP-001–TP-019：規格選擇、session／CSRF、伺服器計價、CRUD、不可用項目 | [tasks](002-shopping-cart-total-calculation/tasks.md)：T001–T041 均已勾選 | Backend 覆蓋選項驗證、金額精度、session 隔離、Origin／CSRF、client 金額拒絕、價格變更及 unavailable；瀏覽器驗收未選齊規格禁止加入、unavailable 隱藏金額／禁止改量／可移除及空車。 | 通過 |
| **003 訂單建立與查詢** ([testplan](003-order-creation-inquiry/testplan.md))<br>TP-001–TP-013：建單、拒絕、快照、冪等、session owner、查詢 | [tasks](003-order-creation-inquiry/tasks.md)：T001–T028 已勾選 | API／整合驗證成功與失敗建單、快照、並行及過期冪等鍵、Origin／CSRF、owner-only 查詢；瀏覽器完成加購、建單、空車更新與訂單查詢。`total_amount`、`unit_price`、`line_total` 明列為忽略欄位；未知欄位仍拒絕。 | 通過 |
| **004 店家出餐流程** ([testplan](004-merchant-serving-workflow/testplan.md))<br>TP-001–TP-017：列表／篩選、授權、狀態機、並發、快照與顧客同步 | [tasks](004-merchant-serving-workflow/tasks.md)：T001–T035 已勾選 | Backend 驗證最多 200 筆、filter、並行接單僅一個成功、非法轉換拒絕、金額／明細欄位忽略且快照不變；瀏覽器完成接單→出餐中→完成，顧客查詢同步為已完成。 | 通過 |
| **005 付款與取消** ([testplan](005-payment-order-cancellation/testplan.md))<br>TP-001–TP-009、TP-011–TP-027 有通過紀錄；TP-010 尚待核准 fault seam | [tasks](005-payment-order-cancellation/tasks.md)：T001–T056 已勾選；TP-010 的歷史 T020/T021 不作核准驗收 | 本次 TP-027 參數化測試驗證未知 `currency`／`order_id` 回 400，訂單仍 unpaid、snapshot 不變且無冪等記錄；付款與取消其餘案例沿用既有測試紀錄。 | TP-010 阻塞；真實 MSSQL smoke 未執行 |
| **006 進階功能與系統驗證** ([testplan](006-advanced-features-system-verification/testplan.md))<br>TP-001–TP-018、TP-020–TP-027 有通過紀錄；TP-019／TP-028 未驗收 | [tasks](006-advanced-features-system-verification/tasks.md)：T001–T058 已勾選；T059 未勾選，等待真實 MSSQL 資料保留驗證 | 本次 backend／frontend full suite 通過；既有 `smoke:006` 與瀏覽器驗收紀錄維持。TP-019 的 test-only route 未經 system-analysis 核准，不作為驗收證據。 | TP-019 缺核准觸發 seam；TP-028 缺專用 MSSQL 目標 |

## 任務與審閱註記

各 `tasks.md` 中已解決的契約／分析前置任務已同步勾選；正式審閱欄位仍為「待審閱」，與本文件記錄的測試執行結果分開。尚未完成的驗收為 005 TP-010（fault-injection seam 未核准）、006 TP-019（安全觸發 seam 未核准）及 TP-028（缺專用 MSSQL 目標）；靜態 migration 檢查不代替真實資料保留驗證。

瀏覽器案例使用正式 React 前端；六迭代的靜態 prototype 未另外逐一重跑。