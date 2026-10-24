# Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 顧客查詢反映持久化的付款與取消狀態 / Example: 顧客查詢付款失敗訂單
Feature: 顧客讀取持久化付款與取消狀態

  Rule: 訂單查詢回傳付款失敗狀態與建立時快照

    # Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 顧客查詢反映持久化的付款與取消狀態 / Example: 顧客查詢付款失敗訂單
    Example: 顧客查詢付款失敗訂單
      Given 目前訪客工作階段有一筆付款失敗的訂單
      When 顧客查詢該訂單
      Then 訂單回傳付款狀態「失敗」及對應中文標籤
      And 查詢結果的出餐狀態與金額快照維持不變

  Rule: 訂單查詢回傳已取消狀態與付款資訊

    # Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 顧客查詢反映持久化的付款與取消狀態 / Example: 顧客查詢已取消訂單
    Example: 顧客查詢已取消訂單
      Given 目前訪客工作階段有一筆已取消的訂單
      When 顧客查詢該訂單
      Then 訂單回傳已取消出餐狀態及付款狀態
      And 查詢結果的明細與金額快照維持不變
