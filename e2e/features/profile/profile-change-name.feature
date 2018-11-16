Feature: profile-change-name

  Scenario: profile-change-name
    Given [common] scenario 'profile-change-name'

    Then [common] I go to '/profile'
    Then [common] I am on page with url '/profile'
    
    Then [common] I enter 'John' into 'profileFirstName' row '0'
    Then [common] I enter 'Smith' into 'profileLastName' row '0'
    Then [common] I click 'profileApplyChangeName'    
    
    Then [common] I wait "1" seconds
    Then [common] I click 'profileTitle'    
    Then [common] Field 'profileFirstName' row '0' attribute 'value' should be 'John'
    Then [common] Field 'profileLastName' row '0' attribute 'value' should be 'Smith'
