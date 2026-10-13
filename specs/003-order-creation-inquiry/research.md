# 研究：點餐系統第三迭代－訂單建立與查詢

- **來源規格**：[spec.md](./spec.md)

## 決策摘要

### 延續既有前後端與訪客工作階段

- **決策**（**Decision**）：延續第二迭代已落地的 React + Vite 前端、Node.js + Express REST JSON API、Microsoft SQL Server（`mssql` driver）與 `guest_session` cookie／`guest_sessions` 表、`GET/POST /api/cart` 及 CSRF／Origin 防護。本迭代新增 `POST /api/orders`（由目前工作階段購物車建立訂單）與 `GET /api/orders/{order_number}`（同一工作階段查詢），不新增微服務或登入。
- **理由**（**Rationale**）：spec FR-010 要求與購物車相同的工作階段模型；002 已實作 session 邊界、精確計價（`money.js`）與購物車可用性判定（`cartPricing`），訂單建立應在同一程序內重用，避免重複建置身份或計價邏輯。Express 路由慣例已存在於 `backend/src/routes/cart.js`。
- **考慮過的替代方案**（**Alternatives considered**）：獨立訂單服務或事件匯流排超出本迭代範圍；以 JWT 自報 session 違反 FR-010。
- **失敗處理**（**Failure handling**）：session 無效或 CSRF／Origin 失敗時沿用既有 403 契約；資料庫或交易失敗時不留下部分訂單、不清空購物車。

### 訂單建立交易與購物車清空

- **決策**（**Decision**）：建立訂單須在**單一資料庫交易**內完成：讀取並計價目前購物車、拒絕空車或含不可用項目、寫入訂單標頭與明細（含名稱／規格摘要與金額快照）、刪除該 cart 下所有項目（或等價清空），最後提交。任一步驗證失敗則整筆回滾。
- **理由**（**Rationale**）：對應 spec FR-004、FR-005、FR-006、BR-002 與 SC-003、SC-006；PostgreSQL／SQL Server 交易語意保證「有訂單則 cart 已清空、無訂單則 cart 不變」。來源：[SQL Server Transactions](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/transactions-transact-sql)。
- **考慮過的替代方案**（**Alternatives considered**）：先建單後非同步清 cart 可能雙重送單或留下幽靈項目；保留 cart 僅標記已下單會違反 FR-006。
- **失敗處理**（**Failure handling**）：建立當下餐點或規格變不可用時整筆拒絕（spec 邊界情況）；計價失敗不得採用客戶端金額。

### 訂單金額快照與查詢權威

- **決策**（**Decision**）：建立訂單時以**當下**伺服器讀取的餐點價格與規格加價（沿用 `money.js`／購物車計價邏輯）計算單價與項目金額，將 `unit_price`、`line_total`、`total_amount` 以 `DECIMAL(10,2)` 持久化；API 以十進位字串回傳。查詢訂單**只讀快照**，不以最新菜單重算。
- **理由**（**Rationale**）：spec BR-001、FR-011、US2 驗收情境 2 與 SC-002；與購物車「最新價格」政策刻意分離：購物車是意圖緩衝，訂單是已成立紀錄。
- **考慮過的替代方案**（**Alternatives considered**）：查詢時重算會違反 BR-001；只存總額不存明細無法驗證 SC-001。
- **失敗處理**（**Failure handling**）：請求 body 若含 `total` 或項目金額欄位，伺服器忽略；持久化與回應僅用伺服器計算結果。

### 訂單編號產生

- **決策**（**Decision**）：成功建立時產生 **`ORD-` + UTC 日期 `YYYYMMDD` + `-` + 8 位大寫十六進位隨機字串**（例如 `ORD-20261013-A1B2C3D4`），資料庫對 `order_number` 設 **UNIQUE**；插入碰撞時在同一交易外重試產生（實作以有限次重試＋唯一約束防競態）。
- **理由**（**Rationale**）：滿足 FR-002「全系統唯一、可供顧客引用」；日期前綴利於人工辨識；隨機後綴避免可枚舉序號洩漏訂單量。Node.js `crypto.randomBytes(4).toString('hex')` 提供 32-bit 熵，搭配唯一索引處理極 rare 碰撞。
- **考慮過的替代方案**（**Alternatives considered**）：純 UUID 可讀性較差；僅自增 ID 易猜測且不適合作顧客-facing 編號。
- **失敗處理**（**Failure handling**）：多次碰撞或產生失敗回 500，不寫入部分訂單。

### 冪等鍵與避免重複送單

- **決策**（**Decision**）：`POST /api/orders` 接受可選 HTTP header **`Idempotency-Key`**（1–128 字元，建議 UUID）；與 `guest_session_id` 配對寫入 `order_idempotency_keys` 表（複合 UNIQUE）。相同 session＋key 的重送在 key **未過期**時回傳**同一筆**訂單（HTTP **200**）與首次成功相同 body，不建立第二筆訂單。Key 缺漏時每次有效請求獨立處理（spec 邊界）。保留期限預設 **24 小時**（與 spec Q10 idle 對齊），過期後相同 key 視為新請求。
- **理由**（**Rationale**）：落實 FR-007、BR-003、SC-004；Stripe 等 API 慣例使用 `Idempotency-Key` header 處理網路重試。來源：[Stripe Idempotent requests](https://docs.stripe.com/api/idempotent_requests)（模式參考，非本專案依賴）。
- **考慮過的替代方案**（**Alternatives considered**）：僅前端 disable 按鈕無法防重送；全域 key 不含 session 可能跨使用者碰撞。
- **失敗處理**（**Failure handling**）：首次請求失敗（4xx）不記錄冪等成功結果，允許修正 cart 後重試；5xx 不記錄或標記失敗以便重試（實作須在 API 契約中明列）。

### 訂單查詢授權

- **決策**（**Decision**）：查詢以 path 參數 `order_number` 定位，SQL 條件同時匹配 **`orders.order_number` 與 `orders.guest_session_id = 目前 session`**；不符合時回 **404**（不區分「不存在」與「非本 session」以避免資訊洩漏，對應 spec US2 情境 3–4）。
- **理由**（**Rationale**）：FR-008、FR-010、SC-005；OWASP 建議授權檢查在伺服器端依資源擁有者判定。來源：[OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)。
- **考慮過的替代方案**（**Alternatives considered**）：僅憑訂單編號公開查詢違反 FR-010 假設。
- **失敗處理**（**Failure handling**）：404 統一錯誤碼 `ORDER_NOT_FOUND`；不回傳其他訂單是否存在。

### 訂單狀態

- **決策**（**Decision**）：持久化欄位 `status` 固定列舉值 **`created`**（API 對外顯示 **`已建立`**）；本迭代不提供狀態轉換 API。
- **理由**（**Rationale**）：spec 假設與邊界情況：第四迭代才接店家流程。
- **考慮過的替代方案**（**Alternatives considered**）：預先實作 `paid`／`cancelled` 屬第五迭代。
- **失敗處理**（**Failure handling**）：不適用。

## 技術參考

- Microsoft, [Transactions (Transact-SQL)](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/transactions-transact-sql)
- OWASP, [Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- OWASP, [Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- Node.js, [Crypto randomBytes](https://nodejs.org/api/crypto.html#cryptorandombytesize-callback)
- Stripe, [Idempotent requests](https://docs.stripe.com/api/idempotent_requests)（冪等 header 模式參考）
- 第二迭代：[research.md](../002-shopping-cart-total-calculation/research.md)、[techstack.md](../002-shopping-cart-total-calculation/techstack.md)、[contracts/http-api.yaml](../002-shopping-cart-total-calculation/contracts/http-api.yaml)

## 已確認需求

- **FR-001 至 FR-007、BR-001 至 BR-003、SC-001 至 SC-004、SC-006**：建立訂單、快照、驗證、冪等、清空購物車。規格依據：[spec.md](./spec.md) US1。
- **FR-008、FR-009、SC-005**：同一 session 查詢、快照呈現、跨 session 拒絕。規格依據：US2。
- **FR-010、FR-011**：工作階段綁定與伺服器計價。規格依據：全域需求。

## 尚未決定與證據限制

- 冪等記錄清理 job 是否與 `sessionMaintenance` 同一排程，由實作 tasks 決定；**保留期限已於 spec 澄清 Q12 定為預設 24h**（`IDEMPOTENCY_TTL_MS` 可覆寫）。
- 5xx 未建單不寫入冪等映射已於 spec Q13 與 API 契約定案。
- 訂單明細「規格摘要」JSON 或正規化列由 data-model／API plan 定案；須能呈現建立當下選項名稱。
- 本迭代不含付款狀態欄位（spec 假設）；第四迭代若需預留欄位須另開 spec 修訂。

<!-- Constitution self-check: pass -->
