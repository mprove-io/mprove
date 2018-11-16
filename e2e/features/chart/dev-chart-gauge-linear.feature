Feature: dev-chart-gauge-linear

  Scenario: dev-chart-gauge-linear
    Given [common] scenario 'dev-chart-gauge-linear'

    Then [common] I go to 'project/futurama/mode/dev/model/c_m4'

    Then [common] I click field 'modelTreeItemName' with text 'Current_signups'

    Then [common] I wait "1" seconds
    
    Then [common] I click field 'modelTreeItemName' with text 'Previous_signups'

    Then [common] I wait "1" seconds
    
    Then [common] I click field 'modelQueryRun' row '0'    
    
    Then [common] I wait "3" seconds

    Then [common] I click field 'queryTabAddChart' row '0'     
    
    Then [common] I wait "1" seconds

    Then [common] I enter 'Gauge Linear' into 'chartTitle' row '1'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] Field 'chartTitle' row '1' attribute 'value' should be 'Gauge Linear'

    Then [common] I wait "1" seconds

    Then [common] I click field 'chartType' row '1'
    Then [common] I click field 'chartTypeGaugeLinear' row '0'

    Then [common] I wait "1" seconds

    Then [common] I click field 'chartValueField' row '1'
    Then [common] I click field 'chartValueFieldOption' row '1'

    Then [common] I wait "1" seconds

    Then [common] I click field 'chartPreviousValueField' row '1'
    Then [common] I click field 'chartPreviousValueFieldOption' row '0'
    
    Then [common] I wait "1" seconds

    Then [common] I enter '20' into 'chartMin' row '1'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] Field 'chartMin' row '1' attribute 'value' should be '20'    
    
    Then [common] I wait "1" seconds

    Then [common] I enter '80' into 'chartMax' row '1'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] Field 'chartMax' row '1' attribute 'value' should be '80'    
    
    Then [common] I wait "1" seconds

    Then [common] I enter 'units' into 'chartUnits' row '1'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] Field 'chartUnits' row '1' attribute 'value' should be 'units'    
    
    Then [common] I wait "1" seconds