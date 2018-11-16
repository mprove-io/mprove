Feature: blockml-edit-file-readme-md-123

  Scenario: blockml-edit-file-readme-md-123
    Given [common] scenario 'blockml-edit-file-readme-md-123'

    Then [common] I go to '/project/futurama/mode/dev/blockml/file/README.md'

    Then [common] I enter text into editor
      """
# futurama
123
      """    
    
    Then [common] I click 'blockmlFileEditorSave'

    Then [common] I click 'blockmlTitle'

    Then [common] Field 'blockmlEditor' row '0' attribute 'innerText' should be text
      """
1
2
# futurama
123
      """    

    Then [common] Field 'blockmlFileEditorSave' row '0' should be disabled
    Then [common] Field 'blockmlCommit' row '0' should be enabled
    Then [common] Field 'blockmlPushToProduction' row '0' should be disabled       
    Then [common] Field 'blockmlOptions' row '0' should be enabled       

