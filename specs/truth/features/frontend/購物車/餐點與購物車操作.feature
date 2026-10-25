# Acceptance source: features/acceptance/顧客管理購物車與金額.feature / Rule: 顧客可以將依規格選擇的供應中餐點加入購物車 / Example: 顧客選完每個規格群組後加入餐點
Feature: 顧客選擇規格並管理購物車


  本 Feature 驗證：顧客選擇規格並管理購物車 — 顧客依規格選擇加入供應中的餐點；顧客調整購物車後看到依目前資料計算的金額；不可用項目保留供顧客確認及移除 等。
  Rule: 顧客依規格選擇加入供應中的餐點

    Example: 顧客選完每個規格群組後加入餐點
      Given 購物車測試菜單中有以下餐點：
        | 餐點 | 價格 | 供應狀態 | 規格群組 | 選項 | 加價 |
        | 漢堡 | 10.00 | 供應中 | 麵包 | 全麥 | 1.00 |
        | 漢堡 | 10.00 | 供應中 | 飲料 | 紅茶 | 2.00 |
      When 顧客選擇餐點 "漢堡" 的每個規格群組各一個選項並加入購物車
      Then 購物車顯示餐點 "漢堡"、所選規格及數量 1
      And 購物車顯示包含規格加價的項目金額

    # Acceptance source: features/acceptance/顧客管理購物車與金額.feature / Rule: 顧客可以將依規格選擇的供應中餐點加入購物車 / Example: 顧客無法加入未供應餐點或未選完整規格的餐點
    Example: 未完成規格選擇時加入遭拒
      Given 菜單中有需要選擇多個規格群組的餐點 "套餐"
      When 顧客未完成規格選擇就嘗試加入餐點 "套餐"
      Then 購物車項目未增加
      And 購物車總額維持不變

    # Acceptance source: features/acceptance/顧客管理購物車與金額.feature / Rule: 顧客可以將依規格選擇的供應中餐點加入購物車 / Example: 顧客無法加入未供應餐點或未選完整規格的餐點
    Example: 未供應餐點加入遭拒
      Given 購物車測試菜單中有以下餐點：
        | 餐點 | 價格 | 供應狀態 | 規格群組 | 選項 | 加價 |
        | 漢堡 | 10.00 | 未供應 | | | |
      When 顧客嘗試加入餐點 "漢堡"
      Then 購物車項目未增加
      And 購物車總額維持不變

  Rule: 顧客調整購物車後看到依目前資料計算的金額

    # Acceptance source: features/acceptance/顧客管理購物車與金額.feature / Rule: 顧客管理購物車後金額依目前可用項目重新計算 / Example: 顧客修改數量與刪除項目後看到最新總額
    Example: 顧客修改可用項目數量
      Given 購物車有一個可用餐點 "漢堡"
      When 顧客將餐點 "漢堡" 的數量改為 2
      Then 購物車顯示餐點 "漢堡" 的數量 2 與更新後金額
      And 購物車總額等於所有可用項目依目前價格計算後的總和

    # Acceptance source: features/acceptance/顧客管理購物車與金額.feature / Rule: 顧客管理購物車後金額依目前可用項目重新計算 / Example: 顧客修改數量與刪除項目後看到最新總額
    Example: 顧客刪除購物車項目
      Given 購物車有多個可用餐點項目
      When 顧客刪除購物車中的餐點 "漢堡"
      Then 購物車不再包含餐點 "漢堡"
      And 購物車總額等於所有可用項目依目前價格計算後的總和

    # Acceptance source: features/acceptance/顧客管理購物車與金額.feature / Rule: 顧客管理購物車後金額依目前可用項目重新計算 / Example: 菜單價格變更後以目前價格更新購物車
    Example: 菜單價格變更後顧客看到最新金額
      Given 購物車已有餐點 "漢堡" 且菜單價格或規格加價已更新
      When 顧客檢視購物車
      Then 項目與購物車總額依目前菜單價格重新計算

  Rule: 不可用項目保留供顧客確認及移除

    # Acceptance source: features/acceptance/顧客管理購物車與金額.feature / Rule: 不可用購物車項目須保留並排除於總額 / Example: 餐點或規格停止供應後仍可移除購物車項目
    Example: 停供項目不顯示金額且不計入總額
      Given 購物車有一項已停止供應的餐點 "漢堡" 及其他可用項目
      When 顧客檢視購物車
      Then 購物車將餐點 "漢堡" 標示為不可用
      And 購物車不顯示餐點 "漢堡" 的金額且不計入總額

    # Acceptance source: features/acceptance/顧客管理購物車與金額.feature / Rule: 不可用購物車項目須保留並排除於總額 / Example: 餐點或規格停止供應後仍可移除購物車項目
    Example: 顧客無法修改不可用項目數量
      Given 購物車有一項不可用餐點 "漢堡"
      When 顧客將餐點 "漢堡" 的數量改為 2
      Then 系統拒絕修改且購物車內容維持不變
    # Acceptance source: features/acceptance/顧客管理購物車與金額.feature / Rule: 不可用購物車項目須保留並排除於總額 / Example: 餐點或規格停止供應後仍可移除購物車項目
    Example: 顧客仍可刪除不可用項目
      Given 購物車有一項不可用餐點 "漢堡"
      When 顧客刪除購物車中的餐點 "漢堡"
      Then 購物車不再包含餐點 "漢堡"

  Rule: 不同工作階段的購物車互相隔離

    # Acceptance source: features/acceptance/顧客管理購物車與金額.feature / Rule: 不同訪客工作階段的購物車互相隔離 / Example: 不同顧客無法看到彼此的購物車
    Example: 顧客只看到目前工作階段的購物車
      Given 第一個訪客工作階段的購物車已有餐點 "漢堡"
      And 第二個顧客持有不同的有效訪客工作階段
      When 第二個顧客檢視自己的購物車
      Then 第二個顧客看不到餐點 "漢堡"

  Rule: 顧客在空車時可辨識購物車狀態

    # Acceptance source: features/acceptance/顧客管理購物車與金額.feature / Rule: 空購物車仍呈現清楚狀態 / Example: 顧客開啟空購物車看到零總額
    Example: 顧客開啟空購物車
      Given 顧客目前工作階段的購物車沒有項目
      When 顧客檢視購物車
      Then 顧客看到空購物車狀態
      And 購物車總額顯示為零
