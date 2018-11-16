Feature: team-check-user-fields

  Scenario: team-check-user-fields
    Given [common] scenario 'team-check-user-fields'

    Then [common] I go to '/project/futurama/team'
    Then [common] I am on page with url '/project/futurama/team'

    Then [common] Field 'teamMemberName' row '0' attribute 'innerText' should be 'John Smith'
    Then [common] Field 'teamMemberEmail' row '0' attribute 'innerText' should be 'bhundr@gmail.com'
    Then [common] Field 'teamMemberAlias' row '0' attribute 'innerText' should be 'bhundr'

    Then [common] Flag 'teamMemberIsAdmin' row '0' should be checked
    Then [common] Flag 'teamMemberIsAdmin' row '0' should be disabled
    
    Then [common] Flag 'teamMemberIsEditor' row '0' should be checked
    Then [common] Flag 'teamMemberIsEditor' row '0' should be enabled

    Then [common] Field 'teamMemberStatus' row '0' attribute 'innerText' should be 'active'    
    
    Then [common] Field 'teamMemberDelete' row '0' should be disabled
    
    
