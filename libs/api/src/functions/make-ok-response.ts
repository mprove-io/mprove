import { ConfigService } from '@nestjs/config';
import { enums } from '~api/barrels/enums';
import { interfaces } from '~api/barrels/interfaces';
import { logToConsole } from './log-to-console';

export function makeOkResponse(item: {
  req: interfaces.MyRequest;
  payload: any;
  cs: ConfigService<interfaces.Config>;
}) {
  let { req, payload, cs } = item;

  let response: interfaces.MyResponse = {
    info: {
      traceId: req.info?.traceId,
      status: enums.ResponseInfoStatusEnum.Ok
    },
    payload: payload
  };

  if (
    cs.get<interfaces.Config['mproveLogOnResponser']>(
      'mproveLogOnResponser'
    ) === enums.BoolEnum.TRUE &&
    cs.get<interfaces.Config['mproveLogResponseOk']>('mproveLogResponseOk') ===
      enums.BoolEnum.TRUE
  ) {
    logToConsole(response, cs);
  }

  return response;
}
