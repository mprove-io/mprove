import axios, { type AxiosResponse } from 'axios';
import { ServerError } from '#common/classes/server-error/server-error';
import { ErEnum } from '#common/enums/er.enum';
import { makeId } from '#common/functions/make-id/make-id';
import { unwrapToBackendResponse } from '#common/functions/unwrap-to-backend-response/unwrap-to-backend-response';
import type { ToBackendInputForRoute } from '#common/types/to-backend-input-for-route';
import type { ToBackendOutputForRoute } from '#common/types/to-backend-output-for-route';
import type { ToBackendRoute } from '#common/types/to-backend-route';
import type { ToBackendRequest } from '#common/zod/backend/request/to-backend-request';
import type { ToBackendResponse } from '#common/zod/backend/response/to-backend-response';

export async function mreq<TRoute extends ToBackendRoute>(item: {
  host: string;
  route: TRoute;
  payload: ToBackendInputForRoute<NoInfer<TRoute>>;
  apiKey?: string;
}): Promise<ToBackendOutputForRoute<TRoute>> {
  let { host, route, payload, apiKey } = item;

  let body: ToBackendRequest = {
    traceId: makeId(),
    idempotencyKey: makeId(),
    input: payload
  };

  let url: string = `${host}/${route}`;

  let headers: Record<string, string> = {};

  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  let resp: AxiosResponse<ToBackendResponse<ToBackendOutputForRoute<TRoute>>> =
    await axios.post<ToBackendResponse<ToBackendOutputForRoute<TRoute>>>(
      url,
      body,
      { headers: headers }
    );

  if (resp.data?.result?.type !== 'Success') {
    throw new ServerError({
      message: ErEnum.MCLI_ERROR_RESPONSE_FROM_BACKEND,
      originalError: resp.data?.result?.error
    });
  }

  let output: ToBackendOutputForRoute<TRoute> = unwrapToBackendResponse({
    response: resp.data
  });

  return output;
}
