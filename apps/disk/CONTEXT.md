# apps/disk/CONTEXT.md

File system and git repository management service. Manages project file storage and git operations.

## Files Tree

Generated with `./scripts/dev/list-context-files-tree.sh apps/disk`

```
.turbo/
dist/
node_modules/
src/
.DS_Store
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
| check       | `pnpm typecheck && pnpm lint && pnpm circular`                                                                     |
| typecheck   | `tsc --noEmit`                                                                                                     |
| lint        | `biome lint src`                                                                                                   |
| circular    | `madge --circular .`                                                                                               |
| build       | `swc src -d dist --source-maps && node build.mjs`                                                                  |
| serve       | `dotenv -e ../../.env -- node --enable-source-maps dist/main.js`                                                   |
| start       | `dotenv -e ../../.env -- node --import @swc-node/register/esm-register --watch src/main.ts`                        |
| debug       | `dotenv -e ../../.env -- node --import @swc-node/register/esm-register --inspect=0.0.0.0:9230 --watch src/main.ts` |
| test        | `dotenv -e ../../.env -v IS_TELEMETRY_ENABLED=FALSE -- ava`                                                        |
| clean-node  | `rimraf --glob "node_modules/*" "node_modules/.[!.]*"`                                                             |
| clean-dist  | `rimraf --glob "dist/*" "dist/.[!.]*"`                                                                             |
| clean-turbo | `rimraf --glob ".turbo/*" ".turbo/.[!.]*"`                                                                         |

## Directory Structure

```
src/
├── config/         # App configuration
├── controllers/    # RPC request handlers (ordered by domain)
│   ├── 01-orgs/
│   ├── 02-projects/
│   ├── 03-repos/
│   ├── 04-catalogs/
│   ├── 05-branches/
│   ├── 06-folders/
│   ├── 07-files/
│   └── 08-seed/
├── functions/      # File system & git helper functions
├── services/       # Business logic services
└── assets/         # Static files for tests
```

## Purpose

Manages the file system layer for Mprove projects:

- Git repository operations (clone, pull, push, commit, branch, merge)
- File operations within repositories
- Folder management
- Organization/project/git-repo files tree structure
- Seed data initialization

## Communication

- Receives Valkey (Redis) RPC messages from backend
- Operates on local filesystem (`mprove_data/` directory)
- Uses SimpleGit for git operations

## Patterns

- Each controller group handles a specific domain entity
