import type { ToBackendRoute } from '#common/types/to-backend-route';
import type { ToBackendRequestForRoute } from '#common/zod/backend/request/to-backend-request-for-route';

export type ToBackendInputForRoute<TRoute extends ToBackendRoute> =
  ToBackendRequestForRoute<TRoute>['input'];
