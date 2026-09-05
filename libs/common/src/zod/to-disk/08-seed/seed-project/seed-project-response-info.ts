import { z } from 'zod';
import { METHOD_RPC } from '#common/constants/top';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToDiskSeedProjectResponseInfo = Extend<
  ResponseInfo,
  {
    path: ToDiskRequestInfoNameEnum.ToDiskSeedProject;
    method: typeof METHOD_RPC;
  }
>;

export let zToDiskSeedProjectResponseInfo = zResponseInfo
  .extend({
    path: z.literal(ToDiskRequestInfoNameEnum.ToDiskSeedProject),
    method: z.literal(METHOD_RPC)
  })
  .meta({ id: 'ToDiskSeedProjectResponseInfo' });

assertTypesEqual<
  ToDiskSeedProjectResponseInfo,
  z.infer<typeof zToDiskSeedProjectResponseInfo>
>({ value: true });
