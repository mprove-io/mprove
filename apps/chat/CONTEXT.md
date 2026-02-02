# apps/chat/CONTEXT.md

Session management for OpenCode

## Files Tree

Generated with `./scripts/dev/list-context-files-tree.sh apps/chat`

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
| debug       | `dotenv -e ../../.env -- node --import @swc-node/register/esm-register --inspect=0.0.0.0:9233 --watch src/main.ts` |
| e2e         | `dotenv -e ../../.env -v IS_TELEMETRY_ENABLED=FALSE -- ava --concurrency=4`                                        |
| clean-node  | `rimraf --glob "node_modules/*" "node_modules/.[!.]*"`                                                             |
| clean-dist  | `rimraf --glob "dist/*" "dist/.[!.]*"`                                                                             |
| clean-turbo | `rimraf --glob ".turbo/*" ".turbo/.[!.]*"`                                                                         |

## Directory Structure

```
src/
├── config/         # App configuration
├── controllers/    # RPC request handlers
│   └── process-message/
├── functions/      # helper functions
├── services/       # Business logic services
└── assets/         # Static files for tests
```

## Purpose

Communicates with OpenCode server through sdk

## Communication

- Receives Valkey (Redis) RPC messages from backend
