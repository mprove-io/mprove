Feature: profile-change-timezone

  Scenario: profile-change-timezone
    Given [common] scenario 'profile-change-timezone'    
    
    Then [common] I go to '/profile'
    Then [common] I am on page with url '/profile'
    
    Then [common] I click field 'profileTimezone' row '0'

    Then [common] I wait "1" seconds

    Then [common] I click field 'profileTimezoneOption' row '1'

    Then [common] I wait "1" seconds

    Then [common] I click field 'profileApplyChangeTimezone' row '0'
    
    Then [common] I wait "1" seconds

    Then [common] I click 'profileTitle'
    
    Then [common] Field 'profileTimezone' row '0' attribute 'innerText' should be 'UTC'

