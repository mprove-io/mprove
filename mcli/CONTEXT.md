# apps/mcli/CONTEXT.md

Command-line interface for Mprove, built with Clipanion.

## Files Tree

Generated with `./scripts/list-context-files-tree.sh apps/mcli`

```
.turbo/
bin/
dist/
node_modules/
src/
.swcrc
ava.config.js
build.mjs
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

## Communication

- Communicates with backend via HTTP API
- Uses same DTOs/interfaces as the frontend
