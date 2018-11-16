Feature: dev-query-filters-yesno

  Scenario: dev-query-filters-yesno
    Given [common] scenario 'dev-query-filters-yesno'

    Then [common] I go to '/project/futurama/mode/prod/model/w_m1'

    Then [common] I click field 'modelTreeItemName' with text 'Orders1'
    
    Then [common] I click field 'modelTreeItemName' with text 'City (dimension string)'

    Then [common] I wait "1" seconds
    
    Then [common] I click hidden field 'modelTreeFilter' row '7'

    Then [common] I wait "1" seconds
    
    Then [common] I click field 'fractionYesnoType' row '0'
    Then [common] I click field 'fractionYesnoTypeIs' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds    

    Then [common] I click field 'fractionYesnoType' row '1'
    Then [common] I click field 'fractionYesnoTypeIs' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionYesnoValue' row '1'
    Then [common] I click field 'fractionYesnoValueNo' row '0'
    Then [common] I click field 'modelTitle' row '0'    
    Then [common] I wait "1" seconds    
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds     

    Then [common] Elements 'fractionYesnoType' length should be '3'    
