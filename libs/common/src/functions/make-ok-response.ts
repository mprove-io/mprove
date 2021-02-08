import { ConfigService } from '@nestjs/config';
import { enums } from '~common/barrels/enums';
import { Config, MyResponse } from '~common/interfaces/_index';
import { logToConsole } from './log-to-console';

export function makeOkResponse(item: {
  req: any;
  payload: any;
  cs: ConfigService<Config>;
}) {
  let { req, payload, cs } = item;

  let response: MyResponse = {
    info: {
      traceId: req.info?.traceId,
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
