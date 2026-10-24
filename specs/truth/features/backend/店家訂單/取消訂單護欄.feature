# Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 已取消訂單不得再進入店家出餐流程 / Example: 店家不能接單已取消訂單
Feature: 店家不得推進已取消訂單

  Rule: 店家不得接單已取消訂單

    # Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 已取消訂單不得再進入店家出餐流程 / Example: 店家不能接單已取消訂單
    Example: 店家不能接單已取消訂單
      Given 店家具有有效操作權限且訂單已取消
      When 店家嘗試接單已取消訂單
      Then 店家取消護欄操作遭拒
      And 店家取消護欄操作後出餐與付款狀態維持不變

  Rule: 店家不得推進已取消訂單

    # Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 已取消訂單不得再進入店家出餐流程 / Example: 店家不能推進已取消訂單
    Example: 店家不能推進已取消訂單
      Given 店家具有有效操作權限且訂單已取消
      When 店家開始準備已取消訂單
      Then 店家取消護欄操作遭拒
      And 店家取消護欄操作後出餐與付款狀態維持不變

    # Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 已取消訂單不得再進入店家出餐流程 / Example: 店家不能完成已取消訂單
    Example: 店家不能完成已取消訂單
      Given 店家具有有效操作權限且訂單已取消
      When 店家完成該訂單
      Then 店家取消護欄操作遭拒
      And 店家取消護欄操作後出餐與付款狀態維持不變
