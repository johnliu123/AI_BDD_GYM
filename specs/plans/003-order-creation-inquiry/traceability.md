# Acceptance to Interface Traceability

## Sources

- Acceptance Feature root: `features/acceptance/`
- Journey 錨點：`Example:` 標題 MUST 與本 matrix「Acceptance Example」欄逐字一致（已於 2026-10-25 對齊）
- System analysis: `plan.md`
- Spec requirements: `spec.md`

## 介面情境摘要（人 Review）

> 覆蓋完整性以下方 Coverage Matrix 與機械稽核為準；人 Review 本節即可。

### frontend / 訂單

| 驗收情境 | 前端驗什麼 | 來源 |
| --- | --- | --- |
| 顧客確認購物車後取得訂單紀錄 | 建立唯一訂單、快照金額與明細並清空同 session 購物車 | AC: 顧客確認購物車後取得訂單紀錄 |
| 空購物車或含不可用項目時建立訂單被拒絕 | 無可用項目時拒絕且保留購物車、不寫入訂單 | AC: 空購物車或含不可用項目時建立訂單被拒絕 |
| 顧客使用訂單編號查詢自己的訂單 | 同 session 查詢取得持久化狀態、明細與建立時金額快照 | AC: 顧客使用訂單編號查詢自己的訂單 |
| 其他訪客無法查詢該訂單 | 跨 session 查詢不洩漏訂單內容或存在性 | AC: 其他訪客無法查詢該訂單 |

### backend / 訂單

| 驗收情境 | 後端驗什麼 | 來源 |
| --- | --- | --- |
| 顧客確認購物車後取得訂單紀錄 | 原子建單、供應驗證、冪等及快照寫入 | AC: 顧客確認購物車後取得訂單紀錄 |
| 顧客端金額不會覆寫訂單快照 | 伺服器只依建立當下菜單價格持久化金額，不採信請求金額 | AC: 顧客端金額不會覆寫訂單快照 |
| 空購物車或含不可用項目時建立訂單被拒絕 | 重驗供應狀態並拒絕空／不可用 cart | AC: 空購物車或含不可用項目時建立訂單被拒絕 |
| 顧客因未收到首次結果而再次送出同一筆訂單 | 同一 session/key 重送回原訂單，不建立第二筆 | AC: 顧客因未收到首次結果而再次送出同一筆訂單 |
| 顧客使用訂單編號查詢自己的訂單 | 訂單查詢回傳原快照、不依新菜單價格重算 | AC: 顧客使用訂單編號查詢自己的訂單 |
| 其他訪客無法查詢該訂單 | 跨 session query 使用與不存在 order 相同的結果 | AC: 其他訪客無法查詢該訂單 |

## Coverage Matrix（AI 機械稽核 — 不要求使用者逐行 Review）

| Acceptance Feature | Acceptance Rule | Acceptance Example | Spec Requirement IDs | Acceptance assertion / invariant | Status | Interface | Module | Derived Feature | Derived Rule / Example | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `features/acceptance/訪客建立與查詢訂單總驗收旅程.feature` | 顧客可將可用購物車建立為訂單 | 顧客確認購物車後取得訂單紀錄 | `FR-001`; `FR-002`; `FR-003`; `FR-006`; `FR-010`; `FR-011`; `BR-001`; `BR-003`; `SC-001`; `SC-002`; `SC-006` | 建立唯一訂單、快照金額與明細並清空同 session 購物車 | assigned | frontend | 訂單 | `../../truth/features/frontend/訂單/確認與查詢訂單.feature` | 顧客確認可用購物車後取得訂單結果 / 顧客確認購物車並看到訂單明細 | 顯示伺服器建立的訂單結果 |
| `features/acceptance/訪客建立與查詢訂單總驗收旅程.feature` | 顧客可將可用購物車建立為訂單 | 顧客確認購物車後取得訂單紀錄 | `FR-001`; `FR-002`; `FR-003`; `FR-004`; `FR-006`; `FR-007`; `FR-010`; `FR-011`; `BR-001`; `BR-002`; `BR-003`; `SC-001`; `SC-002`; `SC-004`; `SC-006` | 原子建單、供應驗證、冪等及快照寫入 | assigned | backend | 訂單 | `../../truth/features/backend/訂單/建立與查詢訂單.feature` | 建立訂單時保存唯一訂單編號及建立時明細快照 / 可用購物車建立一筆訂單並清空購物車 | 單一交易寫入 order/items/options 並清 cart |
| `features/acceptance/訪客建立與查詢訂單總驗收旅程.feature` | 顧客可將可用購物車建立為訂單 | 顧客端金額不會覆寫訂單快照 | `FR-003`; `FR-011`; `BR-001`; `SC-002` | 伺服器只依建立當下菜單價格持久化金額，不採信請求金額 | assigned | backend | 訂單 | `../../truth/features/backend/訂單/建立與查詢訂單.feature` | 建立訂單時保存唯一訂單編號及建立時明細快照 / 顧客端金額不會覆寫訂單快照 | API contract 接受相容金額欄位但忽略其計價作用。 |
| `features/acceptance/訪客建立與查詢訂單總驗收旅程.feature` | 不符合建立條件的購物車不得建立訂單 | 空購物車或含不可用項目時建立訂單被拒絕 | `FR-004`; `FR-005`; `BR-002`; `SC-003` | 無可用項目時拒絕且保留購物車、不寫入訂單 | assigned | frontend | 訂單 | `../../truth/features/frontend/訂單/確認與查詢訂單.feature` | 不符合建立條件的購物車不得建立訂單 / 購物車沒有可用項目時無法送單 | 顯示拒絕狀態並保留 cart |
| `features/acceptance/訪客建立與查詢訂單總驗收旅程.feature` | 不符合建立條件的購物車不得建立訂單 | 空購物車或含不可用項目時建立訂單被拒絕 | `FR-004`; `FR-005`; `BR-002`; `SC-003` | 重驗供應狀態並拒絕空／不可用 cart | assigned | backend | 訂單 | `../../truth/features/backend/訂單/建立與查詢訂單.feature` | 建立訂單時保存唯一訂單編號及建立時明細快照 / 購物車沒有可用項目時拒絕且保留購物車 | 不提交訂單或 cart 清空 |
| `features/acceptance/訪客建立與查詢訂單總驗收旅程.feature` | 不符合建立條件的購物車不得建立訂單 | 顧客因未收到首次結果而再次送出同一筆訂單 | `FR-007`; `BR-003`; `SC-004` | 同一 session/key 重送回原訂單，不建立第二筆 | assigned | backend | 訂單 | `../../truth/features/backend/訂單/建立與查詢訂單.feature` | 建立訂單時保存唯一訂單編號及建立時明細快照 / 相同冪等請求重送回傳原訂單 | 命中有效冪等 mapping |
| `features/acceptance/訪客建立與查詢訂單總驗收旅程.feature` | 顧客只能查詢自己建立的訂單與建立時金額 | 顧客使用訂單編號查詢自己的訂單 | `FR-008`; `FR-009`; `FR-010`; `FR-011`; `SC-005` | 同 session 查詢取得持久化狀態、明細與建立時金額快照 | assigned | frontend | 訂單 | `../../truth/features/frontend/訂單/確認與查詢訂單.feature` | 顧客只能查詢自己建立的訂單快照 / 顧客查詢自己建立的訂單 | 顯示查詢結果快照 |
| `features/acceptance/訪客建立與查詢訂單總驗收旅程.feature` | 顧客只能查詢自己建立的訂單與建立時金額 | 顧客使用訂單編號查詢自己的訂單 | `FR-008`; `FR-009`; `FR-010`; `FR-011`; `SC-005` | 訂單查詢回傳原快照、不依新菜單價格重算 | assigned | backend | 訂單 | `../../truth/features/backend/訂單/建立與查詢訂單.feature` | 訂單查詢限建立訂單的訪客工作階段 / 同一工作階段查詢訂單回傳保存的快照 | SQL query 以 order_number 與 session 同時限定 |
| `features/acceptance/訪客建立與查詢訂單總驗收旅程.feature` | 顧客只能查詢自己建立的訂單與建立時金額 | 其他訪客無法查詢該訂單 | `FR-010`; `SC-005` | 跨 session 查詢不洩漏訂單內容或存在性 | assigned | frontend | 訂單 | `../../truth/features/frontend/訂單/確認與查詢訂單.feature` | 顧客只能查詢自己建立的訂單快照 / 其他工作階段查不到該訂單 | 統一查無呈現 |
| `features/acceptance/訪客建立與查詢訂單總驗收旅程.feature` | 顧客只能查詢自己建立的訂單與建立時金額 | 其他訪客無法查詢該訂單 | `FR-010`; `SC-005` | 跨 session query 使用與不存在 order 相同的結果 | assigned | backend | 訂單 | `../../truth/features/backend/訂單/建立與查詢訂單.feature` | 訂單查詢限建立訂單的訪客工作階段 / 不同工作階段查詢訂單不洩漏存在性 | 不洩漏 order existence |

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
