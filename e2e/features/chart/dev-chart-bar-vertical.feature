Feature: dev-chart-bar-vertical

  Scenario: dev-chart-bar-vertical
    Given [common] scenario 'dev-chart-bar-vertical'

    Then [common] I go to 'project/futurama/mode/dev/model/c_m1'

    Then [common] I click field 'modelTreeItemName' with text 'Name'

    Then [common] I wait "1" seconds
    
    Then [common] I click field 'modelTreeItemName' with text 'Value'

    Then [common] I wait "1" seconds
    
    Then [common] I click field 'queryTabAddChart' row '0'     
    
    Then [common] I wait "1" seconds

    Then [common] I enter 'Bar Vertical' into 'chartTitle' row '1'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] Field 'chartTitle' row '1' attribute 'value' should be 'Bar Vertical'    
    
    Then [common] I wait "1" seconds

    Then [common] I click field 'chartType' row '1'
    Then [common] I click field 'chartTypeBarVertical' row '0'

    Then [common] I wait "1" seconds

    Then [common] I click field 'chartXField' row '1'
    Then [common] I click field 'chartXFieldOption' row '0'

    Then [common] I wait "1" seconds

    Then [common] I click field 'chartYField' row '1'
    Then [common] I click field 'chartYFieldOption' row '1'

    Then [common] I wait "1" seconds

    Then [common] Flag 'chartXAxisToggle' row '1' should be checked
    Then [common] I click field 'chartXAxisToggleInner' row '1'
    Then [common] Flag 'chartXAxisToggle' row '1' should be unchecked
    Then [common] I click field 'chartXAxisToggleInner' row '1'
    Then [common] Flag 'chartXAxisToggle' row '1' should be checked

    Then [common] I wait "1" seconds

    Then [common] Flag 'chartShowXAxisLabelToggle' row '1' should be unchecked
    Then [common] I click field 'chartShowXAxisLabelToggleInner' row '1'
    Then [common] Flag 'chartShowXAxisLabelToggle' row '1' should be checked
    
    Then [common] I wait "1" seconds

    Then [common] I enter 'Country' into 'chartXAxisLabel' row '1'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] Field 'chartXAxisLabel' row '1' attribute 'value' should be 'Country'    
    
    Then [common] I wait "1" seconds

    Then [common] Flag 'chartYAxisToggle' row '1' should be checked
    Then [common] I click field 'chartYAxisToggleInner' row '1'
    Then [common] Flag 'chartYAxisToggle' row '1' should be unchecked
    Then [common] I click field 'chartYAxisToggleInner' row '1'
    Then [common] Flag 'chartYAxisToggle' row '1' should be checked
    
    Then [common] I wait "1" seconds

    Then [common] Flag 'chartShowYAxisLabelToggle' row '1' should be unchecked
    Then [common] I click field 'chartShowYAxisLabelToggleInner' row '1'
    Then [common] Flag 'chartShowYAxisLabelToggle' row '1' should be checked

    Then [common] I wait "1" seconds

    Then [common] I enter 'GDP Per Capita' into 'chartYAxisLabel' row '1'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] Field 'chartYAxisLabel' row '1' attribute 'value' should be 'GDP Per Capita'      
    
    Then [common] I wait "1" seconds

    Then [common] Flag 'chartAnimationsToggle' row '1' should be unchecked
    Then [common] I click field 'chartAnimationsToggleInner' row '1'
    Then [common] Flag 'chartAnimationsToggle' row '1' should be checked
    Then [common] I click field 'chartAnimationsToggleInner' row '1'
    Then [common] Flag 'chartAnimationsToggle' row '1' should be unchecked

    Then [common] I wait "1" seconds    

    Then [common] Flag 'chartGradientToggle' row '1' should be unchecked
    Then [common] I click field 'chartGradientToggleInner' row '1'
    Then [common] Flag 'chartGradientToggle' row '1' should be checked
    Then [common] I click field 'chartGradientToggleInner' row '1'
    Then [common] Flag 'chartGradientToggle' row '1' should be unchecked

    Then [common] I wait "1" seconds    

    Then [common] Flag 'chartLegendToggle' row '1' should be unchecked
    Then [common] I click field 'chartLegendToggleInner' row '1'
    Then [common] Flag 'chartLegendToggle' row '1' should be checked

    Then [common] I wait "1" seconds    

    Then [common] I enter 'abc' into 'chartLegendTitle' row '1'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] Field 'chartLegendTitle' row '1' attribute 'value' should be 'abc'     

    Then [common] I wait "1" seconds    

    Then [common] Flag 'chartTooltipDisabledToggle' row '1' should be checked
    Then [common] I click field 'chartTooltipDisabledToggleInner' row '1'
    Then [common] Flag 'chartTooltipDisabledToggle' row '1' should be unchecked
    Then [common] I click field 'chartTooltipDisabledToggleInner' row '1'
    Then [common] Flag 'chartTooltipDisabledToggle' row '1' should be checked

    Then [common] I wait "1" seconds    

    Then [common] Flag 'chartRoundEdgesToggle' row '1' should be checked
    Then [common] I click field 'chartRoundEdgesToggleInner' row '1'
    Then [common] Flag 'chartRoundEdgesToggle' row '1' should be unchecked
    Then [common] I click field 'chartRoundEdgesToggleInner' row '1'
    Then [common] Flag 'chartRoundEdgesToggle' row '1' should be checked

    Then [common] I wait "1" seconds    

    Then [common] Flag 'chartRoundDomainsToggle' row '1' should be unchecked
    Then [common] I click field 'chartRoundDomainsToggleInner' row '1'
    Then [common] Flag 'chartRoundDomainsToggle' row '1' should be checked
    Then [common] I click field 'chartRoundDomainsToggleInner' row '1'
    Then [common] Flag 'chartRoundDomainsToggle' row '1' should be unchecked

    Then [common] I wait "1" seconds   
    
    Then [common] Flag 'chartShowGridLinesToggle' row '1' should be checked
    Then [common] I click field 'chartShowGridLinesToggleInner' row '1'
    Then [common] Flag 'chartShowGridLinesToggle' row '1' should be unchecked
    Then [common] I click field 'chartShowGridLinesToggleInner' row '1'
    Then [common] Flag 'chartShowGridLinesToggle' row '1' should be checked

    Then [common] I wait "1" seconds     

    Then [common] I click field 'chartColorScheme' row '1'
    Then [common] I click field 'chartColorSchemeCool' row '0'

    Then [common] I wait "1" seconds    

    Then [common] I click field 'chartSchemeType' row '1'
    Then [common] I click field 'chartSchemeTypeOrdinal' row '0'

    Then [common] I wait "1" seconds    

    Then [common] I enter '8' into 'chartBarPadding' row '1'
    Then [common] I click field 'modelTitle' row '0'
    Then [common] Field 'chartBarPadding' row '1' attribute 'value' should be '8'
    