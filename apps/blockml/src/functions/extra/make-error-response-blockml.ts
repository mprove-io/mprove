import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlockmlEnvEnum } from '#common/enums/env/blockml-env.enum';
import { makeErrorResponse } from '#node-common/functions/make-error-response';
import { BlockmlConfig } from '~blockml/config/blockml-config';

export function makeErrorResponseBlockml(item: {
  body: any;
  e: any;
  path: any;
  method: any;
  duration: number;
  cs: ConfigService<BlockmlConfig>;
  logger: Logger;
}) {
  let { e, body, cs, path, method, duration, logger } = item;

  return makeErrorResponse({
    body: body,
    e: e,
    path: path,
    method: method,
    duration: duration,
    isRemoveErrorData: false,
    logResponseError: cs.get<BlockmlConfig['blockmlLogResponseError']>(
      'blockmlLogResponseError'
    ),
    logIsJson: cs.get<BlockmlConfig['blockmlLogIsJson']>('blockmlLogIsJson'),
    logger: logger,
    useLoggerOnlyForErrorLevel:
      cs.get<BlockmlConfig['blockmlEnv']>('blockmlEnv') !== BlockmlEnvEnum.PROD
  });
}
