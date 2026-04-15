import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMember } from '#common/zod/backend/member';
import { zStructX } from '#common/zod/backend/struct-x';
import { zUser } from '#common/zod/backend/user';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGetRepoRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    isFetch: z.boolean()
  })
  .meta({ id: 'ToBackendGetRepoRequestPayload' });

export let zToBackendGetRepoRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetRepo)
  })
  .meta({ id: 'ToBackendGetRepoRequestInfo' });

export let zToBackendGetRepoRequest = zToBackendRequest
  .extend({
    info: zToBackendGetRepoRequestInfo,
    payload: zToBackendGetRepoRequestPayload
  })
  .meta({ id: 'ToBackendGetRepoRequest' });

export let zToBackendGetRepoResponsePayload = z
  .object({
    needValidate: z.boolean(),
    struct: zStructX,
    userMember: zMember,
    user: zUser,
    repo: zRepo
  })
  .meta({ id: 'ToBackendGetRepoResponsePayload' });

export let zToBackendGetRepoResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendGetRepo}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetRepoResponseInfo' });

export let zToBackendGetRepoResponse = zMyResponse
  .extend({
    info: zToBackendGetRepoResponseInfo,
    payload: zToBackendGetRepoResponsePayload
  })
  .meta({ id: 'ToBackendGetRepoResponse' });

export type ToBackendGetRepoRequestPayload = z.infer<
  typeof zToBackendGetRepoRequestPayload
>;
export type ToBackendGetRepoRequest = z.infer<typeof zToBackendGetRepoRequest>;
export type ToBackendGetRepoResponsePayload = z.infer<
  typeof zToBackendGetRepoResponsePayload
>;
export type ToBackendGetRepoResponse = z.infer<
  typeof zToBackendGetRepoResponse
>;
