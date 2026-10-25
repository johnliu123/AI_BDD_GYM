# Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 完整點餐旅程的結果一致 / Example: 顧客完成點餐後店家完成出餐
Feature: 顧客點餐與店家出餐旅程


  本 Feature 驗證：顧客點餐與店家出餐旅程 — 顧客建立訂單後店家完成出餐；建立訂單時必須再次驗證餐點供應狀態；顧客提供的金額不會改變伺服器訂單快照 等。
  Rule: 顧客建立訂單後店家完成出餐

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 完整點餐旅程的結果一致 / Example: 顧客完成點餐後店家完成出餐
    Example: 顧客從菜單完成一筆訂單
      Given 菜單有一項供應中且可選規格的餐點
      When 顧客將餐點加入購物車
      Then 購物車包含該餐點及有效選項

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 完整點餐旅程的結果一致 / Example: 顧客完成點餐後店家完成出餐
    Example: 顧客從購物車建立訂單
      Given 顧客購物車有一項可用餐點
      When 顧客建立訂單
      Then 訂單建立成功且保存建立時金額快照

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 完整點餐旅程的結果一致 / Example: 顧客完成點餐後店家完成出餐
    Example: 顧客完成訂單付款
      Given 顧客有一筆未付款訂單
      When 顧客付款成功
      Then 付款狀態更新為「已付款」
      And 訂單金額維持建立時快照

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 完整點餐旅程的結果一致 / Example: 顧客完成點餐後店家完成出餐
    Example: 店家依序接單並完成出餐
      Given 店家有一筆已付款且狀態為「已建立」的訂單
      When 店家接單
      Then 訂單狀態更新為「已接單」

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 完整點餐旅程的結果一致 / Example: 顧客完成點餐後店家完成出餐
    Example: 店家完成已接單訂單出餐
      Given 店家有一筆狀態為「已接單」的訂單
      When 店家開始出餐
      Then 訂單狀態更新為「出餐中」

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 完整點餐旅程的結果一致 / Example: 顧客完成點餐後店家完成出餐
    Example: 店家完成出餐中的訂單
      Given 店家有一筆狀態為「出餐中」的訂單
      When 店家完成訂單
      Then 訂單狀態更新為「已完成」
      And 顧客查詢時看到與店家一致的狀態

  Rule: 建立訂單時必須再次驗證餐點供應狀態

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 店家維護供應狀態後顧客流程立即遵循最新狀態 / Example: 餐點售完後禁止新增至購物車與建立訂單
    Example: 餐點售完後建立訂單遭拒
      Given 顧客購物車有一項其後已停止供應的餐點
      When 顧客建立訂單
      Then 系統拒絕建立訂單且不產生新訂單
      And 購物車內容維持不變

  Rule: 顧客提供的金額不會改變伺服器訂單快照

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 完整點餐旅程的結果一致 / Example: 建單或付款請求提供不同金額仍以訂單快照為準
    Example: 顧客以不同總額建立訂單仍保存伺服器快照
      Given 顧客購物車有一項可用餐點
      When 顧客以與實際應付金額不同的金額建立訂單
      Then 訂單金額依伺服器菜單價格計算
      And 客戶端提供的金額不會改變訂單快照

  Rule: 預設整合驗證入口可在 CI 環境執行

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: 完整點餐旅程的結果一致 / Example: 預設整合驗證可在 CI 環境重複執行
    Example: 團隊執行預設整合驗證
      Given 專案提供預設整合驗證命令與測試環境
      When 團隊執行預設整合驗證
      Then 整合測試在預設 CI 環境完成並回報執行結果
