import { z } from 'zod';
import { METHOD_RPC } from '#common/constants/top';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToDiskRevertRepoToLastCommitResponseInfo = Extend<
  ResponseInfo,
  {
    path: ToDiskRequestInfoNameEnum.ToDiskRevertRepoToLastCommit;
    method: typeof METHOD_RPC;
  }
>;

export let zToDiskRevertRepoToLastCommitResponseInfo = zResponseInfo
  .extend({
    path: z.literal(ToDiskRequestInfoNameEnum.ToDiskRevertRepoToLastCommit),
    method: z.literal(METHOD_RPC)
  })
  .meta({ id: 'ToDiskRevertRepoToLastCommitResponseInfo' });

assertTypesEqual<
  ToDiskRevertRepoToLastCommitResponseInfo,
  z.infer<typeof zToDiskRevertRepoToLastCommitResponseInfo>
>({ value: true });
