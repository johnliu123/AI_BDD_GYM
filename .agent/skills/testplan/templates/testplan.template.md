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
- **通過／失敗**：{{pass_and_fail_definitions}}

- **P0**：{{p0_definition}}
- **P1**：{{p1_definition}}
- **P2**：{{p2_definition}}
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

| ID | 需求追溯 | 測試層級 | Public seam：system-analysis 測試入口 | 優先級 | Arrange：fixture 與差異 | Act：單一操作 | Assert：精確預期 |
|---|---|---|---|---|---|---|---|
| {{tp_case_id}} | {{spec_story_acceptance_fr_br_nfr_sc_ids}} | {{test_layer}} | {{analysis_output_operation_path_or_ui_test_entry}} | {{priority}} | {{named_fixture_and_case_specific_overrides}} | {{single_primary_operation}} | {{exact_observable_expected_values_and_outcome}} |

<!-- 一列只表達一個主要測試意圖；不同操作或不同主要失敗原因應拆列，只有同一意圖的輸入變化才參數化。 -->
<!-- Public seam 是測試實際呼叫的入口；實作參考只協助定位程式，不可把 internal call 當成通過條件。尚未實作時列契約 seam，實作符號標待建立／待確認。 -->
<!-- Arrange 引用第 7 節具名 fixture，並列出本案例必要差異、身份／session／角色、stub 或時鐘控制；不依賴前一案例。 -->
<!-- Assert 給單一精確結果或明確值；未定義的替代結果須先列為待決事項，不可留給 TDD 執行者選擇。 -->
<!-- 每個 User Story 都是主要分組；依 spec 重複故事小節。每案例有唯一 TP ID、需求追溯與完整 3A。 -->

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

### 新 session 啟動檢查

- **先讀**：{{testplan_path_and_case_ids_for_this_slice}}
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

Constitution self-check: {{pass_or_exceptions}}