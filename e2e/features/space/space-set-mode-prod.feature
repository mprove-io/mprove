Feature: space-set-mode-prod

  Scenario: space-set-mode-prod
    Given [common] scenario 'space-set-mode-prod'

    Then [common] I go to '/project/futurama/mode/dev/blockml'

    Then [common] I click 'blockmlTitle'

    Then [common] Field 'blockmlTitleMode' row '0' attribute 'innerText' should be 'Dev'

    Then [common] I click field 'spaceModeToggle' row '1'

    Then [common] Field 'blockmlTitleMode' row '0' attribute 'innerText' should be 'Prod'
    

