import got, { OptionsOfTextResponseBody } from 'got';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';

export async function mreq<T>(item: {
  pathInfoName: apiToBackend.ToBackendRequestInfoNameEnum;
  payload: any;
  token?: string;
  // showSpinner?: boolean;
}): Promise<T> {
  let { pathInfoName, payload, token } = item;

  let body: apiToBackend.ToBackendRequest = {
    info: {
      traceId: common.makeId(),
      name: pathInfoName,
      idempotencyKey: common.makeId()
    },
    payload: payload
  };

  let host = process.env.MPROVE_CLI_HOST;
  let url = `${host}/${pathInfoName}`;

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
