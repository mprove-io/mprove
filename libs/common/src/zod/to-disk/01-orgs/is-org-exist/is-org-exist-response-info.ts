import { z } from 'zod';
import { METHOD_RPC } from '#common/constants/top';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToDiskIsOrgExistResponseInfo = Extend<
  ResponseInfo,
  {
    path: ToDiskRequestInfoNameEnum.ToDiskIsOrgExist;
    method: typeof METHOD_RPC;
  }
>;

export let zToDiskIsOrgExistResponseInfo = zResponseInfo
  .extend({
    path: z.literal(ToDiskRequestInfoNameEnum.ToDiskIsOrgExist),
    method: z.literal(METHOD_RPC)
  })
  .meta({ id: 'ToDiskIsOrgExistResponseInfo' });

assertTypesEqual<
  ToDiskIsOrgExistResponseInfo,
  z.infer<typeof zToDiskIsOrgExistResponseInfo>
>({ value: true });
