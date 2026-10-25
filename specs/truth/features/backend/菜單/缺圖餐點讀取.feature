# Acceptance source: features/acceptance/顧客瀏覽餐點與分類總驗收旅程.feature / Rule: 缺少餐點資料時仍須明確呈現 / Example: 餐點缺少部分資訊時仍保留在菜單
Feature: 缺少圖片的餐點讀取


  本 Feature 驗證：缺少圖片的餐點讀取 — 缺少圖片不得導致餐點從菜單結果消失；缺少價格不得導致餐點從菜單結果消失；缺少分類不得導致餐點從菜單結果消失。
  Rule: 缺少圖片不得導致餐點從菜單結果消失

    Example: 菜單包含沒有圖片的餐點
      Given 菜單中有一項沒有圖片的餐點
      When 顧客檢視菜單
      Then 菜單結果仍包含該餐點
      And 該餐點沒有圖片內容

  Rule: 缺少價格不得導致餐點從菜單結果消失

    # Acceptance source: features/acceptance/顧客瀏覽餐點與分類總驗收旅程.feature / Rule: 缺少餐點資料時仍須明確呈現 / Example: 餐點缺少部分資訊時仍保留在菜單
    Example: 菜單包含沒有價格的餐點
      Given 菜單中有一項沒有價格的餐點
      When 顧客檢視菜單
      Then 菜單結果仍包含該餐點
      And 該餐點沒有價格內容

  Rule: 缺少分類不得導致餐點從菜單結果消失

    # Acceptance source: features/acceptance/顧客瀏覽餐點與分類總驗收旅程.feature / Rule: 缺少餐點資料時仍須明確呈現 / Example: 餐點缺少部分資訊時仍保留在菜單
    Example: 菜單包含沒有分類的餐點
      Given 菜單中有一項沒有分類的餐點
      When 顧客檢視菜單
      Then 菜單結果仍包含該餐點
      And 該餐點沒有分類內容
