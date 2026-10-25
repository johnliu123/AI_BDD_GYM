# Acceptance source: features/acceptance/店家處理訂單與出餐.feature / Rule: 店家可以檢視訂單佇列與訂單快照 / Example: 店家查看待處理訂單及其明細
Feature: 店家讀取訂單並推進出餐狀態


  本 Feature 驗證：店家讀取訂單並推進出餐狀態 — 有權限的店家可以讀取訂單列表與快照詳情；店家狀態操作只能依有限狀態機前進；顧客查詢與店家讀取同一個持久化狀態。
  Rule: 有權限的店家可以讀取訂單列表與快照詳情

    Example: 店家依狀態篩選訂單列表
      Given 訂單資料有多筆不同狀態的訂單
      And 請求具有有效的店家訂單權限
      When 店家依狀態讀取訂單列表
      Then 回傳符合篩選條件的訂單摘要
      And 摘要包含訂單編號、狀態、建立時間與總金額

    # Acceptance source: features/acceptance/店家處理訂單與出餐.feature / Rule: 店家可以檢視訂單佇列與訂單快照 / Example: 店家查看待處理訂單及其明細
    Example: 店家讀取單筆訂單快照
      Given 訂單資料有一筆含餐點明細與金額快照的訂單
      And 請求具有有效的店家訂單權限
      When 店家依訂單編號讀取詳情
      Then 回傳訂單狀態、建立時間及完整明細快照
      And 回傳金額不受目前菜單價格影響

    # Acceptance source: features/acceptance/店家處理訂單與出餐.feature / Rule: 店家可以檢視訂單佇列與訂單快照 / Example: 未獲授權的人員無法查看訂單
    Example: 未授權請求無法讀取訂單
      Given 訂單資料中有一筆訂單
      And 請求沒有有效的店家訂單權限
      When 請求讀取訂單列表
      Then 系統拒絕讀取
      And 訂單資料不會洩漏

  Rule: 店家狀態操作只能依有限狀態機前進

    # Acceptance source: features/acceptance/店家處理訂單與出餐.feature / Rule: 訂單依店家出餐流程逐步前進 / Example: 店家接單、開始出餐並完成訂單
    Example: created 訂單接受後持久化為 accepted
      Given 一筆目前狀態為「已建立」的訂單
      And 請求具有有效的店家訂單權限
      When 店家接受該訂單
      Then 訂單狀態更新為「已接單」
      And 訂單明細與總金額快照維持不變

    # Acceptance source: features/acceptance/店家處理訂單與出餐.feature / Rule: 訂單依店家出餐流程逐步前進 / Example: 店家接單、開始出餐並完成訂單
    Example: accepted 訂單開始出餐後持久化為 preparing
      Given 一筆目前狀態為「已接單」的訂單
      And 請求具有有效的店家訂單權限
      When 店家開始準備該訂單
      Then 訂單狀態更新為「出餐中」
      And 訂單明細與總金額快照維持不變

    # Acceptance source: features/acceptance/店家處理訂單與出餐.feature / Rule: 訂單依店家出餐流程逐步前進 / Example: 店家接單、開始出餐並完成訂單
    Example: preparing 訂單完成後持久化為 completed
      Given 一筆目前狀態為「出餐中」的訂單
      And 請求具有有效的店家訂單權限
      When 店家完成該訂單
      Then 訂單狀態更新為「已完成」
      And 訂單明細與總金額快照維持不變

    # Acceptance source: features/acceptance/店家處理訂單與出餐.feature / Rule: 訂單依店家出餐流程逐步前進 / Example: 店家無法跳過流程或倒退已完成訂單
    Example: 非法狀態轉換被拒絕且持久化狀態不變
      Given 一筆目前狀態不允許指定操作的訂單
      And 請求具有有效的店家訂單權限
      When 店家嘗試執行不符合狀態機的操作
      Then 系統拒絕狀態轉換
      And 訂單持久化狀態及金額快照維持不變

  Rule: 顧客查詢與店家讀取同一個持久化狀態

    # Acceptance source: features/acceptance/店家處理訂單與出餐.feature / Rule: 訂單依店家出餐流程逐步前進 / Example: 店家接單、開始出餐並完成訂單
    Example: 顧客查詢反映店家已更新的狀態
      Given 訂單屬於目前訪客工作階段且店家已將狀態更新為「已接單」
      When 顧客以原訪客工作階段查詢該訂單
      Then 查詢回傳「已接單」狀態及對應標籤
      And 查詢結果的狀態與店家持久化狀態一致
