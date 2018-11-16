Feature: billing-check-title

  Scenario: billing-check-title
    Given [common] scenario 'billing-check-title'

    Then [common] I go to '/project/futurama/billing'

    Then [common] Page title should be 'futurama | Billing'