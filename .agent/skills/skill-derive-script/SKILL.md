---
name: skill-derive-script
description: 當使用者指定既有 SOP skill 的某個步驟，並希望將其中可自動化的工作委派給 Python 腳本時，必須使用此 skill。
---

# SOP

## Phase 1 -- 收斂指定步驟的自動化需求

1. READ 讀取目標 skill 的 `SKILL.md`，定位使用者指定的 SOP step，並讀取其所在 phase、前後步驟、輸入及預期產出。
2. READ 讀取 `rules/Script-推導與接回.md`，依其判準界定可委派的工作及 SOP 接回方式。
3. THINK 從指定 step 中辨識可由 Python 確定性處理的工作，整理其輸入、輸出、錯誤處理與副作用；需要 AI 判斷或使用者決策的部分保留在 SOP。
4. THINK 確認目標 skill 的 `scripts/` 路徑、腳本介面及執行時機；若需求或輸入輸出仍有歧義，先向使用者確認再修改檔案。

## Phase 2 -- 建立並檢查腳本

1. DELEGATE 呼叫 `/skill-form-script`，依已收斂的需求在目標 skill 的 `scripts/` 下建立或修改 Python 單檔腳本，研究必要的第三方套件並依規範宣告依賴。
2. READ 讀取腳本與測試結果，確認腳本只承接指定 step 中可自動化的工作，且輸入輸出符合預期。

## Phase 3 -- 將腳本接回指定 SOP step

1. DELEGATE 若腳本尚未接回 SOP，委派 `/skill-form-sop` 修改目標 skill 的 SOP。
2. THINK 檢查 SOP 變更前後：指定 step 應以 `DELEGATE` 說明從目標 skill 根目錄執行 `uv run scripts/<script-name>.py <arguments>`，並交代必要輸入、預期輸出及失敗時的處理；若環境沒有 `uv`，指向官方安裝指引並停止等待安裝完成。
3. READ 重新讀取目標 skill 的 SOP，確認委派命令、腳本路徑、參數與目標 step 一致，且其他 phase 與 step 未被不必要地改動。
