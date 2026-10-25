# Acceptance source: features/acceptance/店家處理訂單與出餐.feature / Rule: 店家可以檢視訂單佇列與訂單快照 / Example: 店家查看待處理訂單及其明細
Feature: 店家檢視及處理訂單看板


  本 Feature 驗證：店家檢視及處理訂單看板 — 店家可依狀態檢視訂單與建立時快照；店家只能按流程推進訂單狀態。
  Rule: 店家可依狀態檢視訂單與建立時快照

    Example: 店家查看待處理訂單列表
      Given 店家看板有多筆不同狀態的訂單
      And 店家管理人員具有訂單檢視權限
      When 店家管理人員依狀態檢視訂單列表
      Then 店家看見符合狀態的訂單編號、狀態、建立時間與金額

    # Acceptance source: features/acceptance/店家處理訂單與出餐.feature / Rule: 店家可以檢視訂單佇列與訂單快照 / Example: 店家查看待處理訂單及其明細
    Example: 店家查看單筆訂單明細
      Given 店家管理人員具有訂單檢視權限且訂單已建立
      When 店家管理人員開啟該訂單詳情
      Then 店家看到餐點名稱、規格、數量及金額快照

    # Acceptance source: features/acceptance/店家處理訂單與出餐.feature / Rule: 店家可以檢視訂單佇列與訂單快照 / Example: 未獲授權的人員無法查看訂單
    Example: 未授權店家看不到訂單
      Given 店家管理人員沒有有效的訂單檢視權限
      When 該人員嘗試開啟店家訂單看板
      Then 看板顯示憑證或權限錯誤
      And 訂單內容不會顯示

  Rule: 店家只能按流程推進訂單狀態

    # Acceptance source: features/acceptance/店家處理訂單與出餐.feature / Rule: 訂單依店家出餐流程逐步前進 / Example: 店家接單、開始出餐並完成訂單
    Example: 店家接受已建立訂單
      Given 店家看板有一筆狀態為「已建立」的訂單
      When 店家管理人員接受該訂單
      Then 看板顯示該訂單狀態為「已接單」

    # Acceptance source: features/acceptance/店家處理訂單與出餐.feature / Rule: 訂單依店家出餐流程逐步前進 / Example: 店家接單、開始出餐並完成訂單
    Example: 店家開始準備已接單訂單
      Given 店家看板有一筆狀態為「已接單」的訂單
      When 店家管理人員開始準備該訂單
      Then 看板顯示該訂單狀態為「出餐中」

    # Acceptance source: features/acceptance/店家處理訂單與出餐.feature / Rule: 訂單依店家出餐流程逐步前進 / Example: 店家接單、開始出餐並完成訂單
    Example: 店家完成出餐中的訂單
      Given 店家看板有一筆狀態為「出餐中」的訂單
      When 店家管理人員完成該訂單
      Then 看板顯示該訂單狀態為「已完成」

    # Acceptance source: features/acceptance/店家處理訂單與出餐.feature / Rule: 訂單依店家出餐流程逐步前進 / Example: 店家無法跳過流程或倒退已完成訂單
    Example: 非法狀態操作遭拒且畫面維持原狀
      Given 店家看板有一筆不能執行指定轉換的訂單
      When 店家管理人員嘗試非法狀態操作
      Then 看板顯示狀態操作遭拒
      And 訂單狀態維持不變
