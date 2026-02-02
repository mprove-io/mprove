# apps/front/CONTEXT.md

Angular 21 web application providing the Mprove user interface.

## Files Tree

Generated with `./scripts/dev/list-context-files-tree.sh apps/front`

```
.angular/
.turbo/
dist/
nginx-configs/
node_modules/
src/
.browserslistrc
.DS_Store
angular.json
CONTEXT.md
package.json
tailwind.config.js
tsconfig.json
```

## Scripts

| Script        | Command                                                          |
| ------------- | ---------------------------------------------------------------- |
| check         | `pnpm typecheck && pnpm lint && pnpm circular`                   |
| typecheck     | `tsc --noEmit`                                                   |
| lint          | `biome lint src`                                                 |
| circular      | `madge --circular .`                                             |
| build         | `ng build --configuration production`                            |
| start         | `ng serve --configuration development`                           |
| clean-node    | `rimraf --glob "node_modules/*" "node_modules/.[!.]*"`           |
| clean-dist    | `rimraf --glob "dist/*" "dist/.[!.]*"`                           |
| clean-turbo   | `rimraf --glob ".turbo/*" ".turbo/.[!.]*" && pnpm clean-angular` |
| clean-angular | `rimraf --glob ".angular/*" ".angular/.[!.]*"`                   |

## Directory Structure

```
src/app/
├── functions/      # Utility functions
├── guards/         # Route guards
├── modules/        # Feature modules
│   ├── auth/       # Login, signup, password reset
│   ├── dashboards/ # Dashboard views
│   ├── files/      # File editor
│   ├── models/     # Model explorer
│   ├── nav/        # Navigation
│   ├── navbar/     # Top navbar
│   ├── org/        # Organization management
│   ├── profile/    # User profile
│   ├── project/    # Project settings
│   ├── reports/    # Report views
│   ├── shared/     # Shared components
│   └── special/    # Error pages, landing
├── queries/        # API query functions
├── resolvers/      # Route resolvers
└── services/       # App-wide services
```

## Patterns

- Standalone components and NgModules
- Feature modules organized by domain
- HTTP communication with backend via JWT-authenticated calls
- Route guards for auth protection
- Route resolvers for data pre-fetching
