# ESM Migration Plan for Remaining Apps

This document outlines the steps to migrate the remaining apps to ESM, following the pattern established by `chat` and `disk`.

## Apps to Migrate

| App     | Priority | Complexity                          | Status      |
| ------- | -------- | ----------------------------------- | ----------- |
| blockml | 1        | Medium - similar to disk            | ✅ Complete |
| backend | 2        | High - largest app                  | Pending     |
| mcli    | 3        | Medium - CLI tool                   | Pending     |
| front   | 4        | Low - Angular handles its own build | Pending     |

## Migration Pattern (Per App)

### 1. Configuration Files

#### package.json

Add/modify:

```json
{
  "type": "module",
  "imports": {
    "#APP/*": "./src/*",
    "#common/*": "@mprove/common/*",
    "#node-common/*": "@mprove/node-common/*"
  },
  "scripts": {
    "start": "dotenv -e ../../.env -- node --import @swc-node/register/esm-register --watch src/main.ts",
    "debug": "dotenv -e ../../.env -- node --import @swc-node/register/esm-register --inspect=0.0.0.0:PORT --watch src/main.ts",
    "test": "dotenv -e ../../.env -v IS_TELEMETRY_ENABLED=FALSE -- ava"
  }
}
```

Remove:

- `_moduleAliases` section
- `build-tests` script (if exists)
- `tsconfig-paths` from devDependencies

Add devDependencies:

- `@swc-node/register`
- `@swc/core`
- `@swc/helpers`

#### tsconfig.json (create new)

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "types": ["node"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "baseUrl": ".",
    "outDir": "./dist",
    "paths": {
      "#APP/*": ["./src/*"],
      "#common/*": ["../../libs/common/src/*"],
      "#node-common/*": ["../../libs/node-common/src/*"]
    }
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

#### .swcrc

Change:

```json
{
  "jsc": {
    "target": "es2022"
  },
  "module": {
    "type": "nodenext"
  }
}
```

#### ava.config.js

```javascript
export default {
  files: ['src/**/*.spec.ts'],
  extensions: {
    ts: 'module'
  },
  verbose: true,
  timeout: '1m',
  nodeArguments: ['--import=@swc-node/register/esm-register']
};
```

#### build.mjs

Update aliases from `~APP` to `#APP`:

```javascript
const aliases = {
  '#APP': resolve(__dirname, 'dist/src'),
  '#common': resolve(__dirname, 'dist/libs/common/src'),
  '#node-common': resolve(__dirname, 'dist/libs/node-common/src')
};
```

#### Delete

- `tsconfig.test.json` (no longer needed)

### 2. Source File Import Updates

Replace all internal app imports:

```bash
find apps/APP/src -name "*.ts" -exec sed -i 's/~APP\//#APP\//g' {} +
```

### 3. ESM Compatibility Fixes for CommonJS Packages

These packages require import style changes:

#### fs-extra

```typescript
// Before
import * as fse from 'fs-extra';

// After
import fse from 'fs-extra';
```

#### nodegit

```typescript
// Before
import * as nodegit from 'nodegit';

// After
import nodegit from 'nodegit';
```

#### p-iteration

```typescript
// Before
import { forEachSeries } from 'p-iteration';

// After
import pIteration from 'p-iteration';
const { forEachSeries } = pIteration;
```

#### js-yaml (if used)

```typescript
// Before
import * as yaml from 'js-yaml';

// After
import yaml from 'js-yaml';
```

### 4. Update CONTEXT.md

Add ESM Configuration section:

```markdown
## ESM Configuration

This app uses native ESM with the following configuration:

- **Package type:** `"type": "module"`
- **Path aliases:** `#APP/*`, `#common/*`, `#node-common/*` (via `imports` field)
- **TypeScript:** `"module": "ESNext"`, `"moduleResolution": "Bundler"`
- **SWC:** `"module": { "type": "nodenext" }`, `"target": "es2022"`
- **Tests:** Direct TypeScript execution with AVA + @swc-node/register
```

### 5. Update Root CONTEXT.md

Update the path aliases section to mark the app as migrated.

## Verification Steps

For each app:

1. `pnpm install` - ensure dependencies are resolved
2. `pnpm start:APP` - dev server starts without errors
3. `pnpm build:APP:prod` - production build succeeds
4. `pnpm --filter @mprove/APP test` - all tests pass

## App-Specific Notes

### blockml ✅ COMPLETE

- Fixed `fs-extra`, `walk`, `path`, `p-iteration` imports
- Uses `js-yaml` with named imports (already ESM compatible)
- Required `import type` fixes in libs/common for @malloydata/malloy-filter types
- Required date-fns upgrade (2.30.0 → 4.1.0) for ESM compatibility

### backend

- Largest app with most dependencies
- May have additional CommonJS packages to fix
- Check for dynamic imports that may need adjustment

### mcli

- CLI tool using Clipanion
- May have different entry point pattern
- Check Clipanion ESM compatibility

### front

- Angular app with its own build system
- May only need path alias updates
- Angular CLI handles ESM internally

## Commands Reference

```bash
# Replace imports for an app
find apps/APP/src -name "*.ts" -exec sed -i 's/~APP\//#APP\//g' {} +

# Fix fs-extra imports
find apps/APP/src -name "*.ts" -exec sed -i "s/import \* as fse from 'fs-extra'/import fse from 'fs-extra'/g" {} +

# Fix nodegit imports
find apps/APP/src -name "*.ts" -exec sed -i "s/import \* as nodegit from 'nodegit'/import nodegit from 'nodegit'/g" {} +

# Fix js-yaml imports
find apps/APP/src -name "*.ts" -exec sed -i "s/import \* as yaml from 'js-yaml'/import yaml from 'js-yaml'/g" {} +

# Count remaining tilde imports
grep -r "~APP/" apps/APP/src | wc -l
```

## Already Migrated

- `chat` - complete
- `disk` - complete
- `blockml` - complete

## libs/common Fixes Applied

The following ESM compatibility fixes were applied to `libs/common`:

- `interfaces/blockml/fraction.ts` - Changed `import { Moment }` to `import type { Moment }` for type-only imports
- `functions/get-fraction-ts-mix-unit.ts` - Changed to `import type` for `TemporalUnit`, `WeekdayMoment`
- `functions/get-fraction-ts-units.ts` - Changed to `import type` for `TemporalUnit`
- `functions/parse-ts-literal.ts` - Changed to `import type` for `TemporalUnit`

**Important:** When importing TypeScript types from CJS packages in ESM mode, use `import type` to prevent Node.js from trying to import non-existent runtime exports.

## Dependency Upgrades

The following dependencies were upgraded for ESM compatibility:

- `date-fns`: 2.30.0 → 4.1.0
- `date-fns-tz`: 3.1.3 → 3.2.0

**Note:** date-fns-tz 3.x requires date-fns 3.x+ for proper ESM exports.

## libs/node-common Fixes Applied

The following ESM compatibility fixes were already applied to `libs/node-common`:

- `get-sync-files.ts` - fs-extra, nodegit, p-iteration imports
- `get-changes-to-commit.ts` - nodegit, p-iteration imports
- Other files may need fs-extra import fixes

Check with:

```bash
grep -r "import \* as" libs/node-common/src
```
