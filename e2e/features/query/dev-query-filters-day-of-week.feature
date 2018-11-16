Feature: dev-query-filters-day-of-week

  Scenario: dev-query-filters-day-of-week
    Given [common] scenario 'dev-query-filters-day-of-week'

    Then [common] I go to '/project/futurama/mode/prod/model/w_m1'

    Then [common] I click field 'modelTreeItemName' with text 'Orders1'
    
    Then [common] I click field 'modelTreeItemName' with text 'City (dimension string)'

    Then [common] I wait "1" seconds
    
    Then [common] I click field 'modelTreeItemName' with text 'Created'
    
    Then [common] I click hidden field 'modelTreeFilter' row '3'

    Then [common] I wait "1" seconds
    
    Then [common] I click field 'fractionDayOfWeekType' row '0'
    Then [common] I click field 'fractionDayOfWeekTypeIs' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionDayOfWeekValue' row '0'
    Then [common] I click field 'fractionDayOfWeekValueTuesday' row '0'    
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds    

    Then [common] I click field 'fractionDayOfWeekType' row '1'
    Then [common] I click field 'fractionDayOfWeekTypeIsNull' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds     

    Then [common] I click field 'fractionDayOfWeekType' row '2'
    Then [common] I click field 'fractionDayOfWeekTypeIsNot' row '0'
    Then [common] I wait "1" seconds    
    Then [common] I click field 'fractionDayOfWeekValue' row '1'
    Then [common] I click field 'fractionDayOfWeekValueTuesday' row '0'    
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds     

    Then [common] I click field 'fractionDayOfWeekType' row '2'
    Then [common] I click field 'fractionDayOfWeekTypeIsNotNull' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds     

    Then [common] Elements 'fractionDayOfWeekType' length should be '5'    
