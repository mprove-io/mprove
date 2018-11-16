Feature: project-settings-check-title

  Scenario: project-settings-check-title
    Given [common] scenario 'project-settings-check-title'

    Then [common] I go to '/project/futurama/settings'
    Then [common] I am on page with url '/project/futurama/settings'

    Then [common] Page title should be 'futurama | Settings'