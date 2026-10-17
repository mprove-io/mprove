import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendResponseForRoute } from '#common/types/backend/response/to-backend-response-for-route';
import type { ApiRequestFailure } from './api-request-failure';

export type ApiResponseForRoute<TRoute extends ToBackendRoute> =
  | Extract<ToBackendResponseForRoute<TRoute>, { type: 'Success' }>
  | ApiRequestFailure<ToBackendResponseForRoute<TRoute>>;
