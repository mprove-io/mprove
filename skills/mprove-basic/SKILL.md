---
name: mprove-basic
description: Basic mprove skill
---

# Mprove Basic

Use mprove cli for sync only. Use mprove mcp tools for other mprove tasks.

Run "mprove sync --env <env-id>" before calling mprove mcp tools if you changed or created files to:

- sync local repo and mprove backend repo state
- validate (rebuild) malloy and mprove files

If user asks data question, and there is no mprove.yml - you should setup mprove project first.

## Mprove project setup

The flow for setup a new Mprove project:

- create .gitignore if not exist (or add missing parts from .gitignore example)
- load more skills
- get-schemas (if there are no connections - ask user to create a db connection before continue to next step)
- create mprove.yml (if no existing mprove config)
- get-state
- create .schema for metadata and relationships (use get-schemas and get-sample to understand relationships)
- create mprove model(s) based on malloy sources
- create mprove report, dashboard, chart
- run report, dashboard, chart
- provide report, dashboard, chart links to user

## Load more skills if needed

- mprove-project-structure (Files and folders structure patterns)
- mprove-connection-schemas (Get, create or update .schema metadata files for mprove project connections)
- mprove-build-malloy-model (Build Mprove Model based on Malloy sources)
- mprove-build-store-model (Build Mprove Model based on HTTP API (Store) sources)
- mprove-build-chart (Build Mprove Chart)
- mprove-build-report (Build Mprove Report)
- mprove-build-dashboard (Build Mprove Dashboard)
- mprove-query-data (Query chart, dashboard, report or build a new one. Answer question using data.)

## Rules

If yaml property has an array type - use an empty array [] instead of undefined or null value.

Mprove Reports are much more useful for Metrics (measures + time based dimension) than Mprove Charts or Dashboards.

## Docs

When you need to look up Mprove documentation, check `https://docs.mprove.io/docs/reference/model-malloy` and/or other pages based on task.

When you need to look up Malloy documentation, check `https://docs.malloydata.dev/documentation/user_guides/quickstart_modeling` and/or other pages based on task.

## .gitignore Example

```
*.env
.envrc

.DS_Store
Thumbs.db

.mprove/
```
