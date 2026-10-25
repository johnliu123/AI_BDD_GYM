# Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 店家可檢視並篩選訂單付款資訊 / Example: 店家依付款狀態篩選訂單
Feature: 店家檢視訂單付款資訊


  本 Feature 驗證：店家檢視訂單付款資訊 — 店家可依付款狀態檢視訂單列表；無效憑證不得顯示店家付款資訊；店家詳情顯示付款失敗摘要 等。
  Rule: 店家可依付款狀態檢視訂單列表

    # Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 店家可檢視並篩選訂單付款資訊 / Example: 店家依付款狀態篩選訂單
    Example: 店家依付款狀態篩選訂單
      Given 店家看板有不同付款狀態的訂單
      And 店家管理人員具有有效訂單檢視權限
      When 店家管理人員依付款狀態篩選訂單
      Then 店家看見符合付款狀態的訂單出餐與付款摘要
      And 店家看見訂單建立時金額快照

  Rule: 無效憑證不得顯示店家付款資訊

    # Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 店家可檢視並篩選訂單付款資訊 / Example: 無效店家憑證無法讀取付款資訊
    Example: 無效店家憑證無法讀取付款資訊
      Given 店家管理人員沒有有效訂單檢視權限
      When 店家管理人員嘗試讀取訂單列表
      Then 看板顯示憑證或權限錯誤
      And 訂單付款資訊不會顯示

  Rule: 店家詳情顯示付款失敗摘要

    # Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 店家訂單詳情呈現目前付款資訊 / Example: 店家查看付款失敗訂單詳情
    Example: 店家查看付款失敗訂單詳情
      Given 店家看板有一筆付款失敗且有失敗摘要的訂單
      And 店家管理人員具有有效訂單檢視權限
      When 店家管理人員開啟付款失敗訂單詳情
      Then 店家看到目前付款狀態與最後失敗原因摘要
      And 店家看見訂單建立時金額快照

  Rule: 無效憑證不得顯示訂單詳情

    # Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 店家訂單詳情呈現目前付款資訊 / Example: 無效店家憑證無法讀取訂單詳情
    Example: 無效店家憑證無法讀取訂單詳情
      Given 店家管理人員沒有有效訂單檢視權限
      When 店家管理人員嘗試讀取訂單詳情
      Then 看板顯示憑證或權限錯誤
      And 訂單付款資訊不會顯示
