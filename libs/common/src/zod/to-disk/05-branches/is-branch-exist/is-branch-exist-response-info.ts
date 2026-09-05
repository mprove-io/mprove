import { z } from 'zod';
import { METHOD_RPC } from '#common/constants/top';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToDiskIsBranchExistResponseInfo = Extend<
  ResponseInfo,
  {
    path: ToDiskRequestInfoNameEnum.ToDiskIsBranchExist;
    method: typeof METHOD_RPC;
  }
>;

export let zToDiskIsBranchExistResponseInfo = zResponseInfo
  .extend({
    path: z.literal(ToDiskRequestInfoNameEnum.ToDiskIsBranchExist),
    method: z.literal(METHOD_RPC)
  })
  .meta({ id: 'ToDiskIsBranchExistResponseInfo' });

assertTypesEqual<
  ToDiskIsBranchExistResponseInfo,
  z.infer<typeof zToDiskIsBranchExistResponseInfo>
>({ value: true });
