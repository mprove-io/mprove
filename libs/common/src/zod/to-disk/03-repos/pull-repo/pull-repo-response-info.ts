import { z } from 'zod';
import { METHOD_RPC } from '#common/constants/top';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToDiskPullRepoResponseInfo = Extend<
  ResponseInfo,
  {
    path: ToDiskRequestInfoNameEnum.ToDiskPullRepo;
    method: typeof METHOD_RPC;
  }
>;

export let zToDiskPullRepoResponseInfo = zResponseInfo
  .extend({
    path: z.literal(ToDiskRequestInfoNameEnum.ToDiskPullRepo),
    method: z.literal(METHOD_RPC)
  })
  .meta({ id: 'ToDiskPullRepoResponseInfo' });

assertTypesEqual<
  ToDiskPullRepoResponseInfo,
  z.infer<typeof zToDiskPullRepoResponseInfo>
>({ value: true });
