import { z } from 'zod';
import { METHOD_RPC } from '#common/constants/top';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToDiskGetFileResponseInfo = Extend<
  ResponseInfo,
  {
    path: ToDiskRequestInfoNameEnum.ToDiskGetFile;
    method: typeof METHOD_RPC;
  }
>;

export let zToDiskGetFileResponseInfo = zResponseInfo
  .extend({
    path: z.literal(ToDiskRequestInfoNameEnum.ToDiskGetFile),
    method: z.literal(METHOD_RPC)
  })
  .meta({ id: 'ToDiskGetFileResponseInfo' });

assertTypesEqual<
  ToDiskGetFileResponseInfo,
  z.infer<typeof zToDiskGetFileResponseInfo>
>({ value: true });
