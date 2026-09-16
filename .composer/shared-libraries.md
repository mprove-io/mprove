# Shared Libraries

| Library     | Used By           | Purpose                                    |
| ----------- | ----------------- | ------------------------------------------ |
| common      | All apps          | Shared interfaces, types, enums, constants |
| node-common | Backend apps only | Node.js utilities, telemetry, decorators   |

## libs/common

Shared types, interfaces, enums, and constants used by all apps (frontend and
backend).

## libs/node-common

NodeJS-specific utilities shared across services (backend, blockml, disk) and
mcli. Not used by frontend.

**Directory Structure:**

```
src/
├── classes/        # Utility classes (e.g., CycleGraph)
├── decorators/     # NestJS method decorators
├── functions/      # Node.js utility functions
└── functions-result/ # Node.js utilities returning byethrow Result
```
