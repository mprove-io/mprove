import { z } from 'zod';
import { METHOD_RPC } from '#common/constants/top';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToDiskCreateOrgResponseInfo = Extend<
  ResponseInfo,
  {
    path: ToDiskRequestInfoNameEnum.ToDiskCreateOrg;
    method: typeof METHOD_RPC;
  }
>;

export let zToDiskCreateOrgResponseInfo = zResponseInfo
  .extend({
    path: z.literal(ToDiskRequestInfoNameEnum.ToDiskCreateOrg),
    method: z.literal(METHOD_RPC)
  })
  .meta({ id: 'ToDiskCreateOrgResponseInfo' });

assertTypesEqual<
  ToDiskCreateOrgResponseInfo,
  z.infer<typeof zToDiskCreateOrgResponseInfo>
>({ value: true });
