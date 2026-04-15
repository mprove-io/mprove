import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zStructX } from '#common/zod/backend/struct-x';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendRevertRepoToLastCommitRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string()
  })
  .meta({ id: 'ToBackendRevertRepoToLastCommitRequestPayload' });

export let zToBackendRevertRepoToLastCommitRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(
      ToBackendRequestInfoNameEnum.ToBackendRevertRepoToLastCommit
    )
  })
  .meta({ id: 'ToBackendRevertRepoToLastCommitRequestInfo' });

export let zToBackendRevertRepoToLastCommitRequest = zToBackendRequest
  .extend({
    info: zToBackendRevertRepoToLastCommitRequestInfo,
    payload: zToBackendRevertRepoToLastCommitRequestPayload
  })
  .meta({ id: 'ToBackendRevertRepoToLastCommitRequest' });

export let zToBackendRevertRepoToLastCommitResponsePayload = z
  .object({
    repo: zRepo,
    struct: zStructX,
    needValidate: z.boolean()
  })
  .meta({ id: 'ToBackendRevertRepoToLastCommitResponsePayload' });

export let zToBackendRevertRepoToLastCommitResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendRevertRepoToLastCommit}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendRevertRepoToLastCommitResponseInfo' });

export let zToBackendRevertRepoToLastCommitResponse = zMyResponse
  .extend({
    info: zToBackendRevertRepoToLastCommitResponseInfo,
    payload: zToBackendRevertRepoToLastCommitResponsePayload
  })
  .meta({ id: 'ToBackendRevertRepoToLastCommitResponse' });

export type ToBackendRevertRepoToLastCommitRequestPayload = z.infer<
  typeof zToBackendRevertRepoToLastCommitRequestPayload
>;
export type ToBackendRevertRepoToLastCommitRequest = z.infer<
  typeof zToBackendRevertRepoToLastCommitRequest
>;
export type ToBackendRevertRepoToLastCommitResponsePayload = z.infer<
  typeof zToBackendRevertRepoToLastCommitResponsePayload
>;
export type ToBackendRevertRepoToLastCommitResponse = z.infer<
  typeof zToBackendRevertRepoToLastCommitResponse
>;
