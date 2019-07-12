# Segment

identifies
users

# event folder

events # union of pages and tracks

aliases_mapping
- events
  
events_mapped
- events
- aliases_mapping

# session folder

sessions
- events_mapped
    
event_facts
- events_mapped
- sessions
  
session_event_facts
- sessions
- event_facts

visitor_session_facts
- sessions
- event_facts




