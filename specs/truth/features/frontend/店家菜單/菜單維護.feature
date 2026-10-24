# Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家可以維護分類、餐點與規格 / Example: 店家建立分類與餐點後顧客可在菜單中看到
Feature: 店家維護菜單資料

  Rule: 店家建立的菜單資料會呈現在顧客菜單

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家可以維護分類、餐點與規格 / Example: 店家建立分類與餐點後顧客可在菜單中看到
    Example: 店家建立分類與餐點
      Given 店家管理人員具有菜單管理權限
      When 店家建立一個分類與一項包含名稱、價格及所屬分類的餐點
      Then 店家看到分類與餐點已保存
      And 顧客菜單可呈現該餐點

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家可以維護分類、餐點與規格 / Example: 店家修改餐點資料不會改寫既有訂單
    Example: 店家更新餐點資料後既有訂單快照不變
      Given 菜單中有一項餐點且已有引用該餐點的訂單
      When 店家更新餐點名稱或價格
      Then 顧客菜單呈現更新後的餐點資料
      And 既有訂單仍顯示建立當時的名稱與金額快照

  Rule: 店家可維護餐點規格群組與選項

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家可以維護分類、餐點與規格 / Example: 店家維護餐點規格群組與選項
    Example: 店家儲存規格群組與選項
      Given 店家管理人員具有菜單管理權限
      And 菜單中有一項可維護規格的餐點
      When 店家維護餐點的規格群組與選項
      Then 店家看到規格群組與選項已保存
      And 顧客菜單可呈現更新後的規格及加價
