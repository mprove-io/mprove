Feature: blockml-check-title

  Scenario: blockml-check-title
    Given [common] scenario 'blockml-check-title'

    Then [common] I go to '/project/futurama/mode/prod/blockml'

    Then [common] Page title should be 'futurama | BlockML'