Feature: blockml-create-folder-shop

  Scenario: blockml-create-folder-shop
    Given [common] scenario 'blockml-create-folder-shop'

    Then [common] I go to '/project/futurama/mode/dev/blockml'

    Then [common] Field 'blockmlCommit' row '0' should be disabled
    Then [common] Field 'blockmlPushToProduction' row '0' should be disabled
    Then [common] Field 'blockmlOptions' row '0' should be enabled        

    Then [common] I click hidden field 'blockmlTreeFolderOptions' row '3'
    Then [common] I click 'blockmlTreeFolderOptionsNewFolder'

    Then [common] I enter 'shop' into 'newFolderDialogName' row '0'
    Then [common] I click 'newFolderDialogCreate'

    Then [common] I click 'blockmlTitle'

    Then [common] Elements 'blockmlTreeFolderOptions' length should be '8'
    
    Then [common] Field 'blockmlCommit' row '0' should be disabled
    Then [common] Field 'blockmlPushToProduction' row '0' should be disabled        
    Then [common] Field 'blockmlOptions' row '0' should be enabled        