# 功能規格：{{feature_name}}

**功能分支**：`{{feature_branch}}`

**建立日期**：{{creation_date}}

**狀態**：{{spec_status}}

**輸入**：使用者描述："{{user_input}}"

## 商業規則 *(必要)*

<!-- 跨流程、跨畫面的領域不變量與政策（非 UI 細節）。每條使用穩定 ID；可註明對應 FR/NFR。若無額外規則，寫「本功能無超出 FR/NFR 的額外商業規則。」 -->

- **BR-{{br_id}}**: {{business_rule}}（對應需求：{{linked_requirement_ids_or_none}}）
<!-- 依需求增列 BR；與 FR 重複時以 FR 為驗收主體，BR 保留領域語意。 -->

## 使用者情境與測試 *(必要)*

<!-- 每個 User Story 都應有自己的驗收情境及需求清單。依需要複製以下 User Story 區塊。 -->

### 使用者故事 {{story_number}} - {{story_title}} (優先順序：{{story_priority}})

{{story_description}}

**為何這個優先順序**：{{priority_rationale}}

**獨立測試**：{{independent_test}}

**驗收情境**：

1. **Given** {{acceptance_1_given}}，**When** {{acceptance_1_when}}，**Then** {{acceptance_1_then}}。
2. **Given** {{acceptance_2_given}}，**When** {{acceptance_2_when}}，**Then** {{acceptance_2_then}}。
<!-- 依需求增列驗收情境；每個情境都應可驗證。 -->

**功能需求（FR）**：

- **FR-{{fr_id}}**: {{functional_requirement}}
<!-- 每個需求使用全文件唯一且穩定的 ID。只適用於本故事的 FR 列於此；跨多個故事的 FR 列於「全域需求」。 -->

**非功能需求（NFR）**：

- **NFR-{{nfr_id}}**: {{nonfunctional_requirement}}
<!-- 每個需求使用全文件唯一且穩定的 ID。若本故事沒有明確的專屬 NFR，改寫為「本故事未明確提出專屬 NFR。」 -->

**全域需求參照**：{{applicable_global_requirement_ids_or_none}}

---

### 邊界情況

- {{boundary_case_1}}
- {{boundary_case_2}}
<!-- 依需求增列；若無其他邊界情況，可移除此區塊。 -->

## 全域需求 *(僅於存在跨多個 User Story 的需求時納入)*

<!-- 本區只列出適用於多個 User Story 的 FR/NFR。每項需求在此保留一份正式內容，並標明適用的 User Story；各故事以需求 ID 參照。只適用於單一 User Story 的需求應列在該故事底下。 -->

### 功能需求（FR）

- **FR-{{global_fr_id}}**（適用於使用者故事 {{applicable_story_numbers}}）: {{global_functional_requirement}}
<!-- 依需求增列跨故事 FR。 -->

### 非功能需求（NFR）

- **NFR-{{global_nfr_id}}**（適用於使用者故事 {{applicable_story_numbers}}）: {{global_nonfunctional_requirement}}
<!-- 依需求增列跨故事 NFR；若沒有跨故事 NFR，可移除此小節。 -->

### 主要實體 *(若功能涉及資料則納入)*

- **{{entity_name}}**：{{entity_description}}
<!-- 依需求增列主要實體；若功能不涉及資料，可移除此區塊。 -->

## 成功標準 *(必要)*

### 可衡量成果

- **SC-{{success_criterion_id}}**: {{measurable_outcome}}
<!-- 依需求增列；每項成功標準都應可衡量。 -->

## 假設

- {{assumption}}
<!-- 依需求增列已確認的假設。 -->