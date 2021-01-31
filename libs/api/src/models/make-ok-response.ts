import { ConfigService } from '@nestjs/config';
import * as apiEnums from '~/enums/_index';
import * as apiObjects from '~/objects/_index';
import { logToConsole } from './log-to-console';

export function makeOkResponse(item: {
  req: apiObjects.Request;
  payload: any;
  cs: ConfigService<apiObjects.Config>;
}) {
  let { req, payload, cs } = item;

  let response: apiObjects.Response = {
    info: {
      traceId: req.info?.traceId,
      status: apiEnums.ResponseInfoStatusEnum.Ok
    },
    payload: payload
  };

  if (
    cs.get<apiObjects.Config['mproveLogOnResponser']>(
      'mproveLogOnResponser'
    ) === apiEnums.BoolEnum.TRUE &&
    cs.get<apiObjects.Config['mproveLogResponseOk']>('mproveLogResponseOk') ===
      apiEnums.BoolEnum.TRUE
  ) {
    logToConsole(response, cs);
  }

  return response;
}
