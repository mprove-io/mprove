import { z } from 'zod';
import { METHOD_RPC } from '#common/constants/top';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToDiskSyncRepoResponseInfo = Extend<
  ResponseInfo,
  {
    path: ToDiskRequestInfoNameEnum.ToDiskSyncRepo;
    method: typeof METHOD_RPC;
  }
>;

export let zToDiskSyncRepoResponseInfo = zResponseInfo
  .extend({
    path: z.literal(ToDiskRequestInfoNameEnum.ToDiskSyncRepo),
    method: z.literal(METHOD_RPC)
  })
  .meta({ id: 'ToDiskSyncRepoResponseInfo' });

assertTypesEqual<
  ToDiskSyncRepoResponseInfo,
  z.infer<typeof zToDiskSyncRepoResponseInfo>
>({ value: true });
