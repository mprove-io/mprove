import { enums } from '~common/barrels/enums';
import { MyResponse } from '~common/interfaces/_index';
import { logToConsole } from './log-to-console';

export function logResponse(item: {
  response: MyResponse;
  logResponseOk: enums.BoolEnum;
  logResponseError: enums.BoolEnum;
  logOnResponser: enums.BoolEnum;
  logIsColor: enums.BoolEnum;
}) {
  let {
    response,
    logResponseOk,
    logResponseError,
    logOnResponser,
    logIsColor
  } = item;

  let isLogOk =
    logResponseOk === enums.BoolEnum.TRUE &&
    response.info.status === enums.ResponseInfoStatusEnum.Ok;

  let isLogError =
    logResponseError === enums.BoolEnum.TRUE &&
    response.info.status === enums.ResponseInfoStatusEnum.Error;

  if (logOnResponser === enums.BoolEnum.TRUE && (isLogOk || isLogError)) {
    let part = Object.assign({}, response, { payload: undefined });
    logToConsole(part, logIsColor);
  }
}
