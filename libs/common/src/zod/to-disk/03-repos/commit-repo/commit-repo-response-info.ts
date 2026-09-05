import { z } from 'zod';
import { METHOD_RPC } from '#common/constants/top';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToDiskCommitRepoResponseInfo = Extend<
  ResponseInfo,
  {
    path: ToDiskRequestInfoNameEnum.ToDiskCommitRepo;
    method: typeof METHOD_RPC;
  }
>;

export let zToDiskCommitRepoResponseInfo = zResponseInfo
  .extend({
    path: z.literal(ToDiskRequestInfoNameEnum.ToDiskCommitRepo),
    method: z.literal(METHOD_RPC)
  })
  .meta({ id: 'ToDiskCommitRepoResponseInfo' });

assertTypesEqual<
  ToDiskCommitRepoResponseInfo,
  z.infer<typeof zToDiskCommitRepoResponseInfo>
>({ value: true });
