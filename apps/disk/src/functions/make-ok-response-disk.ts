import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DiskEnvEnum } from '#common/enums/env/disk-env.enum';
import { DiskConfig } from '#disk/config/disk-config';
import { makeOkResponse } from '#node-common/functions/make-ok-response';

export function makeOkResponseDisk(item: {
  body: any;
  payload: any;
  path: any;
  method: any;
  duration: number;
  cs: ConfigService<DiskConfig>;
  logger: Logger;
}) {
  let { payload, body, path, method, duration, cs, logger } = item;

  return makeOkResponse({
    body: body,
    payload: payload,
    path: path,
    method: method,
    duration: duration,
    logResponseOk: cs.get<DiskConfig['diskLogResponseOk']>('diskLogResponseOk'),
    logIsJson: cs.get<DiskConfig['diskLogIsJson']>('diskLogIsJson'),
    logger: logger,
    useLoggerOnlyForErrorLevel:
      cs.get<DiskConfig['diskEnv']>('diskEnv') !== DiskEnvEnum.PROD
  });
}
