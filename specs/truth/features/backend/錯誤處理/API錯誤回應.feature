# Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: API 錯誤一致且不洩漏內部細節 / Example: 可預期的拒絕以一致方式呈現
Feature: API 錯誤回應一致且安全

  Rule: 可預期錯誤保留穩定業務結果且不產生部分寫入

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: API 錯誤一致且不洩漏內部細節 / Example: 可預期的拒絕以一致方式呈現
    Example: 不符合資料要求的請求以結構化錯誤拒絕
      Given 建立菜單資料的請求缺少必要欄位
      When 系統處理該請求
      Then 回應包含穩定錯誤代碼與可理解的中文訊息
      And 菜單資料沒有部分寫入

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: API 錯誤回應一致且不洩漏內部細節 / Example: 可預期的拒絕以一致方式呈現
    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: API 錯誤一致且不洩漏內部細節 / Example: 可預期的拒絕以一致方式呈現
    Example: 未知操作回傳一致的查無錯誤
      Given 請求指向不存在的操作
      When 系統處理該請求
      Then 回應包含穩定的查無錯誤代碼與中文訊息
      And 回應使用一致的錯誤結構

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: API 錯誤一致且不洩漏內部細節 / Example: 可預期的拒絕以一致方式呈現
    Example: 業務規則拒絕維持既有錯誤語意
      Given 顧客對不可操作的訂單執行付款或取消
      When 系統依業務規則拒絕該操作
      Then 回應保留該業務錯誤的穩定代碼
      And 相關訂單資料沒有部分變更

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: API 錯誤一致且不洩漏內部細節 / Example: 可預期的拒絕以一致方式呈現
    Example: 預期錯誤處理不依賴外部服務
      Given 顧客或店家提出不符合業務規則的操作
      When 系統拒絕該操作
      Then 回應包含穩定錯誤代碼與可理解的中文訊息
      And 處理可預期錯誤不需呼叫外部服務

  Rule: 未預期錯誤不向請求者洩漏內部細節

    # Acceptance source: features/acceptance/店家菜單管理與整合驗證.feature / Rule: API 錯誤一致且不洩漏內部細節 / Example: 未預期錯誤不會暴露系統內部資訊
    Example: 未預期錯誤回覆通用訊息
      Given 系統處理請求時發生未預期錯誤
      When 系統回覆請求者
      Then 回應以通用中文訊息說明操作未完成
      And 回應不包含堆疊、資料庫語句或伺服器路徑
      And 錯誤細節僅供服務端記錄

