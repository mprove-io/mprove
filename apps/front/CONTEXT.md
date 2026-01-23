# apps/front/CONTEXT.md

Angular 21 web application providing the Mprove user interface.

## Key Files

- `src/main.ts` — app bootstrap
- `src/app/app.component.ts` — root component
- `src/app/app-routes.ts` — route definitions
- `src/index.html` — HTML entry point
- `src/styles.scss` — global styles
- `src/init-telemetry.ts` — OpenTelemetry initialization

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
