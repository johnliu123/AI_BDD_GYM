# Research: 餐點瀏覽與分類

- **Source specification**: [spec.md](./spec.md)

## 決策摘要

### 前端顯示與資料取得

- **Decision**: 採用 React + TypeScript + Vite 建置前端，透過 REST API 取得 `menu_items` 與 `categories` 資料後渲染清單，維持可擴充的瀏覽頁面；分類瀏覽採用分類標籤篩選，依分類名稱排序，不做分區呈現。
- **Rationale**: 這一迭代僅需讀取餐點資料並顯示名稱、圖片、價格與分類，單頁應用能以元件化方式將資料與 UI 分離，未來擴充到購物車與訂單時仍保有清晰邊界。
- **Alternatives considered**: 直接以伺服器端渲染 HTML 生成菜單，或者把分類與餐點資料寫死於前端靜態檔案。前兩者都會增加後續維護成本，且不利於後續將資料與店家管理功能拆分為 API。
- **Failure handling**: 若 `/api/menu` 失敗或回應缺少必填欄位，顯示空狀態或錯誤提示，不承載不明資料；圖片缺失時顯示佔位圖並標示「暫無圖片」，價格或分類缺失時以明確空值提示，不偽造資料。

### API 契約與資料形狀

- **Decision**: 以 REST JSON 端點返回每筆餐點的 `id`、`name`、`image_url`、`price`、`category_id`、`category_name`、`is_active`（如有）等欄位，讓前端只依賴結構化資料而非直接操作 DOM；正式 API 命名規範採用 `snake_case`，以保持與資料表與 OpenAPI 契約一致。
- **Rationale**: 這種契約能精準支撐規格的「名稱、圖片、價格、分類」需求，且不需在第一迭代引入更重的 GraphQL 或 BFF。
- **Alternatives considered**: 直接將整份資料表 JSON 寫進前端，或使用單一大物件傳回所有關聯資料。前者不利於後續管理，後者會讓資料整體過重。
- **Failure handling**: 若回應缺失 `name` / `price` / `category_id` 等必要欄位，前端丟棄該筆資料並記錄錯誤，避免錯誤資料被展示成有效餐點。

### 資料儲存與關聯

- **Decision**: 以關聯式資料表儲存 `categories` 與 `menu_items`，兩者藉由 `category_id` 建立關聯，讀取路徑只讀不寫，符合本迭代僅瀏覽餐點的範圍。
- **Rationale**: 餐點資料與分類資料具有明確關聯；關聯式資料庫能保證分類名稱與餐點關係一致，且後續迭代可直接接上店家管理功能。
- **Alternatives considered**: 單一 JSON 檔或非結構化資料存儲。前者難以在不同分類間維持一致性，且未來同時管理資料時更難做正確性驗證。
- **Failure handling**: 若 `category_id` 無效或分類缺失，後端回應錯誤或忽略該餐點，避免在前端產生錯誤的分類顯示。

### 影像與價格呈現

- **Decision**: 儲存圖片 URL 或儲存路徑，前端使用 `img` 元素載入，並以十進位貨幣格式顯示價格；價格與圖片應來自後端資料而非前端自行計算或覆寫。
- **Rationale**: 規格要求能正確對應餐點的圖片與價格；由後端提供動態資料可降低前端竄改風險，並與後續訂單金額計算保持一致。
- **Alternatives considered**: 直接在前端寫死價格或依需求用字串拼接。此方法不能保證與餐點資料一致，一旦後續加入價格更新或幣別處理會引入錯誤。
- **Failure handling**: 若圖片 URL 無效或價格為空，前端顯示佔位圖與「暫無價格」，不透過計算器補值。

## 技術參考

- React, [Getting Started](https://react.dev/learn)：React 元件化與資料驅動 UI，適合商品列表與後續擴充。
- Vite, [Guide](https://vite.dev/guide/)：前端建置與開發伺服器，適合作為 SPA 開發工具。
- MDN, [Using Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)：前端從 API 取回 JSON 並渲染列表。
- Express, [Getting started](https://expressjs.com/en/starter/hello-world.html)：Node.js API 專案常見的輕量 REST 伺服器。
- PostgreSQL, [The SQL language](https://www.postgresql.org/docs/current/sql.html)：關聯式資料表與 `FOREIGN KEY` 對餐點與分類的關聯管理，適合後續維護。

## 已確認需求

- **FR-001**: 系統必須提供顧客瀏覽餐點的功能，且本功能只涵蓋餐點瀏覽與分類，不含購物車、訂單及管理後台。規格依據： [spec.md](./spec.md)「使用者故事 1 - 瀏覽餐點與其分類」及其 FR-001。
- **FR-002**: 系統必須在餐點瀏覽內容中呈現每項餐點的名稱、圖片、價格及分類，且各資訊須對應至正確的餐點。規格依據： [spec.md](./spec.md)「使用者故事 1 - 瀏覽餐點與其分類」及其 FR-002。
- **已確認決策**: 分類瀏覽使用單一菜單頁面上的分類標籤篩選，依分類名稱排序，不實作分區呈現；缺資料時保留餐點卡片並顯示明確空值提示；API 欄位命名採 `snake_case`，例如 `image_url`、`category_name`。
