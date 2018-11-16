Feature: project-settings-change-week-start

  Scenario: project-settings-change-week-start
    Given [common] scenario 'project-settings-change-week-start'    
    
    Then [common] I go to '/project/futurama/settings'
    Then [common] I am on page with url '/project/futurama/settings'
    
    Then [common] I click field 'projectSettingsWeekStart' row '0'

    Then [common] I wait "1" seconds

    Then [common] I click field 'projectSettingsWeekStartOption' row '0'
    
    Then [common] I wait "1" seconds

    Then [common] I click field 'projectSettingsApplyChangeWeekStart' row '0'
    
    Then [common] I wait "1" seconds

    Then [common] I click 'projectSettingsTitle'

    Then [common] Field 'projectSettingsWeekStart' row '0' attribute 'innerText' should be 'Sunday'

