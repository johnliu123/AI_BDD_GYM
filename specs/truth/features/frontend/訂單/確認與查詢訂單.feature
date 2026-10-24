# Acceptance source: features/acceptance/顧客建立與查詢訂單.feature / Rule: 顧客可將可用購物車建立為訂單 / Example: 顧客確認購物車後取得訂單紀錄
Feature: 顧客確認與查詢訂單

  Rule: 顧客確認可用購物車後取得訂單結果

    Example: 顧客確認購物車並看到訂單明細
      Given 顧客的購物車有多項可用餐點與所選規格
      When 顧客確認並送出購物車
      Then 顧客看到訂單編號、初始狀態與訂單明細
      And 顧客看到建立當下的訂單總金額
      And 顧客看到購物車已清空

    # Acceptance source: features/acceptance/顧客建立與查詢訂單.feature / Rule: 不符合建立條件的購物車不得建立訂單 / Example: 空購物車或含不可用項目時建立訂單被拒絕
    Example: 購物車沒有可用項目時無法送單
      Given 顧客的購物車沒有任何可用項目
      When 顧客嘗試確認並送出購物車
      Then 顧客看到無法建立訂單的提示
      And 顧客不會看到新訂單編號
      And 購物車內容維持不變

  Rule: 顧客只能查詢自己建立的訂單快照

    # Acceptance source: features/acceptance/顧客建立與查詢訂單.feature / Rule: 顧客只能查詢自己建立的訂單與建立時金額 / Example: 顧客使用訂單編號查詢自己的訂單
    Example: 顧客查詢自己建立的訂單
      Given 顧客在目前訪客工作階段建立了一筆訂單
      And 訂單建立後菜單價格已變更
      When 顧客查詢該訂單
      Then 顧客看到訂單狀態、建立時間與訂單明細
      And 顧客看到建立當下的金額快照

    # Acceptance source: features/acceptance/顧客建立與查詢訂單.feature / Rule: 顧客只能查詢自己建立的訂單與建立時金額 / Example: 其他訪客無法查詢該訂單
    Example: 其他工作階段查不到該訂單
      Given 第一個訪客工作階段建立了一筆訂單
      And 第二個顧客持有不同的有效訪客工作階段
      When 第二個顧客以該訂單編號查詢訂單
      Then 顧客看到統一的查無訂單結果
      And 顧客無法判斷其他工作階段的訂單是否存在
