Feature: team-set-member-is-editor-b2

  Scenario: team-set-member-is-editor-b2
    Given [common] scenario 'team-set-member-is-editor-b2'

    Then [common] I go to '/project/futurama/team'
    Then [common] I am on page with url '/project/futurama/team'

    Then [common] I click flag 'teamMemberIsEditor' row '0'

    Then [common] I wait "1" seconds
    Then [common] I click 'teamTitle' 

    Then [common] Flag 'teamMemberIsEditor' row '0' should be checked
    
    
