Feature: blockml-prod-check-readme-md-123

  Scenario: blockml-prod-check-readme-md-123
    Given [common] scenario 'blockml-prod-check-readme-md-123'

    Then [common] I go to '/project/futurama/mode/prod/blockml/file/README.md'

    Then [common] Field 'blockmlEditor' row '0' attribute 'innerText' should be text
      """
1
2
# futurama
123
      """    

