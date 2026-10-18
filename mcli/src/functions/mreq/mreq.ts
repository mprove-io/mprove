import { Result } from '@praha/byethrow';
import axios, { type AxiosResponse, isAxiosError } from 'axios';
import { makeId } from '#common/functions/make-id/make-id';
import { makeToBackendRequest } from '#common/functions/make-to-backend-request/make-to-backend-request';
import type { ToBackendInputForRoute } from '#common/types/backend/request/to-backend-input-for-route';
import type { ToBackendRequest } from '#common/types/backend/request/to-backend-request';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendOutputForRoute } from '#common/types/backend/response/to-backend-output-for-route';
import type { ToBackendResponseForRoute } from '#common/types/backend/response/to-backend-response-for-route';
import type { MreqError } from '#mcli/types/function-errors/mreq-error';

export async function mreq<TRoute extends ToBackendRoute>(item: {
  host: string;
  route: TRoute;
  payload: ToBackendInputForRoute<NoInfer<TRoute>>;
  apiKey?: string;
}): Result.ResultAsync<
  ToBackendOutputForRoute<TRoute>,
  MreqError<ToBackendResponseForRoute<TRoute>>
> {
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

  let resp: AxiosResponse<
    | Extract<ToBackendResponseForRoute<TRoute>, { type: 'Success' }>
    | Extract<ToBackendResponseForRoute<TRoute>, { type: 'Failure' }>
  >;

  try {
    resp = await axios.post<
      | Extract<ToBackendResponseForRoute<TRoute>, { type: 'Success' }>
      | Extract<ToBackendResponseForRoute<TRoute>, { type: 'Failure' }>
    >(url, body, {
      headers: headers,
      validateStatus: () => true
    });
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      return Result.fail({
        code: 'MCLI_REQUEST_FAILED',
        displayData: {
          status: error.response?.status,
          reason: error.code
        }
      });
    }

    throw error;
  }

  if (resp.data?.type === 'Failure') {
    return await Result.fail<MreqError<ToBackendResponseForRoute<TRoute>>>(
      resp.data.error
    );
  }

  if (resp.status < 200 || resp.status >= 300) {
    return Result.fail({
      code: 'MCLI_REQUEST_FAILED',
      displayData: {
        status: resp.status
      }
    });
  }

  if (resp.data?.type !== 'Success') {
    return Result.fail({ code: 'MCLI_INVALID_BACKEND_RESPONSE' });
  }

  return Result.succeed(resp.data.output);
}
