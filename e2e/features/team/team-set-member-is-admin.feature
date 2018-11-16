Feature: team-set-member-is-admin

  Scenario: team-set-member-is-admin
    Given [common] scenario 'team-set-member-is-admin'

    Then [common] I go to '/project/futurama/team'
    Then [common] I am on page with url '/project/futurama/team'

    Then [common] I click flag 'teamMemberIsAdmin' row '1'

    Then [common] I wait "1" seconds
    Then [common] I click 'teamTitle' 

    Then [common] Flag 'teamMemberIsAdmin' row '1' should be checked
    
    
