---
name: skill-form-template
description: 當要在目標 skill 的 templates/ 新增或修改可填寫的模板及其對照範例時，必須使用此 skill。
---

# SOP

## Phase 1 -- 收斂模板組需求

1. READ 讀取目標 skill 的 `SKILL.md` 與相關上下文，確認要產生的內容格式、用途及目標路徑。
2. READ 讀取 `rules/Template-檔案組成與填位符.md`，確認模板組的檔案、命名與填位符要求。
3. THINK 區分輸出中固定不變的結構與每次需要替換的內容，確認模板名稱及格式副檔名。
4. THINK 若用途、格式或目標位置仍有歧義，先向使用者確認再建立檔案。

## Phase 2 -- 建立並檢查模板組

1. WRITE 在目標 skill 的 `templates/` 下建立骨架 `<模板名字>.<格式>` 與範例 `<模板名字>.example.<格式>`。
2. WRITE 在骨架中以填位符號標出需替換的內容，並以相同結構填入範例中的代表值。
3. READ 對照兩個檔案，確認範例對應骨架、所有填位符都已示範替換，且兩者格式與命名一致。
