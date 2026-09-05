import { z } from 'zod';
import { METHOD_RPC } from '#common/constants/top';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToDiskSaveFileResponseInfo = Extend<
  ResponseInfo,
  {
    path: ToDiskRequestInfoNameEnum.ToDiskSaveFile;
    method: typeof METHOD_RPC;
  }
>;

export let zToDiskSaveFileResponseInfo = zResponseInfo
  .extend({
    path: z.literal(ToDiskRequestInfoNameEnum.ToDiskSaveFile),
    method: z.literal(METHOD_RPC)
  })
  .meta({ id: 'ToDiskSaveFileResponseInfo' });

assertTypesEqual<
  ToDiskSaveFileResponseInfo,
  z.infer<typeof zToDiskSaveFileResponseInfo>
>({ value: true });
