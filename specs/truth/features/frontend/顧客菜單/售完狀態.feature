# Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家維護供應狀態後顧客流程立即遵循最新狀態 / Example: 餐點售完後禁止新增至購物車與建立訂單
Feature: 顧客菜單反映餐點供應狀態

  Rule: 顧客不能購買停止供應的餐點

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家維護供應狀態後顧客流程立即遵循最新狀態 / Example: 餐點售完後禁止新增至購物車與建立訂單
    Example: 菜單中的售完餐點清楚標示且無法選購
      Given 顧客菜單中有一項已停止供應的餐點
      When 顧客瀏覽該餐點
      Then 顧客看到明確的售完標示
      And 顧客無法進入該餐點的有效下單流程

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家維護供應狀態後顧客流程立即遵循最新狀態 / Example: 店家恢復供應後顧客可以再次購買
    Example: 餐點恢復供應後可重新選購
      Given 顧客菜單中有一項已恢復供應的餐點
      When 顧客選擇該餐點
      Then 顧客可以繼續選擇有效規格並購買
