import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zSessionApi } from '#common/zod/backend/session-api';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendCommitRepoRequestPayload = z
  .object({
    projectId: z.string(),
    branchId: z.string(),
    repoId: z.string(),
    commitMessage: z.string()
  })
  .meta({ id: 'ToBackendCommitRepoRequestPayload' });

export let zToBackendCommitRepoRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendCommitRepo)
  })
  .meta({ id: 'ToBackendCommitRepoRequestInfo' });

export let zToBackendCommitRepoRequest = zToBackendRequest
  .extend({
    info: zToBackendCommitRepoRequestInfo,
    payload: zToBackendCommitRepoRequestPayload
  })
  .meta({ id: 'ToBackendCommitRepoRequest' });

export let zToBackendCommitRepoResponsePayload = z
  .object({
    repo: zRepo,
    session: zSessionApi.nullish()
  })
  .meta({ id: 'ToBackendCommitRepoResponsePayload' });

export let zToBackendCommitRepoResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendCommitRepo}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendCommitRepoResponseInfo' });

export let zToBackendCommitRepoResponse = zMyResponse
  .extend({
    info: zToBackendCommitRepoResponseInfo,
    payload: zToBackendCommitRepoResponsePayload
  })
  .meta({ id: 'ToBackendCommitRepoResponse' });

export type ToBackendCommitRepoRequestPayload = z.infer<
  typeof zToBackendCommitRepoRequestPayload
>;
export type ToBackendCommitRepoRequest = z.infer<
  typeof zToBackendCommitRepoRequest
>;
export type ToBackendCommitRepoResponsePayload = z.infer<
  typeof zToBackendCommitRepoResponsePayload
>;
export type ToBackendCommitRepoResponse = z.infer<
  typeof zToBackendCommitRepoResponse
>;
