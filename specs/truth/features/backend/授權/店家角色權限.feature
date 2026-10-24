Feature: 店家操作依角色權限授權

  Rule: 訂單管理權限允許讀取訂單

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家權限依職責隔離 / Example: 菜單管理人員與訂單管理人員只能執行各自職責
    Example: orders-only 憑證允許訂單操作但拒絕菜單寫入
      Given 店家憑證只有訂單管理權限
      When 憑證持有人讀取訂單列表
      Then 訂單列表讀取成功

  Rule: 訂單管理權限不得寫入菜單

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家權限依職責隔離 / Example: 菜單管理人員與訂單管理人員只能執行各自職責
    Example: orders-only 憑證不能建立菜單分類
      Given 店家憑證只有訂單管理權限
      When 憑證持有人建立菜單分類
      Then 系統拒絕菜單寫入且不新增分類

  Rule: 菜單管理權限允許寫入菜單

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家權限依職責隔離 / Example: 菜單管理人員與訂單管理人員只能執行各自職責
    Example: menu-only 憑證允許建立菜單分類
      Given 店家憑證只有菜單管理權限
      When 憑證持有人建立菜單分類
      Then 菜單寫入成功

  Rule: 菜單管理權限不得操作訂單

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家權限依職責隔離 / Example: 菜單管理人員與訂單管理人員只能執行各自職責
    Example: menu-only 憑證不能接受訂單
      Given 店家憑證只有菜單管理權限
      And 系統已有一筆可接受的訂單
      When 憑證持有人接受一筆已建立訂單
      Then 系統拒絕訂單狀態變更
      And 訂單狀態維持不變

  Rule: 店家權限依伺服器憑證設定判定

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家權限依職責隔離 / Example: 菜單管理人員與訂單管理人員只能執行各自職責
    Example: 用戶端自稱管理員不能提升店家權限
      Given 店家憑證只有菜單管理權限
      And 系統已有一筆可接受的訂單
      When 憑證持有人自稱具有完整管理權限並接受訂單
      Then 系統拒絕訂單狀態變更
      And 訂單狀態維持不變

  Rule: 完整管理權限允許寫入菜單

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家權限依職責隔離 / Example: 菜單管理人員與訂單管理人員只能執行各自職責
    Example: admin 憑證可以建立菜單分類
      Given 店家憑證具有完整管理權限
      When 憑證持有人建立菜單分類
      Then 菜單寫入成功

  Rule: 完整管理權限允許讀取訂單

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家權限依職責隔離 / Example: 菜單管理人員與訂單管理人員只能執行各自職責
    Example: admin 憑證可以讀取訂單列表
      Given 店家憑證具有完整管理權限
      When 憑證持有人讀取訂單列表
      Then 訂單列表讀取成功

  Rule: 無有效權限時不得使用店家管理功能

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家權限依職責隔離 / Example: 未授權人員無法使用店家管理功能
    Example: 未提供有效憑證時店家菜單寫入遭拒
      Given 店家請求沒有有效管理憑證
      When 請求者嘗試建立菜單分類
      Then 系統拒絕存取且不新增分類
