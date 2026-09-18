# Architecture

Apps communicate:

- frontend to backend - HTTP API
- mcli to backend - HTTP API
- backend to blockml - RPC using Groupmq and Valkey (Redis) pub/sub
- backend to disk - RPC using Groupmq and Valkey (Redis) pub/sub
