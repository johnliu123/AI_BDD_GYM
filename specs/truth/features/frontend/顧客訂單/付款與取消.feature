# Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 顧客可使用訂單建立時的應付金額付款 / Example: 顧客完成付款並查看付款狀態
Feature: 顧客付款與取消自己的訂單


  本 Feature 驗證：顧客付款與取消自己的訂單 — 付款結果使用訂單快照金額且不改變出餐狀態；顧客僅能在允許的狀態取消訂單。
  Rule: 付款結果使用訂單快照金額且不改變出餐狀態

    Example: 顧客成功付款後看到已付款狀態
      Given 顧客在目前訪客工作階段有一筆未付款訂單
      When 顧客對該訂單發起付款並成功完成
      Then 訂單付款狀態更新為「已付款」
      And 已付金額等於訂單建立時保存的總金額
      And 顧客查詢訂單時看到已付款狀態與原有出餐狀態
      And 訂單明細及金額快照維持不變

    # Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 顧客可使用訂單建立時的應付金額付款 / Example: 顧客端提交不同金額不會改變應付金額
    Example: 顧客嘗試以錯誤金額付款仍依訂單快照計價
      Given 顧客在目前訪客工作階段有一筆未付款訂單
      When 顧客提交的付款資料含有不同的訂單金額
      Then 系統仍以訂單建立時保存的總金額作為應付金額
      And 訂單金額快照不會被付款資料覆寫

    # Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 付款失敗後顧客可以安全重試 / Example: 付款失敗後以同一訂單再次付款成功
    Example: 付款失敗後顧客可以重試成功
      Given 顧客的一筆訂單付款處理失敗
      When 顧客在同一訪客工作階段重新發起付款並成功完成
      Then 訂單付款狀態更新為「已付款」
      And 先前的失敗結果仍可供查詢
      And 訂單明細及金額快照維持不變

    # Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 付款失敗後顧客可以安全重試 / Example: 顧客重送已成功的同一付款請求
    Example: 顧客重送成功付款請求不會重複扣款
      Given 顧客已成功付款且系統記錄該次付款
      When 顧客重送同一付款請求
      Then 顧客看到原付款結果
      And 不會重複扣款或重複變更付款狀態

  Rule: 顧客僅能在允許的狀態取消訂單

    # Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 顧客只能在訂單尚未接單時取消 / Example: 顧客取消尚未接單且未付款的訂單
    Example: 顧客取消尚未付款且未接單的訂單
      Given 顧客有一筆尚未接單且尚未付款的訂單
      When 顧客取消該訂單
      Then 訂單出餐狀態更新為「已取消」
      And 付款狀態維持未付款
      And 訂單明細與金額快照仍可查詢
      And 後續付款及店家出餐操作都被拒絕

    # Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 顧客只能在訂單尚未接單時取消 / Example: 顧客取消已付款但尚未接單的訂單
    Example: 顧客取消已付款但未接單的訂單後看到退款
      Given 顧客有一筆已付款但尚未接單的訂單
      When 顧客取消該訂單
      Then 訂單出餐狀態更新為「已取消」
      And 付款狀態更新為「已退款」
      And 訂單明細與金額快照仍可查詢

    # Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 顧客只能在訂單尚未接單時取消 / Example: 顧客無法取消已進入出餐流程的訂單
    Example: 已接單後顧客無法取消訂單
      Given 訂單已被店家接單或已進入出餐流程
      When 顧客嘗試取消該訂單
      Then 系統拒絕取消
      And 出餐狀態與付款狀態維持不變

    # Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 顧客只能在訂單尚未接單時取消 / Example: 付款仍有效處理中時不得取消，過期處理才可安全取消
    Example: 付款仍處理中時取消遭拒
      Given 訂單尚未接單且付款狀態為「處理中」
      When 顧客取消該訂單
      Then 系統拒絕取消並維持訂單狀態

    # Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 顧客只能在訂單尚未接單時取消 / Example: 付款仍有效處理中時不得取消，過期處理才可安全取消
    Example: 付款處理逾時後取消可安全完成
      Given 訂單尚未接單且付款處理已逾等待時間
      When 顧客取消該訂單
      Then 系統先結束未完成的付款處理再將訂單標記為已取消
