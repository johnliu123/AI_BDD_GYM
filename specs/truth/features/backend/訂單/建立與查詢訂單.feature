# Acceptance source: features/acceptance/顧客建立與查詢訂單.feature / Rule: 顧客可將可用購物車建立為訂單 / Example: 顧客確認購物車後取得訂單紀錄
Feature: 由訪客購物車建立與查詢訂單


  本 Feature 驗證：由訪客購物車建立與查詢訂單 — 建立訂單時保存唯一訂單編號及建立時明細快照；訂單查詢限建立訂單的訪客工作階段。
  Rule: 建立訂單時保存唯一訂單編號及建立時明細快照

    Example: 可用購物車建立一筆訂單並清空購物車
      Given 目前訪客工作階段購物車有多項可用餐點與規格
      When 顧客送出建立訂單
      Then 系統建立一筆唯一訂單並回傳訂單編號
      And 訂單保存餐點、規格、數量與建立當下的價格快照
      And 訂單總金額等於建立當下各明細快照總和
      And 目前訪客工作階段購物車被清空

    # Acceptance source: features/acceptance/顧客建立與查詢訂單.feature / Rule: 不符合建立條件的購物車不得建立訂單 / Example: 空購物車或含不可用項目時建立訂單被拒絕
    Example: 購物車沒有可用項目時拒絕且保留購物車
      Given 目前訪客工作階段購物車為空或只含不可用項目
      When 顧客送出建立訂單
      Then 系統拒絕建立訂單且不寫入訂單資料
      And 購物車內容維持不變

    # Acceptance source: features/acceptance/顧客建立與查詢訂單.feature / Rule: 不符合建立條件的購物車不得建立訂單 / Example: 顧客因未收到首次結果而再次送出同一筆訂單
    Example: 相同冪等請求重送回傳原訂單
      Given 目前工作階段已以某冪等鍵成功建立一筆訂單
      When 顧客以相同工作階段及冪等鍵再次送出建立訂單
      Then 系統回傳原訂單結果
      And 系統不建立第二筆訂單

    # Acceptance source: features/acceptance/顧客建立與查詢訂單.feature / Rule: 顧客可將可用購物車建立為訂單 / Example: 顧客端金額不會覆寫訂單快照
    Example: 顧客端金額不會覆寫訂單快照
      Given 目前訪客工作階段購物車有可用項目
      When 顧客以請求附帶的不同總額送出建立訂單
      Then 訂單仍依目前菜單與規格資料計算建立時快照
      And 系統不保存顧客端提供的金額

  Rule: 訂單查詢限建立訂單的訪客工作階段

    # Acceptance source: features/acceptance/顧客建立與查詢訂單.feature / Rule: 顧客只能查詢自己建立的訂單與建立時金額 / Example: 顧客使用訂單編號查詢自己的訂單
    Example: 同一工作階段查詢訂單回傳保存的快照
      Given 目前訪客工作階段已建立一筆訂單
      And 訂單建立後菜單價格已變更
      When 目前訪客工作階段以訂單編號查詢
      Then 系統回傳訂單狀態、建立時間、明細及建立時金額快照
      And 查詢結果不依最新菜單價格重算

    # Acceptance source: features/acceptance/顧客建立與查詢訂單.feature / Rule: 顧客只能查詢自己建立的訂單與建立時金額 / Example: 其他訪客無法查詢該訂單
    Example: 不同工作階段查詢訂單不洩漏存在性
      Given 第一個訪客工作階段建立了一筆訂單
      When 第二個訪客工作階段以該訂單編號查詢
      Then 系統回傳查無訂單或等同拒絕結果
      And 系統不洩漏該訂單是否存在
