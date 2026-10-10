# Shared: 需求追溯 ID 慣例

applies_to: spec.md, plan.md, tasks.md, ui-plan.md

## MUST

- 功能需求使用 **`FR-`** 前綴；非功能需求使用 **`NFR-`**；商業規則使用 **`BR-`**；成功標準使用 **`SC-`**（若 spec 含該章節）。
- User Story 以 **`User Story N`** 或 template 既定標題層級呈現；故事內引用全域需求時使用「全域需求參照：FR-xxx」，不另造重複 ID 描述同一需求。
- `tasks.md` 機器錨點引用 spec 時使用 `spec:FR-001`、`spec:US1`、`spec:US1·情境2` 等格式，與 `Rule-Tasks-端點分層與按需讀取.md` 一致。
- `plan.md` 提及需求或故事時，須可對應到 `spec.md` 中既有 ID 或故事編號（不得引入未在 spec 出現的正式需求 ID）。

## MUST NOT

- 在同一 feature 套件內對同一語意需求分配兩個不同 FR/NFR/BR ID。
- 在 `plan.md` 或 `tasks.md` 定義新的「正式 FR/NFR」取代 spec（缺口應 `/clarify` 後回寫 spec）。

## 交付自檢（Agent）

- [ ] spec 內 ID 唯一且跨文件引用一致
- [ ] plan／tasks 出現的需求指涉可追溯到 spec ID 或 US 編號
- [ ] tasks 錨點前綴符合上表
