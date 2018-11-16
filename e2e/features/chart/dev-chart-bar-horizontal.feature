Feature: dev-chart-bar-horizontal

  Scenario: dev-chart-bar-horizontal
    Given [common] scenario 'dev-chart-bar-horizontal'

    Then [common] I go to 'project/futurama/mode/dev/model/c_m1'

    Then [common] I click field 'modelTreeItemName' with text 'Name'

    Then [common] I wait "1" seconds
    
    Then [common] I click field 'modelTreeItemName' with text 'Value'

    Then [common] I wait "1" seconds
    
    Then [common] I click field 'modelQueryRun' row '0'    
    
    Then [common] I wait "3" seconds

    Then [common] I click field 'queryTabAddChart' row '0'     
    
    Then [common] I wait "1" seconds

    Then [common] I enter 'Bar Horizontal' into 'chartTitle' row '1'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] Field 'chartTitle' row '1' attribute 'value' should be 'Bar Horizontal' 

    Then [common] I wait "1" seconds

    Then [common] I click field 'chartType' row '1'
    Then [common] I click field 'chartTypeBarHorizontal' row '0'

    Then [common] I wait "1" seconds

    Then [common] I click field 'chartXField' row '1'
    Then [common] I click field 'chartXFieldOption' row '0'

    Then [common] I wait "1" seconds

    Then [common] I click field 'chartYField' row '1'
    Then [common] I click field 'chartYFieldOption' row '1'

    Then [common] I wait "1" seconds

    Then [common] I enter 'GDP Per Capita' into 'chartXAxisLabel' row '1'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] Field 'chartXAxisLabel' row '1' attribute 'value' should be 'GDP Per Capita'    
    
    Then [common] I wait "1" seconds

    Then [common] I enter 'Country' into 'chartYAxisLabel' row '1'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] Field 'chartYAxisLabel' row '1' attribute 'value' should be 'Country'      
    
    