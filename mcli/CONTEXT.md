# mcli/CONTEXT.md

Command-line interface for Mprove, built with Clipanion.

## Files Tree

Generated with `./scripts/dev/list-context-files-tree.sh mcli`

```
.bun/
dist/
node_modules/
src/
ava.config.js
bunfig.toml
bun.lock
CONTEXT.md
package.json
tsconfig.json
```

## Key Files

- `src/main.ts` — CLI entry point
- `src/config/` — CLI configuration

## Directory Structure

```
src/
├── commands/
│   ├── base/           # Built-in commands
│   │   ├── definitions/  # Command definitions
│   │   ├── help/         # Help command
│   │   ├── unk/          # Unknown command handler
│   │   └── version/      # Version command
│   └── custom/         # Mprove-specific commands
│       ├── commit/       # Commit changes
│       ├── create-branch/
│       ├── delete-branch/
│       ├── get-branches/
│       ├── get-query/    # Get query results
│       ├── get-state/    # Get project state
│       ├── merge/        # Merge branches
│       ├── pull/         # Pull from remote
│       ├── push/         # Push to remote
│       ├── revert/       # Revert changes
│       ├── run/          # Run queries
│       ├── sync/         # Sync project
│       └── validate/     # Validate models
├── functions/          # Helper functions
├── models/             # CLI models
└── assets/             # Static config
```

## Package Management

mcli uses **bun** as package manager (independent from turbo/pnpm workspace).

Dependency versions are centrally managed in `pnpm-workspace.yaml` catalog.
Run `pnpm catalog-write` from project root to sync catalog versions to `package.json`.

## Communication

- Communicates with backend via HTTP API
- Uses same DTOs/interfaces as the frontend
