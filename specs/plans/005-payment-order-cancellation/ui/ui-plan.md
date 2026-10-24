# UI Plan：點餐系統第五迭代－付款與取消訂單

- **來源規格**：[功能規格：付款與取消訂單](./spec.md)
- **系統分析計畫**：[plan.md](./plan.md)
- **互動雛形**：[prototype/index.html](prototype/index.html)

## 範疇

- **分析邊界**：顧客付款／取消／查詢 payment 欄位；店家看板付款篩選與顯示；假資料，不設計 OpenAPI schema 或 DBML。
- **涵蓋需求部位**：User Story 1–5；FR-001–FR-020；全域 FR-010–FR-013、FR-015；BR-001–BR-004；SC-001–SC-006。
- **設計前提**：
  - 顧客在「訂單查詢／建立成功」區塊完成付款與取消。
  - 雛形以 localStorage 模擬 payment_status 與 cancelled。
  - 店家看板沿用 004 布局，新增付款 badge 與篩選。

## 畫面與流程

**tasks 機器錨點**：`ui-plan:§畫面與流程→顧客付款`、`→付款失敗重試`、`→顧客取消訂單`、`→查詢付款狀態`、`→店家付款篩選`、`→店家詳情付款資訊`、`→已取消不可接單`

| 畫面 | 檔案 | 目的 |
|---|---|---|
| 顧客訂單操作 | `index.html` | 付款、取消、查詢 payment |
| 店家看板 | `index.html` | 付款狀態篩選與欄位 |

### 顧客付款

- **觸發**：查詢結果為「已建立」且 payment 為未付款／付款失敗。
- **步驟**：按「付款」→ 顯示處理中 → 成功顯示「已付款」與快照總額；可選「模擬失敗」切換。
- **追溯**：US1、FR-001、SC-001。

### 付款失敗重試

- **觸發**：模擬失敗後 payment 為 failed。
- **步驟**：顯示失敗原因摘要 → 再次按「付款」→ 成功變 paid。
- **追溯**：US2、FR-004–FR-005、SC-002。

### 顧客取消訂單

- **觸發**：出餐狀態「已建立」；**非 stale** 之 `pending` 禁用取消（與 spec FR-013／research F1 一致；**stale pending** 可取消）。
- **步驟**：按「取消訂單」→ 出餐狀態「已取消」；若已付款則 payment 顯示「已退款」。
- **追溯**：US3、FR-007、SC-003。

### 查詢付款狀態

- **觸發**：輸入訂單編號查詢。
- **步驟**：顯示 `status_label` 與 `payment_status_label`、總額快照。
- **追溯**：US4、FR-016、SC-001。

### 店家付款篩選

- **觸發**：店家 token 有效。
- **步驟**：下拉篩選未付款／已付款；列表顯示 payment badge。
- **追溯**：US5、FR-018。

### 店家詳情付款資訊

- **觸發**：選取訂單。
- **步驟**：詳情區顯示付款狀態、失敗原因（若有）。
- **追溯**：US5、FR-017。

### 已取消不可接單

- **觸發**：訂單出餐狀態「已取消」。
- **步驟**：接單／出餐按鈕隱藏；toast 提示不可操作。
- **追溯**：US5、FR-019。

## 實作

- 正式前端：擴充 `OrderLookupPage.jsx`、`MenuPage.jsx` 成功區、`MerchantOrdersPage.jsx`。
- 對齊 [techstack.md](./techstack.md) React + Vite；`orderApi.payOrder`／`cancelOrder`。
- 錯誤態：409 顯示 server message（已付款、處理中、不可取消）。

## 驗證

- 雛形：成功付款、失敗重試、取消、店家篩選、cancelled 無接單按鈕。
- 正式 UI：`orderPaymentUi.test.js` + [techstack.md §005 smoke](./techstack.md) 瀏覽器手動走查（US1–US5）；Playwright 等 E2E **不在 005 範圍**。

<!-- Constitution self-check: pass -->
