# {{interface_name}} / {{module_or_shared_scope}} DSL

{{brief_scope_description}}

## 業務 DSL（人 Review）

| 句型 | 參數 | 意思 |
| --- | --- | --- |
| `{{sentence_for_humans}}` | {{parameters_or_none}} | {{plain_language_meaning}} |

## 技術 DSL（測試落地參考）

## Given 句型

| DSL 句型 | Gherkin 參數 | Data Table 參數 | 預設參數 | {{interface_implementation_semantics_header}} |
| --- | --- | --- | --- | --- |
| `{{given_sentence}}` | {{parameters_or_none}} | {{table_parameters_or_unsupported}} | {{defaults_or_none}} | {{arrangement_and_authoritative_state_semantics}} |

## When 句型

| DSL 句型 | Gherkin 參數 | Data Table 參數 | 預設參數 | {{interface_implementation_semantics_header}} |
| --- | --- | --- | --- | --- |
| `{{when_sentence}}` | {{parameters_or_none}} | {{table_parameters_or_unsupported}} | {{defaults_or_none}} | {{single_operation_and_state_writeback_semantics}} |

## Then 句型

| DSL 句型 | Gherkin 參數 | Data Table 參數 | 預設參數 | {{interface_implementation_semantics_header}} |
| --- | --- | --- | --- | --- |
| `{{then_sentence}}` | {{parameters_or_none}} | {{table_parameters_or_unsupported}} | {{defaults_or_none}} | {{assertion_channels_and_required_invariants}} |
