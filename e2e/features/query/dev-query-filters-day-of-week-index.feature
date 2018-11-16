Feature: dev-query-filters-day-of-week-index

  Scenario: dev-query-filters-day-of-week-index
    Given [common] scenario 'dev-query-filters-day-of-week-index'

    Then [common] I go to '/project/futurama/mode/prod/model/w_m1'

    Then [common] I click field 'modelTreeItemName' with text 'Orders1'
    
    Then [common] I click field 'modelTreeItemName' with text 'City (dimension string)'

    Then [common] I wait "1" seconds
    
    Then [common] I click field 'modelTreeItemName' with text 'Created'
    
    Then [common] I click hidden field 'modelTreeFilter' row '4'

    Then [common] I wait "1" seconds
    
    Then [common] I click field 'fractionDayOfWeekIndexType' row '0'
    Then [common] I click field 'fractionDayOfWeekIndexTypeIsEqualTo' row '0'
    Then [common] I enter '1' into 'fractionDayOfWeekIndexValues' row '0'
    Then [common] I click field 'modelTitle' row '0'      
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds    

    Then [common] I click field 'fractionDayOfWeekIndexType' row '1'
    Then [common] I click field 'fractionDayOfWeekIndexTypeIsEqualTo' row '0'
    Then [common] I enter '2,3' into 'fractionDayOfWeekIndexValues' row '1'
    Then [common] I click field 'modelTitle' row '0'      
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds     

    Then [common] I click field 'fractionDayOfWeekIndexType' row '2'
    Then [common] I click field 'fractionDayOfWeekIndexTypeIsNull' row '0'
    Then [common] I wait "1" seconds    
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds     

    Then [common] I click field 'fractionDayOfWeekIndexType' row '3'
    Then [common] I click field 'fractionDayOfWeekIndexTypeIsNotEqualTo' row '0'
    Then [common] I enter '5, 6, 7' into 'fractionDayOfWeekIndexValues' row '2'    
    Then [common] I click field 'modelTitle' row '0'      
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds     

    Then [common] I click field 'fractionDayOfWeekIndexType' row '3'
    Then [common] I click field 'fractionDayOfWeekIndexTypeIsNotNull' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds     

    Then [common] Elements 'fractionDayOfWeekIndexType' length should be '6'    
