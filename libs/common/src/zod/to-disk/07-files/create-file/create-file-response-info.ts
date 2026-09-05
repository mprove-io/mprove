import { z } from 'zod';
import { METHOD_RPC } from '#common/constants/top';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToDiskCreateFileResponseInfo = Extend<
  ResponseInfo,
  {
    path: ToDiskRequestInfoNameEnum.ToDiskCreateFile;
    method: typeof METHOD_RPC;
  }
>;

export let zToDiskCreateFileResponseInfo = zResponseInfo
  .extend({
    path: z.literal(ToDiskRequestInfoNameEnum.ToDiskCreateFile),
    method: z.literal(METHOD_RPC)
  })
  .meta({ id: 'ToDiskCreateFileResponseInfo' });

assertTypesEqual<
  ToDiskCreateFileResponseInfo,
  z.infer<typeof zToDiskCreateFileResponseInfo>
>({ value: true });
