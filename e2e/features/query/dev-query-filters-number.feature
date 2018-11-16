Feature: dev-query-filters-number

  Scenario: dev-query-filters-number
    Given [common] scenario 'dev-query-filters-number'

    Then [common] I go to '/project/futurama/mode/prod/model/w_m1'

    Then [common] I click field 'modelTreeItemName' with text 'Orders1'
    
    Then [common] I wait "1" seconds
    
    Then [common] I click field 'modelTreeItemName' with text 'Price'

    Then [common] I wait "1" seconds
    
    Then [common] I click hidden field 'modelTreeFilter' row '8'

    Then [common] I wait "1" seconds
    
    Then [common] I click field 'fractionNumberType' row '0'
    Then [common] I click field 'fractionNumberTypeIsEqualTo' row '0'
    Then [common] I enter '-100' into 'fractionNumberValues' row '0'
    Then [common] I click field 'modelTitle' row '0'      
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds    

    Then [common] I click field 'fractionNumberType' row '1'
    Then [common] I click field 'fractionNumberTypeIsEqualTo' row '0'
    Then [common] I enter '105, 110, 115' into 'fractionNumberValues' row '1'
    Then [common] I click field 'modelTitle' row '0'      
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds     

    Then [common] I click field 'fractionNumberType' row '2'
    Then [common] I click field 'fractionNumberTypeIsGreaterThan' row '0'
    Then [common] I enter '100' into 'fractionNumberSingleValue' row '0'
    Then [common] I click field 'modelTitle' row '0'    
    Then [common] I wait "1" seconds    
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds     

    Then [common] I click field 'fractionNumberType' row '3'
    Then [common] I click field 'fractionNumberTypeIsGreaterThanOrEqualTo' row '0'
    Then [common] I enter '100' into 'fractionNumberSingleValue' row '1'    
    Then [common] I click field 'modelTitle' row '0'      
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds     

    Then [common] I click field 'fractionNumberType' row '4'
    Then [common] I click field 'fractionNumberTypeIsLessThan' row '0'
    Then [common] I enter '100' into 'fractionNumberSingleValue' row '2'
    Then [common] I click field 'modelTitle' row '0'    
    Then [common] I wait "1" seconds    
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds     

    Then [common] I click field 'fractionNumberType' row '5'
    Then [common] I click field 'fractionNumberTypeIsLessThanOrEqualTo' row '0'
    Then [common] I enter '100' into 'fractionNumberSingleValue' row '3'    
    Then [common] I click field 'modelTitle' row '0'      
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds     

    Then [common] I click field 'fractionNumberType' row '6'
    Then [common] I click field 'fractionNumberTypeIsBetween' row '0'
    Then [common] I enter '100' into 'fractionNumberBetweenFirstValue' row '0'    
    Then [common] I enter '200' into 'fractionNumberBetweenSecondValue' row '0'    
    Then [common] I click field 'modelTitle' row '0'      
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds     

    Then [common] I click field 'fractionNumberType' row '7'
    Then [common] I click field 'fractionNumberTypeIsBetween' row '0'
    Then [common] I click field 'fractionNumberBetweenOption' row '1'
    Then [common] I click field 'fractionNumberBetweenOptionLeftInclusive' row '0'
    Then [common] I enter '100' into 'fractionNumberBetweenFirstValue' row '1'    
    Then [common] I enter '200' into 'fractionNumberBetweenSecondValue' row '1'    
    Then [common] I click field 'modelTitle' row '0'      
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds     

    Then [common] I click field 'fractionNumberType' row '8'
    Then [common] I click field 'fractionNumberTypeIsBetween' row '0'
    Then [common] I click field 'fractionNumberBetweenOption' row '2'
    Then [common] I click field 'fractionNumberBetweenOptionRightInclusive' row '0'
    Then [common] I enter '100' into 'fractionNumberBetweenFirstValue' row '2'    
    Then [common] I enter '200' into 'fractionNumberBetweenSecondValue' row '2'    
    Then [common] I click field 'modelTitle' row '0'      
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds     

    Then [common] I click field 'fractionNumberType' row '9'
    Then [common] I click field 'fractionNumberTypeIsBetween' row '0'
    Then [common] I click field 'fractionNumberBetweenOption' row '3'
    Then [common] I click field 'fractionNumberBetweenOptionExclusive' row '0'
    Then [common] I enter '100' into 'fractionNumberBetweenFirstValue' row '3'    
    Then [common] I enter '200' into 'fractionNumberBetweenSecondValue' row '3'    
    Then [common] I click field 'modelTitle' row '0'      
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds     

    Then [common] I click field 'fractionNumberType' row '10'
    Then [common] I click field 'fractionNumberTypeIsNull' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds     

    Then [common] I click field 'fractionNumberType' row '11'
    Then [common] I click field 'fractionNumberTypeIsNotEqualTo' row '0'
    Then [common] I enter '100' into 'fractionNumberValues' row '2'
    Then [common] I click field 'modelTitle' row '0'      
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds     

    Then [common] I click field 'fractionNumberType' row '11'
    Then [common] I click field 'fractionNumberTypeIsNotEqualTo' row '0'
    Then [common] I enter '105, 110, 115' into 'fractionNumberValues' row '2'
    Then [common] I click field 'modelTitle' row '0'      
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds     

    Then [common] I click field 'fractionNumberType' row '11'
    Then [common] I click field 'fractionNumberTypeIsNotBetween' row '0'
    Then [common] I enter '100' into 'fractionNumberBetweenFirstValue' row '4'    
    Then [common] I enter '200' into 'fractionNumberBetweenSecondValue' row '4'    
    Then [common] I click field 'modelTitle' row '0'      
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds


    Then [common] I click field 'fractionNumberType' row '11'
    Then [common] I click field 'fractionNumberTypeIsNotBetween' row '0'
    Then [common] I click field 'fractionNumberBetweenOption' row '4'
    Then [common] I click field 'fractionNumberBetweenOptionLeftInclusive' row '0'
    Then [common] I enter '100' into 'fractionNumberBetweenFirstValue' row '4'    
    Then [common] I enter '200' into 'fractionNumberBetweenSecondValue' row '4'    
    Then [common] I click field 'modelTitle' row '0'      
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds     

    Then [common] I click field 'fractionNumberType' row '11'
    Then [common] I click field 'fractionNumberTypeIsNotBetween' row '0'
    Then [common] I click field 'fractionNumberBetweenOption' row '4'
    Then [common] I click field 'fractionNumberBetweenOptionRightInclusive' row '0'
    Then [common] I enter '100' into 'fractionNumberBetweenFirstValue' row '4'    
    Then [common] I enter '200' into 'fractionNumberBetweenSecondValue' row '4'    
    Then [common] I click field 'modelTitle' row '0'      
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds     

    Then [common] I click field 'fractionNumberType' row '11'
    Then [common] I click field 'fractionNumberTypeIsNotBetween' row '0'
    Then [common] I click field 'fractionNumberBetweenOption' row '4'
    Then [common] I click field 'fractionNumberBetweenOptionExclusive' row '0'
    Then [common] I enter '100' into 'fractionNumberBetweenFirstValue' row '4'    
    Then [common] I enter '200' into 'fractionNumberBetweenSecondValue' row '4'    
    Then [common] I click field 'modelTitle' row '0'      
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds

    Then [common] I click field 'fractionNumberType' row '11'
    Then [common] I click field 'fractionNumberTypeIsNotNull' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds    

    Then [common] Elements 'fractionNumberType' length should be '19'    
