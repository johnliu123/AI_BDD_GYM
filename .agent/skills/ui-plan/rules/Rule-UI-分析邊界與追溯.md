# Rule 1 - Markdown 只描述前端與使用者可見行為

- Level: `MUST`
- `ui-plan.md` 僅描述範疇、畫面、流程、實作取向、驗證與前端限制；不得定義 REST 路徑、request/response、資料表或服務端 transaction。
- 需要後端配合時，以使用者可見結果表述，不代替 `/data-plan` 或 `/api-plan`。

# Rule 2 - HTML 雛形必須像產品，不像說明文件

- Level: `MUST`
- `prototype/` 內為一個或多個靜態 `.html`，共用 `assets/`（CSS/JS/圖）；內容為可操作的 UI，含假資料與流程級互動（導覽、按鈕、toast、空狀態／錯誤態、以簡化方式模擬拖放或上傳等）。
- 禁止以 HTML 撰寫規格說明頁、章節式 doc、README 主頁或「本原型目的如下」為主體的版面。
- 雛形不連真後端；可 localStorage 或記憶體模擬持久化以支援重新整理後仍演示流程。

## Good Example

- `index.html` 呈現相簿卡片列表與匯入按鈕；點卡片進入 `album.html` 格狀照片，可交換順序並看 toast。

## Bad Example

- 單頁 `<h1>UI Plan</h1><ol><li>使用者流程…</li></ol>` 羅列需求。

# Rule 3 - 需求追溯與委派邊界

- Level: `MUST`
- `ui-plan.md` 須連結規格與 `plan.md`；流程與畫面可追溯 User Story／FR 或 plan 需求部位。
- 雛形須覆蓋 Markdown「畫面與流程」中的主要畫面；不得新增未確認功能。
- System Analysis 委派時，以委派邊界為準。

# Rule 4 - 頁數由導覽決定

- Level: `SHOULD`
- 需要換頁或明確獨立畫面時使用多個 HTML；單頁可完成流程時至少一個 HTML 即可。`ui-plan.md` 的畫面表須列出檔名對應。
