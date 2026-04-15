import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zStructX } from '#common/zod/backend/struct-x';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendPushRepoRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string()
  })
  .meta({ id: 'ToBackendPushRepoRequestPayload' });

export let zToBackendPushRepoRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendPushRepo)
  })
  .meta({ id: 'ToBackendPushRepoRequestInfo' });

export let zToBackendPushRepoRequest = zToBackendRequest
  .extend({
    info: zToBackendPushRepoRequestInfo,
    payload: zToBackendPushRepoRequestPayload
  })
  .meta({ id: 'ToBackendPushRepoRequest' });

export let zToBackendPushRepoResponsePayload = z
  .object({
    repo: zRepo,
    struct: zStructX,
    needValidate: z.boolean()
  })
  .meta({ id: 'ToBackendPushRepoResponsePayload' });

export let zToBackendPushRepoResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendPushRepo}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendPushRepoResponseInfo' });

export let zToBackendPushRepoResponse = zMyResponse
  .extend({
    info: zToBackendPushRepoResponseInfo,
    payload: zToBackendPushRepoResponsePayload
  })
  .meta({ id: 'ToBackendPushRepoResponse' });

export type ToBackendPushRepoRequestPayload = z.infer<
  typeof zToBackendPushRepoRequestPayload
>;
export type ToBackendPushRepoRequest = z.infer<
  typeof zToBackendPushRepoRequest
>;
export type ToBackendPushRepoResponsePayload = z.infer<
  typeof zToBackendPushRepoResponsePayload
>;
export type ToBackendPushRepoResponse = z.infer<
  typeof zToBackendPushRepoResponse
>;
