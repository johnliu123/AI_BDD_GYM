Feature: 後端折扣碼套用

  Rule: 符合門檻的折扣碼必須成功套用

    Example: 商品小計 1050 元時套用 WELCOME100
      # Acceptance source: features/acceptance/折扣碼套用.feature / Rule: 顧客可在符合門檻時套用折扣碼並看到正確折抵 / Example: 購物車達門檻後顧客套用折扣碼並確認訂單金額
      Given 平台的結帳規則如下：
        | 規則 | 值 |
        | 折扣碼 | WELCOME100 |
        | 折扣門檻 | 1000 |
        | 折扣金額 | 100 |
        | 運費 | 60 |
      And 購物車中已有以下商品：
        | 商品代碼 | 單價 | 數量 |
        | SKU-A | 600 | 1 |
        | SKU-B | 450 | 1 |
      When "Alice" 套用折扣碼 "WELCOME100"
      Then 折扣碼狀態是 "已套用"
      And 訂單摘要如下：
        | 項目 | 值 |
        | 商品小計 | 1050 |
        | 折扣金額 | 100 |
        | 運費 | 60 |
        | 應付總額 | 1010 |
