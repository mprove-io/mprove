Feature: profile-check-fields

  Scenario: profile-check-fields
    Given [common] scenario 'profile-check-fields'

    Then [common] I go to '/profile'
    Then [common] I am on page with url '/profile'

    Then [common] Field 'profileEmail' row '0' attribute 'innerText' should be 'bhundr@gmail.com'
    Then [common] Field 'profileFirstName' row '0' attribute 'value' should be 'bhundr'
    Then [common] Field 'profileLastName' row '0' attribute 'value' should be 'LastName'    
    Then [common] Field 'profileTimezone' row '0' attribute 'innerText' should be 'Use Project Default'