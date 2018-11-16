Feature: login-check-title

  Scenario: login-check-title
    Given [common] scenario 'login-check-title'

    Then [common] I go to '/login'
    Then [common] Page title should be 'Login | Mprove'