Feature: blockml-push-to-production

  Scenario: blockml-push-to-production
    Given [common] scenario 'blockml-push-to-production'

    Then [common] I go to '/project/futurama/mode/dev/blockml'

    Then [common] I click field 'blockmlPushToProduction' row '0'
    
    Then [common] I wait "1" seconds
    
    Then [common] I click 'blockmlTitle'
    
    Then [common] Field 'blockmlCommit' row '0' should be disabled
    Then [common] Field 'blockmlPushToProduction' row '0' should be disabled
    Then [common] Field 'blockmlOptions' row '0' should be enabled    

