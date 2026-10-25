# Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家權限依職責隔離 / Example: 菜單管理人員與訂單管理人員只能執行各自職責
Feature: 店家管理介面依角色限制操作


  本 Feature 驗證：店家管理介面依角色限制操作 — 菜單管理角色與訂單管理角色互相隔離。
  Rule: 菜單管理角色與訂單管理角色互相隔離

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家權限依職責隔離 / Example: 菜單管理人員與訂單管理人員只能執行各自職責
    Example: 僅有訂單權限者無法儲存菜單
      Given 店家管理人員只有訂單管理權限
      When 該人員嘗試儲存菜單變更
      Then 介面提示權限不足
      And 菜單內容維持不變

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家權限依職責隔離 / Example: 菜單管理人員與訂單管理人員只能執行各自職責
    Example: 僅有菜單權限者無法操作訂單
      Given 店家管理人員只有菜單管理權限
      When 該人員嘗試接受訂單
      Then 介面提示權限不足
      And 訂單狀態維持不變

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家權限依職責隔離 / Example: 未授權人員無法使用店家管理功能
    Example: 無有效權限者無法讀取或修改店家資料
      Given 請求者沒有有效店家管理權限
      When 請求者嘗試使用受保護的店家功能
      Then 介面顯示存取遭拒
      And 店家資料維持不變
