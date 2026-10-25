# Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家可以維護分類、餐點與規格 / Example: 店家建立分類與餐點後顧客可在菜單中看到
Feature: 店家維護菜單資料


  本 Feature 驗證：店家維護菜單資料 — 店家可以建立分類與餐點資料；店家維護的規格群組與選項可由顧客菜單讀取。
  Rule: 店家可以建立分類與餐點資料

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家可以維護分類、餐點與規格 / Example: 店家建立分類與餐點後顧客可在菜單中看到
    Example: 店家建立菜單分類
      Given 店家憑證具有菜單管理權限
      When 店家建立一個分類
      Then 分類持久化且可由店家列表讀取

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家可以維護分類、餐點與規格 / Example: 店家建立分類與餐點後顧客可在菜單中看到
    Example: 店家建立隸屬於既有分類的餐點
      Given 店家憑證具有菜單管理權限
      And 系統已有一個菜單分類
      When 店家建立一項包含名稱、價格及所屬分類的餐點
      Then 餐點持久化且顧客菜單可讀到該餐點

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家可以維護分類、餐點與規格 / Example: 店家修改餐點資料不會改寫既有訂單
    Example: 店家更新餐點名稱或價格
      Given 系統已有一項餐點且存在引用該餐點的既有訂單
      When 店家更新餐點名稱或價格
      Then 菜單資料更新為新值
      And 既有訂單快照不受影響

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家可以維護分類、餐點與規格 / Example: 店家刪除仍有餐點使用的分類
    Example: 店家刪除仍被餐點使用的分類遭拒
      Given 系統已有一個仍被餐點使用的分類
      When 店家嘗試刪除該分類
      Then 系統拒絕刪除仍被使用的分類
      And 分類與餐點關聯維持不變

  Rule: 店家維護的規格群組與選項可由顧客菜單讀取

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家可以維護分類、餐點與規格 / Example: 店家維護餐點規格群組與選項
    Example: 店家更新餐點規格群組與選項
      Given 店家憑證具有菜單管理權限
      And 系統已有一項餐點
      When 店家更新該餐點的規格群組與選項
      Then 菜單規格群組與選項持久化更新
      And 顧客菜單讀取到更新後的規格及加價
