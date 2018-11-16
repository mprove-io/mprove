Feature: blockml-conflicts

  Scenario: blockml-conflicts
    Given [common] scenario 'blockml-conflicts'

    Then [common] I go to '/project/futurama/mode/dev/blockml'

    Then [common] Field 'blockmlConflicts' row '0' should be enabled
    Then [common] Field 'blockmlCommit' row '0' should be disabled
    Then [common] Field 'blockmlPushToProduction' row '0' should be disabled
    Then [common] Field 'blockmlOptions' row '0' should be enabled

    Then [common] I click field 'blockmlConflicts' row '0'
    Then [common] I click field 'blockmlConflictLine' row '0'

    Then [common] I am redirected to page with url '/project/futurama/mode/dev/blockml/file/README.md?line=2'

