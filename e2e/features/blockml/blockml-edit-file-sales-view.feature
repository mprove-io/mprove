Feature: blockml-edit-file-sales-view

  Scenario: blockml-edit-file-sales-view
    Given [common] scenario 'blockml-edit-file-sales-view'

    Then [common] I go to '/project/futurama/mode/dev/blockml/file/shop___sales.view'


    Then [common] I enter text into editor
      """
view: sales
table: flow-1202.ak.data1
      """    
    
    Then [common] Field 'blockmlFileEditorSave' row '0' should be enabled
    Then [common] Field 'blockmlCommit' row '0' should be disabled
    Then [common] Field 'blockmlPushToProduction' row '0' should be disabled
    Then [common] Field 'blockmlOptions' row '0' should be disabled
    
    Then [common] I click 'blockmlFileEditorSave'

    Then [common] I click 'blockmlTitle'

    Then [common] Field 'blockmlEditor' row '0' attribute 'innerText' should be text
      """
1
2
view: sales
table: flow-1202.ak.data1
      """    

    Then [common] Field 'blockmlFileEditorSave' row '0' should be disabled
    Then [common] Field 'blockmlCommit' row '0' should be enabled
    Then [common] Field 'blockmlPushToProduction' row '0' should be disabled
    Then [common] Field 'blockmlOptions' row '0' should be enabled
