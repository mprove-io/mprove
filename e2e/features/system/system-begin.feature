Feature: system-begin

  Scenario: system-begin
    Given [common] scenario 'system-begin'    
    Given [system] I check if testing enabled
    Given [system] I clean data
    Given [system] I start testing
