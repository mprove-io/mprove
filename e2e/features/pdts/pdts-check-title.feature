Feature: pdts-check-title

  Scenario: pdts-check-title
    Given [common] scenario 'pdts-check-title'

    Then [common] I go to '/project/futurama/mode/prod/pdts'

    Then [common] Page title should be 'futurama | Pdts'