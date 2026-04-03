---
name: mprove-build-store-model
description: Build Mprove Model based on HTTP API (Store) sources
---

# Build Mprove Model based on HTTP API (Store) sources

## Docs

https://docs.mprove.io/docs/ref-model-store

## If user asked to create mprove model (Store) for HTTP API data source

Use get-connections-list tool to understand existing HTTP API (non-SQL) connections added by User.

Check if .store files referencing these connections already exist.

If not exist - create a new .store file per HTTP API connection.

You can search web for docs of requested HTTP API data source.

If user requested HTTP API data sources that is not presend in get-connections-list response - ask user to add connection first. You can guide user based on searched HTTP API docs.

After creation of Store model:

- create mprove report, chart and dashboard
- use run tool to test
- fix errors (if any)
