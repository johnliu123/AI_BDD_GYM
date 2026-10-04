---
name: skill-form-script
description: 當要在目標 skill 的 scripts/ 新增或修改用於自動化流程的 Python 單檔腳本時，必須使用此 skill。
---

# SOP

## Phase 1 -- 收斂並撰寫 Python script

1. READ 讀取目標 skill 的 `SKILL.md` 與相關上下文，確認腳本要完成的工作、輸入、輸出、錯誤處理及目標路徑。
2. READ 讀取 `rules/Script-依賴宣告與執行.md`，確認單檔腳本、相依宣告、跨平台依賴與執行方式。
3. THINK 限定產出為目標 skill `scripts/` 下的單一 Python `.py` 檔；若需求是 Shell script 或完整 Python 專案，先向使用者說明範圍不符並確認方向。
4. READ 只有在腳本需要第三方套件時，才查閱套件官方文件與 PyPI 資訊，確認套件名稱、Python 版本需求、用途及 Windows、macOS、Linux 支援狀況。
5. THINK 先判斷標準函式庫是否足夠；若需第三方套件，只選擇完成任務所需的最少依賴，並決定相容的 Python 版本範圍。
6. WRITE 在目標 skill 的 `scripts/` 下撰寫 Python 腳本；使用第三方套件時，在腳本內依 PEP 723 格式宣告相依套件。

## Phase 2 -- 執行並接回目標 Skill

1. THINK 確認執行環境有 `uv`；若沒有，提供官方跨平台安裝指引並請執行者安裝，不可改用全域 `pip install` 或未經確認安裝工具。
2. DELEGATE 從目標 skill 根目錄使用 `uv run scripts/<script-name>.py <arguments>` 執行適當的安全測試，取得結果與錯誤訊息。
3. WRITE 依測試結果修正腳本，直到預期輸入能產生預期輸出；有外部副作用的操作須先確認測試方式。
4. READ 讀取目標 skill 的 `SKILL.md`，確認對應 SOP step 已委派執行此腳本；若沒有，使用 `/skill-form-sop` 補上執行步驟。
