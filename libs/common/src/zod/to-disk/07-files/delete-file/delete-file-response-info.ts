import { z } from 'zod';
import { METHOD_RPC } from '#common/constants/top';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToDiskDeleteFileResponseInfo = Extend<
  ResponseInfo,
  {
    path: ToDiskRequestInfoNameEnum.ToDiskDeleteFile;
    method: typeof METHOD_RPC;
  }
>;

export let zToDiskDeleteFileResponseInfo = zResponseInfo
  .extend({
    path: z.literal(ToDiskRequestInfoNameEnum.ToDiskDeleteFile),
    method: z.literal(METHOD_RPC)
  })
  .meta({ id: 'ToDiskDeleteFileResponseInfo' });

assertTypesEqual<
  ToDiskDeleteFileResponseInfo,
  z.infer<typeof zToDiskDeleteFileResponseInfo>
>({ value: true });
