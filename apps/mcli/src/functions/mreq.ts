import got, { OptionsOfTextResponseBody } from 'got';
import { ErEnum } from '~common/enums/er.enum';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import { makeId } from '~common/functions/make-id';
import { ToBackendRequest } from '~common/interfaces/to-backend/to-backend-request';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ServerError } from '~common/models/server-error';

export async function mreq<T extends MyResponse>(item: {
  host: string;
  pathInfoName: ToBackendRequestInfoNameEnum;
  payload: any;
  loginToken?: string;
}): Promise<T> {
  let { host, pathInfoName, payload, loginToken } = item;

  let body: ToBackendRequest = {
    info: {
      traceId: makeId(),
      name: pathInfoName,
      idempotencyKey: makeId()
    },
    payload: payload
  };

  let url = `${host}/${pathInfoName}`;

  let options: OptionsOfTextResponseBody = {
    json: body,
    headers: {}
  };

  if (isDefined(loginToken)) {
    options.headers.authorization = `Bearer ${loginToken}`;
  }

  let resp = await got.post(url, options).json<T>();

  if (resp.info?.status !== ResponseInfoStatusEnum.Ok) {
    throw new ServerError({
      message: ErEnum.MCLI_ERROR_RESPONSE_FROM_BACKEND,
      originalError: resp.info?.error
    });
  }

  return resp;
}
