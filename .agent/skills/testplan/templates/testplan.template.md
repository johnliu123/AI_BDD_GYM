# {{project_name}} 測試計畫

## 1. 計畫資訊

- **狀態**：{{plan_status}}
- **計畫版本／更新日**：{{plan_revision_and_date}}
- **審閱狀態／日期**：{{review_status_and_date}}
- **需求範圍**：{{scope_summary}}
- **需求來源**：`{{spec_path}}`（需求、User Story、驗收、FR／NFR／BR／SC）
- **系統分析來源**：`{{plan_path}}`、`{{ui_plan_path_or_none}}`、`{{data_model_path_or_none}}`、`{{api_contract_paths_or_none}}`
- **測試環境來源**：`{{research_and_techstack_paths_or_none}}`
- **測試狀態約定**：{{test_status_convention}}

## 2. 測試目標與範圍

{{test_objectives_and_analysis_boundary}}

本計畫以 spec 定義測試需求與驗收語意；端點、系統邊界、資料責任、API operation、UI seam 與測試入口依 system-analysis 產物。缺少或互相矛盾時，記錄缺口並停止受影響部分，不自行規劃系統。

### 納入範圍

- **{{interface_or_system_1}}**：{{included_responsibilities_1}}
- **{{interface_or_system_2}}**：{{included_responsibilities_2}}
- **{{additional_interfaces}}**：{{included_responsibilities}}

### 不納入範圍

- {{out_of_scope_item_1}}
- {{out_of_scope_item_2}}

## 3. 測試策略與優先級

| 測試層級 | 責任介面 | 驗證重點 |
|---|---|---|
| {{test_level_1}} | {{owning_interface_1}} | {{verification_focus_1}} |
| {{test_level_2}} | {{owning_interface_2}} | {{verification_focus_2}} |
| {{test_level_3}} | {{owning_interface_3}} | {{verification_focus_3}} |
<!-- 依實際介面與測試層級增減列數。 -->

{{framework_environment_and_external_boundary_strategy}}

- **P0**：{{p0_risk_definition}}
- **P1**：{{p1_story_acceptance_definition}}
- **P2**：{{p2_optional_coverage_definition}}
- **通過**：{{pass_definition}}
- **失敗**：{{fail_definition}}

## 4. 非功能需求追溯

| NFR | 來源語意 | 適用 User Story | 驗證案例 | 可判定的驗收方式 |
|---|---|---|---|---|
| {{nfr_id}} | {{source_wording_without_invented_thresholds}} | {{applicable_story_ids}} | {{tp_case_ids}} | {{observable_verification}} |
<!-- 跨故事 NFR 在此集中追溯；各故事章節仍列適用 NFR ID。未定義的量測門檻不得自行補造。 -->

## 5. User Story 測試案例

### 5.1 {{user_story_id}}－{{user_story_title}}

**目標／獨立驗收**：{{goal_and_independent_test}}

**需求追溯**：{{story_acceptance_fr_br_nfr_and_sc_ids}}

| ID | 需求追溯 | 測試層級 | Public seam：system-analysis 測試入口 | 優先級 | Arrange：fixture 與差異 | Act：單一操作 | Assert：驗證層＋精確預期 |
|---|---|---|---|---|---|---|---|
| {{tp_case_id}} | {{spec_story_acceptance_fr_br_nfr_sc_ids}} | {{test_layer}} | {{analysis_output_operation_path_or_ui_test_entry}} | {{priority}} | {{named_fixture_and_case_specific_overrides}} | {{single_primary_operation}} | {{verification_depth_tag}} {{exact_observable_expected_values_and_outcome}} |

<!-- 案例格式詳見 SKILL.md §通用約束。一列只表達一個主要測試意圖；不同操作或不同主要失敗原因應拆列。 -->
<!-- Assert 必須以驗證層標記開頭：[response]、[response+state]、[response+side-effect]、[state-only]、[idempotent]。 -->
<!-- 驗證層標記告訴 /tdd 執行者該測試需要驗證到什麼深度，避免只測回應碼而遺漏持久化或副作用驗證。 -->

## 6. 具名 Fixture 與環境

| Fixture | 必要狀態、欄位與資料關聯 | 身分／權限 | 隔離與重設方式 |
|---|---|---|---|
| {{fixture_id}} | {{explicit_initial_state_and_relations}} | {{caller_identity_role_session}} | {{seed_reset_isolation_procedure}} |

**執行命令及版本**：依 system-analysis 指定來源及其研究／堆疊文件；不得自行推測端點、工具或版本。

## 7. 執行與交接

1. **{{journey_name_1}}**：{{journey_steps_and_expected_outcome}}
2. **{{journey_name_2}}**：{{journey_steps_and_expected_outcome}}

### TDD 進入條件

- {{plan_review_and_ambiguity_gate}}
- {{slice_interface_seam_and_red_gate}}

### 快速狀態摘要（由最近一次 TDD 執行後更新）

- **最後執行日期**：—
- **已完成 TP**：（列出已 🟢／✅ 的 TP ID）
- **進行中 TP**：（列出 🔴 的 TP ID 及紅燈原因）
- **未啟動 TP**：（列出 ⬜ 的 TP ID）
- **已知阻塞**：（列出影響後續的待確認／缺口）
- **下一步建議**：（建議從哪個 TP 的哪個 TDD 步驟繼續）

### 新 session 啟動檢查

- **先讀**：本節「快速狀態摘要」→ 第 10 節「執行狀態追蹤」→ {{testplan_path_and_case_ids_for_this_slice}}
- **核對需求來源**：{{source_paths_versions_or_dates_requirement_ids_and_api_operations}}
- **核對 Public seam**：{{seam_exists_and_contract_matches}}
- **核對環境入口**：{{command_fixture_setup_and_required_nonsecret_configuration}}
- **發現差異時**：{{stop_and_update_or_confirm_plan_rule}}

## 8. 需求至測試追溯

| User Story／需求 ID | 本計畫案例 |
|---|---|
| {{user_story_and_requirement_ids}} | {{tp_case_ids}} |
<!-- 覆蓋所有受測故事與 FR／NFR；未納入需求須說明原因。 -->

## 9. 待確認事項

- {{unresolved_requirement_or_analysis_gap_or_none}}
- {{scope_change_and_replan_rule}}

## 10. 執行狀態追蹤

> 由 `/tdd` 執行過程中回寫；初始狀態由 `/testplan` 產生時設為 ⬜ 未執行。

| TP ID | 狀態 | 執行日期 | 紅燈驗證 | 綠燈驗證 | Assert 符合度 | 備註 |
|---|---|---|---|---|---|---|
| {{tp_case_id}} | ⬜ 未執行 | — | — | — | — | — |

<!-- 狀態：⬜ 未執行 / 🔴 RED 通過 / 🟢 GREEN 通過 / ✅ 已驗收 / ❌ 失敗待修 -->
<!-- Assert 符合度由 /tdd GREEN 階段填入：✅ 全覆蓋 / ⚠️ 部分覆蓋 / ❌ 有缺口 -->

## 11. AI 自主決策與發現紀錄

> 由 `/tdd` 執行過程中回寫；記錄 AI 在 TDD 過程中做出的 testplan 未預期的決策。

| 日期 | TP 案例 | TDD 步驟 | 決策／發現內容 | 處置 |
|---|---|---|---|---|
| — | — | — | （初始為空；由 /tdd 執行過程中回寫） | — |

<!-- 記錄規則：
- AI 發現 testplan 未預期的情境、做出與計畫不同的設計選擇、或調整了 Assert 的具體驗證方式時，必須回寫此表。
- 「處置」欄可為：已更新案例 / 已新增待確認 / 已回報使用者待決定。
- 此表不取代正式案例；重大發現應升級為新的 TP 案例或待確認事項。 -->

Constitution self-check: {{pass_or_exceptions}}