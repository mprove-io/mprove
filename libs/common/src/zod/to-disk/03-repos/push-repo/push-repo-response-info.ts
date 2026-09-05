import { z } from 'zod';
import { METHOD_RPC } from '#common/constants/top';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToDiskPushRepoResponseInfo = Extend<
  ResponseInfo,
  {
    path: ToDiskRequestInfoNameEnum.ToDiskPushRepo;
    method: typeof METHOD_RPC;
  }
>;

export let zToDiskPushRepoResponseInfo = zResponseInfo
  .extend({
    path: z.literal(ToDiskRequestInfoNameEnum.ToDiskPushRepo),
    method: z.literal(METHOD_RPC)
  })
  .meta({ id: 'ToDiskPushRepoResponseInfo' });

assertTypesEqual<
  ToDiskPushRepoResponseInfo,
  z.infer<typeof zToDiskPushRepoResponseInfo>
>({ value: true });
