Feature: blockml-revert-repo-to-last-commit

  Scenario: blockml-revert-repo-to-last-commit
    Given [common] scenario 'blockml-revert-repo-to-last-commit'

    Then [common] I go to '/project/futurama/mode/dev/blockml/file/README.md'

    Then [common] I click field 'blockmlOptions' row '0'
    
    Then [common] I click 'blockmlRevertRepoToLastCommit'

    Then [common] I wait "1" seconds
    
    Then [common] I click 'blockmlTitle'

    Then [common] Field 'blockmlEditor' row '0' attribute 'innerText' should be text
      """
1
2
# futurama
123
      """

    Then [common] Field 'blockmlFileEditorSave' row '0' should be disabled
    Then [common] Field 'blockmlCommit' row '0' should be disabled
    Then [common] Field 'blockmlPushToProduction' row '0' should be enabled
    Then [common] Field 'blockmlOptions' row '0' should be enabled      