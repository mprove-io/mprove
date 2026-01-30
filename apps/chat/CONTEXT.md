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
