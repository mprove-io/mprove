import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { common } from '~backend/barrels/common';

export async function sendToBackend<T>(item: {
  httpServer: any;
  req: any;
  checkIsOk?: boolean;
  loginToken?: string;
}) {
  let { httpServer, req, checkIsOk, loginToken } = item;

  let rq = request(httpServer).post('/' + req.info.name);

  if (common.isDefined(loginToken)) {
    rq = rq.auth(loginToken, { type: 'bearer' });
  }

  let response = await rq.send(req);

  if (response.status !== HttpStatus.CREATED) {
    throw new common.ServerError({
      message: common.ErEnum.BACKEND_ERROR_CODE_FROM_BACKEND,
      originalError: response.text
    });
  }

  if (
    checkIsOk === true &&
    response.body.info.status !== common.ResponseInfoStatusEnum.Ok
  ) {
    throw new common.ServerError({
      message: common.ErEnum.BACKEND_ERROR_RESPONSE_FROM_BACKEND,
      originalError: response.body.info.error
    });
  }

  return response.body as unknown as T;
}
