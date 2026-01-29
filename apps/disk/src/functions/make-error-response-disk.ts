import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DiskEnvEnum } from '#common/enums/env/disk-env.enum';
import { DiskConfig } from '#disk/config/disk-config';
import { makeErrorResponse } from '#node-common/functions/make-error-response';

export function makeErrorResponseDisk(item: {
  body: any;
  e: any;
  path: any;
  method: any;
  duration: number;
  cs: ConfigService<DiskConfig>;
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
    logResponseError: cs.get<DiskConfig['diskLogResponseError']>(
      'diskLogResponseError'
    ),
    logIsJson: cs.get<DiskConfig['diskLogIsJson']>('diskLogIsJson'),
    logger: logger,
    useLoggerOnlyForErrorLevel:
      cs.get<DiskConfig['diskEnv']>('diskEnv') !== DiskEnvEnum.PROD
  });
}
