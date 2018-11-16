Feature: blockml-create-file-sales-view

  Scenario: blockml-create-file-sales-view
    Given [common] scenario 'blockml-create-file-sales-view'

    Then [common] I go to '/project/futurama/mode/dev/blockml'

    Then [common] I click hidden field 'blockmlTreeFolderOptions' row '2'
    
    Then [common] I click 'blockmlTreeFolderOptionsNewFile'

    Then [common] I enter 'sales.view' into 'newFileDialogName' row '0'
    
    Then [common] I click 'newFileDialogCreate'

    Then [common] I click 'blockmlTitle'

    Then [common] I am redirected to page with url '/project/futurama/mode/dev/blockml/file/shop___sales.view'
    
    Then [common] I click 'blockmlTitle'

    Then [common] Field 'blockmlFileEditorSave' row '0' should be disabled
    Then [common] Field 'blockmlCommit' row '0' should be enabled
    Then [common] Field 'blockmlPushToProduction' row '0' should be disabled
    Then [common] Field 'blockmlOptions' row '0' should be enabled  