Feature: login-log-in-with-email

  Scenario: login-log-in-with-email
    Given [common] scenario 'login-log-in-with-email'

    Then [common] I go to '/login'
    Then [common] I wait "3" seconds
    Then [login] I login with Email 'bhundr@gmail.com' and Password 'derfvb77'

    Then [common] My token ready
    Then [common] I am redirected to page with url '/profile'