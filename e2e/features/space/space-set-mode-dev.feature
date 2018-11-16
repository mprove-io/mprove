Feature: space-set-mode-dev

  Scenario: space-set-mode-dev
    Given [common] scenario 'space-set-mode-dev'

    Then [common] I go to '/project/futurama/mode/prod/blockml'

    Then [common] I click 'blockmlTitle'

    Then [common] Field 'blockmlTitleMode' row '0' attribute 'innerText' should be 'Prod'
    
    Then [common] I click field 'spaceModeToggle' row '1'

    Then [common] Field 'blockmlTitleMode' row '0' attribute 'innerText' should be 'Dev'
    

