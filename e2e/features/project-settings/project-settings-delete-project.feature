Feature: project-settings-delete-project

  Scenario: project-settings-delete-project
    Given [common] scenario 'project-settings-delete-project'    
    
    Then [common] I go to '/project/futurama/settings'
    Then [common] I am on page with url '/project/futurama/settings'
    
    Then [common] I click 'projectSettingsTitle'
    
    Then [common] I click 'projectSettingsDelete'
    
    Then [common] I click 'projectSettingsDeleteDialogYes'

    Then [common] I wait "1" seconds

    Then [common] I am redirected to page with url '/profile'

    Then [common] I click field 'projectSelectMenu' row '1'

    Then [common] Elements 'projectSelectMenuProject' length should be '1'

