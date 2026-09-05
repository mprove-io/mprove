import { z } from 'zod';
import { METHOD_RPC } from '#common/constants/top';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToDiskIsProjectExistResponseInfo = Extend<
  ResponseInfo,
  {
    path: ToDiskRequestInfoNameEnum.ToDiskIsProjectExist;
    method: typeof METHOD_RPC;
  }
>;

export let zToDiskIsProjectExistResponseInfo = zResponseInfo
  .extend({
    path: z.literal(ToDiskRequestInfoNameEnum.ToDiskIsProjectExist),
    method: z.literal(METHOD_RPC)
  })
  .meta({ id: 'ToDiskIsProjectExistResponseInfo' });

assertTypesEqual<
  ToDiskIsProjectExistResponseInfo,
  z.infer<typeof zToDiskIsProjectExistResponseInfo>
>({ value: true });
