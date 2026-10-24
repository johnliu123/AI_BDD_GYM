# 後端 / 訂單付款與取消 DSL

付款、取消、查詢與店家取消護欄的 SQL Server 權威契約。payment_status 與出餐 status 為正交欄位；orders/items 金額維持 003 建單快照。

## Given 句型

| DSL 句型 | Gherkin 參數 | Data Table 參數 | 預設參數 | 後端實作語意 |
| --- | --- | --- | --- | --- |
| `一筆出餐狀態為 created 且付款狀態為 unpaid 的訂單` | 無 | 不支援 | 無 | `權威狀態落地`：建立 created/unpaid 訂單及 items snapshots，綁定目前 guest session。 |
| `付款服務可成功完成該筆付款` | 無 | 不支援 | 無 | `使用 fixture`：payment stub 下一次結果成功；不呼叫外部金流。 |
| `付款服務可成功完成下一次付款` | 無 | 不支援 | 無 | `使用 fixture`：failed 訂單下一次 stub 結果成功；不呼叫外部金流。 |
| `一筆付款狀態為 unpaid 的訂單` | 無 | 不支援 | 無 | `權威狀態落地`：目前 guest session 所有且 payment_status=unpaid 的訂單。 |
| `一筆付款狀態為 paid 的訂單` | 無 | 不支援 | 無 | `權威狀態落地`：payment_status=paid 並保存 paid_at。 |
| `一筆付款仍在有效處理期間的 pending 訂單` | 無 | 不支援 | 無 | `權威狀態落地`：payment_status=pending 且尚未超過 stale 門檻。 |
| `顧客有一筆付款失敗的訂單` | 無 | 不支援 | 無 | `權威狀態落地`：目前 guest session 訂單 payment_status=failed，保留 failure summary。 |
| `目前訪客工作階段有一筆付款失敗的訂單` | 無 | 不支援 | 無 | `權威狀態落地`：建立屬於目前 guest session 且 payment_status=failed 的訂單，保留建立時 snapshot。 |
| `目前訪客工作階段有一筆已取消的訂單` | 無 | 不支援 | 無 | `權威狀態落地`：建立屬於目前 guest session 且 status=cancelled 的訂單，保留付款與金額快照。 |
| `顧客已成功付款且系統記錄該次付款` | 無 | 不支援 | 無 | `權威狀態落地`：paid order 且 payment idempotency mapping 對應成功結果。 |
| `一筆付款狀態為 pending 且付款服務回報失敗` | 無 | 不支援 | 無 | `權威狀態落地`：建立 pending 訂單並設定 stub 失敗；尚無 paid 冪等 mapping。 |
| `一筆出餐狀態為 created 且付款狀態為 paid 的訂單` | 無 | 不支援 | 無 | `權威狀態落地`：created/paid order，保存 paid snapshot。 |
| `一筆出餐狀態為 accepted、preparing 或 completed 的訂單` | 無 | 不支援 | 無 | `權威狀態落地`：建立任一不可取消的出餐狀態，payment status 保持獨立。 |
| `一筆出餐狀態為 created 且付款仍在有效處理期間的訂單` | 無 | 不支援 | 無 | `權威狀態落地`：created/pending 且 pending 尚未 stale。 |
| `一筆出餐狀態為 created 且付款處理已逾等待時間的訂單` | 無 | 不支援 | 無 | `權威狀態落地`：created/pending 且建立時間超過 stale threshold。 |
| `店家具有有效的訂單操作權限` | 無 | 不支援 | 無 | `使用 fixture`：提供可通過 004/005 merchant auth 的 orders/admin credential。 |
| `店家有權讀取訂單且訂單已付款失敗` | 無 | 不支援 | 無 | `使用 fixture`：merchant credential 有效，訂單含 failed payment 摘要。 |
| `店家有權操作且有一筆已取消訂單` | 無 | 不支援 | 無 | `使用 fixture`：merchant credential 有效，orders.status=cancelled。 |
| `一筆出餐狀態為「已建立」且付款狀態為「未付款」的訂單` | 無 | 不支援 | 無 | `權威狀態落地`：建立 created/unpaid 訂單並綁定目前 session；保存 items/total 快照。 |
| `一筆付款狀態為「未付款」的訂單` | 無 | 不支援 | 無 | `權威狀態落地`：payment_status=unpaid，訂單屬於目前 guest session。 |
| `一筆付款狀態為「已付款」的訂單` | 無 | 不支援 | 無 | `權威狀態落地`：payment_status=paid 並保存付款時間及成功結果。 |
| `一筆付款仍在有效處理期間的「處理中」訂單` | 無 | 不支援 | 無 | `權威狀態落地`：payment_status=pending 且尚未 stale。 |
| `一筆付款狀態為「失敗」的訂單` | 無 | 不支援 | 無 | `權威狀態落地`：payment_status=failed 並保留失敗摘要。 |
| `一筆付款已成功且系統記錄了該次請求` | 無 | 不支援 | 無 | `權威狀態落地`：paid order 與同 session/request success mapping 已存在。 |
| `一筆付款處理中的訂單且付款服務回報失敗` | 無 | 不支援 | 無 | `權威狀態落地`：payment_status=pending，stub 下一次回報失敗；尚無 paid mapping。 |
| `一筆出餐狀態為「已建立」且付款狀態為「已付款」的訂單` | 無 | 不支援 | 無 | `權威狀態落地`：created/paid 訂單及建立時快照。 |
| `一筆已接單、出餐中或已完成的訂單` | 無 | 不支援 | 無 | `權威狀態落地`：建立不能取消的出餐狀態訂單，付款狀態另行保存。 |
| `一筆尚未接單且付款仍在有效處理期間的訂單` | 無 | 不支援 | 無 | `權威狀態落地`：created/pending 且 pending 未逾 stale threshold。 |
| `一筆尚未接單且付款處理已逾等待時間的訂單` | 無 | 不支援 | 無 | `權威狀態落地`：created/pending 且超過 stale threshold。 |

## When 句型

| DSL 句型 | Gherkin 參數 | Data Table 參數 | 預設參數 | 後端實作語意 |
| --- | --- | --- | --- | --- |
| `顧客發起付款` | 無 | 不支援 | 無 | `怎麼做`：以目前 guest session 及 order number 發起一次 pay；`權威狀態落地`：條件轉換到 pending 並呼叫同步 stub；`回寫`：paid/failed 與 timestamps；`不必查`：不接受 client amount。 |
| `顧客以不同於訂單 total_amount 的金額發起付款` | 無 | 不支援 | 無 | `怎麼做`：請求提供與快照不同的金額；`權威狀態落地`：以 orders.total_amount 為唯一應付依據；`回寫`：付款結果；`不必查`：不把請求金額保存。 |
| `顧客再次發起付款` | 無 | 不支援 | 無 | `怎麼做`：對同一 order 再次發起 pay；`權威狀態落地`：依目前 payment status 與 stale policy 決定接受或拒絕。 |
| `顧客在同一訪客工作階段重新發起付款` | 無 | 不支援 | 無 | `怎麼做`：以原 guest session 重試 failed 訂單；`權威狀態落地`：重入付款狀態機；`回寫`：最新結果。 |
| `顧客以相同冪等鍵重送付款請求` | 無 | 不支援 | 無 | `怎麼做`：相同 session/key 再送一次；`權威狀態落地`：只查 paid success mapping；`回寫`：原成功結果；`不必查`：不得二次執行成功扣款。 |
| `系統完成付款失敗處理` | 無 | 不支援 | 無 | `怎麼做`：處理 stub failure；`權威狀態落地`：pending → failed 並保存時間／對外原因；`回寫`：不新增 paid idempotency mapping。 |
| `顧客取消該訂單` | 無 | 不支援 | 無 | `怎麼做`：以目前 guest session 發起 cancel；`權威狀態落地`：條件更新，paid 時同交易 refunded，stale pending 先 failed 再 cancelled；`回寫`：order response；`不必查`：不改 items/total snapshot。 |
| `店家接受該訂單` | 無 | 不支援 | 無 | `怎麼做`：呼叫 004 accept action；`權威狀態落地`：只允許 created → accepted；`回寫`：新 order；`不必查`：cancelled 必須拒絕。 |
| `顧客成功支付訂單` | 無 | 不支援 | 無 | `怎麼做`：使用目前 session 對 order 發起 pay，stub 成功；`權威狀態落地`：依快照金額處理；`回寫`：paid；`不必查`：不採 client amount。 |
| `顧客以不同於訂單金額快照的金額發起付款` | 無 | 不支援 | 無 | `怎麼做`：測試層提供不同金額；`權威狀態落地`：仍使用 orders.total_amount；`回寫`：server 計價結果；`不必查`：不保存提交值。 |
| `顧客再次發起新付款` | 無 | 不支援 | 無 | `怎麼做`：對 paid 或 non-stale pending 訂單發起新 pay；`權威狀態落地`：拒絕重複付款；`回寫`：原狀態或已付款結果。 |
| `顧客重新付款並成功` | 無 | 不支援 | 無 | `怎麼做`：failed 訂單重新 pay 並使 stub 成功；`權威狀態落地`：failed → pending → paid；`回寫`：成功結果。 |
| `顧客重送同一付款請求` | 無 | 不支援 | 無 | `怎麼做`：相同 guest session 與 idempotency key 重送；`權威狀態落地`：命中 paid mapping；`回寫`：原結果，不再次呼叫成功扣款。 |
| `顧客查詢該訂單` | 無 | 不支援 | 無 | `怎麼做`：以目前 server-validated guest session 查詢訂單；`權威狀態落地`：唯讀同一 orders row；`回寫`：狀態、付款標籤及快照；`不必查`：不得跨 session 洩漏。 |

## Then 句型

| DSL 句型 | Gherkin 參數 | Data Table 參數 | 預設參數 | 後端實作語意 |
| --- | --- | --- | --- | --- |
| `訂單付款狀態持久化為 paid` | 無 | 不支援 | 無 | `必查`：`呈現結果`與`權威狀態`均為 paid，paid_at 存在。 |
| `入帳金額等於訂單 total_amount 快照` | 無 | 不支援 | 無 | `必查`：付款金額與 orders.total_amount 完全一致；`不該發生`：不讀取 client amount。 |
| `出餐狀態與明細快照維持不變` | 無 | 不支援 | 無 | `必查`：status、order_items、total_amount 操作前後不變。 |
| `系統依 total_amount 快照完成付款` | 無 | 不支援 | 無 | `必查`：paid result 以 server snapshot 計價，body amount 不影響。 |
| `持久化訂單金額與明細不變` | 無 | 不支援 | 無 | `必查`：orders.total_amount 及所有 items/options snapshots 相同。 |
| `系統回傳已付款結果或拒絕重複付款` | 無 | 不支援 | 無 | `必查`：paid order 不建立新 payment attempt；回原結果或穩定 409。 |
| `付款狀態維持 paid` | 無 | 不支援 | 無 | `必查`：資料庫仍為 paid 且成功結果數量為一。 |
| `系統拒絕新增付款流程` | 無 | 不支援 | 無 | `必查`：非 stale pending 回 PAYMENT_IN_PROGRESS；不新增付款 attempt。 |
| `付款狀態維持 pending` | 無 | 不支援 | 無 | `必查`：pending 狀態及時間不被拒絕請求改變。 |
| `先前失敗結果仍可查詢` | 無 | 不支援 | 無 | `必查`：先前失敗時間／摘要保留可讀。 |
| `系統回傳原付款成功結果` | 無 | 不支援 | 無 | `必查`：冪等命中返回相同 order/payment result。 |
| `不會再次執行扣款或新增狀態轉換` | 無 | 不支援 | 無 | `必查`：付款成功計數、payment_status_updated_at 與 mapping 不重複變更。 |
| `訂單付款狀態持久化為 failed` | 無 | 不支援 | 無 | `必查`：pending → failed 及失敗時間／摘要保存。 |
| `不建立代表 paid 成功的付款冪等記錄` | 無 | 不支援 | 無 | `必查`：payment_idempotency_keys 無該 paid success mapping。 |
| `訂單狀態持久化為 cancelled` | 無 | 不支援 | 無 | `必查`：status=cancelled 且 cancelled_at 保存。 |
| `付款狀態維持 unpaid` | 無 | 不支援 | 無 | `必查`：payment_status 仍 unpaid。 |
| `訂單明細與金額快照維持不變` | 無 | 不支援 | 無 | `必查`：items、options、unit_price、line_total、total_amount 不變。 |
| `付款狀態更新為 refunded` | 無 | 不支援 | 無 | `必查`：paid → refunded 並保存 refunded_at。 |
| `系統拒絕取消` | 無 | 不支援 | 無 | `必查`：非 created 訂單回 ORDER_NOT_CANCELLABLE，兩個 status 均不變。 |
| `系統拒絕取消且付款狀態維持 pending` | 無 | 不支援 | 無 | `必查`：非 stale pending 回 PAYMENT_IN_PROGRESS；status 與 payment_status 均不變。 |
| `同一交易先將付款狀態更新為 failed 再將出餐狀態更新為 cancelled` | 無 | 不支援 | 無 | `必查`：單一 SQL transaction 內 stale pending → failed、status → cancelled；`不該發生`：部分提交。 |
| `訂單不會同時處於 pending 與 cancelled` | 無 | 不支援 | 無 | `必查`：transaction 完成後不能存在 payment_status=pending 且 status=cancelled。 |
| `店家接受已取消訂單遭拒` | 無 | 不支援 | 無 | `必查`：004 accept 回 ORDER_STATUS_CONFLICT，status 仍 cancelled。 |
| `店家列表只包含符合付款狀態的訂單` | 無 | 不支援 | 無 | `必查`：列表篩選只回傳指定 payment_status。 |
| `店家詳情包含付款狀態與失敗摘要` | 無 | 不支援 | 無 | `必查`：detail 回傳目前 payment status／label 與可公開摘要，快照不變。 |
| `訂單付款狀態持久化為 {狀態}` | `狀態`：列舉值 unpaid/pending/paid/failed/refunded。 | 不支援 | 無 | `必查`：orders.payment_status 與對外 label 一致。 |
| `訂單付款狀態更新為「已付款」` | 無 | 不支援 | 無 | `必查`：payment_status=paid 且成功時間保存；金額等於 total snapshot。 |
| `入帳金額等於訂單建立時的金額快照` | 無 | 不支援 | 無 | `必查`：付款結果金額與 orders.total_amount 完全一致；`不該發生`：不讀取 client amount。 |
| `已付金額等於訂單建立時的金額快照` | 無 | 不支援 | 無 | `必查`：實際付款結果金額與 orders.total_amount 相同；不讀 client 值。 |
| `系統仍依訂單建立時保存的金額完成付款` | 無 | 不支援 | 無 | `必查`：付款金額來源為 orders.total_amount，請求額不影響結果。 |
| `訂單金額與明細快照維持不變` | 無 | 不支援 | 無 | `必查`：orders.total_amount 及 items/options snapshots 操作前後一致。 |
| `付款狀態維持「已付款」` | 無 | 不支援 | 無 | `必查`：重複 pay 後仍 paid，成功結果只有一份。 |
| `付款狀態維持「處理中」` | 無 | 不支援 | 無 | `必查`：non-stale pending 的重複 pay 不新增操作，欄位與時間不變。 |
| `訂單付款狀態更新為「失敗」` | 無 | 不支援 | 無 | `必查`：pending → failed，失敗時間／摘要保存且不寫 paid mapping。 |
| `不建立代表付款成功的去重紀錄` | 無 | 不支援 | 無 | `必查`：payment_idempotency_keys 不存在該 session/key 的 paid mapping。 |
| `訂單出餐狀態更新為「已取消」` | 無 | 不支援 | 無 | `必查`：status=cancelled 並保存 cancelled_at。 |
| `訂單付款狀態維持「未付款」` | 無 | 不支援 | 無 | `必查`：payment_status 仍 unpaid。 |
| `後續付款與店家出餐操作均遭拒` | 無 | 不支援 | 無 | `必查`：cancelled 後 pay 及 004 merchant transition 均回拒絕，status 不變。 |
| `取消成功後出餐狀態為「已取消」且付款狀態為「已退款」` | 無 | 不支援 | 無 | `必查`：paid cancellation 同一交易將 status=cancelled、payment_status=refunded，保存 refunded_at。 |
| `出餐狀態與付款狀態維持不變` | 無 | 不支援 | 無 | `必查`：拒絕取消後兩個狀態與時間戳維持原值。 |
| `系統拒絕取消且付款狀態維持「處理中」` | 無 | 不支援 | 無 | `必查`：non-stale pending 回 PAYMENT_IN_PROGRESS，status/payment_status 不變。 |
| `訂單不會同時處於付款處理中與已取消` | 無 | 不支援 | 無 | `必查`：資料庫不存在 payment_status=pending 且 status=cancelled 的狀態組合。 |
| `付款狀態更新為「失敗」且出餐狀態更新為「已取消」` | 無 | 不支援 | 無 | `必查`：stale pending cancel 在同一交易先 pending→failed、再 created→cancelled；任一步驟失敗均不得部分提交。 |
| `訂單回傳付款狀態「失敗」及對應中文標籤` | 無 | 不支援 | 無 | `必查`：`呈現結果`：payment_status=failed 且 label 對應；`權威狀態`：與持久化欄位一致。 |
| `查詢結果的出餐狀態與金額快照維持不變` | 無 | 不支援 | 無 | `必查`：`權威狀態`：回傳出餐狀態、order items 與 total 快照；`不該發生`：查詢不得重算或改寫。 |
| `訂單回傳已取消出餐狀態及付款狀態` | 無 | 不支援 | 無 | `必查`：`呈現結果`：回傳 cancelled 及 payment_status/label；`權威狀態`：均取自同一訂單記錄。 |
| `查詢結果的明細與金額快照維持不變` | 無 | 不支援 | 無 | `必查`：`權威狀態`：查詢回傳 items 與 total 與建單 snapshot 一致；不得重算。 |

## 003 建立與查詢訂單 — Given 句型

| DSL 句型 | Gherkin 參數 | Data Table 參數 | 預設參數 | 後端實作語意 |
| --- | --- | --- | --- | --- |
| `目前訪客工作階段購物車有多項可用餐點與規格` | 無 | 不支援 | 無 | `權威狀態落地`：在目前 guest session cart 建立多筆 available items 及完整 option 選擇。 |
| `目前訪客工作階段購物車為空或只含不可用項目` | 無 | 不支援 | 無 | `權威狀態落地`：cart 空集合或全部 unavailable。 |
| `目前工作階段已以某冪等鍵成功建立一筆訂單` | 無 | 不支援 | 無 | `權威狀態落地`：同一 session 與 idempotency key 已有一筆 order row。 |
| `目前訪客工作階段購物車有可用項目` | 無 | 不支援 | 無 | `權威狀態落地`：至少一筆 available cart item。 |
| `目前訪客工作階段已建立一筆訂單` | 無 | 不支援 | 無 | `權威狀態落地`：order 綁定目前 guest session。 |
| `訂單建立後菜單價格已變更` | 無 | 不支援 | 無 | `權威狀態落地`：建單後更新 menu price，快照與現價不同。 |
| `第一個訪客工作階段建立了一筆訂單` | 無 | 不支援 | 無 | `權威狀態落地`：以第一個 session 建單；第二個 session 無權讀取。 |

## 003 建立與查詢訂單 — When 句型

| DSL 句型 | Gherkin 參數 | Data Table 參數 | 預設參數 | 後端實作語意 |
| --- | --- | --- | --- | --- |
| `顧客以相同工作階段及冪等鍵再次送出建立訂單` | 無 | 不支援 | 無 | `怎麼做`：相同 session/key 重送 create；`回寫`：原 order 或 409。 |
| `顧客以請求附帶的不同總額送出建立訂單` | 無 | 不支援 | 無 | `怎麼做`：body 含 client total；`權威狀態`：忽略 client amount。 |
| `目前訪客工作階段以訂單編號查詢` | 無 | 不支援 | 無 | `怎麼做`：GET order by number with session。 |
| `第二個訪客工作階段以該訂單編號查詢` | 無 | 不支援 | 無 | `怎麼做`：不同 session 查詢他人 order number。 |

## 003 建立與查詢訂單 — Then 句型

| DSL 句型 | Gherkin 參數 | Data Table 參數 | 預設參數 | 後端實作語意 |
| --- | --- | --- | --- | --- |
| `系統建立一筆唯一訂單並回傳訂單編號` | 無 | 不支援 | 無 | `必查`：201 與唯一 order number；DB 新增一筆 orders。 |
| `訂單保存餐點、規格、數量與建立當下的價格快照` | 無 | 不支援 | 無 | `必查`：order_items 含 name/options/qty/unit_price snapshots。 |
| `訂單總金額等於建立當下各明細快照總和` | 無 | 不支援 | 無 | `必查`：total_amount 等於 line totals 加總。 |
| `目前訪客工作階段購物車被清空` | 無 | 不支援 | 無 | `必查`：建單成功後 cart items 為空。 |
| `系統拒絕建立訂單且不寫入訂單資料` | 無 | 不支援 | 無 | `必查`：4xx 且 orders 無新 row。 |
| `系統回傳原訂單結果` | 無 | 不支援 | 無 | `必查`：冪等重送回傳相同 order payload。 |
| `系統不建立第二筆訂單` | 無 | 不支援 | 無 | `必查`：orders 計數不增加。 |
| `訂單仍依目前菜單與規格資料計算建立時快照` | 無 | 不支援 | 無 | `必查`：snapshot 依 server 計價，非 client total。 |
| `系統不保存顧客端提供的金額` | 無 | 不支援 | 無 | `必查`：DB 無 client amount 欄位寫入。 |
| `系統回傳訂單狀態、建立時間、明細及建立時金額快照` | 無 | 不支援 | 無 | `必查`：GET 含 status、created_at、items、total snapshot。 |
| `查詢結果不依最新菜單價格重算` | 無 | 不支援 | 無 | `必查`：total 仍為建單 snapshot。 |
| `系統回傳查無訂單或等同拒絕結果` | 無 | 不支援 | 無 | `必查`：404 或統一 not-found，無 order body。 |
| `系統不洩漏該訂單是否存在` | 無 | 不支援 | 無 | `必查`：跨 session 回應不可區分存在與否。 |

## 004 店家訂單與出餐 — Given 句型

| DSL 句型 | Gherkin 參數 | Data Table 參數 | 預設參數 | 後端實作語意 |
| --- | --- | --- | --- | --- |
| `訂單資料有多筆不同狀態的訂單` | 無 | 不支援 | 無 | `權威狀態落地`：建立 created/accepted/preparing/completed 等多筆 orders。 |
| `訂單資料有一筆含餐點明細與金額快照的訂單` | 無 | 不支援 | 無 | `權威狀態落地`：order 含 items snapshots 與 total_amount。 |
| `訂單資料中有一筆訂單` | 無 | 不支援 | 無 | `權威狀態落地`：至少一筆 order 供未授權測試。 |
| `一筆目前狀態為「已建立」的訂單` | 無 | 不支援 | 無 | `權威狀態落地`：status=created。 |
| `一筆目前狀態為「已接單」的訂單` | 無 | 不支援 | 無 | `權威狀態落地`：status=accepted。 |
| `一筆目前狀態為「出餐中」的訂單` | 無 | 不支援 | 無 | `權威狀態落地`：status=preparing。 |
| `一筆目前狀態不允許指定操作的訂單` | 無 | 不支援 | 無 | `權威狀態落地`：例如 completed 或非法 transition 起點。 |
| `訂單屬於目前訪客工作階段且店家已將狀態更新為「已接單」` | 無 | 不支援 | 無 | `權威狀態落地`：guest order + merchant accept 後 status=accepted。 |

## 004 店家訂單與出餐 — When 句型

| DSL 句型 | Gherkin 參數 | Data Table 參數 | 預設參數 | 後端實作語意 |
| --- | --- | --- | --- | --- |
| `店家依狀態讀取訂單列表` | 無 | 不支援 | 無 | `怎麼做`：GET merchant orders with status filter。 |
| `請求讀取訂單列表` | 無 | 不支援 | 無 | `怎麼做`：未授權或無效 credential 列表請求。 |
| `店家開始準備該訂單` | 無 | 不支援 | 無 | `怎麼做`：start-preparing action；accepted→preparing。 |
| `店家嘗試執行不符合狀態機的操作` | 無 | 不支援 | 無 | `怎麼做`：非法 transition（如 completed→accepted）。 |
| `顧客以原訪客工作階段查詢該訂單` | 無 | 不支援 | 無 | `怎麼做`：guest GET order after merchant update。 |

## 004 店家訂單與出餐 — Then 句型

| DSL 句型 | Gherkin 參數 | Data Table 參數 | 預設參數 | 後端實作語意 |
| --- | --- | --- | --- | --- |
| `回傳符合篩選條件的訂單摘要` | 無 | 不支援 | 無 | `必查`：列表僅含篩選 status 的 orders。 |
| `摘要包含訂單編號、狀態、建立時間與總金額` | 無 | 不支援 | 無 | `必查`：每列含 number、status、created_at、total。 |
| `回傳訂單狀態、建立時間及完整明細快照` | 無 | 不支援 | 無 | `必查`：detail 含 status、time、items snapshot。 |
| `回傳金額不受目前菜單價格影響` | 無 | 不支援 | 無 | `必查`：total 與 items 仍為建單 snapshot。 |
| `系統拒絕讀取` | 無 | 不支援 | 無 | `必查`：401/403 且無 order 資料。 |
| `訂單資料不會洩漏` | 無 | 不支援 | 無 | `必查`：body 不含 order 列或計數暗示。 |
| `訂單明細與總金額快照維持不變` | 無 | 不支援 | 無 | `必查`：items/total 操作前後一致。 |
| `系統拒絕狀態轉換` | 無 | 不支援 | 無 | `必查`：409 或業務錯誤，status 不變。 |
| `訂單持久化狀態及金額快照維持不變` | 無 | 不支援 | 無 | `必查`：非法操作後 DB status 與 snapshots 不變。 |
| `查詢回傳「已接單」狀態及對應標籤` | 無 | 不支援 | 無 | `必查`：guest GET 顯示 accepted label。 |
| `查詢結果的狀態與店家持久化狀態一致` | 無 | 不支援 | 無 | `必查`：guest 與 merchant 讀取同一 status。 |
