# Rule 1 - 第三方相依套件必須以 PEP 723 metadata 宣告在腳本內

- Level: `MUST`
- Python script 使用第三方套件時，必須在腳本頂層使用 `# /// script` 區塊宣告 `dependencies`，每項依賴使用有效的 PEP 508 dependency specifier。
- 只有在腳本要求特定 Python 版本時才宣告 `requires-python`；不為單檔腳本額外建立 `pyproject.toml` 或 `requirements.txt`。
- 腳本不使用第三方套件時，優先使用標準函式庫，不新增不必要的依賴 metadata。

## Good Example

- 這個例子是好的，因為唯一的第三方依賴以 PEP 723 格式直接宣告在腳本內。

````python
# /// script
# requires-python = ">=3.11"
# dependencies = [
#   "requests>=2,<3",
# ]
# ///

import requests
````

## Bad Example

- 這個例子是壞的，因為腳本使用第三方套件，卻沒有在腳本內宣告依賴，必須仰賴未隨腳本提供的外部 requirements 檔案。

````text
scripts/fetch_data.py:
    import requests

requirements.txt:
    requests>=2,<3
````

# Rule 2 - 第三方套件必須經查證且符合目標平台

- Level: `MUST`
- 使用第三方套件前，必須查閱套件官方文件與 PyPI 專案資訊，確認套件名稱、用途、Python 版本需求及目標平台支援；不可只由 `import` 名稱猜測套件名稱或相容性。
- 優先選擇能在 Windows、macOS、Linux 使用且維護中的最少直接依賴；若無法確認目標平台支援，必須向使用者說明限制再決定是否採用。

## Good Example

- 這個例子是好的，因為依賴選擇記錄了官方來源與目標平台查證結果，並只加入完成任務所需的套件。

````text
依賴：example-library
官方文件：已確認所需 API 與 Python 版本需求
PyPI 專案資訊：已確認套件名稱及 Windows、macOS、Linux 支援情況
決定：只加入此項直接依賴
````

## Bad Example

- 這個例子是壞的，因為只憑 `import yaml` 推測套件名稱並直接加進依賴，沒有查證套件來源與平台支援。

````python
# /// script
# dependencies = ["yaml"]
# ///

import yaml
````

# Rule 3 - 腳本必須以 uv 隔離執行且不可暗中安裝執行工具

- Level: `MUST`
- 執行腳本時必須從目標 skill 根目錄使用 `uv run scripts/<script-name>.py`，由 uv 依 PEP 723 metadata 準備腳本所需環境；不可將第三方套件安裝到系統或使用者的全域 Python 環境。
- 若環境沒有 uv，必須提供 [uv 官方安裝指引](https://docs.astral.sh/uv/getting-started/installation/) 並等待執行者安裝；不可自行安裝 uv 或改以全域 `pip install` 繞過。

## Good Example

- 這個例子是好的，因為腳本由 uv 執行，並在缺少 uv 時先提供官方安裝指引，不修改全域 Python 環境。

````text
uv run scripts/fetch_data.py
uv 未安裝時：請執行者依 https://docs.astral.sh/uv/getting-started/installation/ 安裝後再執行。
````

## Bad Example

- 這個例子是壞的，因為直接將套件安裝到全域 Python，再以一般 Python 命令執行腳本。

````text
python -m pip install requests
python scripts/fetch_data.py
````

**References**

- [PyPA Inline script metadata](https://packaging.python.org/en/latest/specifications/inline-script-metadata/)
- [uv: Running scripts](https://docs.astral.sh/uv/guides/scripts/)
