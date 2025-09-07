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
  cs: ConfigService<BlockmlConfig>;
  logger: Logger;
}) {
  let { payload, body, path, method, duration, cs, logger } = item;

  return makeOkResponse({
    body: body,
    payload: payload,
    path: path,
    method: method,
    duration: duration,
    isBackend: false,
    logResponseOk: enumToBoolean(
      cs.get<BlockmlConfig['blockmlLogResponseOk']>('blockmlLogResponseOk')
    ),
    logIsJson: enumToBoolean(
      cs.get<BlockmlConfig['blockmlLogIsJson']>('blockmlLogIsJson')
    ),
    logger: logger
  });
}
