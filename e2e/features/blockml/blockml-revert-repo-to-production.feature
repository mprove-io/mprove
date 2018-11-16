Feature: blockml-revert-repo-to-production

  Scenario: blockml-revert-repo-to-production
    Given [common] scenario 'blockml-revert-repo-to-production'

    Then [common] I go to '/project/futurama/mode/dev/blockml'

    Then [common] I click field 'blockmlOptions' row '0'
    
    Then [common] I click 'blockmlRevertRepoToProduction'

    Then [common] I wait "1" seconds
    
    Then [common] I am redirected to page with url '/project/futurama/mode/dev/blockml'

    Then [common] I click 'blockmlTitle'

    Then [common] Elements 'blockmlTreeFolderOptions' length should be '6'

    Then [common] Field 'blockmlCommit' row '0' should be disabled
    Then [common] Field 'blockmlPushToProduction' row '0' should be disabled    
    Then [common] Field 'blockmlOptions' row '0' should be enabled    