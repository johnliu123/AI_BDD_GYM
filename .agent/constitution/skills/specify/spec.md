# Artifact: spec.md

skill: specify  
overlay: true

本檔只寫 **本 repo 在 skill 預設之上的增量**；結構與追溯詳見 `skills/specify/rules/` 與 `validate_spec.py`。

## MUST

- 文件須含 **`## 澄清紀錄`** 章節；若尚無澄清，保留章節並標示「（尚無）」或等價陳述，不可刪除該章。
- 每個 User Story 至少一則可獨立驗證的 **Given/When/Then** 驗收情境（與 template 一致時視為已滿足）。
- 假設與待確認事項不得寫成已拍板的 FR/NFR/BR 正文。

## MUST NOT

- 保留未替換的 template 佔位符或空白必填章節。

## 交付自檢（Agent）

- [ ] shared 模組（繁中、追溯 ID）已滿足
- [ ] `uv run scripts/validate_spec.py` 已通過
- [ ] 澄清紀錄章節存在且與正文無矛盾
