import type { Result } from '@praha/byethrow';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendOutputForRoute } from '#common/types/backend/response/to-backend-output-for-route';
import type { ToBackendResponseForRoute } from '#common/types/backend/response/to-backend-response-for-route';
import type { ApiRequestFailure } from './api-request-failure';

export type ApiRequestResult<TRoute extends ToBackendRoute> = Result.Result<
  ToBackendOutputForRoute<TRoute>,
  ApiRequestFailure<ToBackendResponseForRoute<TRoute>>
>;
