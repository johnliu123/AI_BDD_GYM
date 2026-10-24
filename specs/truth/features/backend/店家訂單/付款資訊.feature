# Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 店家可檢視並篩選訂單付款資訊 / Example: 店家依付款狀態篩選訂單
Feature: 店家讀取訂單付款資訊

  Rule: 店家列表依付款狀態篩選並回傳快照

    # Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 店家可檢視並篩選訂單付款資訊 / Example: 店家依付款狀態篩選訂單
    Example: 店家依付款狀態篩選訂單
      Given 店家訂單有不同付款狀態的訂單
      And 請求具有有效的店家訂單權限
      When 店家依付款狀態讀取訂單列表
      Then 回傳符合付款狀態的訂單摘要及金額快照

  Rule: 無效店家憑證不得讀取付款資訊

    # Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 店家可檢視並篩選訂單付款資訊 / Example: 無效店家憑證無法讀取付款資訊
    Example: 無效店家憑證無法讀取付款資訊
      Given 請求沒有有效的店家訂單權限
      When 請求以無效憑證讀取店家訂單列表
      Then 系統拒絕未授權讀取且不洩漏訂單

  Rule: 店家詳情回傳付款狀態與失敗摘要

    # Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 店家訂單詳情呈現目前付款資訊 / Example: 店家查看付款失敗訂單詳情
    Example: 店家讀取付款失敗訂單詳情
      Given 店家有一筆付款失敗且保留失敗摘要的訂單
      And 請求具有有效的店家訂單權限
      When 店家依訂單編號讀取詳情
      Then 詳情包含付款狀態與最後失敗原因摘要
      And 訂單詳情仍回傳建立時明細與金額快照

  Rule: 無效店家憑證不得讀取訂單詳情

    # Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 店家訂單詳情呈現目前付款資訊 / Example: 無效店家憑證無法讀取訂單詳情
    Example: 無效店家憑證無法讀取訂單詳情
      Given 請求沒有有效的店家訂單權限
      When 請求以無效憑證讀取店家訂單詳情
      Then 系統拒絕未授權讀取且不洩漏訂單
