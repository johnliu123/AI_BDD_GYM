# 前端共用 DSL

跨模組且 Gherkin 句型完全一致的前端 step 契約（模組 dsl 不得重複定義下列句型）。

## Given 句型

| DSL 句型 | Gherkin 參數 | Data Table 參數 | 預設參數 | Playwright BDD 實作語意 |
| --- | --- | --- | --- | --- |
| `第二個顧客持有不同的有效訪客工作階段` | 無 | 不支援 | 無 | `使用 fixture`：建立第二個獨立 browser context 與有效 session。`權威狀態`：session ID 與第一個不同。 |

## When 句型

| DSL 句型 | Gherkin 參數 | Data Table 參數 | 預設參數 | Playwright BDD 實作語意 |
| --- | --- | --- | --- | --- |
| `顧客查詢該訂單` | 無 | 不支援 | 無 | `頁面操作`：使用目前 session 查詢已保存的訂單編號；`等待條件`：付款與出餐狀態載入完成。 |

## Then 句型

| DSL 句型 | Gherkin 參數 | Data Table 參數 | 預設參數 | Playwright BDD 實作語意 |
| --- | --- | --- | --- | --- |
| `訂單狀態維持不變` | 無 | 不支援 | 無 | `必查`：`權威狀態`：操作前後出餐狀態與快照一致。 |
