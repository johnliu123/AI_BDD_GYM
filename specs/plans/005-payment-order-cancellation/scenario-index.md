# 業務情境索引：005-payment-order-cancellation

> 人 Review 主入口；機械覆蓋見 `traceability.md` Coverage Matrix。

## 情境 1：顧客完成付款並查看付款狀態

**業務規則**：成功付款使用訂單快照並保留出餐狀態

| 誰驗 | 驗什麼 | Feature 位置 |
| --- | --- | --- |
| 前端 | 成功付款使用訂單快照並保留出餐狀態 | `frontend/顧客訂單/付款與取消.feature#顧客成功付款後看到已付款狀態` |
| 後端 | 後端保存 paid 並以 total_amount 快照付款 | `backend/訂單/付款與取消.feature#付款成功後保存 paid 狀態及快照金額` |

**缺口**：無

---

## 情境 2：顧客端提交不同金額不會改變應付金額

**業務規則**：client amount 不會覆寫應付金額或快照

| 誰驗 | 驗什麼 | Feature 位置 |
| --- | --- | --- |
| 前端 | client amount 不會覆寫應付金額或快照 | `frontend/顧客訂單/付款與取消.feature#顧客嘗試以錯誤金額付款仍依訂單快照計價` |
| 後端 | pay result 依 orders.total_amount，不採信 request amount | `backend/訂單/付款與取消.feature#付款請求金額不會覆寫訂單快照` |

**缺口**：無

---

## 情境 3：已付款或付款處理中的訂單不會重複扣款

**業務規則**：paid 或 non-stale pending 不啟動第二次付款

| 誰驗 | 驗什麼 | Feature 位置 |
| --- | --- | --- |
| 前端 | paid 或 non-stale pending 不啟動第二次付款 | `frontend/顧客訂單/付款與取消.feature#已付款訂單或處理中訂單不會重複扣款` |
| 後端 | 後端不建立第二個 payment attempt | `backend/訂單/付款與取消.feature#已付款訂單拒絕再次扣款；非 stale pending 訂單拒絕新付款` |

**缺口**：無

---

## 情境 4：付款失敗後以同一訂單再次付款成功

**業務規則**：failed 可重試並轉 paid，快照不變

| 誰驗 | 驗什麼 | Feature 位置 |
| --- | --- | --- |
| 前端 | failed 可重試並轉 paid，快照不變 | `frontend/顧客訂單/付款與取消.feature#付款失敗後顧客可以重試成功` |
| 後端 | failed 訂單重試成功，保留前次失敗摘要 | `backend/訂單/付款與取消.feature#付款失敗後重試可更新為 paid` |

**缺口**：無

---

## 情境 5：顧客重送已成功的同一付款請求

**業務規則**：同 key 重送回原成功結果，不重複扣款

| 誰驗 | 驗什麼 | Feature 位置 |
| --- | --- | --- |
| 前端 | 同 key 重送回原成功結果，不重複扣款 | `frontend/顧客訂單/付款與取消.feature#顧客重送成功付款請求不會重複扣款` |
| 後端 | 只有 paid 成功寫入冪等 mapping，重送不二次執行 | `backend/訂單/付款與取消.feature#已成功付款請求以相同冪等鍵重送` |

**缺口**：無

---

## 情境 6：顧客取消尚未接單且未付款的訂單

**業務規則**：created/unpaid 可取消，保留訂單快照並阻擋後續操作

| 誰驗 | 驗什麼 | Feature 位置 |
| --- | --- | --- |
| 前端 | created/unpaid 可取消，保留訂單快照並阻擋後續操作 | `frontend/顧客訂單/付款與取消.feature#顧客取消尚未付款且未接單的訂單` |
| 後端 | backend 交易取消 order 且後續 pay/merchant action 拒絕 | `backend/訂單/付款與取消.feature#created unpaid 訂單取消後禁止付款及出餐` |

**缺口**：無

---

## 情境 7：顧客取消已付款但尚未接單的訂單

**業務規則**：paid cancel 同步 refunded 並保留快照

| 誰驗 | 驗什麼 | Feature 位置 |
| --- | --- | --- |
| 前端 | paid cancel 同步 refunded 並保留快照 | `frontend/顧客訂單/付款與取消.feature#顧客取消已付款但未接單的訂單後看到退款` |
| 後端 | backend 同一交易 cancelled+refunded 並記 refunded_at | `backend/訂單/付款與取消.feature#paid 訂單取消時同步標記 refunded` |

**缺口**：無

---

## 情境 8：顧客無法取消已進入出餐流程的訂單

**業務規則**：非 created 訂單取消遭拒且雙狀態不變

| 誰驗 | 驗什麼 | Feature 位置 |
| --- | --- | --- |
| 前端 | 非 created 訂單取消遭拒且雙狀態不變 | `frontend/顧客訂單/付款與取消.feature#已接單後顧客無法取消訂單` |
| 後端 | backend 依持久化出餐狀態拒絕並保留付款狀態 | `backend/訂單/付款與取消.feature#非 created 訂單拒絕顧客取消` |

**缺口**：無

---

## 情境 9：付款仍有效處理中時不得取消，過期處理才可安全取消

**業務規則**：non-stale pending cancel 拒絕；stale pending 同交易 failed+cancelled

| 誰驗 | 驗什麼 | Feature 位置 |
| --- | --- | --- |
| 前端 | non-stale pending cancel 拒絕；stale pending 同交易 failed+cancelled | `frontend/顧客訂單/付款與取消.feature#付款仍處理中時取消遭拒；付款處理逾時後取消可安全完成` |
| 後端 | stale pending 中止、non-stale pending 不變，避免 pending+cancelled | `backend/訂單/付款與取消.feature#非 stale pending 拒絕取消；stale pending 同一交易中止付款並取消` |

**缺口**：無

---

## 情境 10：顧客查詢付款失敗訂單

**業務規則**：查詢回傳付款失敗標籤、出餐狀態與建立時快照

| 誰驗 | 驗什麼 | Feature 位置 |
| --- | --- | --- |
| 前端 | 查詢回傳付款失敗標籤、出餐狀態與建立時快照 | `frontend/顧客訂單/付款狀態查詢.feature#顧客看到失敗狀態及快照` |
| 後端 | API 回傳 failed、標籤及快照 | `backend/訂單/付款狀態查詢.feature#查詢付款失敗訂單` |

**缺口**：無

---

## 情境 11：顧客查詢已取消訂單

**業務規則**：cancelled 與付款標籤及建立快照仍可查詢

| 誰驗 | 驗什麼 | Feature 位置 |
| --- | --- | --- |
| 前端 | cancelled 與付款標籤及建立快照仍可查詢 | `frontend/顧客訂單/付款狀態查詢.feature#顧客看到取消及付款狀態` |
| 後端 | API 回傳 cancelled/refunded 狀態與建立快照 | `backend/訂單/付款狀態查詢.feature#查詢已取消訂單` |

**缺口**：無

---

## 情境 12：店家依付款狀態篩選訂單

**業務規則**：店家列表依付款狀態篩選並顯示雙狀態及快照

| 誰驗 | 驗什麼 | Feature 位置 |
| --- | --- | --- |
| 前端 | 店家列表依付款狀態篩選並顯示雙狀態及快照 | `frontend/店家訂單/付款資訊.feature#列表顯示付款與出餐資訊` |
| 後端 | API 列表與詳情含付款狀態並依 payment_status 篩選 | `backend/店家訂單/付款資訊.feature#篩選回傳付款狀態訂單` |

**缺口**：無

---

## 情境 13：無效店家憑證無法讀取付款資訊

**業務規則**：無效憑證拒絕且不揭露訂單內容

| 誰驗 | 驗什麼 | Feature 位置 |
| --- | --- | --- |
| 前端 | 無效憑證拒絕且不揭露訂單內容 | `frontend/店家訂單/付款資訊.feature#看板不顯示付款資料` |
| 後端 | API 拒絕未授權讀取且不回傳訂單 | `backend/店家訂單/付款資訊.feature#無效憑證讀取遭拒` |

**缺口**：無

---

## 情境 14：店家不能接單已取消訂單

**業務規則**：cancelled 訂單拒絕接單且狀態不變

| 誰驗 | 驗什麼 | Feature 位置 |
| --- | --- | --- |
| 前端 | cancelled 訂單拒絕接單且狀態不變 | `frontend/店家訂單/取消訂單護欄.feature#看板拒絕接單` |
| 後端 | cancelled 訂單拒絕 accept operation | `backend/店家訂單/取消訂單護欄.feature#API 拒絕接單` |

**缺口**：無

---

## 情境 15：店家不能推進已取消訂單

**業務規則**：cancelled 訂單拒絕出餐狀態推進

| 誰驗 | 驗什麼 | Feature 位置 |
| --- | --- | --- |
| 前端 | cancelled 訂單拒絕出餐狀態推進 | `frontend/店家訂單/取消訂單護欄.feature#看板拒絕狀態操作` |
| 後端 | cancelled 訂單拒絕 start/complete operation | `backend/店家訂單/取消訂單護欄.feature#API 拒絕狀態轉換` |

**缺口**：無

---

## 情境 16：店家查看付款失敗訂單詳情

**業務規則**：詳情含付款狀態、失敗摘要及建立快照

| 誰驗 | 驗什麼 | Feature 位置 |
| --- | --- | --- |
| 前端 | 詳情含付款狀態、失敗摘要及建立快照 | `frontend/店家訂單/付款資訊.feature#店家查看付款失敗訂單詳情` |
| 後端 | API 詳情含付款狀態與失敗摘要，快照不變 | `backend/店家訂單/付款資訊.feature#店家讀取付款失敗訂單詳情` |

**缺口**：無

---

## 情境 17：無效店家憑證無法讀取訂單詳情

**業務規則**：無效憑證拒絕詳情讀取且不洩漏資料

| 誰驗 | 驗什麼 | Feature 位置 |
| --- | --- | --- |
| 前端 | 無效憑證拒絕詳情讀取且不洩漏資料 | `frontend/店家訂單/付款資訊.feature#無效店家憑證無法讀取訂單詳情` |
| 後端 | API 拒絕無效憑證讀取單筆詳情 | `backend/店家訂單/付款資訊.feature#無效店家憑證無法讀取訂單詳情` |

**缺口**：無

---

## 情境 18：店家不能完成已取消訂單

**業務規則**：cancelled 訂單拒絕 complete action 且雙狀態不變

| 誰驗 | 驗什麼 | Feature 位置 |
| --- | --- | --- |
| 前端 | cancelled 訂單拒絕 complete action 且雙狀態不變 | `frontend/店家訂單/取消訂單護欄.feature#店家不能完成已取消訂單` |
| 後端 | cancelled 訂單拒絕 complete operation 且雙狀態不變 | `backend/店家訂單/取消訂單護欄.feature#店家不能完成已取消訂單` |

**缺口**：無

---

