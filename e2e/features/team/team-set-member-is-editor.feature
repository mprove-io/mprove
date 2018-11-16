Feature: team-set-member-is-editor

  Scenario: team-set-member-is-editor
    Given [common] scenario 'team-set-member-is-editor'

    Then [common] I go to '/project/futurama/team'
    Then [common] I am on page with url '/project/futurama/team'

    Then [common] I click flag 'teamMemberIsEditor' row '1'

    Then [common] I wait "1" seconds
    Then [common] I click 'teamTitle' 

    Then [common] Flag 'teamMemberIsEditor' row '1' should be checked
    
    
