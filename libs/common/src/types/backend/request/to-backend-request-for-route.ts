import type { ToBackendRouteRegistry } from '#common/types/backend/request/to-backend-route-registry';

export type ToBackendRequestForRoute<
  TRoute extends keyof ToBackendRouteRegistry
> = ToBackendRouteRegistry[TRoute]['request'];
