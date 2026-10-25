# Acceptance source: features/acceptance/顧客瀏覽餐點與分類總驗收旅程.feature / Rule: 顧客可以從菜單辨識餐點及其資訊 / Example: 顧客依分類瀏覽餐點並確認資訊相符
Feature: 顧客依分類瀏覽餐點


  本 Feature 驗證：顧客依分類瀏覽餐點 — 顧客選擇分類後只看到該分類的餐點資訊。
  Rule: 顧客選擇分類後只看到該分類的餐點資訊

    Example: 顧客切換分類並辨識餐點資料
      Given 菜單中有以下餐點：
        | 分類 | 餐點 | 圖片 | 價格 |
        | 主餐 | 素食漢堡 | menu/veggie-burger.png | 120 |
        | 飲品 | 無糖茶 | menu/tea.png | 35 |
      When 顧客切換到分類 "主餐"
      Then 菜單只顯示分類 "主餐" 的餐點
      And 每張餐點卡都顯示該餐點的名稱、圖片、價格與分類
