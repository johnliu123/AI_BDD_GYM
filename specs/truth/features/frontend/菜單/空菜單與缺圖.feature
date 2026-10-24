# Acceptance source: features/acceptance/顧客瀏覽餐點與分類總驗收旅程.feature / Rule: 缺少餐點資料時仍須明確呈現 / Example: 餐點缺少部分資訊時仍保留在菜單
Feature: 菜單缺資料時的呈現

  Rule: 餐點缺少圖片時仍保留餐點卡並明確提示

    Example: 顧客瀏覽沒有圖片的餐點
      Given 菜單中有一項沒有圖片的餐點
      When 顧客開啟菜單
      Then 該餐點仍顯示在菜單中
      And 缺少圖片的餐點顯示佔位圖

  Rule: 缺少價格時仍顯示餐點與明確提示

    # Acceptance source: features/acceptance/顧客瀏覽餐點與分類總驗收旅程.feature / Rule: 缺少餐點資料時仍須明確呈現 / Example: 餐點缺少部分資訊時仍保留在菜單
    Example: 顧客瀏覽沒有價格的餐點
      Given 菜單中有一項沒有價格的餐點
      When 顧客開啟菜單
      Then 該餐點仍顯示在菜單中
      And 缺少價格的餐點顯示明確提示

  Rule: 缺少分類時仍顯示餐點與明確提示

    # Acceptance source: features/acceptance/顧客瀏覽餐點與分類總驗收旅程.feature / Rule: 缺少餐點資料時仍須明確呈現 / Example: 餐點缺少部分資訊時仍保留在菜單
    Example: 顧客瀏覽沒有分類的餐點
      Given 菜單中有一項沒有分類的餐點
      When 顧客開啟菜單
      Then 該餐點仍顯示在菜單中
      And 缺少分類的餐點顯示明確提示

# Acceptance source: features/acceptance/顧客瀏覽餐點與分類總驗收旅程.feature / Rule: 沒有餐點時顧客仍能辨識菜單狀態 / Example: 顧客開啟尚無餐點的菜單
  Rule: 沒有餐點時顧客可以辨識空菜單狀態

    Example: 顧客開啟空菜單
      Given 菜單目前沒有任何餐點
      When 顧客開啟菜單
      Then 顧客看到明確的空菜單狀態
      And 菜單不會顯示不存在的餐點
