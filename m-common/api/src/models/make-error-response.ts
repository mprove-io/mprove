import { ConfigService } from '@nestjs/config';
import * as apiEnums from '../enums/_index';
import * as apiObjects from '../objects/_index';
import { logToConsole } from './log-to-console';
import { wrapError } from './wrap-error';

export function makeErrorResponse(item: {
  req: any;
  e: any;
  cs: ConfigService<apiObjects.Config>;
}) {
  let { req, e, cs } = item;

  let response: apiObjects.Response = {
    info: {
      traceId: req.info?.traceId,
      status: apiEnums.ResponseInfoStatusEnum.Error,
      error: wrapError(e)
    },
    payload: {}
  };

  if (
    cs.get<apiObjects.Config['mproveLogOnResponser']>(
      'mproveLogOnResponser'
    ) === apiEnums.BoolEnum.TRUE &&
    cs.get<apiObjects.Config['mproveLogResponseError']>(
      'mproveLogResponseError'
    ) === apiEnums.BoolEnum.TRUE
  ) {
    logToConsole(response, cs);
  }

  return response;
}
