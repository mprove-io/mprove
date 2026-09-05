import { z } from 'zod';
import { METHOD_RPC } from '#common/constants/top';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToDiskCreateProjectResponseInfo = Extend<
  ResponseInfo,
  {
    path: ToDiskRequestInfoNameEnum.ToDiskCreateProject;
    method: typeof METHOD_RPC;
  }
>;

export let zToDiskCreateProjectResponseInfo = zResponseInfo
  .extend({
    path: z.literal(ToDiskRequestInfoNameEnum.ToDiskCreateProject),
    method: z.literal(METHOD_RPC)
  })
  .meta({ id: 'ToDiskCreateProjectResponseInfo' });

assertTypesEqual<
  ToDiskCreateProjectResponseInfo,
  z.infer<typeof zToDiskCreateProjectResponseInfo>
>({ value: true });
