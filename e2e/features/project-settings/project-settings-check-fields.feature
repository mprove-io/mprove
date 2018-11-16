Feature: project-settings-check-fields

  Scenario: project-settings-check-fields
    Given [common] scenario 'project-settings-check-fields'

    Then [common] I go to '/project/futurama/settings'
    Then [common] I am on page with url '/project/futurama/settings'

    Then [common] Field 'projectSettingsBqProject' row '0' attribute 'innerText' should be empty
    Then [common] Field 'projectSettingsClientEmail' row '0' attribute 'innerText' should be empty
    Then [common] Field 'projectSettingsQuerySizeLimit' row '0' attribute 'value' should be '1'
    Then [common] Field 'projectSettingsTimezone' row '0' attribute 'innerText' should be 'UTC'
    Then [common] Field 'projectSettingsWeekStart' row '0' attribute 'innerText' should be 'Monday'
    Then [common] Field 'projectSettingsProjectId' row '0' attribute 'innerText' should be 'futurama'
    
    
