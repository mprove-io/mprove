Feature: dev-chart-gauge

  Scenario: dev-chart-gauge
    Given [common] scenario 'dev-chart-gauge'

    Then [common] I go to 'project/futurama/mode/dev/model/c_m1'

    Then [common] I click field 'modelTreeItemName' with text 'Name'

    Then [common] I wait "1" seconds
    
    Then [common] I click field 'modelTreeItemName' with text 'Value'

    Then [common] I wait "1" seconds
    
    Then [common] I click field 'dragTableSortDesc' row '0'  

    Then [common] I wait "1" seconds
    
    Then [common] I click field 'modelQueryRun' row '0'    
    
    Then [common] I wait "3" seconds

    Then [common] I click field 'queryTabAddChart' row '0'     
    
    Then [common] I wait "1" seconds

    Then [common] I enter 'Gauge' into 'chartTitle' row '1'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] Field 'chartTitle' row '1' attribute 'value' should be 'Gauge' 

    Then [common] I wait "1" seconds

    Then [common] I click field 'chartType' row '1'
    Then [common] I click field 'chartTypeGauge' row '0'

    Then [common] I wait "1" seconds

    Then [common] I click field 'chartXField' row '1'
    Then [common] I click field 'chartXFieldOption' row '0'

    Then [common] I wait "1" seconds

    Then [common] I click field 'chartYField' row '1'
    Then [common] I click field 'chartYFieldOption' row '1'

    Then [common] I wait "1" seconds

    Then [common] I enter '260' into 'chartAngleSpan' row '1'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] Field 'chartAngleSpan' row '1' attribute 'value' should be '260'  

    Then [common] I wait "1" seconds

    Then [common] I enter '-130' into 'chartStartAngle' row '1'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] Field 'chartStartAngle' row '1' attribute 'value' should be '-130'  

    Then [common] I wait "1" seconds

    Then [common] I enter '12' into 'chartBigSegments' row '1'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] Field 'chartBigSegments' row '1' attribute 'value' should be '12'  

    Then [common] I wait "1" seconds

    Then [common] I enter '3' into 'chartSmallSegments' row '1'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] Field 'chartSmallSegments' row '1' attribute 'value' should be '3'  

    Then [common] I wait "1" seconds

    Then [common] I enter '1000' into 'chartMin' row '1'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] Field 'chartMin' row '1' attribute 'value' should be '1000'  

    Then [common] I wait "1" seconds

    Then [common] I enter '70000' into 'chartMax' row '1'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] Field 'chartMax' row '1' attribute 'value' should be '70000'  

    Then [common] I wait "1" seconds

    Then [common] I enter 'units' into 'chartUnits' row '1'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] Field 'chartUnits' row '1' attribute 'value' should be 'units'  

    Then [common] I wait "1" seconds

    
    