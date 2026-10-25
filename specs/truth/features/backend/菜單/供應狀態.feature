# Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家維護供應狀態後顧客流程立即遵循最新狀態 / Example: 餐點售完後禁止新增至購物車與建立訂單
Feature: 店家更新菜單供應狀態


  本 Feature 驗證：店家更新菜單供應狀態 — 店家供應狀態更新會持久化並供顧客菜單讀取；店家可單獨切換規格選項供應狀態。
  Rule: 店家供應狀態更新會持久化並供顧客菜單讀取

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家維護供應狀態後顧客流程立即遵循最新狀態 / Example: 餐點售完後禁止新增至購物車與建立訂單
    Example: 店家將餐點停止供應
      Given 一項供應中的餐點存在於菜單
      When 店家將該餐點設為停止供應
      Then 餐點供應狀態持久化為停止供應
      And 顧客菜單讀取到該餐點為停止供應

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家維護供應狀態後顧客流程立即遵循最新狀態 / Example: 店家恢復供應後顧客可以再次購買
    Example: 店家恢復餐點供應
      Given 一項停止供應的餐點存在於菜單
      When 店家恢復該餐點供應
      Then 餐點供應狀態持久化為供應中
      And 顧客菜單讀取到該餐點為供應中

  Rule: 店家可單獨切換規格選項供應狀態

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家維護供應狀態後顧客流程立即遵循最新狀態 / Example: 店家停止供應單一規格選項
    Example: 店家停止供應單一規格選項
      Given 一項供應中的餐點有多個供應中的規格選項
      When 店家將一個規格選項設為停止供應
      Then 該規格選項供應狀態持久化為停止供應
      And 其他規格選項仍維持供應中
