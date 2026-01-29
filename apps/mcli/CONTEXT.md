# apps/mcli/CONTEXT.md

Command-line interface for Mprove, built with Clipanion.

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

## ESM Configuration

This app uses native ESM with the following configuration:

- **Package type:** `"type": "module"`
- **Path aliases:** `#mcli/*`, `#common/*`, `#node-common/*` (via `imports` field)
- **TypeScript:** `"module": "ESNext"`, `"moduleResolution": "Bundler"`
- **SWC:** `"module": { "type": "nodenext" }`, `"target": "es2022"`
- **Tests:** Direct TypeScript execution with AVA + @swc-node/register
