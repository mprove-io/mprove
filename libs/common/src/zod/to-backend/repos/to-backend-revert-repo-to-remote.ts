import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zStructX } from '#common/zod/backend/struct-x';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendRevertRepoToRemoteRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string()
  })
  .meta({ id: 'ToBackendRevertRepoToRemoteRequestPayload' });

export let zToBackendRevertRepoToRemoteRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendRevertRepoToRemote)
  })
  .meta({ id: 'ToBackendRevertRepoToRemoteRequestInfo' });

export let zToBackendRevertRepoToRemoteRequest = zToBackendRequest
  .extend({
    info: zToBackendRevertRepoToRemoteRequestInfo,
    payload: zToBackendRevertRepoToRemoteRequestPayload
  })
  .meta({ id: 'ToBackendRevertRepoToRemoteRequest' });

export let zToBackendRevertRepoToRemoteResponsePayload = z
  .object({
    repo: zRepo,
    struct: zStructX,
    needValidate: z.boolean()
  })
  .meta({ id: 'ToBackendRevertRepoToRemoteResponsePayload' });

export let zToBackendRevertRepoToRemoteResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendRevertRepoToRemote}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendRevertRepoToRemoteResponseInfo' });

export let zToBackendRevertRepoToRemoteResponse = zMyResponse
  .extend({
    info: zToBackendRevertRepoToRemoteResponseInfo,
    payload: zToBackendRevertRepoToRemoteResponsePayload
  })
  .meta({ id: 'ToBackendRevertRepoToRemoteResponse' });

export type ToBackendRevertRepoToRemoteRequestPayload = z.infer<
  typeof zToBackendRevertRepoToRemoteRequestPayload
>;
export type ToBackendRevertRepoToRemoteRequest = z.infer<
  typeof zToBackendRevertRepoToRemoteRequest
>;
export type ToBackendRevertRepoToRemoteResponsePayload = z.infer<
  typeof zToBackendRevertRepoToRemoteResponsePayload
>;
export type ToBackendRevertRepoToRemoteResponse = z.infer<
  typeof zToBackendRevertRepoToRemoteResponse
>;
