Feature: blockml-pull

  Scenario: blockml-pull
    Given [common] scenario 'blockml-pull'

    Then [common] I go to '/project/futurama/mode/dev/blockml'

    Then [common] Field 'blockmlCommit' row '0' should be disabled
    Then [common] Field 'blockmlPull' row '0' should be enabled
    Then [common] Field 'blockmlPushToProduction' row '0' should be disabled
    Then [common] Field 'blockmlOptions' row '0' should be enabled

    Then [common] I click field 'blockmlPull' row '0'
    
    Then [common] I wait "1" seconds
    
    Then [common] I click 'blockmlTitle'
    
    Then [common] Field 'blockmlCommit' row '0' should be disabled
    Then [common] Field 'blockmlPushToProduction' row '0' should be disabled
    Then [common] Field 'blockmlOptions' row '0' should be enabled    

