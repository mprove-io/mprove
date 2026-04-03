---
name: mprove-editor-query
description: Query chart, dashboard, report or build a new one. Answer question using data.
---

# Query chart, dashboard, report or build a new one. Answer question using data.

Use get-state tool to see if project has valid mprove models.
You can use get-model to see available fields.
You can search files by modelId to understand model source and imported sources.
You can build a new model if current models cannot answer user question.

get-state also provides reports, dashboards and charts.
You can search files by reportId and dashboardId to understand it.
If existing reports and dashboard cannot answer user question - you create a new report or dashboard.

Instead of searching for existing charts by chartId - you can create a new mprove chart file.

If user asks for question that can be answered using metric (time dimension + measure) - provide a report as an answer (existing report or create a new one).

Priority:

- if metric question - use report (multiple or single rows (queries)).
- if need for multiple queries, but not all of them are metric based - use dashboard (multiple tiles (queries)).
- single query, not metric based - use chart.

If you create or modify files - run "mprove sync --env <envId>" to validate and rebuild mprove state.

Then:

- get-state (optional)
- get-query-info (optional)
- run
