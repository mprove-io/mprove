import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '~backend/config/backend-config';
import { BoolEnum } from '~common/enums/bool.enum';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { enumToBoolean } from '~common/functions/enum-to-boolean';
import { MyResponse } from '~common/interfaces/to/my-response';
import { logToConsole } from '~node-common/functions/log-to-console';

export function logResponseBackend(item: {
  response: MyResponse;
  logLevel: LogLevelEnum;
  cs: ConfigService;
  logger: Logger;
}) {
  let { response, logLevel, cs, logger } = item;

  let isLogOk =
    cs.get<BackendConfig['backendLogResponseOk']>('backendLogResponseOk') ===
      BoolEnum.TRUE && response.info.status === ResponseInfoStatusEnum.Ok;

  let isLogError =
    cs.get<BackendConfig['backendLogResponseError']>(
      'backendLogResponseError'
    ) === BoolEnum.TRUE &&
    response.info.status === ResponseInfoStatusEnum.Error;

  if (isLogOk || isLogError) {
    let log = {
      response: Object.assign({}, response, { payload: undefined })
    };
    logToConsole({
      log: log,
      logIsJson: enumToBoolean(
        cs.get<BackendConfig['backendLogIsJson']>('backendLogIsJson')
      ),
      logger: logger,
      logLevel: logLevel
    });
  }
}
