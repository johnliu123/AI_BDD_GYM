# Acceptance to Interface Traceability

## Sources

- Acceptance Feature root: `{{acceptance_features_root}}`
- System analysis: `{{system_analysis_plan_path}}`

## Coverage Matrix

| Acceptance Feature | Acceptance Rule | Acceptance Example | Spec Requirement IDs | Acceptance assertion / invariant | Status | Interface | Module | Derived Feature | Derived Rule / Example | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| {{acceptance_feature}} | {{acceptance_rule}} | {{acceptance_example}} | {{spec_requirement_ids_or_none}} | {{acceptance_assertion}} | {{assigned_unmapped_or_blocked}} | {{interface_or_none}} | {{module_or_none}} | {{derived_feature_or_none}} | {{derived_rule_and_example_or_none}} | {{reason_or_open_issue}} |

## Coverage Summary

- Acceptance Examples: {{acceptance_example_count}}
- In-scope spec requirement IDs: {{in_scope_spec_requirement_count}}
- Requirements mapped to acceptance Examples: {{mapped_spec_requirement_count}}
- Unmapped spec requirements: {{unmapped_spec_requirement_count_and_ids}}
- Assigned assertions: {{assigned_assertion_count}}
- Unmapped assertions: {{unmapped_assertion_count}}
- Blocked assertions: {{blocked_assertion_count}}
- Derived interface Examples: {{derived_example_count}}

## Open Decisions

| Acceptance source | Unresolved decision or conflict | Impacted interface / module | Next action |
| --- | --- | --- | --- |
| {{source_or_none}} | {{decision_or_none}} | {{impacted_scope_or_none}} | {{clarify_or_none}} |
