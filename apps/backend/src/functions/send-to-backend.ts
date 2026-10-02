import { HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { ServerError } from '#common/classes/server-error/server-error';
import { ErEnum } from '#common/enums/er.enum';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ToBackendRequestForRoute } from '#common/types/backend/request/to-backend-request-for-route';
import type { ToBackendResponseForRoute } from '#common/types/backend/response/to-backend-response-for-route';
import type { ToBackendRoute } from '#common/types/to-backend-route';

export async function sendToBackend<TRoute extends ToBackendRoute>(item: {
  httpServer: any;
  route: TRoute;
  req: ToBackendRequestForRoute<NoInfer<TRoute>>;
  checkIsOk?: boolean;
  loginToken?: string;
  apiKey?: string;
}): Promise<ToBackendResponseForRoute<TRoute>> {
  let { httpServer, route, req, checkIsOk, loginToken, apiKey } = item;

  let rq: request.Test = request(httpServer).post('/' + route);

  if (isDefined(apiKey)) {
    rq = rq.auth(apiKey, { type: 'bearer' });
  } else if (isDefined(loginToken)) {
    rq = rq.auth(loginToken, { type: 'bearer' });
  }

  let response: request.Response = await rq.send(req);

  if (response.status !== HttpStatus.CREATED) {
    throw new ServerError({
      message: ErEnum.BACKEND_ERROR_CODE_FROM_BACKEND,
      originalError: response.text
    });
  }

  if (checkIsOk === true && response.body.type !== 'Success') {
    throw new ServerError({
      message: ErEnum.BACKEND_ERROR_RESPONSE_FROM_BACKEND,
      originalError: response.body.error
    });
  }

  let result: ToBackendResponseForRoute<TRoute> = response.body;

  return result;
}
