Feature: profile-logout

  Scenario: profile-logout
    Given [common] scenario 'profile-logout'    
    
    Then [common] I go to '/profile'
    Then [common] I am on page with url '/profile'
    Then [common] I click 'userMenu'
    Then [common] I click 'logoutButton'

    Then [common] I am redirected to page with url '/logout'
    Then [common] I should see empty token
