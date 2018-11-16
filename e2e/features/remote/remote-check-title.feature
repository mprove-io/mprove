Feature: remote-check-title

  Scenario: remote-check-title
    Given [common] scenario 'remote-check-title'

    Then [common] I go to '/project/futurama/remote'

    Then [common] Page title should be 'futurama | Remote'