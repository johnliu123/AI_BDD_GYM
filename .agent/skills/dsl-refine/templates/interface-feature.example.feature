# Acceptance source: features/acceptance/顧客下單.feature / Rule: 顧客可使用符合資格的優惠 / Example: 顧客套用折扣碼完成下單
Feature: 結帳頁套用折扣碼

  Rule: 結帳頁套用合格折扣碼後必須顯示折抵結果

    Example: 商品小計 1050 元時套用 WELCOME100
      Given 購物車中已有以下商品：
        | 商品代碼 | 單價 | 數量 |
        | SKU-A | 600 | 1 |
        | SKU-B | 450 | 1 |
      And 平台上有一張可用的折扣碼 "WELCOME100"
      When "Alice" 在結帳頁輸入折扣碼 "WELCOME100" 並套用
      Then 結帳頁顯示折扣碼狀態是 "已套用"
      And 結帳頁顯示以下資訊：
        | 項目 | 值 |
        | 商品小計 | 1050 |
        | 折扣金額 | 100 |
        | 應付總額 | 1010 |
