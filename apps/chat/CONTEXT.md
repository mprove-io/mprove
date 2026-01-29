# apps/chat/CONTEXT.md

Session management for OpenCode

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
│   └── process-message/
├── functions/      # helper functions
├── services/       # Business logic services
└── assets/         # Static files for tests
```

## Purpose

Communicates with OpenCode server through sdk

## Communication

- Receives Valkey (Redis) RPC messages from backend

## ESM Configuration

This app uses native ESM with the following configuration:

- **Package type:** `"type": "module"`
- **Path aliases:** `#chat/*`, `#common/*`, `#node-common/*` (via `imports` field)
- **TypeScript:** `"module": "ESNext"`, `"moduleResolution": "Bundler"`
- **SWC:** `"module": { "type": "nodenext" }`, `"target": "es2022"`
- **Tests:** Direct TypeScript execution with AVA + @swc-node/register
