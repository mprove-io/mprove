Feature: project-settings-change-query-size-limit

  Scenario: project-settings-change-query-size-limit
    Given [common] scenario 'project-settings-change-query-size-limit'

    Then [common] I go to '/project/futurama/settings'
    Then [common] I am on page with url '/project/futurama/settings'

    Then [common] I enter '5' into 'projectSettingsQuerySizeLimit' row '0'
    Then [common] I click 'projectSettingsApplyChangeQuerySizeLimit'    
    
    Then [common] I wait "1" seconds
    Then [common] I click 'projectSettingsTitle'    
    Then [common] Field 'projectSettingsQuerySizeLimit' row '0' attribute 'value' should be '5'
    
    
