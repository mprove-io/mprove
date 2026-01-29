import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { BlockmlEnvEnum } from '#common/enums/env/blockml-env.enum';
import { makeOkResponse } from '#node-common/functions/make-ok-response';

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
    logResponseOk: cs.get<BlockmlConfig['blockmlLogResponseOk']>(
      'blockmlLogResponseOk'
    ),
    logIsJson: cs.get<BlockmlConfig['blockmlLogIsJson']>('blockmlLogIsJson'),
    logger: logger,
    useLoggerOnlyForErrorLevel:
      cs.get<BlockmlConfig['blockmlEnv']>('blockmlEnv') !== BlockmlEnvEnum.PROD
  });
}
