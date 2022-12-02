import got, { OptionsOfTextResponseBody } from 'got';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { interfaces } from '~mcli/barrels/interfaces';

export async function mreq<T>(item: {
  pathInfoName: apiToBackend.ToBackendRequestInfoNameEnum;
  payload: any;
  config: interfaces.Config;
  token?: string;
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

  return resp;
}
