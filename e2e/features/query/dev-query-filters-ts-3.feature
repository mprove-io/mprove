Feature: dev-query-filters-ts-3

  Scenario: dev-query-filters-ts-3
    Given [common] scenario 'dev-query-filters-ts-3'

    Then [common] I go to '/project/futurama/mode/prod/model/w_m1'

    Then [common] I click field 'modelTreeItemName' with text 'Orders1'
    
    Then [common] I click field 'modelTreeItemName' with text 'City (dimension string)'

    Then [common] I wait "1" seconds
    
    Then [common] I click field 'modelTreeItemName' with text 'Created'
    
    Then [common] I click hidden field 'modelTreeFilter' row '7'

    Then [common] I wait "1" seconds
    
    Then [common] I click field 'fractionTsType' row '0'
    Then [common] I click field 'fractionTsTypeIsBeforeRelative' row '0'
    Then [common] I wait "1" seconds
    Then [common] I enter '5' into 'fractionTsRelativeValue' row '0'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsRelativeUnit' row '0'
    Then [common] I click field 'fractionTsRelativeUnitDays' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsRelativeCompleteOption' row '0'
    Then [common] I click field 'fractionTsRelativeCompleteOptionIncomplete' row '0'    
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds
    
    Then [common] I click field 'fractionTsType' row '1'
    Then [common] I click field 'fractionTsTypeIsBeforeRelative' row '0'
    Then [common] I wait "1" seconds
    Then [common] I enter '5' into 'fractionTsRelativeValue' row '1'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsRelativeUnit' row '1'
    Then [common] I click field 'fractionTsRelativeUnitDays' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsRelativeCompleteOption' row '1'
    Then [common] I click field 'fractionTsRelativeCompleteOptionComplete' row '0'    
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds
    
    Then [common] I click field 'fractionTsType' row '2'
    Then [common] I click field 'fractionTsTypeIsBeforeRelative' row '0'
    Then [common] I wait "1" seconds
    Then [common] I enter '5' into 'fractionTsRelativeValue' row '2'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsRelativeUnit' row '2'
    Then [common] I click field 'fractionTsRelativeUnitDays' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsRelativeCompleteOption' row '2'
    Then [common] I click field 'fractionTsRelativeCompleteOptionIncomplete' row '0'    
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsRelativeWhenOption' row '2'
    Then [common] I click field 'fractionTsRelativeWhenOptionInFuture' row '0'      
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds
    
    Then [common] I click field 'fractionTsType' row '3'
    Then [common] I click field 'fractionTsTypeIsBeforeRelative' row '0'
    Then [common] I wait "1" seconds
    Then [common] I enter '5' into 'fractionTsRelativeValue' row '3'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsRelativeUnit' row '3'
    Then [common] I click field 'fractionTsRelativeUnitDays' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsRelativeCompleteOption' row '3'
    Then [common] I click field 'fractionTsRelativeCompleteOptionComplete' row '0'    
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsRelativeWhenOption' row '3'
    Then [common] I click field 'fractionTsRelativeWhenOptionInFuture' row '0'      
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds
    
    Then [common] I click field 'fractionTsType' row '4'
    Then [common] I click field 'fractionTsTypeIsBeforeRelative' row '0'
    Then [common] I wait "1" seconds
    Then [common] I enter '5' into 'fractionTsRelativeValue' row '4'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsRelativeUnit' row '4'
    Then [common] I click field 'fractionTsRelativeUnitDays' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsRelativeCompleteOption' row '4'
    Then [common] I click field 'fractionTsRelativeCompleteOptionIncomplete' row '0'    
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsRelativeWhenOption' row '4'
    Then [common] I click field 'fractionTsRelativeWhenOptionAgo' row '0'      
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsForOption' row '4'
    Then [common] I click field 'fractionTsForOptionFor' row '0'    
    Then [common] I wait "1" seconds
    Then [common] I enter '2' into 'fractionTsForValue' row '0'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsForUnit' row '0'
    Then [common] I click field 'fractionTsForUnitHours' row '0'    
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds
    
    Then [common] I click field 'fractionTsType' row '5'
    Then [common] I click field 'fractionTsTypeIsBeforeRelative' row '0'
    Then [common] I wait "1" seconds
    Then [common] I enter '5' into 'fractionTsRelativeValue' row '5'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsRelativeUnit' row '5'
    Then [common] I click field 'fractionTsRelativeUnitDays' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsRelativeCompleteOption' row '5'
    Then [common] I click field 'fractionTsRelativeCompleteOptionComplete' row '0'    
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsRelativeWhenOption' row '5'
    Then [common] I click field 'fractionTsRelativeWhenOptionAgo' row '0'      
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsForOption' row '5'
    Then [common] I click field 'fractionTsForOptionFor' row '0'    
    Then [common] I wait "1" seconds
    Then [common] I enter '2' into 'fractionTsForValue' row '1'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsForUnit' row '1'
    Then [common] I click field 'fractionTsForUnitMinutes' row '0'    
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds
    
    Then [common] I click field 'fractionTsType' row '6'
    Then [common] I click field 'fractionTsTypeIsBeforeRelative' row '0'
    Then [common] I wait "1" seconds
    Then [common] I enter '5' into 'fractionTsRelativeValue' row '6'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsRelativeUnit' row '6'
    Then [common] I click field 'fractionTsRelativeUnitDays' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsRelativeCompleteOption' row '6'
    Then [common] I click field 'fractionTsRelativeCompleteOptionIncomplete' row '0'    
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsRelativeWhenOption' row '6'
    Then [common] I click field 'fractionTsRelativeWhenOptionInFuture' row '0'      
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsForOption' row '6'
    Then [common] I click field 'fractionTsForOptionFor' row '0'    
    Then [common] I wait "1" seconds
    Then [common] I enter '2' into 'fractionTsForValue' row '2'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsForUnit' row '2'
    Then [common] I click field 'fractionTsForUnitMinutes' row '0'    
    Then [common] I wait "1" seconds
    Then [common] I click field 'addModelFraction' row '0'
    Then [common] I wait "1" seconds
    
    Then [common] I click field 'fractionTsType' row '7'
    Then [common] I click field 'fractionTsTypeIsBeforeRelative' row '0'
    Then [common] I wait "1" seconds
    Then [common] I enter '5' into 'fractionTsRelativeValue' row '7'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsRelativeUnit' row '7'
    Then [common] I click field 'fractionTsRelativeUnitDays' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsRelativeCompleteOption' row '7'
    Then [common] I click field 'fractionTsRelativeCompleteOptionComplete' row '0'    
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsRelativeWhenOption' row '7'
    Then [common] I click field 'fractionTsRelativeWhenOptionInFuture' row '0'      
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsForOption' row '7'
    Then [common] I click field 'fractionTsForOptionFor' row '0'    
    Then [common] I wait "1" seconds
    Then [common] I enter '2' into 'fractionTsForValue' row '3'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] I wait "1" seconds
    Then [common] I click field 'fractionTsForUnit' row '3'
    Then [common] I click field 'fractionTsForUnitMinutes' row '0'    
    Then [common] I wait "1" seconds
    
    Then [common] Elements 'fractionTsType' length should be '8'    
