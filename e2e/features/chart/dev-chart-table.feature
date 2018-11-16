Feature: dev-chart-table

  Scenario: dev-chart-table
    Given [common] scenario 'dev-chart-table'

    Then [common] I go to 'project/futurama/mode/dev/model/c_m1'

    Then [common] I click field 'modelTreeItemName' with text 'Name'

    Then [common] I wait "1" seconds
    
    Then [common] I click field 'modelTreeItemName' with text 'Value'

    Then [common] I wait "1" seconds
    
    Then [common] I click field 'modelQueryRun' row '0'    
    
    Then [common] I wait "3" seconds

    Then [common] I click field 'queryTabAddChart' row '0'     
    
    Then [common] I wait "1" seconds

    Then [common] I enter 'Table' into 'chartTitle' row '1'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] Field 'chartTitle' row '1' attribute 'value' should be 'Table'    
    
    Then [common] I wait "1" seconds

    Then [common] I click field 'chartType' row '1'
    Then [common] I click field 'chartTypeTable' row '0'

    Then [common] I wait "1" seconds

    Then [common] I enter '6' into 'chartPageSize' row '1'
    Then [common] I click field 'modelTitle' row '0'

    Then [common] I wait "1" seconds

    Then [common] I click field 'chartTileWidth' row '1'
    Then [common] I click field 'chartTileWidth12' row '0'

    Then [common] I wait "1" seconds

    Then [common] I click field 'chartTileHeight' row '1'
    Then [common] I click field 'chartTileHeight500' row '0'

    Then [common] I wait "1" seconds

    Then [common] I click field 'chartViewSize' row '1'
    Then [common] I click field 'chartViewSizeManual' row '0'

    Then [common] I wait "1" seconds

    Then [common] I enter '700' into 'chartViewWidth' row '1'
    Then [common] I click field 'modelTitle' row '0'

    Then [common] I wait "1" seconds

    Then [common] I enter '400' into 'chartViewHeight' row '1'
    Then [common] I click field 'modelTitle' row '0'

    Then [common] I wait "1" seconds

