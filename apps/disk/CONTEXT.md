# apps/disk/CONTEXT.md

File system and git repository management service. Manages project file storage and git operations.

## Key Files

- `src/main.ts` — app bootstrap
- `src/app.module.ts` — root NestJS module
- `src/app-controllers.ts` — controller registration
- `src/app-services.ts` — service registration

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
- File CRUD within repositories
- Folder management
- Catalog/project structure
- Seed data initialization

## Communication

- Receives Valkey (Redis) RPC messages from backend
- Operates on local filesystem (`mprove_data/` directory)
- Uses NodeGit for git operations

## Patterns

- Each controller group handles a specific domain entity
