import { ErEnum } from '#common/enums/er.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { makeId } from '#common/functions/make-id';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '#common/interfaces/to-backend/to-backend-request';
import { ServerError } from '#common/models/server-error';

let axios = require('axios/dist/node/axios.cjs');

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

  let headers: any = {};

  if (isDefined(loginToken)) {
    headers.Authorization = `Bearer ${loginToken}`;
  }

  // console.log('url');
  // console.log(url);

  let resp = await axios.post(url, body, { headers: headers });
  // let options: OptionsOfTextResponseBody = {
  //   json: body,
  //   headers: headers
  // };
  // let resp = await got.post(url, options).json<T>();

  // console.log('resp');
  // console.log(resp);

  if (resp.data?.info?.status !== ResponseInfoStatusEnum.Ok) {
    // if (resp.info?.status !== ResponseInfoStatusEnum.Ok) {
    throw new ServerError({
      message: ErEnum.MCLI_ERROR_RESPONSE_FROM_BACKEND,
      originalError: resp.data?.info?.error
    });
  }

  return resp.data;
  // return resp;
}
