# Tech Stack: 相簿整理器

## 整體架構

本機單使用者 Web 應用：Vite 提供原生前端並在開發時代理 `/api`；Node.js LTS 後端以 Express 提供 JSON 與影像 API。MySQL 保存中繼資料，原始照片與預覽圖存於後端私有本機目錄。

## 技術堆疊

| 領域 | 採用技術／決策 | 責任與用途 | 研究決策依據 | 版本或限制 |
|---|---|---|---|---|
| 前端 | Vite、原生 HTML/CSS/JavaScript | 建置前端；不採用 React 等 UI framework | [前端與 API](./research.md#前端與-api) | Vite 版本未指定 |
| API 後端 | Node.js LTS、Express | 提供 JSON 與影像 API，處理上傳 | [前端與 API](./research.md#前端與-api) | Node.js 使用 LTS；具體版本未指定 |
| 資料庫 | MySQL | 保存相片中繼資料 | [照片持久化](./research.md#照片持久化) | 具體版本未指定；拍攝時間以 `DATETIME` 保存相機本地時間 |
| 影像處理 | Sharp | 解碼驗證影像、讀取 EXIF、產生 WebP 預覽 | [格式、驗證與預覽](./research.md#格式驗證與預覽) | JPEG、PNG、WebP 靜態影像；每檔上限 20 MiB、解碼後上限 40 MP |
| 檔案儲存 | 後端私有本機目錄 | 保存原圖與預覽圖；透過相片 ID API 提供預覽 | [照片持久化](./research.md#照片持久化) | 不放入 Vite 公開靜態目錄；預覽不包含 EXIF |
| 開發代理 | Vite dev server proxy | 將 `/api` 代理到 loopback API，維持同源開發 | [前端與 API](./research.md#前端與-api) | API 僅綁定 loopback |

## 來源規格

- **來源規格**: [相簿整理器規格](./spec.md)（示意連結；實際產出時須連結到本次輸入規格）

## 架構與部署限制

- 僅供本機使用；API 不得曝露至 LAN 或網際網路，第一版不提供登入。
- 變更方法驗證精確允許的前端 Origin，不開放任意 CORS；若未來改變服務可達性，須另行設計驗證、授權及 CSRF 防護。
- 備份必須同時涵蓋 MySQL 資料與私有影像目錄。

## 尚未固定的版本與選項

- Node.js 採 LTS，但尚未指定具體版本。
- Vite、Express、Sharp 的套件版本尚未指定。
- MySQL 的具體版本尚未指定；MySQL 8.4 文件僅作為日期型別參考，不代表已選定該版本。
- Express 上傳路由所使用的 multipart middleware 尚未指定。
- 測試執行器尚未選定；Node.js Test Runner 僅列於研究參考，並非已確認的採用決策。
