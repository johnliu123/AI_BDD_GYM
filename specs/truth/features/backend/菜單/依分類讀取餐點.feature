# Acceptance source: features/acceptance/顧客瀏覽餐點與分類總驗收旅程.feature / Rule: 顧客可以從菜單辨識餐點及其資訊 / Example: 顧客依分類瀏覽餐點並確認資訊相符
Feature: 依分類讀取餐點


  本 Feature 驗證：依分類讀取餐點 — 菜單餐點必須回傳其正確分類與顯示資料；沒有菜單資料時回傳空的餐點集合。
  Rule: 菜單餐點必須回傳其正確分類與顯示資料

    # Acceptance source: features/acceptance/顧客瀏覽餐點與分類總驗收旅程.feature / Rule: 顧客可以從菜單辨識餐點及其資訊 / Example: 顧客依分類瀏覽餐點並確認資訊相符
    Example: 顧客讀取菜單時餐點欄位對應正確分類
      Given 菜單資料中有多個分類及其所屬餐點
      When 顧客檢視菜單
      Then 每項餐點都包含正確的名稱、圖片、價格與分類
      And 每項餐點的分類都符合其菜單資料關聯

    # Acceptance source: features/acceptance/顧客瀏覽餐點與分類總驗收旅程.feature / Rule: 顧客可以從菜單辨識餐點及其資訊 / Example: 顧客依分類瀏覽餐點並確認資訊相符
    Example: 顧客依分類檢視菜單
      Given 菜單中有屬於不同分類的餐點
      When 顧客檢視分類 "主餐" 的菜單
      Then 結果只包含分類 "主餐" 的餐點
      And 每項餐點都包含正確的名稱、圖片、價格與分類

  Rule: 沒有菜單資料時回傳空的餐點集合

    # Acceptance source: features/acceptance/顧客瀏覽餐點與分類總驗收旅程.feature / Rule: 沒有餐點時顧客仍能辨識菜單狀態 / Example: 顧客開啟尚無餐點的菜單
    Example: 顧客檢視尚無餐點的菜單
      Given 菜單中沒有任何餐點
      When 顧客檢視菜單
      Then 餐點結果為空集合
      And 分類資料不會被錯誤呈現為餐點
