import { z } from 'zod';
import { METHOD_RPC } from '#common/constants/top';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToDiskDeleteOrgResponseInfo = Extend<
  ResponseInfo,
  {
    path: ToDiskRequestInfoNameEnum.ToDiskDeleteOrg;
    method: typeof METHOD_RPC;
  }
>;

export let zToDiskDeleteOrgResponseInfo = zResponseInfo
  .extend({
    path: z.literal(ToDiskRequestInfoNameEnum.ToDiskDeleteOrg),
    method: z.literal(METHOD_RPC)
  })
  .meta({ id: 'ToDiskDeleteOrgResponseInfo' });

assertTypesEqual<
  ToDiskDeleteOrgResponseInfo,
  z.infer<typeof zToDiskDeleteOrgResponseInfo>
>({ value: true });
