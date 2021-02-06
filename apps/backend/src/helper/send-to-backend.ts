import * as request from 'supertest';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { isDefined } from './is-defined';

export async function sendToBackend<T>(item: {
  httpServer: any;
  req: any;
  checkIsOk?: boolean;
  loginToken?: string;
}) {
  let { httpServer, req, checkIsOk, loginToken } = item;

  let rq = request(httpServer).post('/' + req.info.name);

  if (isDefined(loginToken)) {
    rq = rq.auth(loginToken, { type: 'bearer' });
  }

  let response = await rq.send(req);

  if (response.status !== 201) {
    throw new common.ServerError({
      message: apiToBackend.ErEnum.BACKEND_ERROR_CODE_FROM_BACKEND,
      originalError: response.text
    });
  }

  if (
    checkIsOk === true &&
    response.body.info.status !== common.ResponseInfoStatusEnum.Ok
  ) {
    throw new common.ServerError({
      message: apiToBackend.ErEnum.BACKEND_ERROR_RESPONSE_FROM_BACKEND,
      originalError: response.body.info.error
    });
  }

  return (response.body as unknown) as T;
}
