import { z } from 'zod';
import { METHOD_RPC } from '#common/constants/top';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToDiskCloneTestRepoResponseInfo = Extend<
  ResponseInfo,
  {
    path: ToDiskRequestInfoNameEnum.ToDiskCloneTestRepo;
    method: typeof METHOD_RPC;
  }
>;

export let zToDiskCloneTestRepoResponseInfo = zResponseInfo
  .extend({
    path: z.literal(ToDiskRequestInfoNameEnum.ToDiskCloneTestRepo),
    method: z.literal(METHOD_RPC)
  })
  .meta({ id: 'ToDiskCloneTestRepoResponseInfo' });

assertTypesEqual<
  ToDiskCloneTestRepoResponseInfo,
  z.infer<typeof zToDiskCloneTestRepoResponseInfo>
>({ value: true });
