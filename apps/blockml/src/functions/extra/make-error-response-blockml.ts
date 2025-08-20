import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { enumToBoolean } from '~common/functions/enum-to-boolean';
import { makeErrorResponse } from '~node-common/functions/make-error-response';

export function makeErrorResponseBlockml(item: {
  body: any;
  e: any;
  path: any;
  method: any;
  duration: number;
  skipLog?: boolean;
  cs: ConfigService<BlockmlConfig>;
  logger: Logger;
}) {
  let { e, body, cs, path, method, duration, skipLog, logger } = item;

  return makeErrorResponse({
    body: body,
    e: e,
    path: path,
    method: method,
    duration: duration,
    skipLog: skipLog,
    logResponseError: enumToBoolean(
      cs.get<BlockmlConfig['blockmlLogResponseError']>(
        'blockmlLogResponseError'
      )
    ),
    logIsJson: enumToBoolean(
      cs.get<BlockmlConfig['blockmlLogIsJson']>('blockmlLogIsJson')
    ),
    logger: logger
  });
}
