# Artifact: research.md

skill: technical-research  
overlay: true

## MUST

- 文件開頭須以 Markdown 連結或明確路徑指向輸入 **`spec.md`**。
- 每項採納決策須含 **Decision**、**Rationale**、**Alternatives considered**（與 template 對齊）；無法查核的斷言標示限制，不得寫成已驗證事實。
- 已確認需求須標示其 **spec 依據**（FR/NFR/BR 或故事／情境）。

## MUST NOT

- 新增 spec 未確認且會改變驗收範圍的功能需求。
- 保留 `{{}}` 佔位符或空白決策小節。

## 交付自檢（Agent）

- [ ] shared 繁中已滿足
- [ ] 每個 Decision 可追溯到 spec 或明示為技術未決
- [ ] 與同目錄 `techstack.md` 無矛盾
