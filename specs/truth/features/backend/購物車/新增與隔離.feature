# Acceptance source: features/acceptance/顧客管理購物車與金額.feature / Rule: 顧客可以將依規格選擇的供應中餐點加入購物車 / Example: 顧客選完每個規格群組後加入餐點
Feature: 訪客將餐點加入購物車

  Rule: 每個規格群組恰選一個有效選項後才能新增項目

    Example: 供應中餐點依完整規格選擇加入目前工作階段購物車
      Given 菜單中有供應中的餐點 "漢堡" 及其規格群組
      When 顧客將餐點 "漢堡" 及每組各一個所選規格加入購物車
      Then 目前工作階段購物車新增餐點 "漢堡" 及其規格
      And 項目金額依目前餐點價格、規格加價及數量計算

    # Acceptance source: features/acceptance/顧客管理購物車與金額.feature / Rule: 顧客可以將依規格選擇的供應中餐點加入購物車 / Example: 顧客無法加入未供應餐點或未選完整規格的餐點
    Example: 未供應餐點加入遭拒
      Given 菜單中有未供應的餐點 "漢堡"
      When 顧客嘗試將餐點 "漢堡" 加入購物車
      Then 系統拒絕新增該項目
      And 目前工作階段購物車內容維持不變

    # Acceptance source: features/acceptance/顧客管理購物車與金額.feature / Rule: 顧客可以將依規格選擇的供應中餐點加入購物車 / Example: 顧客無法加入未供應餐點或未選完整規格的餐點
    Example: 規格群組未選完整時新增遭拒
      Given 菜單中有需要選擇多個規格群組的餐點 "套餐"
      When 顧客漏選至少一個群組的選項並嘗試加入餐點 "套餐"
      Then 系統拒絕新增該項目
      And 目前工作階段購物車內容維持不變

  Rule: 每筆購物車只能由建立該購物車的訪客工作階段讀取

    # Acceptance source: features/acceptance/顧客管理購物車與金額.feature / Rule: 不同訪客工作階段的購物車互相隔離 / Example: 不同顧客無法看到彼此的購物車
    Example: 第二個工作階段讀取不到第一個工作階段的項目
      Given 第一個訪客工作階段的購物車已有餐點 "漢堡"
      When 第二個不同的訪客工作階段讀取自己的購物車
      Then 回傳的購物車不包含餐點 "漢堡"
      And 第一個工作階段的購物車內容維持不變
