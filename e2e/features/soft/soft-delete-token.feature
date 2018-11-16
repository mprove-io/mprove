Feature: soft-delete-token

  Scenario: soft-delete-token
    Given [common] scenario 'soft-delete-token'  

    Then [common] I go to '/soft'
    Then [common] I delete token 

    Then [common] I should see empty token