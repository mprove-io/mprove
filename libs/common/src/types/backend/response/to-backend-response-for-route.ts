import type { ToBackendRouteRegistry } from '#common/types/backend/request/to-backend-route-registry';

export type ToBackendResponseForRoute<
  TRoute extends keyof ToBackendRouteRegistry
> = ToBackendRouteRegistry[TRoute]['response'];
