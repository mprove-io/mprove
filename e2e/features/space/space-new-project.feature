Feature: space-new-project

  Scenario: space-new-project
    Given [common] scenario 'space-new-project'

    Then [common] I go to '/profile'
    Then [common] I click field 'projectSelectMenu' row '1'
    Then [common] I click field 'projectSelectMenuNewProject' row '0'
    Then [common] I enter 'futurama' into 'newProjectDialogName' row '0'
    Then [common] I click 'newProjectDialogAdd'
    
    Then [common] I am redirected to page with url '/project/futurama/team'
    Then [common] I click 'teamTitle'    
    
    Then [common] Field 'projectSetupMenu' row '1' attribute 'innerText' should be 'Futurama'

    Then [common] I click field 'projectSelectMenu' row '1'
    Then [common] Elements 'projectSelectMenuProject' length should be '2'    
