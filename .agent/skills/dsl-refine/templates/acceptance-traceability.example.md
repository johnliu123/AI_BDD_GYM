# Acceptance to Interface Traceability

## Sources

- Acceptance Feature root: `features/acceptance/`
- System analysis: `plan.md`

## Coverage Matrix

| Acceptance Feature | Acceptance Rule | Acceptance Example | Spec Requirement IDs | Acceptance assertion / invariant | Status | Interface | Module | Derived Feature | Derived Rule / Example | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `顧客下單.feature` | 顧客可使用符合資格的優惠 | 顧客套用折扣碼完成下單 | `FR-001`; `BR-001` | 折扣碼適用且訂單金額正確 | assigned | backend | 折扣 | `backend/折扣/折扣碼適用.feature` | 折扣碼未達門檻時必須拒絕 / 商品小計 600 元時拒絕套用 | 驗證拒絕結果與訂單權威狀態不變 |
| `顧客下單.feature` | 顧客可使用符合資格的優惠 | 顧客套用折扣碼完成下單 | `FR-001`; `FR-002` | 顧客看到正確折扣碼狀態與金額摘要 | assigned | frontend | 結帳 | `frontend/結帳/結帳頁折扣碼輸入.feature` | 結帳頁套用合格折扣碼後顯示折抵結果 / 商品小計 1050 元時套用 WELCOME100 | 一個介面操作、兩項同屬畫面折抵結果的 Then |
| `顧客下單.feature` | 顧客可使用符合資格的優惠 | 顧客套用折扣碼完成下單 | `NFR-001` | 訂單成功後的寄送通知時機 | blocked | notification | 通知 | - | - | acceptance 未定義通知時機；回交 `/spec-by-example` 與 `/clarify` |

## Coverage Summary

- Acceptance Examples: 1
- In-scope spec requirement IDs: 3
- Requirements mapped to acceptance Examples: 3
- Unmapped spec requirements: 0
- Assigned assertions: 2
- Unmapped assertions: 0
- Blocked assertions: 1
- Derived interface Examples: 2

## Open Decisions

| Acceptance source | Unresolved decision or conflict | Impacted interface / module | Next action |
| --- | --- | --- | --- |
| `顧客下單.feature` / `顧客套用折扣碼完成下單` | 成功訂單的寄送通知時機未定義 | notification / 通知 | 回交 `/spec-by-example` 與 `/clarify` |
