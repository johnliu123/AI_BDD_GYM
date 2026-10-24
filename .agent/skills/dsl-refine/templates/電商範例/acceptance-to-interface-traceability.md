# Acceptance to Interface Traceability

## Coverage Matrix

| Acceptance source | Spec Requirement IDs | Acceptance assertion | Interface | Module | Derived Feature | Derived Rule / Example | Coverage |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `features/acceptance/折扣碼套用.feature` / `顧客可在符合門檻時套用折扣碼並看到正確折抵` / `購物車達門檻後顧客套用折扣碼並確認訂單金額` | （此示例未附 spec.md；實際產物須填入來源需求 ID） | 符合門檻的折扣碼會被套用，訂單折扣與金額正確 | backend | 折扣 | `features/backend/折扣/折扣碼套用.feature` | `符合門檻的折扣碼必須成功套用` / `商品小計 1050 元時套用 WELCOME100` | covered |
| `features/acceptance/折扣碼套用.feature` / `顧客可在符合門檻時套用折扣碼並看到正確折抵` / `購物車達門檻後顧客套用折扣碼並確認訂單金額` | （此示例未附 spec.md；實際產物須填入來源需求 ID） | 顧客在結帳頁看到已套用狀態及正確金額 | frontend | 結帳 | `features/frontend/結帳/結帳頁折扣碼套用.feature` | `結帳頁必須顯示折扣碼套用結果與金額` / `商品小計 1050 元時顯示 WELCOME100 折抵結果` | covered |

## Coverage Summary

- Acceptance Examples: 1
- Spec Requirement IDs: not verifiable in this example because `spec.md` is not included
- Covered assertions: 2
- Unmapped assertions: 0
- Blocked assertions: 0
- Derived interface Examples: 2
