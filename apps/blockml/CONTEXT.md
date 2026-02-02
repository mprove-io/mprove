# apps/blockml/CONTEXT.md

Malloy/BlockML model compilation service. Receives compilation requests from backend via Valkey (Redis) RPC and returns compiled struct.

## Files Tree

Generated with `./scripts/dev/list-context-files-tree.sh apps/blockml`

```
.turbo/
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

## Scripts

| Script      | Command                                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------ |
| check       | `pnpm typecheck && pnpm lint`                                                                                      |
| typecheck   | `tsc --noEmit`                                                                                                     |
| lint        | `biome lint src`                                                                                                   |
| circular    | `madge --circular .`                                                                                               |
| build       | `swc src -d dist --source-maps && node build.mjs`                                                                  |
| node-serve  | `dotenv -e ../../.env -- node --enable-source-maps dist/main.js`                                                   |
| start       | `dotenv -e ../../.env -- node --import @swc-node/register/esm-register --watch src/main.ts`                        |
| debug       | `dotenv -e ../../.env -- node --import @swc-node/register/esm-register --inspect=0.0.0.0:9231 --watch src/main.ts` |
| test        | `dotenv -e ../../.env -v BLOCKML_LOG_IO=TRUE -v IS_TELEMETRY_ENABLED=FALSE -- ava --concurrency=4`                 |
| clean-node  | `rimraf --glob "node_modules/*" "node_modules/.[!.]*"`                                                             |
| clean-dist  | `rimraf --glob "dist/*" "dist/.[!.]*"`                                                                             |
| clean-turbo | `rimraf --glob ".turbo/*" ".turbo/.[!.]*"`                                                                         |

## Directory Structure

```
src/
├── config/         # App configuration
├── controllers/    # RPC request handlers
│   └── rebuild-struct/  # Model recompilation logic
├── functions/      # Compilation helper functions
├── models/         # Internal models (bm-error.ts)
├── presets/        # Preset configurations
├── services/       # Business logic services
└── assets/         # Static config files
```

## Purpose

Compiles BlockML model definitions (YAML-based) into executable query structures. The compilation pipeline:

1. Receives file tree from backend
2. Parses Malloy/BlockML model definitions
3. Validates model structure
4. Produces compiled struct

## Communication

- Listens for Valkey (Redis) RPC messages from backend
- Returns compiled structures or compilation errors
