Feature: dev-query-filters-ts-2

  Scenario: dev-query-filters-ts-2
    Given [common] scenario 'dev-query-filters-ts-2'

    Then [common] I go to '/project/futurama/mode/prod/model/w_m1'

    Then [common] I click field 'modelTreeItemName' with text 'Orders1'
    
    Then [common] I click field 'modelTreeItemName' with text 'City (dimension string)'

    Then [common] I wait "1" seconds
    
    Then [common] I click field 'modelTreeItemName' with text 'Created'
    
    Then [common] I click hidden field 'modelTreeFilter' row '7'

    Then [common] I wait "1" seconds
    
    Then [common] I click field 'fractionTsType' row '0'
    Then [common] I click field 'fractionTsTypeIsOnMinute' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds    
    
    Then [common] I click field 'fractionTsType' row '1'
    Then [common] I click field 'fractionTsTypeIsOnHour' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds    
    
    Then [common] I click field 'fractionTsType' row '2'
    Then [common] I click field 'fractionTsTypeIsOnDay' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds    
    
    Then [common] I click field 'fractionTsType' row '3'
    Then [common] I click field 'fractionTsTypeIsOnMonth' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds    
    
    Then [common] I click field 'fractionTsType' row '4'
    Then [common] I click field 'fractionTsTypeIsOnYear' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds    
    
    Then [common] I click field 'fractionTsType' row '5'
    Then [common] I click field 'fractionTsTypeIsInRange' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds
    
    Then [common] I click field 'fractionTsType' row '6'
    Then [common] I click field 'fractionTsTypeIsBeforeDate' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds
    
    Then [common] I click field 'fractionTsType' row '7'
    Then [common] I click field 'fractionTsTypeIsBeforeDate' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsForOption' row '1'
    Then [common] I click field 'fractionTsForOptionFor' row '0'
    Then [common] I wait "1" seconds
    Then [common] I enter '2' into 'fractionTsForValue' row '0'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsForUnit' row '0'
    Then [common] I click field 'fractionTsForUnitYears' row '0'    
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds
    
    Then [common] I click field 'fractionTsType' row '8'
    Then [common] I click field 'fractionTsTypeIsBeforeDate' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsForOption' row '2'
    Then [common] I click field 'fractionTsForOptionFor' row '0'
    Then [common] I wait "1" seconds
    Then [common] I enter '2' into 'fractionTsForValue' row '1'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsForUnit' row '1'
    Then [common] I click field 'fractionTsForUnitQuarters' row '0'    
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds
    
    Then [common] I click field 'fractionTsType' row '9'
    Then [common] I click field 'fractionTsTypeIsBeforeDate' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsForOption' row '3'
    Then [common] I click field 'fractionTsForOptionFor' row '0'
    Then [common] I wait "1" seconds
    Then [common] I enter '2' into 'fractionTsForValue' row '2'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsForUnit' row '2'
    Then [common] I click field 'fractionTsForUnitMonths' row '0'    
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds
    
    Then [common] I click field 'fractionTsType' row '10'
    Then [common] I click field 'fractionTsTypeIsBeforeDate' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsForOption' row '4'
    Then [common] I click field 'fractionTsForOptionFor' row '0'
    Then [common] I wait "1" seconds
    Then [common] I enter '2' into 'fractionTsForValue' row '3'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsForUnit' row '3'
    Then [common] I click field 'fractionTsForUnitWeeks' row '0'    
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds
    
    Then [common] I click field 'fractionTsType' row '11'
    Then [common] I click field 'fractionTsTypeIsBeforeDate' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsForOption' row '5'
    Then [common] I click field 'fractionTsForOptionFor' row '0'
    Then [common] I wait "1" seconds
    Then [common] I enter '2' into 'fractionTsForValue' row '4'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsForUnit' row '4'
    Then [common] I click field 'fractionTsForUnitDays' row '0'    
    Then [common] I wait "1" seconds
    
    Then [common] Elements 'fractionTsType' length should be '12'    
