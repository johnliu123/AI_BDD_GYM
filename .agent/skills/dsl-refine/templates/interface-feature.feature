# Acceptance source: {{acceptance_feature_path}} / Rule: {{acceptance_rule}} / Example: {{acceptance_example}}
Feature: {{interface_feature_name}}

  Rule: {{one_atomic_validation_contract}}

    Example: {{example_data_situation}}
      Given {{initial_state_for_this_single_test}}
      And {{additional_arrangement_if_needed}}
      When {{one_interface_level_operation}}
      Then {{observable_result_for_this_rule}}
      And {{related_invariant_for_the_same_validation_contract}}
