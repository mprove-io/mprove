Feature: dev-chart-tree-map

  Scenario: dev-chart-tree-map
    Given [common] scenario 'dev-chart-tree-map'

    Then [common] I go to 'project/futurama/mode/dev/model/c_m1'
    
    Then [common] I click field 'modelTreeItemName' with text 'Name'

    Then [common] I wait "1" seconds
    
    Then [common] I click field 'modelTreeItemName' with text 'Value'

    Then [common] I wait "1" seconds
    
    Then [common] I click field 'modelQueryRun' row '0'    
    
    Then [common] I wait "3" seconds

    Then [common] I click field 'queryTabAddChart' row '0'     
    
    Then [common] I wait "1" seconds

    Then [common] I enter 'Tree Map' into 'chartTitle' row '1'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] Field 'chartTitle' row '1' attribute 'value' should be 'Tree Map'

    Then [common] I wait "1" seconds

    Then [common] I click field 'chartType' row '1'
    Then [common] I click field 'chartTypeTreeMap' row '0'

    Then [common] I wait "1" seconds

    Then [common] I click field 'chartXField' row '1'
    Then [common] I click field 'chartXFieldOption' row '0'

    Then [common] I wait "1" seconds

    Then [common] I click field 'chartYField' row '1'
    Then [common] I click field 'chartYFieldOption' row '1'
    
    Then [common] I wait "1" seconds
    