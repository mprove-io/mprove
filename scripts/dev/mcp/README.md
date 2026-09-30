# MCP request script

```sh
pnpm mcp <command> [json-arguments]
pnpm mcp --help
```

## Configuration

```sh
export MPROVE_CLI_HOST='http://localhost:3000'
export MPROVE_CLI_API_KEY='PK-your-key'
```

The host defaults to `http://localhost:3000`; requests target `/api/mcp`.
`MPROVE_MCP_TIMEOUT` overrides the default 60-second request timeout. Do not
commit real API keys.

JSON responses are syntax-highlighted when stdout is a terminal: keys are cyan,
strings green, numbers magenta, and booleans yellow. Redirected or piped output
stays plain JSON. Set `NO_COLOR=1` to disable highlighting.

## Protocol requests

```sh
pnpm mcp initialize
pnpm mcp list-tools
```

The Mprove server is stateless: these are independent requests, and tool
commands do not require running `initialize` first.

## Tool requests

Tools with inputs accept one JSON object after the command name (defaults to
`{}`). All fields are sent unchanged; use `pnpm mcp list-tools` to inspect
current input schemas. Replace placeholder IDs below with actual IDs.

```sh
pnpm mcp list-docs
pnpm mcp get-skills
pnpm mcp read-docs '{"pageIds":["page-id"]}'
pnpm mcp search-docs '{"query":"models"}'

pnpm mcp get-connections-list '{"projectId":"project-id","envId":"env-id"}'

pnpm mcp get-state '{"projectId":"project-id","repoId":"repo-id","branchId":"branch-id","envId":"env-id","isFetch":false,"getErrors":true,"getRepo":true,"getRepoNodes":true,"getModels":true,"getDashboards":true,"getCharts":true,"getMetrics":true,"getReports":true}'

pnpm mcp get-model '{"projectId":"project-id","repoId":"repo-id","branchId":"branch-id","envId":"env-id","modelId":"model-id","getMalloy":true}'

pnpm mcp get-query-info '{"projectId":"project-id","repoId":"repo-id","branchId":"branch-id","envId":"env-id","chartId":"chart-id","timezone":"UTC","getMalloy":true,"getSql":true,"getData":true,"isFetch":false}'

pnpm mcp get-sample '{"projectId":"project-id","envId":"env-id","connectionId":"connection-id","schemaName":"public","tableName":"table-name"}'

pnpm mcp get-schemas '{"projectId":"project-id","repoId":"repo-id","branchId":"branch-id","envId":"env-id","isRefreshExistingCache":false}'

pnpm mcp run '{"projectId":"project-id","repoId":"repo-id","branchId":"branch-id","envId":"env-id","chartIds":"chart-id","wait":true,"noDashboards":true,"noCharts":false,"getDashboards":false,"getCharts":true,"noReports":true,"getReports":false}'

pnpm mcp validate '{"projectId":"project-id","repoId":"repo-id","branchId":"branch-id","envId":"env-id"}'
```
