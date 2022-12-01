import got from 'got';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';

export async function mreq<T>(item: {
  pathInfoName: apiToBackend.ToBackendRequestInfoNameEnum;
  payload: any;
  // showSpinner?: boolean;
}): Promise<T> {
  let { pathInfoName, payload } = item;

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

  let token = process.env.MPROVE_CLI_API_KEY;

  let resp = await got
    .post(url, {
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        authorization: `Bearer ${token}`
      },
      json: body
    })
    .json<T>();

  return resp;
}
