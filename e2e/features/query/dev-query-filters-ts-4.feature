Feature: dev-query-filters-ts-4

  Scenario: dev-query-filters-ts-4
    Given [common] scenario 'dev-query-filters-ts-4'

    Then [common] I go to '/project/futurama/mode/prod/model/w_m1'

    Then [common] I click field 'modelTreeItemName' with text 'Orders1'
    
    Then [common] I click field 'modelTreeItemName' with text 'City (dimension string)'

    Then [common] I wait "1" seconds
    
    Then [common] I click field 'modelTreeItemName' with text 'Created'
    
    Then [common] I click hidden field 'modelTreeFilter' row '7'

    Then [common] I wait "1" seconds
    
    Then [common] I click field 'fractionTsType' row '0'
    Then [common] I click field 'fractionTsTypeIsInLast' row '0'
    Then [common] I wait "1" seconds
    Then [common] I enter '5' into 'fractionTsLastValue' row '0'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsLastUnit' row '0'
    Then [common] I click field 'fractionTsLastUnitDays' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsLastCompleteOption' row '0'
    Then [common] I click field 'fractionTsLastCompleteOptionIncomplete' row '0'    
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds
    
    Then [common] I click field 'fractionTsType' row '1'
    Then [common] I click field 'fractionTsTypeIsInLast' row '0'
    Then [common] I wait "1" seconds
    Then [common] I enter '5' into 'fractionTsLastValue' row '1'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsLastUnit' row '1'
    Then [common] I click field 'fractionTsLastUnitDays' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsLastCompleteOption' row '1'
    Then [common] I click field 'fractionTsLastCompleteOptionComplete' row '0'    
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds
    
    Then [common] I click field 'fractionTsType' row '2'
    Then [common] I click field 'fractionTsTypeIsInLast' row '0'
    Then [common] I wait "1" seconds
    Then [common] I enter '5' into 'fractionTsLastValue' row '2'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsLastUnit' row '2'
    Then [common] I click field 'fractionTsLastUnitDays' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsLastCompleteOption' row '2'
    Then [common] I click field 'fractionTsLastCompleteOptionCompletePlusCurrent' row '0'    
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds
    
    Then [common] I click field 'fractionTsType' row '3'
    Then [common] I click field 'fractionTsTypeIsNull' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds
    
    Then [common] I click field 'fractionTsType' row '4'
    Then [common] I click field 'fractionTsTypeIsNotNull' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds

    Then [common] Elements 'fractionTsType' length should be '6'    
