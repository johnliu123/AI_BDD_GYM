# Acceptance source: features/acceptance/店家處理訂單與出餐.feature / Rule: 店家可以檢視訂單佇列與訂單快照 / Example: 店家查看待處理訂單及其明細
Feature: 顧客查詢店家更新後的訂單狀態


  本 Feature 驗證：顧客查詢店家更新後的訂單狀態 — 顧客查詢呈現持久化的最新出餐狀態。
  Rule: 顧客查詢呈現持久化的最新出餐狀態

    # Acceptance source: features/acceptance/店家處理訂單與出餐.feature / Rule: 訂單依店家出餐流程逐步前進 / Example: 店家接單、開始出餐並完成訂單
    Example: 顧客看到店家接單後的狀態
      Given 顧客在目前工作階段建立一筆訂單且店家已接單
      When 顧客查詢該訂單
      Then 顧客看到狀態「已接單」
      And 訂單明細與金額快照維持建立時內容

    # Acceptance source: features/acceptance/店家處理訂單與出餐.feature / Rule: 訂單依店家出餐流程逐步前進 / Example: 店家接單、開始出餐並完成訂單
    Example: 顧客看到店家完成出餐後的狀態
      Given 顧客在目前工作階段建立一筆已完成的訂單
      When 顧客查詢該訂單
      Then 顧客看到狀態「已完成」
      And 顯示狀態與店家持久化狀態一致
