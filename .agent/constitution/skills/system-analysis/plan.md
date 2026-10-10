# Artifact: plan.md

skill: system-analysis  
overlay: true

## MUST

- 文件開頭或「輸入」段須指向本 feature 的 **`spec.md`**、**`research.md`**、**`techstack.md`** 路徑。
- **Wave 排程**（或 template 等價段落）中，每項端點分析工作須列：**負責 skill id**（如 `/ui-plan`）、**輸出產物路徑**、**前置 Wave 結果**。
- 需求部位與端點對照須覆蓋 spec 中本次實作範圍內的主要 User Story 或需求部位，不得無對照地遺漏整個故事。

## MUST NOT

- 在 Wave 排程段落填入端點分析結論（結論在委派 skill 產物中）。
- 保留未替換佔位符。

## 交付自檢（Agent）

- [ ] shared（繁中、追溯 ID）已滿足
- [ ] Wave 列可機械對照到 skill id 與產物路徑
- [ ] 與 spec 範圍一致，未引入未澄清的新需求 ID
