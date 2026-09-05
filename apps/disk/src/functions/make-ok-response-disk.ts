import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DiskEnvEnum } from '#common/enums/env/disk-env.enum';
import type { Extend } from '#common/types/extend';
import type { MyResponse } from '#common/zod/to/my-response';
import type { ResponseInfo } from '#common/zod/to/response-info';
import { DiskConfig } from '#disk/config/disk-config';
import { makeOkResponse } from '#node-common/functions/make-ok-response';

export type DiskResponse<
  TPayload,
  TPath extends string,
  TMethod extends string
> = Extend<
  MyResponse,
  {
    info: Extend<
      ResponseInfo,
      {
        path: TPath;
        method: TMethod;
      }
    >;
    payload: TPayload;
  }
>;

export function makeOkResponseDisk<
  TPayload,
  TPath extends string,
  TMethod extends string
>(item: {
  body: unknown;
  payload: TPayload;
  path: TPath;
  method: TMethod;
  duration: number;
  cs: ConfigService<DiskConfig>;
  logger: Logger;
}): DiskResponse<TPayload, TPath, TMethod> {
  let { payload, body, path, method, duration, cs, logger } = item;

  let response: MyResponse = makeOkResponse({
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

  let diskResponse: DiskResponse<TPayload, TPath, TMethod> = {
    info: {
      ...response.info,
      path: path,
      method: method
    },
    payload: payload
  };

  return diskResponse;
}
