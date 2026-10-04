---
name: skill-derive-template
description: 當使用者指定既有 SOP skill 的某個步驟，並希望從該步驟推導可重用的輸出模板時，必須使用此 skill。
---

# SOP

## Phase 1 -- 收斂指定步驟的模板需求

1. READ 讀取目標 skill 的 `SKILL.md`，定位使用者指定的 SOP step，並讀取其所在 phase、前後步驟及相關輸出範例。
2. READ 讀取 `rules/Template-推導與接回.md`，依其判準界定模板內容與 SOP 接回方式。
3. THINK 根據指定 step 的預期產出，區分固定結構與需由 AI 替換的內容，並決定模板名稱、格式及目標 skill 的 `templates/` 路徑。
4. THINK 確認要建立新模板組或沿用既有模板組；若指定 step、產出格式或模板範圍仍有歧義，先向使用者確認再修改檔案。

## Phase 2 -- 建立模板組

1. DELEGATE 呼叫 `/skill-form-template`，在目標 skill 的 `templates/` 下建立骨架及對照範例兩個檔案。
2. READ 讀取兩個產出檔案，確認檔案存在、路徑與命名成對，且內容對應指定 step 的預期產出。

## Phase 3 -- 將模板組接回指定步驟

1. DELEGATE 若模板組尚未接回 SOP，委派 `/skill-form-sop` 修改目標 skill 的 SOP。
2. THINK 檢查 SOP 變更前後：在指定 step 前加入載入模板組的 `READ`，明確列出骨架與範例的兩個路徑；指定 step 則說明依骨架填寫並參照範例。
3. READ 重新讀取目標 skill 的 SOP，確認兩個路徑都可供執行者辨識並讀取，載入位置緊鄰指定 step，且其他 phase 與 step 未被不必要地改動。
