Feature: dev-query-filters-month-name

  Scenario: dev-query-filters-month-name
    Given [common] scenario 'dev-query-filters-month-name'

    Then [common] I go to '/project/futurama/mode/prod/model/w_m1'

    Then [common] I click field 'modelTreeItemName' with text 'Orders1'
    
    Then [common] I click field 'modelTreeItemName' with text 'City (dimension string)'

    Then [common] I wait "1" seconds
    
    Then [common] I click field 'modelTreeItemName' with text 'Created'
    
    Then [common] I click hidden field 'modelTreeFilter' row '5'

    Then [common] I wait "1" seconds
    
    Then [common] I click field 'fractionMonthNameType' row '0'
    Then [common] I click field 'fractionMonthNameTypeIs' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionMonthNameValue' row '0'
    Then [common] I click field 'fractionMonthNameValueFebruary' row '0'    
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds    

    Then [common] I click field 'fractionMonthNameType' row '1'
    Then [common] I click field 'fractionMonthNameTypeIsNull' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds     

    Then [common] I click field 'fractionMonthNameType' row '2'
    Then [common] I click field 'fractionMonthNameTypeIsNot' row '0'
    Then [common] I wait "1" seconds    
    Then [common] I click field 'fractionMonthNameValue' row '1'
    Then [common] I click field 'fractionMonthNameValueFebruary' row '0'    
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds     

    Then [common] I click field 'fractionMonthNameType' row '2'
    Then [common] I click field 'fractionMonthNameTypeIsNotNull' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds     

    Then [common] Elements 'fractionMonthNameType' length should be '5'    
