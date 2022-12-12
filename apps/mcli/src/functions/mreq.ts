import got, { OptionsOfTextResponseBody } from 'got';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';

export async function mreq<T extends common.MyResponse>(item: {
  host: string;
  pathInfoName: apiToBackend.ToBackendRequestInfoNameEnum;
  payload: any;
  loginToken?: string;
}): Promise<T> {
  let { host, pathInfoName, payload, loginToken } = item;

  let body: apiToBackend.ToBackendRequest = {
    info: {
      traceId: common.makeId(),
      name: pathInfoName,
      idempotencyKey: common.makeId()
    },
    payload: payload
  };

  let url = `${host}/${pathInfoName}`;

  let options: OptionsOfTextResponseBody = {
    json: body,
    headers: {}
  };

  if (common.isDefined(loginToken)) {
    options.headers.authorization = `Bearer ${loginToken}`;
  }

  let resp = await got.post(url, options).json<T>();

  if (resp.info?.status !== common.ResponseInfoStatusEnum.Ok) {
    throw new common.ServerError({
      message: common.ErEnum.MCLI_ERROR_RESPONSE_FROM_BACKEND,
      originalError: resp.info?.error
    });
  }

  return resp;
}
