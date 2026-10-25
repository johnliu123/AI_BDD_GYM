# Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 顧客查詢反映持久化的付款與取消狀態 / Example: 顧客查詢付款失敗訂單
Feature: 顧客查詢付款與取消狀態


  本 Feature 驗證：顧客查詢付款與取消狀態 — 顧客查詢顯示付款失敗狀態；顧客查詢顯示已取消狀態。
  Rule: 顧客查詢顯示付款失敗狀態

    # Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 顧客查詢反映持久化的付款與取消狀態 / Example: 顧客查詢付款失敗訂單
    Example: 顧客查詢付款失敗訂單
      Given 顧客在目前訪客工作階段有一筆付款失敗的訂單
      When 顧客查詢該訂單
      Then 顧客看到付款失敗狀態及其對應中文標籤
      And 訂單明細及金額快照維持不變

  Rule: 顧客查詢顯示已取消狀態

    # Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 顧客查詢反映持久化的付款與取消狀態 / Example: 顧客查詢已取消訂單
    Example: 顧客查詢已取消訂單
      Given 顧客在目前訪客工作階段有一筆已取消的訂單
      When 顧客查詢該訂單
      Then 顧客看到已取消的出餐狀態及付款狀態標籤
      And 顧客看到訂單明細與建立時金額快照
