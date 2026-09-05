import { z } from 'zod';
import { METHOD_RPC } from '#common/constants/top';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToDiskDeleteBranchResponseInfo = Extend<
  ResponseInfo,
  {
    path: ToDiskRequestInfoNameEnum.ToDiskDeleteBranch;
    method: typeof METHOD_RPC;
  }
>;

export let zToDiskDeleteBranchResponseInfo = zResponseInfo
  .extend({
    path: z.literal(ToDiskRequestInfoNameEnum.ToDiskDeleteBranch),
    method: z.literal(METHOD_RPC)
  })
  .meta({ id: 'ToDiskDeleteBranchResponseInfo' });

assertTypesEqual<
  ToDiskDeleteBranchResponseInfo,
  z.infer<typeof zToDiskDeleteBranchResponseInfo>
>({ value: true });
