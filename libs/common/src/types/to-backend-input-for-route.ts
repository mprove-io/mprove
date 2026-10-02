import type { ToBackendRequestForRoute } from '#common/types/backend/request/to-backend-request-for-route';
import type { ToBackendRoute } from '#common/types/to-backend-route';

export type ToBackendInputForRoute<TRoute extends ToBackendRoute> =
  ToBackendRequestForRoute<TRoute>['input'];
