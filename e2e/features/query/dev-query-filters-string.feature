Feature: dev-query-filters-string

  Scenario: dev-query-filters-string
    Given [common] scenario 'dev-query-filters-string'

    Then [common] I go to '/project/futurama/mode/prod/model/w_m1'

    Then [common] I click field 'modelTreeItemName' with text 'Orders1'
    
    Then [common] I click field 'modelTreeItemName' with text 'City (dimension string)'

    Then [common] I wait "1" seconds
    
    Then [common] I click hidden field 'modelTreeFilter' row '2'

    Then [common] I wait "1" seconds

    Then [common] I click field 'fractionStringType' row '0'
    Then [common] I click field 'fractionStringTypeIsEqualTo' row '0'
    Then [common] I enter 'FOO' into 'fractionStringValue' row '0'
    Then [common] I click field 'modelTitle' row '0'    
    Then [common] I wait "1" seconds    
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds

    Then [common] I click field 'fractionStringType' row '1'
    Then [common] I click field 'fractionStringTypeContains' row '0'
    Then [common] I enter 'FOO' into 'fractionStringValue' row '1'
    Then [common] I click field 'modelTitle' row '0'    
    Then [common] I wait "1" seconds    
    Then [common] I click field 'addModelFraction' row '0'    
    Then [common] I wait "1" seconds

    Then [common] I click field 'fractionStringType' row '2'
    Then [common] I click field 'fractionStringTypeStartsWith' row '0'
    Then [common] I enter 'FOO' into 'fractionStringValue' row '2'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] I wait "1" seconds        
    Then [common] I click field 'addModelFraction' row '0'    
    Then [common] I wait "1" seconds

    Then [common] I click field 'fractionStringType' row '3'
    Then [common] I click field 'fractionStringTypeEndsWith' row '0'
    Then [common] I enter 'FOO' into 'fractionStringValue' row '3'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] I wait "1" seconds        
    Then [common] I click field 'addModelFraction' row '0'    
    Then [common] I wait "1" seconds

    Then [common] I click field 'fractionStringType' row '4'
    Then [common] I click field 'fractionStringTypeIsNull' row '0'
    Then [common] I click field 'modelTitle' row '0'    
    Then [common] I wait "1" seconds    
    Then [common] I click field 'addModelFraction' row '0'    
    Then [common] I wait "1" seconds

    Then [common] I click field 'fractionStringType' row '5'
    Then [common] I click field 'fractionStringTypeIsBlank' row '0'
    Then [common] I click field 'modelTitle' row '0'    
    Then [common] I wait "1" seconds    
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds

    Then [common] I click field 'fractionStringType' row '6'
    Then [common] I click field 'fractionStringTypeIsNotEqualTo' row '0'
    Then [common] I enter 'FOO' into 'fractionStringValue' row '4'
    Then [common] I click field 'modelTitle' row '0'    
    Then [common] I wait "1" seconds    
    Then [common] I click field 'addModelFraction' row '0'     
    Then [common] I wait "1" seconds

    Then [common] I click field 'fractionStringType' row '6'
    Then [common] I click field 'fractionStringTypeDoesNotContain' row '0'
    Then [common] I enter 'FOO' into 'fractionStringValue' row '4'
    Then [common] I click field 'modelTitle' row '0'    
    Then [common] I wait "1" seconds    
    Then [common] I click field 'addModelFraction' row '0'     
    Then [common] I wait "1" seconds

    Then [common] I click field 'fractionStringType' row '6'
    Then [common] I click field 'fractionStringTypeDoesNotStartWith' row '0'
    Then [common] I enter 'FOO' into 'fractionStringValue' row '4'
    Then [common] I click field 'modelTitle' row '0'    
    Then [common] I wait "1" seconds    
    Then [common] I click field 'addModelFraction' row '0'     
    Then [common] I wait "1" seconds

    Then [common] I click field 'fractionStringType' row '6'
    Then [common] I click field 'fractionStringTypeDoesNotEndWith' row '0'
    Then [common] I enter 'FOO' into 'fractionStringValue' row '4'
    Then [common] I click field 'modelTitle' row '0'    
    Then [common] I wait "1" seconds    
    Then [common] I click field 'addModelFraction' row '0'     
    Then [common] I wait "1" seconds

    Then [common] I click field 'fractionStringType' row '6'
    Then [common] I click field 'fractionStringTypeIsNotNull' row '0'
    Then [common] I click field 'modelTitle' row '0'    
    Then [common] I wait "1" seconds    
    Then [common] I click field 'addModelFraction' row '0'     
    Then [common] I wait "1" seconds

    Then [common] I click field 'fractionStringType' row '6'
    Then [common] I click field 'fractionStringTypeIsNotBlank' row '0'
    Then [common] I click field 'modelTitle' row '0'    
    Then [common] I wait "1" seconds    
    Then [common] I click field 'addModelFraction' row '0'     
    Then [common] I wait "1" seconds

    Then [common] Elements 'fractionStringType' length should be '13'    
