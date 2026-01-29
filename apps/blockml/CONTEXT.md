# apps/blockml/CONTEXT.md

Malloy/BlockML model compilation service. Receives compilation requests from backend via Valkey (Redis) RPC and returns compiled struct.

## Key Files

- `src/main.ts` — app bootstrap
- `src/app.module.ts` — root NestJS module
- `src/app-controllers.ts` — controller registration
- `src/app-services.ts` — service registration

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

## ESM Configuration

This app uses native ESM with the following configuration:

- **Package type:** `"type": "module"`
- **Path aliases:** `#blockml/*`, `#common/*`, `#node-common/*` (via `imports` field in package.json)
- **TypeScript:** `"module": "ESNext"`, `"moduleResolution": "Bundler"`
- **SWC:** `"module": { "type": "nodenext" }`, `"target": "es2022"`
- **Tests:** Direct TypeScript execution with AVA + @swc-node/register/esm-register
- **Scripts:** Uses `node --import @swc-node/register/esm-register` for dev and debug
