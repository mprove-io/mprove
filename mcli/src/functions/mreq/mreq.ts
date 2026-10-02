import axios, { type AxiosResponse } from 'axios';
import { ServerError } from '#common/classes/server-error/server-error';
import { ErEnum } from '#common/enums/er.enum';
import { makeId } from '#common/functions/make-id/make-id';
import { makeToBackendRequest } from '#common/functions/make-to-backend-request/make-to-backend-request';
import type { ToBackendInputForRoute } from '#common/types/backend/request/to-backend-input-for-route';
import type { ToBackendRequest } from '#common/types/backend/request/to-backend-request';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendOutputForRoute } from '#common/types/backend/response/to-backend-output-for-route';
import type { ToBackendResponseForRoute } from '#common/types/backend/response/to-backend-response-for-route';

export async function mreq<TRoute extends ToBackendRoute>(item: {
  host: string;
  route: TRoute;
  payload: ToBackendInputForRoute<NoInfer<TRoute>>;
  apiKey?: string;
}): Promise<ToBackendOutputForRoute<TRoute>> {
  let { host, route, payload, apiKey } = item;

  let body: ToBackendRequest = makeToBackendRequest({
    route: route,
    traceId: makeId(),
    idempotencyKey: makeId(),
    input: payload
  });

  let url: string = `${host}/${route}`;

  let headers: Record<string, string> = {};

  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  let resp: AxiosResponse<ToBackendResponseForRoute<TRoute>> = await axios.post<
    ToBackendResponseForRoute<TRoute>
  >(url, body, { headers: headers });

  if (resp.data?.type !== 'Success') {
    throw new ServerError({
      message: ErEnum.MCLI_ERROR_RESPONSE_FROM_BACKEND,
      originalError: resp.data?.error
    });
  }

  let output: ToBackendOutputForRoute<TRoute> = resp.data.output;

  return output;
}
