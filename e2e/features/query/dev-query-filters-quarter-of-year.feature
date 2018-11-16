Feature: dev-query-filters-quarter-of-year

  Scenario: dev-query-filters-quarter-of-year
    Given [common] scenario 'dev-query-filters-quarter-of-year'

    Then [common] I go to '/project/futurama/mode/prod/model/w_m1'

    Then [common] I click field 'modelTreeItemName' with text 'Orders1'
    
    Then [common] I click field 'modelTreeItemName' with text 'City (dimension string)'

    Then [common] I wait "1" seconds
    
    Then [common] I click field 'modelTreeItemName' with text 'Created'
    
    Then [common] I click hidden field 'modelTreeFilter' row '6'

    Then [common] I wait "1" seconds
    
    Then [common] I click field 'fractionQuarterOfYearType' row '0'
    Then [common] I click field 'fractionQuarterOfYearTypeIs' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionQuarterOfYearValue' row '0'
    Then [common] I click field 'fractionQuarterOfYearValueQ2' row '0'    
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds    

    Then [common] I click field 'fractionQuarterOfYearType' row '1'
    Then [common] I click field 'fractionQuarterOfYearTypeIsNull' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds     

    Then [common] I click field 'fractionQuarterOfYearType' row '2'
    Then [common] I click field 'fractionQuarterOfYearTypeIsNot' row '0'
    Then [common] I wait "1" seconds    
    Then [common] I click field 'fractionQuarterOfYearValue' row '1'
    Then [common] I click field 'fractionQuarterOfYearValueQ2' row '0'    
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds     

    Then [common] I click field 'fractionQuarterOfYearType' row '2'
    Then [common] I click field 'fractionQuarterOfYearTypeIsNotNull' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds     

    Then [common] Elements 'fractionQuarterOfYearType' length should be '5'    
