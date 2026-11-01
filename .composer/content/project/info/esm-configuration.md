# ESM Configuration

All apps use native ESM with the following configuration:

**Node.js built-ins:** Use `node:` prefix (e.g.,
`import { createRequire } from 'node:module'`).

| File            | Key Settings                                                                 |
| --------------- | ---------------------------------------------------------------------------- |
| `package.json`  | `"type": "module"`, `imports` field with `#app/*` aliases                    |
| `tsconfig.json` | `"module": "ESNext"`, `"moduleResolution": "Bundler"`, paths with `#` prefix |
| `.swcrc`        | `"target": "es2022"`, `"module": { "type": "nodenext" }`                     |
| `ava.config.js` | Direct TS execution with `@swc-node/register/esm-register`                   |
