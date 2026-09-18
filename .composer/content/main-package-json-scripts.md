# Main package json scripts

| Script     | Command                                                                 |
| ---------- | ----------------------------------------------------------------------- |
| check      | `pnpm typecheck && pnpm lint`                                           |
| typecheck  | `pnpm typecheck:turbo && pnpm typecheck:mcli && pnpm typecheck:scripts` |
| lint       | `pnpm lint:turbo && pnpm lint:mcli && pnpm lint:scripts`                |
| circular   | `pnpm circular:turbo && pnpm circular:mcli && pnpm circular:scripts`    |
| build      | `pnpm build:turbo && pnpm build:mcli`                                   |
| node-serve | `turbo run node-serve`                                                  |
| start      | `turbo run start`                                                       |
| debug      | `turbo run debug`                                                       |
| test       | `turbo run test`                                                        |
| e2e        | `pnpm e2e:turbo && pnpm e2e:mcli`                                       |
| inst       | `pnpm catalog-write && pnpm install && pnpm install:mcli`               |

Scripts follow pattern: `pnpm <task>` runs for all packages, `pnpm <task>:<app>`
for specific package.

**Filters:** `backend`, `blockml`, `disk`, `front`, `common`, `node-common`,
`mcli`
