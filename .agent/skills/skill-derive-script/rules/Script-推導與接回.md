# Rule 1 - 只將可確定性執行的工作委派給 Python script

- Level: `MUST`
- 從 SOP step 擷取的腳本工作必須能以明確輸入和演算法產生可檢查的輸出；需要語意判斷、權衡或使用者決策的工作必須留在 AI 或使用者負責的步驟。
- 推導時必須寫明腳本的輸入、預期輸出及失敗時可辨識的結果，不可只把原 SOP step 改成呼叫腳本而未定義介面。

## Good Example

- 這個例子是好的，因為腳本只將測試結果資料轉成摘要，是否符合需求及後續處置仍由 AI 判斷。

````md
SOP 原步驟：
1. READ 讀取測試結果 JSON。
2. THINK 判斷結果是否符合需求，決定是否需要修正。
3. WRITE 撰寫測試摘要。

可委派給 script：讀取測試結果 JSON，輸出通過／失敗數量及失敗案例清單。
保留在 AI：判斷失敗是否違反需求，以及決定後續修正方式。
````

## Bad Example

- 這個例子是壞的，因為把是否符合未形式化需求的語意判斷也委派給腳本，沒有可確定性檢查標準。

````md
DELEGATE 執行腳本，判斷測試結果是否符合所有未明確列出的產品需求，並自行決定要不要修改程式。
````

# Rule 2 - SOP 必須提供可直接執行的 Python 委派契約

- Level: `MUST`
- 目標 skill 的 SOP 必須以 `DELEGATE` 指定從目標 skill 根目錄執行的 `uv run scripts/<script-name>.py <arguments>` 命令，並說明必要輸入與預期輸出。
- 若環境沒有 uv，SOP 必須指向 [uv 官方安裝指引](https://docs.astral.sh/uv/getting-started/installation/) 並要求先完成安裝再執行；不可要求將套件安裝到全域 Python。

## Good Example

- 這個例子是好的，因為委派步驟包含腳本路徑、參數、預期輸出，以及 uv 未安裝時的處理方式。

````md
2. DELEGATE 從目標 skill 根目錄執行 `uv run scripts/summarize_results.py results.json`，輸入為 `results.json`，取得摘要 JSON；若 uv 未安裝，請執行者依 https://docs.astral.sh/uv/getting-started/installation/ 安裝後再執行。
````

## Bad Example

- 這個例子是壞的，因為沒有說明腳本執行後應取得什麼結果。

````md
2. DELEGATE 執行 `uv run scripts/summarize_results.py results.json`。
````
