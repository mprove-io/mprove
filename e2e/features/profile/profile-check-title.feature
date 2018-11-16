Feature: profile-check-title

  Scenario: profile-check-title
    Given [common] scenario 'profile-check-title'    

    Then [common] I go to '/profile'
    Then [common] I am on page with url '/profile'

    Then [common] Page title should be 'Profile'