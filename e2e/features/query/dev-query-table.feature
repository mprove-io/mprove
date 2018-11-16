Feature: dev-query-table

  Scenario: dev-query-table
    Given [common] scenario 'dev-query-table'

    Then [common] I go to '/project/futurama/mode/prod/model/w_m1'
    
    Then [common] I wait "1" seconds

    Then [common] I click field 'modelTreeItemName' with text 'Price (measure number)'
    
    Then [common] I wait "1" seconds
    
    Then [common] I click field 'modelTreeItemName' with text 'Orders1'

    Then [common] I wait "1" seconds
    
    Then [common] I click field 'modelTreeItemName' with text 'DoublePrice'

    Then [common] I wait "1" seconds    
    
    Then [common] I click field 'reqDimAddedOk' row '0'

    Then [common] I wait "1" seconds    

    Then [common] I click field 'dragTableSortDesc' row '0'      
    
    Then [common] I wait "1" seconds    
    
    Then [common] Field 'dragTableSortNumber' row '0' attribute 'innerText' should be '1'
    
    Then [common] I wait "1" seconds
    
    Then [common] I click field 'dragTableSortDesc' row '1'
    
    Then [common] I wait "1" seconds    
    
    Then [common] Field 'dragTableSortNumber' row '1' attribute 'innerText' should be '2'    

    Then [common] I wait "1" seconds    
    
    Then [common] I click field 'dragTableSortDesc' row '0'

    Then [common] I wait "1" seconds    
    
    Then [common] I click field 'dragTableSortAsc' row '0'
    
    Then [common] I wait "1" seconds   

    Then [common] I click field 'modelMconfigTimezone' row '0'

    Then [common] I wait "1" seconds

    Then [common] I click field 'modelMconfigTimezoneOption' row '1'

    Then [common] I wait "1" seconds

    Then [common] Field 'modelMconfigTimezone' row '0' attribute 'innerText' should be 'America - Adak'    
    
    Then [common] I enter '100' into 'modelMconfigDataLimit' row '0'
    
    Then [common] I click 'modelTitle'

    Then [common] I wait "1" seconds    
    
    Then [common] I click field 'modelQueryMenu' row '0'
    
    Then [common] I click field 'modelQueryMenuRunDry' row '0'
    
    Then [common] I wait "3" seconds    
    
    Then [common] I click field 'modelQueryRun' row '0'

    Then [common] Field 'dataTableCell' row '2' attribute 'innerText' should be '1110'     
    