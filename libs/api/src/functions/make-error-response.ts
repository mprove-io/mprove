import { ConfigService } from '@nestjs/config';
import { enums } from '~api/barrels/enums';
import { interfaces } from '~api/barrels/interfaces';
import { logToConsole } from './log-to-console';
import { wrapError } from './wrap-error';

export function makeErrorResponse(item: {
  req: any;
  e: any;
  cs: ConfigService<interfaces.Config>;
}) {
  let { req, e, cs } = item;

  let response: interfaces.MyResponse = {
    info: {
      traceId: req.info?.traceId,
      status: enums.ResponseInfoStatusEnum.Error,
      error: wrapError(e)
    },
    payload: {}
  };

  if (
    cs.get<interfaces.Config['mproveLogOnResponser']>(
      'mproveLogOnResponser'
    ) === enums.BoolEnum.TRUE &&
    cs.get<interfaces.Config['mproveLogResponseError']>(
      'mproveLogResponseError'
    ) === enums.BoolEnum.TRUE
  ) {
    logToConsole(response, cs);
  }

  return response;
}
