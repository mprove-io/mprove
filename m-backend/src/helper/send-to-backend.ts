import { api } from '../barrels/api';
import * as request from 'supertest';

export async function sendToBackend<T>(item: {
  httpServer: any;
  req: any;
  checkIsOk?: boolean;
}) {
  let { httpServer, req, checkIsOk } = item;

  let response = await request(httpServer)
    .post('/' + req.info.name)
    .send(req);

  if (response.status !== 201) {
    throw new api.ServerError({
      message: api.ErEnum.M_BACKEND_ERROR_CODE_FROM_BACKEND,
      originalError: response.text
    });
  }

  if (
    checkIsOk === true &&
    response.body.info.status !== api.ResponseInfoStatusEnum.Ok
  ) {
    throw new api.ServerError({
      message: api.ErEnum.M_BACKEND_ERROR_RESPONSE_FROM_BACKEND,
      originalError: response.body.info.error
    });
  }

  return (response.body as unknown) as T;
}
