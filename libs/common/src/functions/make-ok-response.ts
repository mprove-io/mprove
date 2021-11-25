import { ConfigService } from '@nestjs/config';
import { enums } from '~common/barrels/enums';
import { Config, MyResponse } from '~common/interfaces/_index';
import { logToConsole } from './log-to-console';

export function makeOkResponse(item: {
  request?: any;
  body: any;
  payload: any;
  cs: ConfigService<Config>;
}) {
  let { body, payload, cs, request } = item;

  let response: MyResponse = {
    info: {
      path: request?.url,
      method: request?.method,
      traceId: body.info?.traceId,
      status: enums.ResponseInfoStatusEnum.Ok
    },
    payload: payload
  };

  if (
    cs.get<Config['mproveLogOnResponser']>('mproveLogOnResponser') ===
      enums.BoolEnum.TRUE &&
    cs.get<Config['mproveLogResponseOk']>('mproveLogResponseOk') ===
      enums.BoolEnum.TRUE
  ) {
    logToConsole(response, cs);
  }

  return response;
}
