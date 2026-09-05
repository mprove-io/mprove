import { z } from 'zod';
import { METHOD_RPC } from '#common/constants/top';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToDiskDeleteDevRepoResponseInfo = Extend<
  ResponseInfo,
  {
    path: ToDiskRequestInfoNameEnum.ToDiskDeleteDevRepo;
    method: typeof METHOD_RPC;
  }
>;

export let zToDiskDeleteDevRepoResponseInfo = zResponseInfo
  .extend({
    path: z.literal(ToDiskRequestInfoNameEnum.ToDiskDeleteDevRepo),
    method: z.literal(METHOD_RPC)
  })
  .meta({ id: 'ToDiskDeleteDevRepoResponseInfo' });

assertTypesEqual<
  ToDiskDeleteDevRepoResponseInfo,
  z.infer<typeof zToDiskDeleteDevRepoResponseInfo>
>({ value: true });
