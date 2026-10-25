# Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家維護供應狀態後顧客流程立即遵循最新狀態 / Example: 餐點售完後禁止新增至購物車與建立訂單
Feature: 交易操作依最新餐點供應狀態驗證


  本 Feature 驗證：交易操作依最新餐點供應狀態驗證 — 已停止供應的餐點不得新增至購物車；建立訂單時必須再次驗證整個購物車。
  Rule: 已停止供應的餐點不得新增至購物車

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家維護供應狀態後顧客流程立即遵循最新狀態 / Example: 餐點售完後禁止新增至購物車與建立訂單
    Example: 顧客加入時餐點已售完
      Given 菜單中的餐點 "漢堡" 已停止供應
      When 顧客嘗試將餐點 "漢堡" 加入購物車
      Then 系統拒絕新增購物車項目
      And 購物車內容維持不變

  Rule: 建立訂單時必須再次驗證整個購物車

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家維護供應狀態後顧客流程立即遵循最新狀態 / Example: 餐點售完後禁止新增至購物車與建立訂單
    Example: 加購後餐點售完使建立訂單遭拒
      Given 顧客購物車有餐點且該餐點已停止供應
      When 顧客送出建立訂單
      Then 系統拒絕建立訂單且不產生訂單編號
      And 購物車內容維持不變

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家維護供應狀態後顧客流程立即遵循最新狀態 / Example: 餐點售完後禁止新增至購物車與建立訂單
    Example: 餐點恢復供應後可以建立訂單
      Given 顧客購物車有餐點且該餐點已恢復供應
      When 顧客送出建立訂單
      Then 系統成功建立訂單
      And 訂單金額依建立當時菜單快照計算
