# Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 已取消訂單不得再進入店家出餐流程 / Example: 店家不能接單已取消訂單
Feature: 店家看板阻擋已取消訂單操作

  Rule: 已取消訂單不得接單

    # Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 已取消訂單不得再進入店家出餐流程 / Example: 店家不能接單已取消訂單
    Example: 店家不能接單已取消訂單
      Given 店家看板有一筆已取消的訂單
      When 店家管理人員嘗試接單已取消訂單
      Then 看板顯示狀態操作遭拒
      And 訂單狀態維持不變

  Rule: 已取消訂單不得推進出餐

    # Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 已取消訂單不得再進入店家出餐流程 / Example: 店家不能推進已取消訂單
    Example: 店家不能推進已取消訂單
      Given 店家看板有一筆已取消的訂單
      When 店家管理人員嘗試推進已取消訂單
      Then 看板顯示狀態操作遭拒
      And 訂單狀態維持不變

    # Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 已取消訂單不得再進入店家出餐流程 / Example: 店家不能完成已取消訂單
    Example: 店家不能完成已取消訂單
      Given 店家看板有一筆已取消的訂單
      When 店家管理人員嘗試完成已取消訂單
      Then 看板顯示狀態操作遭拒
      And 訂單狀態維持不變
