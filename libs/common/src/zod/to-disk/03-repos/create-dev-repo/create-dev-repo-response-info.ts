import { z } from 'zod';
import { METHOD_RPC } from '#common/constants/top';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToDiskCreateDevRepoResponseInfo = Extend<
  ResponseInfo,
  {
    path: ToDiskRequestInfoNameEnum.ToDiskCreateDevRepo;
    method: typeof METHOD_RPC;
  }
>;

export let zToDiskCreateDevRepoResponseInfo = zResponseInfo
  .extend({
    path: z.literal(ToDiskRequestInfoNameEnum.ToDiskCreateDevRepo),
    method: z.literal(METHOD_RPC)
  })
  .meta({ id: 'ToDiskCreateDevRepoResponseInfo' });

assertTypesEqual<
  ToDiskCreateDevRepoResponseInfo,
  z.infer<typeof zToDiskCreateDevRepoResponseInfo>
>({ value: true });
