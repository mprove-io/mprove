import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { ErEnum } from '~common/enums/er.enum';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { isDefined } from '~common/functions/is-defined';
import { ServerError } from '~common/models/server-error';

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

  if (response.status !== HttpStatus.CREATED) {
    throw new ServerError({
      message: ErEnum.BACKEND_ERROR_CODE_FROM_BACKEND,
      originalError: response.text
    });
  }

  if (
    checkIsOk === true &&
    response.body.info.status !== ResponseInfoStatusEnum.Ok
  ) {
    throw new ServerError({
      message: ErEnum.BACKEND_ERROR_RESPONSE_FROM_BACKEND,
      originalError: response.body.info.error
    });
  }

  return response.body as unknown as T;
}
