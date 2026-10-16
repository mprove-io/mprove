import { Result } from '@praha/byethrow';
import { ServerError } from '#common/classes/server-error/server-error';

import type { ToBackendInputForRoute } from '#common/types/backend/request/to-backend-input-for-route';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendOutputForRoute } from '#common/types/backend/response/to-backend-output-for-route';
import type { ToBackendResponseForRoute } from '#common/types/backend/response/to-backend-response-for-route';
import { mreqResult } from '#mcli/functions/mreq-result/mreq-result';
import type { MreqError } from '#mcli/types/function-errors/mreq-error';

export async function mreq<TRoute extends ToBackendRoute>(item: {
  host: string;
  route: TRoute;
  payload: ToBackendInputForRoute<NoInfer<TRoute>>;
  apiKey?: string;
}): Promise<ToBackendOutputForRoute<TRoute>> {
  let { host, route, payload, apiKey } = item;

  let result: Result.Result<
    ToBackendOutputForRoute<TRoute>,
    MreqError<ToBackendResponseForRoute<TRoute>>
  > = await mreqResult({
    host: host,
    route: route,
    payload: payload,
    apiKey: apiKey
  });

  if (Result.isFailure(result)) {
    throw new ServerError({
      message: result.error.code,
      displayData:
        'displayData' in result.error ? result.error.displayData : undefined,
      originalError: result.error
    });
  }

  let output: ToBackendOutputForRoute<TRoute> = result.value;

  return output;
}
