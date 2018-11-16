Feature: team-invite-member

  Scenario: team-invite-member
    Given [common] scenario 'team-invite-member'

    Then [common] I go to '/project/futurama/team'
    Then [common] I am on page with url '/project/futurama/team'

    Then [common] I click 'teamInviteMember'

    Then [common] I enter 'fry@example.com' into 'teamInviteMemberDialogEmail' row '0'
    
    Then [common] I click 'teamInviteMemberDialogInvite'

    Then [common] I wait "1" seconds
    Then [common] I click 'teamTitle' 

    Then [common] Field 'teamMemberName' row '1' attribute 'innerText' should be 'fry LastName'
    Then [common] Field 'teamMemberEmail' row '1' attribute 'innerText' should be 'fry@example.com'
    Then [common] Field 'teamMemberAlias' row '1' attribute 'innerText' should be 'fry'
    
    Then [common] Flag 'teamMemberIsAdmin' row '1' should be unchecked
    Then [common] Flag 'teamMemberIsAdmin' row '1' should be enabled
    
    Then [common] Flag 'teamMemberIsEditor' row '1' should be unchecked
    Then [common] Flag 'teamMemberIsEditor' row '1' should be enabled

    Then [common] Field 'teamMemberStatus' row '1' attribute 'innerText' should be 'pending'    
    
    Then [common] Field 'teamMemberDelete' row '1' should be enabled
    
    
