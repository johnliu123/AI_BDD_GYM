# Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家維護供應狀態後顧客流程立即遵循最新狀態 / Example: 餐點售完後禁止新增至購物車與建立訂單
Feature: 店家更新餐點供應狀態

  Rule: 店家可切換餐點供應狀態

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家維護供應狀態後顧客流程立即遵循最新狀態 / Example: 餐點售完後禁止新增至購物車與建立訂單
    Example: 店家將供應中的餐點標記為售完
      Given 一項供應中的餐點顯示在店家菜單管理清單
      When 店家將該餐點標記為停止供應
      Then 店家看到該餐點已停止供應
      And 菜單內容更新成功

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家維護供應狀態後顧客流程立即遵循最新狀態 / Example: 店家恢復供應後顧客可以再次購買
    Example: 店家恢復已售完餐點供應
      Given 一項已停止供應的餐點顯示在店家菜單管理清單
      When 店家恢復該餐點供應
      Then 店家看到該餐點已恢復供應

  Rule: 店家可單獨切換規格選項供應狀態

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家維護供應狀態後顧客流程立即遵循最新狀態 / Example: 店家停止供應單一規格選項
    Example: 店家將單一規格選項標記為停止供應
      Given 一項供應中的餐點顯示在店家菜單管理清單且有多個供應中的規格選項
      When 店家將一個規格選項標記為停止供應
      Then 店家看到該規格選項已停止供應
      And 其他規格選項仍顯示可供應
