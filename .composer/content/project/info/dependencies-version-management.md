# Dependencies Version Management

All dependency versions are centrally defined in `pnpm-workspace.yaml` catalog.

| Package Type          | Version Syntax | How it works                         |
| --------------------- | -------------- | ------------------------------------ |
| Turbo apps (`apps/*`) | `catalog:`     | pnpm resolves versions automatically |
| Turbo libs (`libs/*`) | explicit       | synced via `pnpm catalog-write`      |
| mcli (bun)            | explicit       | synced via `pnpm catalog-write`      |

Run `pnpm catalog-write` to sync catalog versions to `libs/common`,
`libs/node-common`, and `mcli` package.json files.
