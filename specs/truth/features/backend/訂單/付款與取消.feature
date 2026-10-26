# Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 顧客可使用訂單建立時的應付金額付款 / Example: 顧客完成付款並查看付款狀態
Feature: 後端處理訂單付款與取消


  本 Feature 驗證：後端處理訂單付款與取消 — 付款金額以訂單快照為準並保存正交付款狀態；付款失敗可重試且冪等只保護成功結果；顧客取消與付款狀態在同一權威訂單上協調。
  Rule: 付款金額以訂單快照為準並保存正交付款狀態

    Example: 付款成功後保存 paid 狀態及快照金額
      Given 一筆出餐狀態為「已建立」且付款狀態為「未付款」的訂單
      And 付款服務可成功完成該筆付款
      When 顧客發起付款
      Then 訂單付款狀態更新為「已付款」
      And 入帳金額等於訂單建立時的金額快照
      And 出餐狀態與明細快照維持不變

    # Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 顧客可使用訂單建立時的應付金額付款 / Example: 顧客端提交不同金額不會改變應付金額
    Example: 付款請求金額不會覆寫訂單快照
      Given 一筆付款狀態為「未付款」的訂單
      And 付款服務可成功完成該筆付款
      When 顧客以不同於訂單金額快照的金額發起付款
      Then 系統仍依訂單建立時保存的金額完成付款
      And 訂單金額與明細快照維持不變

    # Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 顧客可使用訂單建立時的應付金額付款 / Example: 已付款或付款處理中的訂單不會重複扣款
    Example: 已付款訂單拒絕再次扣款
      Given 一筆付款狀態為「已付款」的訂單
      When 顧客再次發起付款
      Then 系統回傳已付款結果或拒絕重複付款
      And 付款狀態維持「已付款」

    # Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 顧客可使用訂單建立時的應付金額付款 / Example: 已付款或付款處理中的訂單不會重複扣款
    Example: 非 stale 的 pending 訂單拒絕新付款
      Given 一筆付款仍在有效處理期間的「處理中」訂單
      When 顧客再次發起新付款
      Then 系統拒絕新增付款流程
      And 付款狀態維持「處理中」

  Rule: 付款失敗可重試且冪等只保護成功結果

    # Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 付款失敗後顧客可以安全重試 / Example: 付款失敗後以同一訂單再次付款成功
    Example: 付款失敗後重試可更新為 paid
      Given 一筆付款狀態為「失敗」的訂單
      And 付款服務可成功完成下一次付款
      When 顧客在同一訪客工作階段重新發起付款
      Then 訂單付款狀態更新為「已付款」
      And 先前失敗結果仍可查詢
      And 出餐狀態與明細快照維持不變

    # Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 付款失敗後顧客可以安全重試 / Example: 顧客重送已成功的同一付款請求
    Example: 已成功付款請求以相同冪等鍵重送
      Given 一筆付款已成功且系統記錄了該次請求
      When 顧客重送同一付款請求
      Then 系統回傳原付款成功結果
      And 不會再次執行扣款或新增狀態轉換

    # Acceptance source: features/acceptance/付款取消與狀態查詢總驗收旅程.feature / Rule: 付款失敗後顧客可以安全重試 / Example: 付款中斷後以相同冪等鍵安全重試
    Example: pending 後 5xx 不寫 paid 冪等且同 key 可安全重試
      Given 一筆出餐狀態為「已建立」且付款狀態為「未付款」的訂單
      And 付款服務設定為 pending 後回傳 5xx 中斷
      When 顧客以冪等鍵「retry-after-5xx」發起付款
      And 付款服務恢復正常且顧客以相同冪等鍵重試付款
      Then 首次回應為伺服器錯誤且不建立代表付款成功的去重紀錄
      And 重試後訂單付款狀態更新為「已付款」
      And 不會再次執行扣款或新增狀態轉換

    # Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 付款失敗後顧客可以安全重試 / Example: 付款失敗後以同一訂單再次付款成功
    Example: 付款失敗不寫入 paid 冪等記錄
      Given 一筆付款處理中的訂單且付款服務回報失敗
      When 系統完成付款失敗處理
      Then 訂單付款狀態更新為「失敗」
      And 不建立代表付款成功的去重紀錄

  Rule: 顧客取消與付款狀態在同一權威訂單上協調

    # Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 顧客只能在訂單尚未接單時取消 / Example: 顧客取消尚未接單且未付款的訂單
    Example: 尚未接單且未付款的訂單取消後禁止付款及出餐
      Given 一筆出餐狀態為「已建立」且付款狀態為「未付款」的訂單
      When 顧客取消該訂單
      Then 訂單出餐狀態更新為「已取消」
      And 訂單付款狀態維持「未付款」
      And 後續付款與店家出餐操作均遭拒

    # Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 顧客只能在訂單尚未接單時取消 / Example: 顧客取消已付款但尚未接單的訂單
    Example: 已付款但未接單的訂單取消後同步退款
      Given 一筆出餐狀態為「已建立」且付款狀態為「已付款」的訂單
      When 顧客取消該訂單
      Then 取消成功後出餐狀態為「已取消」且付款狀態為「已退款」
      And 訂單明細與金額快照維持不變

    # Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 顧客只能在訂單尚未接單時取消 / Example: 顧客無法取消已進入出餐流程的訂單
    Example: 已進入出餐流程的訂單拒絕顧客取消
      Given 一筆已接單、出餐中或已完成的訂單
      When 顧客取消該訂單
      Then 系統拒絕取消
      And 出餐狀態與付款狀態維持不變

    # Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 顧客只能在訂單尚未接單時取消 / Example: 付款仍有效處理中時不得取消，過期處理才可安全取消
    Example: 非 stale pending 訂單拒絕取消
      Given 一筆尚未接單且付款仍在有效處理期間的訂單
      When 顧客取消該訂單
      Then 系統拒絕取消且付款狀態維持「處理中」

    # Acceptance source: features/acceptance/顧客付款與取消訂單.feature / Rule: 顧客只能在訂單尚未接單時取消 / Example: 付款仍有效處理中時不得取消，過期處理才可安全取消
    Example: stale pending 訂單同一交易中止付款並取消
      Given 一筆尚未接單且付款處理已逾等待時間的訂單
      When 顧客取消該訂單
      Then 付款狀態更新為「失敗」且出餐狀態更新為「已取消」
      And 訂單不會同時處於付款處理中與已取消
