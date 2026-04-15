import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zStructX } from '#common/zod/backend/struct-x';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendPullRepoRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string()
  })
  .meta({ id: 'ToBackendPullRepoRequestPayload' });

export let zToBackendPullRepoRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendPullRepo)
  })
  .meta({ id: 'ToBackendPullRepoRequestInfo' });

export let zToBackendPullRepoRequest = zToBackendRequest
  .extend({
    info: zToBackendPullRepoRequestInfo,
    payload: zToBackendPullRepoRequestPayload
  })
  .meta({ id: 'ToBackendPullRepoRequest' });

export let zToBackendPullRepoResponsePayload = z
  .object({
    repo: zRepo,
    struct: zStructX,
    needValidate: z.boolean()
  })
  .meta({ id: 'ToBackendPullRepoResponsePayload' });

export let zToBackendPullRepoResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendPullRepo}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendPullRepoResponseInfo' });

export let zToBackendPullRepoResponse = zMyResponse
  .extend({
    info: zToBackendPullRepoResponseInfo,
    payload: zToBackendPullRepoResponsePayload
  })
  .meta({ id: 'ToBackendPullRepoResponse' });

export type ToBackendPullRepoRequestPayload = z.infer<
  typeof zToBackendPullRepoRequestPayload
>;
export type ToBackendPullRepoRequest = z.infer<
  typeof zToBackendPullRepoRequest
>;
export type ToBackendPullRepoResponsePayload = z.infer<
  typeof zToBackendPullRepoResponsePayload
>;
export type ToBackendPullRepoResponse = z.infer<
  typeof zToBackendPullRepoResponse
>;
