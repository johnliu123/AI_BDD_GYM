Feature: 結帳頁折扣碼套用

  Rule: 結帳頁必須顯示折扣碼套用結果與金額

    Example: 商品小計 1050 元時顯示 WELCOME100 折抵結果
      # Acceptance source: features/acceptance/折扣碼套用.feature / Rule: 顧客可在符合門檻時套用折扣碼並看到正確折抵 / Example: 購物車達門檻後顧客套用折扣碼並確認訂單金額
      Given 顧客 "Alice" 已登入
      And 購物車中已有以下商品：
        | 商品代碼 | 單價 | 數量 |
        | SKU-A | 600 | 1 |
        | SKU-B | 450 | 1 |
      And 平台上有一張可用的折扣碼 "WELCOME100"
      And 顧客已進入結帳頁
      When "Alice" 在結帳頁輸入折扣碼 "WELCOME100" 並套用
      Then 結帳頁顯示折扣碼狀態是 "已套用"
      And 結帳頁顯示以下資訊：
        | 項目 | 值 |
        | 商品小計 | 1050 |
        | 折扣金額 | 100 |
        | 運費 | 60 |
        | 應付總額 | 1010 |
