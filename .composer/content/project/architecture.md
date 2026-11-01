# Architecture

Parts:

| App     | Purpose                                     |
| ------- | ------------------------------------------- |
| backend | Core API, auth, DB, DWH queries             |
| blockml | Malloy and BlockML (YAML) model compilation |
| disk    | File system & git repo management           |
| front   | Web UI                                      |
| mcli    | Command-line interface                      |

Communication:

- frontend to backend - HTTP API
- mcli to backend - HTTP API
- backend to blockml - RPC using Groupmq and Valkey (Redis) pub/sub
- backend to disk - RPC using Groupmq and Valkey (Redis) pub/sub
