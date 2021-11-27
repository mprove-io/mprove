import { ConfigService } from '@nestjs/config';
import { enums } from '~common/barrels/enums';
import { Config, MyResponse } from '~common/interfaces/_index';
import { logToConsole } from './log-to-console';

export function logResponse(item: {
  response: MyResponse;
  cs: ConfigService<Config>;
}) {
  let { response, cs } = item;

  let isLogOk =
    cs.get<Config['mproveLogResponseOk']>('mproveLogResponseOk') ===
      enums.BoolEnum.TRUE &&
    response.info.status === enums.ResponseInfoStatusEnum.Ok;

  let isLogError =
    cs.get<Config['mproveLogResponseError']>('mproveLogResponseError') ===
      enums.BoolEnum.TRUE &&
    response.info.status === enums.ResponseInfoStatusEnum.Error;

  if (
    cs.get<Config['mproveLogOnResponser']>('mproveLogOnResponser') ===
      enums.BoolEnum.TRUE &&
    (isLogOk || isLogError)
  ) {
    let part = Object.assign({}, response, { payload: undefined });
    logToConsole(part, cs);
  }
}
