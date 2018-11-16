Feature: login-log-in-with-email-b2

  Scenario: login-log-in-with-email-b2
    Given [common] scenario 'login-log-in-with-email-b2'

    Then [common] I go to '/login'
    Then [common] I wait "3" seconds
    Then [login] I login with Email 'bhundr+2@gmail.com' and Password 'derfvb'

    Then [common] My token ready
    Then [common] I am redirected to page with url '/profile'