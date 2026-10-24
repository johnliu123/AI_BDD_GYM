# Acceptance source: features/acceptance/顧客管理購物車與金額.feature / Rule: 顧客管理購物車後金額依目前可用項目重新計算 / Example: 顧客修改數量與刪除項目後看到最新總額
Feature: 讀取及維護訪客購物車

  Rule: 購物車金額必須依權威菜單資料計算

    # Acceptance source: features/acceptance/顧客管理購物車與金額.feature / Rule: 顧客管理購物車後金額依目前可用項目重新計算 / Example: 顧客修改數量與刪除項目後看到最新總額
    Example: 讀取購物車時回傳項目與可用項目總額
      Given 目前工作階段購物車有多個可用餐點項目
      When 顧客讀取目前工作階段購物車
      Then 回傳每項餐點、規格、數量與項目金額
      And 回傳總額等於所有可用項目依目前價格計算後的總和

    # Acceptance source: features/acceptance/顧客管理購物車與金額.feature / Rule: 顧客管理購物車後金額依目前可用項目重新計算 / Example: 菜單價格變更後以目前價格更新購物車
    Example: 菜單價格更新後重新讀取購物車
      Given 目前工作階段購物車已有餐點 "漢堡" 且菜單價格或規格加價已變更
      When 顧客讀取目前工作階段購物車
      Then 項目金額及總額依目前菜單價格重新計算
      And 系統不沿用購物車建立時的舊金額

    # Acceptance source: features/acceptance/顧客管理購物車與金額.feature / Rule: 顧客管理購物車後金額依目前可用項目重新計算 / Example: 顧客修改數量與刪除項目後看到最新總額
    Example: 顧客端提供的金額不能成為計價依據
      Given 目前工作階段購物車有可用餐點項目
      When 顧客提交含自訂項目金額或總金額的購物車更新
      Then 系統不採用顧客端提供的金額
      And 購物車金額只依目前餐點價格、規格加價及數量計算

  Rule: 修改與刪除項目後購物車狀態保持一致

    # Acceptance source: features/acceptance/顧客管理購物車與金額.feature / Rule: 顧客管理購物車後金額依目前可用項目重新計算 / Example: 顧客修改數量與刪除項目後看到最新總額
    Example: 修改數量後重算項目與總金額
      Given 目前工作階段購物車有可用餐點 "漢堡"
      When 顧客將餐點 "漢堡" 的數量更新為 2
      Then 持久化項目數量為 2
      And 項目金額及購物車總額依目前價格重新計算

    # Acceptance source: features/acceptance/顧客管理購物車與金額.feature / Rule: 顧客管理購物車後金額依目前可用項目重新計算 / Example: 顧客修改數量與刪除項目後看到最新總額
    Example: 刪除項目後依剩餘項目重算總額
      Given 目前工作階段購物車有多個可用餐點項目
      When 顧客刪除餐點 "漢堡"
      Then 持久化購物車不再包含餐點 "漢堡"
      And 總金額依剩餘可用項目重新計算

  Rule: 不可用項目保留但不得計價或修改數量

    # Acceptance source: features/acceptance/顧客管理購物車與金額.feature / Rule: 不可用購物車項目須保留並排除於總額 / Example: 餐點或規格停止供應後仍可移除購物車項目
    Example: 讀取購物車時保留不可用項目但排除金額
      Given 目前工作階段購物車有不可用餐點 "漢堡" 及其他可用項目
      When 顧客讀取目前工作階段購物車
      Then 餐點 "漢堡" 仍列於購物車且標示不可用
      And 不可用項目不回傳單價或項目金額且不計入總額

    # Acceptance source: features/acceptance/顧客管理購物車與金額.feature / Rule: 不可用購物車項目須保留並排除於總額 / Example: 餐點或規格停止供應後仍可移除購物車項目
    Example: 不可用項目數量更新遭拒
      Given 目前工作階段購物車有不可用餐點 "漢堡"
      When 顧客將餐點 "漢堡" 的數量更新為 2
      Then 系統拒絕更新數量
      And 持久化購物車內容與總額維持不變

    # Acceptance source: features/acceptance/顧客管理購物車與金額.feature / Rule: 不可用購物車項目須保留並排除於總額 / Example: 餐點或規格停止供應後仍可移除購物車項目
    Example: 刪除不可用項目仍獲允許
      Given 目前工作階段購物車有不可用餐點 "漢堡"
      When 顧客刪除餐點 "漢堡"
      Then 持久化購物車不再包含餐點 "漢堡"
      And 總金額依剩餘可用項目重新計算

  Rule: 空購物車讀取回傳零總額

    # Acceptance source: features/acceptance/顧客管理購物車與金額.feature / Rule: 空購物車仍呈現清楚狀態 / Example: 顧客開啟空購物車看到零總額
    Example: 顧客讀取空購物車
      Given 目前工作階段購物車沒有項目
      When 顧客讀取目前工作階段購物車
      Then 購物車項目集合為空
      And 購物車總額為零
