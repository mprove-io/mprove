Feature: team-check-title

  Scenario: team-check-title
    Given [common] scenario 'team-check-title'

    Then [common] I go to '/project/futurama/team'
    Then [common] I am on page with url '/project/futurama/team'

    Then [common] Page title should be 'futurama | Team'