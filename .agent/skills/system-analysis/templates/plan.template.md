# 系統分析規劃

## 專案結構

### 文件（本功能）

```text
{{feature_documentation_tree}}
```

### 原始碼（儲存庫根目錄）

```text
{{repository_source_tree}}
```

**結構決策**：{{structure_decision}}

## 設計決策

{{design_decision_items}}

## 分析流程規劃

本段只規劃後續系統分析的範圍與排程，不在此處產生各端點的分析結論或設計細節。先從使用者需求拆出需求部位，再標記每個需求部位涉及的技術端點；以需求間的先後依賴決定 Wave。每個端點至少安排一個分析步驟；只有前置分析結果不會阻礙其工作的端點，才排在同一 Wave 平行處理。排程完成後，System Analysis 會依 Wave 順序委派各端點專責 Skill 實際分析；每項工作須標示負責 Skill（含 skill id）、輸出產物路徑、必要前置產物及分析邊界。

### {{feature_name}}：需求部位與端點盤點

| 需求部位 | 涉及的技術端點 |
|---|---|
{{requirement_endpoint_mapping_rows}}

本次實際端點為 **{{in_scope_endpoint_types}}**；需求未包含 **{{out_of_scope_endpoint_types_or_none}}**，因此不將它們列入本次計畫。

### {{feature_name}}：分析 Wave 排程

Wave 的切分依分析工作對其他端點結果的需求，而非單純按端點清單排序。每個端點安排獨立分析步驟；同一 Wave 中沒有相依阻礙的端點分析可平行委派。

{{dependency_ordered_wave_sections}}

### {{optional_wave_scheduling_illustration_title}}

{{optional_wave_scheduling_illustration_content}}
