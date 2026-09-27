import type { ToBackendRouteRegistry } from '#common/zod/backend/request/to-backend-route-registry';

export type ToBackendResponseForRoute<
  TRoute extends keyof ToBackendRouteRegistry
> = ToBackendRouteRegistry[TRoute]['response'];
