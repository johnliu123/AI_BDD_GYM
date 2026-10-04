---
name: skill-form-rule
description: 當要撰寫或修改 skill 的 rules/ 底下 RuleFile，涉及規則的新增、修改或重寫時，必須使用此 skill。
---

# SOP

## Phase 1 -- 收斂並完成 RuleFile

1. READ 讀取目標 RuleFile 內容，確認要新增、修改或重寫的規則範圍。
2. READ 若目標檔案尚不存在，確認要建立的路徑在目標 skill 的 `rules/` 底下，且檔名包含主題關鍵字。
3. READ 讀取 `rules/RuleFile-格式規範.md`、`rules/RuleLevel-定義.md` 與 `rules/RuleFile-規則品質判準.md`，確認 Rule 結構、`Level` 與規則品質的要求。
4. READ 只有在來源包含 3 項以上的分類或檢查項時，才讀取 `rules/RuleFile-語意承載判準.md`。
5. THINK 依本次已載入規則決定規則的拆分方式、每條規則的 `Level`，以及 Good 與 Bad 使用的情境。
6. WRITE 依思考結果撰寫或修改目標 RuleFile。

## Phase 2 -- 掛上流程並通過結構檢查

1. DELEGATE 執行 `powershell -NoProfile -File scripts/validate_rulefile.ps1 <目標 RuleFile 路徑>`，取得 ERROR 與 WARN 清單。
2. WRITE 依 ERROR 與 WARN 清單修正目標 RuleFile，重跑腳本直到 ERROR 為 0。
3. READ 讀取目標 skill 的 SKILL.md，確認 SOP 中已有 step 讀取此 RuleFile。
4. WRITE 若沒有對應的 step，依 `skill-form-sop` 在目標 skill 的 SOP 補上讀取此 RuleFile 的 step。
