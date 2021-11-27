import { ConfigService } from '@nestjs/config';
import { enums } from '~common/barrels/enums';
import { Config, MyResponse } from '~common/interfaces/_index';
import { logToConsole } from './log-to-console';
import { wrapError } from './wrap-error';

export function makeErrorResponse(item: {
  request?: any;
  path?: any;
  method?: any;
  duration?: number;
  body: any;
  e: any;
  cs: ConfigService<Config>;
  skipLog?: boolean;
}) {
  let { body, e, cs, request, path, method, duration, skipLog } = item;

  let response: MyResponse = {
    info: {
      path: request?.url || path,
      method: request?.method || method,
      duration: duration,
      traceId: body.info?.traceId,
      status: enums.ResponseInfoStatusEnum.Error,
      error: wrapError(e)
    },
    payload: {}
  };

  if (
    cs.get<Config['mproveLogOnResponser']>('mproveLogOnResponser') ===
      enums.BoolEnum.TRUE &&
    cs.get<Config['mproveLogResponseError']>('mproveLogResponseError') ===
      enums.BoolEnum.TRUE &&
    skipLog !== true
  ) {
    let part = Object.assign({}, response, { payload: undefined });
    logToConsole(part, cs);
  }

  return response;
}
