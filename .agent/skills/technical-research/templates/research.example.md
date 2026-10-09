# Research: 相簿整理器

## 決策摘要

### 前端與 API

- **Decision**: Vite 建置原生 HTML/CSS/JavaScript；Node.js LTS 後端以 Express 提供 JSON 與影像 API，開發時由 Vite 將 `/api` 代理至 loopback API。
- **Rationale**: 符合使用者指定的簡單前端和 Node.js 後端；同源代理避免前端 CORS 設定，Express 可用單一路由中介軟體處理上傳。
- **Alternatives considered**: React 或其他 UI framework 增加非必要前端依賴；自行以 Node HTTP 實作 multipart 解析容易重複實作且更難安全驗證。

### 照片持久化

- **Decision**: MySQL 僅存中繼資料；原圖與預覽圖存入後端私有本機目錄，目錄與 Vite 靜態內容隔離，透過相片 ID 的 API 路由提供預覽。
- **Rationale**: 適合單機單使用者與小型部署，避免資料庫及備份承載影像二進位內容。備份必須同時涵蓋資料庫與檔案目錄。
- **Alternatives considered**: MySQL BLOB 可讓備份集中，但會使資料庫和備份膨脹；物件儲存對本機第一版增加不必要的外部服務。

### 格式、驗證與預覽

- **Decision**: 支援 JPEG、PNG、WebP 靜態影像；每檔 20 MiB、解碼後最多 40 MP、一次上傳一檔。用 Sharp 解碼驗證並產生 WebP 預覽；保留私有原始檔，預覽輸出不包含 EXIF。
- **Rationale**: 格式白名單、伺服器生成檔案名稱、大小與像素上限可降低上傳風險及解壓縮炸彈風險；尺寸較小且無 EXIF 的預覽降低傳輸量與位置資訊暴露。
- **Alternatives considered**: 直接依副檔名或瀏覽器 MIME 判斷不足以驗證檔案內容；原始檔公開服務會洩漏可能包含 GPS 的 EXIF；HEIC/HEIF 未納入第一版，避免未驗證平台編碼器支援。
- **Failure handling**: 不支援、格式不符、損毀、超過檔案／像素上限的檔案回傳明確 4xx；暫存檔或 DB 寫入錯誤回傳伺服器錯誤並清理未提交檔案，不回報成功。

### 拍攝日期

- **Decision**: 優先使用 EXIF `DateTimeOriginal` 及 `OffsetTimeOriginal`；若缺少前者，再試 `DateTimeDigitized`；兩者都無效則拍攝時間為空，歸入唯一「日期未知」相簿。上傳時間獨立保存，不作拍攝日期替代。
- **Rationale**: 規格明確要求缺少日期時進入日期未知分組；保留無時區的相機本地時間，不假設 UTC，避免跨日誤分組。
- **Alternatives considered**: 以檔案建立時間或上傳時間作 fallback 會把非拍攝時間錯當拍攝日期；通用 EXIF `DateTime` 語意較弱，第一版不作自動 fallback。

### 相簿順序與 API

- **Decision**: 新相簿按拍攝日期新到舊列出，日期未知固定在最後；新相簿照片依拍攝時間排序，平手或缺時間時使用匯入序列。拖放後儲存完整相片 ID 順序，只有同相簿 reorder 有效；手動排序後新增照片附加於末端。
- **Rationale**: 日期新到舊是便於查看的常見時間線預設；穩定的匯入序列符合規格平手／缺時間行為。完整清單可檢查重複、遺漏及跨相簿操作，避免部分更新破壞順序。
- **Alternatives considered**: 客戶端暫存順序不能抵抗重新整理；逐張更新索引需要更多請求且可能出現中間不一致狀態。

### 部署與身分驗證

- **Decision**: 第一版 API 僅綁定 loopback、不做登入。設定不得把服務曝露至 LAN／網際網路；若未來改變可達性，必須另行設計身分驗證、授權及 CSRF 防護。
- **Rationale**: 使用者確認僅本機使用；可避免不必要的帳戶功能，同時把網路暴露限制明確化。loopback 綁定不會自動阻擋其他網站的瀏覽器向本機服務送出請求，因此變更方法須驗證精確允許的前端 Origin，且不開放任意 CORS。

## 技術參考

- OWASP, [File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)：上傳白名單、伺服器檔名、大小限制及檔案儲存建議。
- Multer, [Documentation](https://github.com/expressjs/multer)：Express multipart 路由中介軟體與限制設定。
- Sharp, [Input metadata API](https://sharp.pixelplumbing.com/api-input/) 及 [Output API](https://sharp.pixelplumbing.com/api-output/)：影像解碼、尺寸／EXIF 擷取與預設移除輸出 metadata。
- ExifTool, [EXIF Tag Names](https://exiftool.org/TagNames/EXIF.html)：拍攝時間及時區標籤語意。
- MySQL 8.4, [Date and Time Data Types](https://dev.mysql.com/doc/refman/8.4/en/datetime.html)：使用 `DATETIME` 保存相機本地牆上時間。
- Vite, [Server Options](https://vite.dev/config/server-options)：開發伺服器代理設定。
- Node.js, [Test Runner](https://nodejs.org/api/test.html)：不增加測試框架套件的內建測試方式。
- MDN, [Using FormData](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest_API/Using_FormData_Objects)：瀏覽器 multipart 表單上傳。
- Node.js, [File system](https://nodejs.org/api/fs.html)：後端暫存與檔案持久化 API。

## 已確認需求

- 使用者指定 Vite 搭配原生 HTML/CSS/JavaScript，不採用 React。
- 使用者指定 Node.js 後端與 MySQL。
- 使用者確認僅本機使用，並選擇第一版僅支援 JPEG、PNG、WebP。
- 20 MiB 單檔與 40 MP 解碼上限為本計畫的初始安全限制，應以清楚的錯誤提示呈現。
