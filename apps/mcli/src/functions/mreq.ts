import got, { OptionsOfTextResponseBody } from 'got';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { interfaces } from '~mcli/barrels/interfaces';

export async function mreq<T extends common.MyResponse>(item: {
  token?: string;
  pathInfoName: apiToBackend.ToBackendRequestInfoNameEnum;
  payload: any;
  config: interfaces.Config;
}): Promise<T> {
  let { pathInfoName, payload, config, token } = item;

  let body: apiToBackend.ToBackendRequest = {
    info: {
      traceId: common.makeId(),
      name: pathInfoName,
      idempotencyKey: common.makeId()
    },
    payload: payload
  };

  let url = `${config.mproveCliHost}/${pathInfoName}`;

  let options: OptionsOfTextResponseBody = {
    json: body,
    headers: {}
  };

  if (common.isDefined(token)) {
    options.headers.authorization = `Bearer ${token}`;
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
