# 研究：點餐系統第二迭代－購物車與金額計算

- **來源規格**：[spec.md](./spec.md)

## 決策摘要

### 前端與 API 延續

- **決策**（**Decision**）：延續目前前端專案已採用的 React + JavaScript + Vite、Node.js LTS + Express 後端，以及 REST JSON API；購物車操作由既有 Express API 提供，不另建前端計價服務或獨立微服務。建議的資源端點為 `GET /api/cart`、`POST /api/cart/items`、`PATCH /api/cart/items/{item_id}`、`DELETE /api/cart/items/{item_id}`。
- **理由**（**Rationale**）：第一迭代已建立前後端分離與 Express 路由慣例；Express 官方文件說明路由依 HTTP method 與 route path 對應處理器，可支援上述 REST 資源操作。延續既有結構能讓菜單及購物車共用餐點資料來源。來源：[Express Routing](https://expressjs.com/en/guide/routing/)。
- **考慮過的替代方案**（**Alternatives considered**）：前端自行保存完整購物車無法維持伺服器端 session 歸屬與權威計價；新增 GraphQL 或獨立購物車服務則會引入目前規格未要求的服務邊界。
- **失敗處理**（**Failure handling**）：API 失敗或資料驗證未通過時回傳既有 JSON 錯誤格式，不回報未完成的購物車變更；前端保留可重試的錯誤狀態，不自行填入價格或總額。

### 訪客工作階段與購物車歸屬

- **決策**（**Decision**）：本迭代不建置登入或帳號認證。研究建議以 `express-session` 建立訪客工作階段，並用 `connect-pg-simple` 將 session 存於 PostgreSQL；此套件組合尚未安裝或確認採用。Express 以 `req.sessionID` 作為伺服器端工作階段識別，購物車以該識別限定，每個工作階段一個購物車。Session ID 使用 Node.js `crypto.randomBytes(32)` 產生，只透過伺服器簽發的 opaque cookie 傳遞；cookie 設為 `HttpOnly`、`SameSite=Lax`、`Path=/` 且不設定 `Domain`，正式 HTTPS 環境啟用 `Secure`。不設定持久 cookie 的 `Max-Age`；伺服器端仍須執行 idle 與 absolute expiry。不得從本文、URL、localStorage 或任意 header 接受客戶端自選的工作階段識別。
- **理由**（**Rationale**）：此決策落實 spec Q9、FR-004 對單一瀏覽器工作階段隔離的要求，而不假設不存在的帳號服務。OWASP 建議 session ID 使用 CSPRNG、至少 128 bits entropy、不得包含業務或個人資料，並將狀態保留在伺服器端；Node.js `randomBytes` 產生 cryptographically strong pseudorandom data。Express 文件指出 session cookie 只保存 ID、session data 存於伺服器端，且預設 MemoryStore 不適合正式環境。`connect-pg-simple` 提供 PostgreSQL 相容 store 與過期清理設定。採 `SameSite=Lax` 讓使用者可由外部連結以安全的頂層 GET 開啟菜單，同時阻擋一般跨站寫入；因 SameSite 不是完整 CSRF 防護，仍搭配精確 Origin 與 synchronizer token。來源：[OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)、[OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)、[Node.js Crypto](https://nodejs.org/api/crypto.html#cryptorandombytessize-callback)、[Express session middleware](https://expressjs.com/en/resources/middleware/session.html)、[connect-pg-simple](https://github.com/voxpelli/node-connect-pg-simple)。
- **考慮過的替代方案**（**Alternatives considered**）：在 localStorage 保存 client-generated ID 無法提供可信的伺服器簽發工作階段識別，且 session ID 可被同源 JavaScript 讀取；把完整 cart 狀態放入 signed cookie 會與既有 PostgreSQL cart persistence 重複，並增加 cookie 大小、撤銷及過期管理負擔；外部登入帳號目前不存在，新增登入服務不符合本次 Q9 決策。
- **失敗處理**（**Failure handling**）：沒有 cookie 時由伺服器建立新工作階段；無效、未知或已過期的 cookie 不得選取任何既有購物車，須拒絕或簽發新工作階段。Session store／資料庫無法使用時，購物車讀寫失敗，不得退回記憶體、共用車或客戶端識別。GET／HEAD 不得改變購物車；POST／PATCH／DELETE 驗證精確 Origin，並使用 session-bound synchronizer CSRF token。`SameSite` 僅作縱深防禦；OWASP 指出瀏覽器會自動附帶 cookie，且 SameSite 通常不能取代 CSRF token。來源：[OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)。

### 關聯式購物車資料與交易

- **決策**（**Decision**）：延續 `specs/001-food-browsing-categories/data-model.dbml` 的 PostgreSQL 關聯式模型；以訪客工作階段、購物車、購物車項目及項目所選規格的關聯資料保存工作階段歸屬、餐點識別、規格選項識別與數量，使用外鍵維持資料關聯。`connect-pg-simple` 的 session store 與購物車資料同用 PostgreSQL；每個 guest session 對應一個 cart。加入含多個規格選項的項目及其明細應在同一資料庫交易中完成。每次有效加入都建立獨立 `cart_item`，不合併相同餐點／規格的數量。
- **理由**（**Rationale**）：spec FR-004／Q9 要求每個工作階段擁有獨立購物車；PostgreSQL 可同時持久化 session 與 cart 關聯。第一迭代資料模型已採 PostgreSQL，交易可確保項目及選項明細全有或全無。來源：[第一迭代資料模型](../001-food-browsing-categories/data-model.dbml)、[PostgreSQL Transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html)、[connect-pg-simple](https://github.com/voxpelli/node-connect-pg-simple)。
- **考慮過的替代方案**（**Alternatives considered**）：以瀏覽器儲存或單一 JSON 欄位保存整個購物車不易維持工作階段隔離、外鍵一致性及局部修改；以唯一索引合併相同餐點／規格會違反每次新增均建立獨立項目的已確認政策。
- **失敗處理**（**Failure handling**）：項目與規格明細寫入期間發生錯誤時回滾整筆交易，不留下不完整購物車項目。無效或不屬於該餐點的規格 ID 必須拒絕，不以部分有效選項繼續寫入；guest session 無效時不得讀寫其他工作階段資料。

### 伺服器權威計價與最新價格

- **決策**（**Decision**）：前端只提交餐點 ID、規格選項 ID 與數量；後端重新讀取目前餐點價格、供應狀態及規格加價，再計算項目金額與購物車總額。購物車保留餐點及規格識別，不以加入當下的價格快照作為本輪顯示及計價來源；顧客再次取得或變更購物車時採用系統最新價格。若餐點停供或所選規格失效，保留項目並標示不可用、省略該項目金額且排除於總額外；不可修改數量，但允許刪除。伺服器不得採信前端提交的價格、項目金額或總金額。
- **理由**（**Rationale**）：這是規格 FR-003、FR-005 至 FR-008 與 BR-001 的直接技術落實。保留不可用項目可避免靜默遺失顧客選擇，同時不以失效項目價格形成誤導總額。OWASP Input Validation Cheat Sheet 指出輸入須在伺服器端驗證，並分別驗證欄位格式與業務語意；只做用戶端驗證可被繞過。來源：[OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)。
- **考慮過的替代方案**（**Alternatives considered**）：接受前端合計值、只在前端計算，或固定沿用加入購物車時的價格，都違反本迭代已確認的價格權威或最新價格政策。
- **失敗處理**（**Failure handling**）：加入餐點時若餐點已未供應、規格選項不存在或選項不屬於該餐點，拒絕該操作且不更動購物車。項目加入後才失效時，讀取購物車仍回傳該項目及不可用狀態、不提供其金額；數量更新拒絕，刪除仍可用。若任何可用項目的來源價格無法讀取，不使用前端金額或舊快取補算，回報計價失敗。

### 金額精度與表示

- **決策**（**Decision**）：金額採用精確定點／十進位數值運算，不使用 JavaScript 二進位浮點數作為伺服器端貨幣計算依據；資料庫使用 PostgreSQL `NUMERIC`／`DECIMAL` 類型，API 一律以十進位字串序列化。幣別及資料庫精度／刻度沿用既有菜單與資料庫政策；購物車不轉成 JavaScript `Number`，也不自行捨入。
- **理由**（**Rationale**）：PostgreSQL 文件將 `numeric` 定義為可配置精度的精確型別，並特別建議用於貨幣；MDN 說明 JavaScript `Number` 使用 IEEE 754 雙精度二進位格式，部分十進位分數無法精確表示。API 使用十進位字串可避免 JSON number 與 JavaScript `Number` 帶來的精度損失。來源：[PostgreSQL Numeric Types](https://www.postgresql.org/docs/current/datatype-numeric.html)、[MDN Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)。第一迭代 DBML 將餐點價格標為 `decimal(10,2)`；欄位精度與刻度須核對既有菜單資料來源。
- **考慮過的替代方案**（**Alternatives considered**）：以一般 JavaScript `Number` 直接累加貨幣值容易因二進位表示產生精度差異；固定使用整數最小貨幣單位也需要先確認幣別與其小數位規則。
- **失敗處理**（**Failure handling**）：超出既有資料庫精度／刻度的價格不得靜默轉型或捨入後回報成功；實作前由 T002 核對菜單來源的幣別、精度與刻度，API 十進位字串格式已定，不得序列化為二進位浮點數。

### 請求輸入與資料驗證

- **決策**（**Decision**）：後端驗證數量為正整數、餐點與規格識別碼格式有效；餐點具有規格群組時，每個群組都必須且只能選一個屬於該餐點的有效選項。加入操作須重新檢查餐點供應狀態。驗證使用結構化欄位白名單，不將客戶端金額欄位綁定至購物車資料。
- **理由**（**Rationale**）：這些條件對應 spec 的 FR-001 至 FR-003、FR-006、BR-002 與 BR-003。OWASP 指引要求伺服器同時驗證語法與語意，並明確限定允許欄位，不能只把字串轉成數字便視為有效數量。來源：[OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)。
- **考慮過的替代方案**（**Alternatives considered**）：只依賴 HTML 表單限制或前端選單選項無法保證 API 請求符合規格；以黑名單刪除不合法內容也不能取代欄位允許清單與語意檢查。
- **失敗處理**（**Failure handling**）：任一必要欄位無效，或餐點具有規格群組而未為每個群組提供一個有效選項時，拒絕整筆操作，不部分新增或更新；錯誤回應沿用第一迭代 OpenAPI 的 `ErrorBody` 結構。具體 HTTP 狀態碼由本迭代 API 契約定義。

## 技術參考

- OWASP, [Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)：每次請求的伺服器端授權、資源擁有者檢查及禁止依賴用戶端控制。
- OWASP, [Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)：伺服器端語法與語意驗證、欄位允許清單，以及禁止只做用戶端驗證。
- Express, [Routing](https://expressjs.com/en/guide/routing/)：以 HTTP method 與 route path 定義 API 路由。
- PostgreSQL, [Numeric Types](https://www.postgresql.org/docs/current/datatype-numeric.html)：`numeric` 精確值型別及貨幣用途。
- PostgreSQL, [Transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html)：交易的原子性與回滾語意。
- MDN, [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)：JavaScript `Number` 的 IEEE 754 二進位表示與精度限制。
- OWASP, [Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)：伺服器端 session state、CSPRNG ID、cookie 屬性與伺服器端期限。
- OWASP, [Cross-Site Request Forgery Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)：cookie 自動附帶、CSRF token、SameSite 限制與 Origin 驗證。
- Express, [Session middleware](https://expressjs.com/en/resources/middleware/session.html)：session ID cookie、伺服器端 session store、cookie options 與 MemoryStore 限制。
- `connect-pg-simple`, [文件](https://github.com/voxpelli/node-connect-pg-simple)：PostgreSQL session store、TTL 與過期 session 清理。
- Node.js, [Crypto `randomBytes`](https://nodejs.org/api/crypto.html#cryptorandombytessize-callback)：產生 cryptographically strong pseudorandom data。
- 第一迭代專案文件：[資料模型](../001-food-browsing-categories/data-model.dbml)、[HTTP API](../001-food-browsing-categories/http-api.yaml)、[研究](../001-food-browsing-categories/research.md)、[技術堆疊](../001-food-browsing-categories/techstack.md)。

## 已確認需求

- **FR-001 至 FR-003、BR-002**：持有有效訪客工作階段者可將供應中的餐點及規格加入該工作階段購物車；餐點具有規格群組時每組必須且只能選一項；未供應餐點不得加入。規格依據：[spec.md](./spec.md)「使用者故事 1」、FR-001 至 FR-003、BR-002、Q6、Q9。
- **FR-004**：購物車依伺服器簽發的訪客工作階段保存並隔離，不綁定登入帳號。規格依據：[spec.md](./spec.md)「全域需求」FR-004、Q9。
- **FR-005 至 FR-008、BR-001 至 BR-003、SC-005**：系統以最新餐點／規格價格計算可用項目金額，不採信前端金額；不可用項目保留但不計入總額、不可改數量且可刪除。規格依據：[spec.md](./spec.md)「使用者故事 2」、FR-005 至 FR-008、BR-001 至 BR-003 及 SC-005。
- **規格決策**：系統沒有既有認證能力；02 不建置登入，購物車改以訪客工作階段 cookie 隔離。規格依據：[spec.md](./spec.md)「假設」及澄清紀錄 Q5、Q9。

## 尚未決定與證據限制

- 重複加入政策已確認為每次有效請求建立獨立購物車項目，不合併數量。
- 幣別及菜單來源的資料庫精度／刻度沿用既有菜單政策；實作前仍須核對其來源欄位與 PostgreSQL schema。API 金額表示已定為十進位字串，Decimal 函式庫尚待實作分析選定。
- 訪客工作階段 cookie 是 bearer capability，不代表已驗證個人或帳號；工作階段只能在持有 cookie 的瀏覽器使用者代理中取用，不支援跨裝置或跨瀏覽器同步。
- Session idle／absolute timeout 已由 spec Q10 定為 **24 小時 idle、7 天 absolute**；server-side store 須強制過期。Session 失效後使用者只會取得新空購物車；舊 cart 列可留 DB 並與 session store 定期清理（spec Q11）。Browser session cookie 本身不保證使用者關閉瀏覽器後工作階段一定結束，因瀏覽器可能還原工作階段。
- `express-session`、`connect-pg-simple` 與 PostgreSQL driver 尚未安裝於目前 backend；套件版本、session store schema／migration 與實際連線整合須由後續實作確認。`connect-pg-simple` 文件標示 PostgreSQL 9.5+；本專案 PostgreSQL 版本尚未指定。
- Synchronizer CSRF token 已由 [contracts/http-api.yaml](./contracts/http-api.yaml) 定義：`GET /cart` bootstrap、`CartResponse.csrf_token`、`X-CSRF-Token` 保護 POST／PATCH／DELETE，並維持精確 Origin 驗證。GET／HEAD 不得變更購物車。
- 第一迭代 `data-model.dbml` 將 `database_type` 設為 PostgreSQL；第一迭代 `techstack.md` 卻將資料庫供應商列為未定。本文沿用 DBML 的 PostgreSQL 宣告，版本仍未定，需在後續資料計畫同步此文件差異。
- 菜單來源的幣別／精度仍是 T002 實作前置；訪客工作階段 timeout 與 cart 清理政策見 spec Q10、Q11；加入後失效項目的行為已由 [spec.md](./spec.md) FR-008 與 Q8 定義。
