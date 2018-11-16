Feature: team-invite-member-b2

  Scenario: team-invite-member-b2
    Given [common] scenario 'team-invite-member-b2'

    Then [common] I go to '/project/futurama/team'
    Then [common] I am on page with url '/project/futurama/team'

    Then [common] I click 'teamInviteMember'

    Then [common] I enter 'bhundr+2@gmail.com' into 'teamInviteMemberDialogEmail' row '0'
    
    Then [common] I click 'teamInviteMemberDialogInvite'

    Then [common] I wait "1" seconds
    Then [common] I click 'teamTitle' 

    Then [common] Field 'teamMemberName' row '0' attribute 'innerText' should be 'bhundr+2 LastName'
    Then [common] Field 'teamMemberEmail' row '0' attribute 'innerText' should be 'bhundr+2@gmail.com'
    Then [common] Field 'teamMemberAlias' row '0' attribute 'innerText' should be 'bhundr-2'
    
    Then [common] Flag 'teamMemberIsAdmin' row '0' should be unchecked
    Then [common] Flag 'teamMemberIsAdmin' row '0' should be enabled
    
    Then [common] Flag 'teamMemberIsEditor' row '0' should be unchecked
    Then [common] Flag 'teamMemberIsEditor' row '0' should be enabled

    Then [common] Field 'teamMemberStatus' row '0' attribute 'innerText' should be 'pending'    
    
    Then [common] Field 'teamMemberDelete' row '0' should be enabled
    
    
