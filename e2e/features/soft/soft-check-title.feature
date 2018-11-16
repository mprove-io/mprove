Feature: soft-check-title

  Scenario: soft-check-title
    Given [common] scenario 'soft-check-title'

    Then [common] I go to '/soft'

    Then [common] Page title should be 'Mprove'