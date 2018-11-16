Feature: project-settings-change-timezone

  Scenario: project-settings-change-timezone
    Given [common] scenario 'project-settings-change-timezone'    
    
    Then [common] I go to '/project/futurama/settings'
    Then [common] I am on page with url '/project/futurama/settings'
    
    Then [common] I click field 'projectSettingsTimezone' row '0'

    Then [common] I wait "1" seconds

    Then [common] I click field 'projectSettingsTimezoneOption' row '1'
    
    Then [common] I wait "1" seconds

    Then [common] I click field 'projectSettingsApplyChangeTimezone' row '0'
    
    Then [common] I wait "1" seconds

    Then [common] I click 'projectSettingsTitle'

    Then [common] Field 'projectSettingsTimezone' row '0' attribute 'innerText' should be 'America - Adak'

