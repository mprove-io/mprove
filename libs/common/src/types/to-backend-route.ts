import type { ToBackendRouteRegistry } from '#common/zod/backend/request/to-backend-route-registry';

export type ToBackendRoute = keyof ToBackendRouteRegistry;
