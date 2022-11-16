import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { interfaces } from '~backend/barrels/interfaces';
import { nodeCommon } from '~backend/barrels/node-common';
import { enums } from '~common/barrels/enums';
import { MyResponse } from '~common/interfaces/_index';
import { common } from '~node-common/barrels/common';

export function logResponseBackend(item: {
  response: MyResponse;
  logLevel: enums.LogLevelEnum;
  cs: ConfigService;
  logger: Logger;
}) {
  let { response, logLevel, cs, logger } = item;

  let isLogOk =
    cs.get<interfaces.Config['backendLogResponseOk']>(
      'backendLogResponseOk'
    ) === common.BoolEnum.TRUE &&
    response.info.status === enums.ResponseInfoStatusEnum.Ok;

  let isLogError =
    cs.get<interfaces.Config['backendLogResponseError']>(
      'backendLogResponseError'
    ) === common.BoolEnum.TRUE &&
    response.info.status === enums.ResponseInfoStatusEnum.Error;

  if (isLogOk || isLogError) {
    let log = {
      response: Object.assign({}, response, { payload: undefined })
    };
    nodeCommon.logToConsole({
      log: log,
      logIsJson: common.enumToBoolean(
        cs.get<interfaces.Config['backendLogIsJson']>('backendLogIsJson')
      ),
      logger: logger,
      logLevel: logLevel
    });
  }
}
