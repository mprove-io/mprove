# Architecture

Monorepo managed with **Turborepo** and **pnpm**.

Apps communicate:

- frontend to backend - using HTTP API
- mcli to backend - using HTTP API
- backend to blockml - using RPC using Groupmq and Valkey (Redis) pub/sub
- backend to disk - using RPC using Groupmq and Valkey (Redis) pub/sub
