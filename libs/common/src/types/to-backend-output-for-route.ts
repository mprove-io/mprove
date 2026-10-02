import type { ToBackendResponseForRoute } from '#common/types/backend/response/to-backend-response-for-route';
import type { ToBackendRoute } from '#common/types/to-backend-route';

export type ToBackendOutputForRoute<TRoute extends ToBackendRoute> = Extract<
  ToBackendResponseForRoute<TRoute>,
  { type: 'Success' }
>['output'];
