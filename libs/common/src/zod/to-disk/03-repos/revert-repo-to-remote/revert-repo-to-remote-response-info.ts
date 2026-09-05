import { z } from 'zod';
import { METHOD_RPC } from '#common/constants/top';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToDiskRevertRepoToRemoteResponseInfo = Extend<
  ResponseInfo,
  {
    path: ToDiskRequestInfoNameEnum.ToDiskRevertRepoToRemote;
    method: typeof METHOD_RPC;
  }
>;

export let zToDiskRevertRepoToRemoteResponseInfo = zResponseInfo
  .extend({
    path: z.literal(ToDiskRequestInfoNameEnum.ToDiskRevertRepoToRemote),
    method: z.literal(METHOD_RPC)
  })
  .meta({ id: 'ToDiskRevertRepoToRemoteResponseInfo' });

assertTypesEqual<
  ToDiskRevertRepoToRemoteResponseInfo,
  z.infer<typeof zToDiskRevertRepoToRemoteResponseInfo>
>({ value: true });
