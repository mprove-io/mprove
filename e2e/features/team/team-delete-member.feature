Feature: team-delete-member

  Scenario: team-delete-member
    Given [common] scenario 'team-delete-member'

    Then [common] I go to '/project/futurama/team'
    Then [common] I am on page with url '/project/futurama/team'

    Then [common] I click 'teamTitle'

    Then [common] I click field 'teamMemberDelete' row '1'

    Then [common] I wait "1" seconds
    Then [common] I click 'teamTitle' 

    Then [common] Elements 'teamMemberName' length should be '1'
    
    
