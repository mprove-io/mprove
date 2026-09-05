import { z } from 'zod';
import { METHOD_RPC } from '#common/constants/top';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToDiskDeleteProjectResponseInfo = Extend<
  ResponseInfo,
  {
    path: ToDiskRequestInfoNameEnum.ToDiskDeleteProject;
    method: typeof METHOD_RPC;
  }
>;

export let zToDiskDeleteProjectResponseInfo = zResponseInfo
  .extend({
    path: z.literal(ToDiskRequestInfoNameEnum.ToDiskDeleteProject),
    method: z.literal(METHOD_RPC)
  })
  .meta({ id: 'ToDiskDeleteProjectResponseInfo' });

assertTypesEqual<
  ToDiskDeleteProjectResponseInfo,
  z.infer<typeof zToDiskDeleteProjectResponseInfo>
>({ value: true });
