import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { enumToBoolean } from '~common/functions/enum-to-boolean';
import { makeOkResponse } from '~node-common/functions/make-ok-response';

export function makeOkResponseBlockml(item: {
  body: any;
  payload: any;
  path: any;
  method: any;
  duration: number;
  skipLog?: boolean;
  cs: ConfigService<BlockmlConfig>;
  logger: Logger;
}) {
  let { payload, body, path, method, duration, skipLog, cs, logger } = item;

  return makeOkResponse({
    body: body,
    payload: payload,
    path: path,
    method: method,
    duration: duration,
    skipLog: skipLog,
    logResponseOk: enumToBoolean(
      cs.get<BlockmlConfig['blockmlLogResponseOk']>('blockmlLogResponseOk')
    ),
    logIsJson: enumToBoolean(
      cs.get<BlockmlConfig['blockmlLogIsJson']>('blockmlLogIsJson')
    ),
    logger: logger
  });
}
