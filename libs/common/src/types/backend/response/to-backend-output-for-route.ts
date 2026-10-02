import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendResponseForRoute } from '#common/types/backend/response/to-backend-response-for-route';

export type ToBackendOutputForRoute<TRoute extends ToBackendRoute> = Extract<
  ToBackendResponseForRoute<TRoute>,
  { type: 'Success' }
>['output'];
