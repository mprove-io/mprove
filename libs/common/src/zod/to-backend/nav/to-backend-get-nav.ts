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

export let zToBackendGetNavRequestPayload = z
  .object({
    orgId: z.string().nullish(),
    projectId: z.string().nullish(),
    getRepo: z.boolean()
  })
  .meta({ id: 'ToBackendGetNavRequestPayload' });

export let zToBackendGetNavRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetNav)
  })
  .meta({ id: 'ToBackendGetNavRequestInfo' });

export let zToBackendGetNavRequest = zToBackendRequest
  .extend({
    info: zToBackendGetNavRequestInfo,
    payload: zToBackendGetNavRequestPayload
  })
  .meta({ id: 'ToBackendGetNavRequest' });

export let zToBackendGetNavResponsePayload = z
  .object({
    avatarSmall: z.string(),
    avatarBig: z.string(),
    orgId: z.string(),
    orgOwnerId: z.string(),
    orgName: z.string(),
    projectId: z.string(),
    projectName: z.string(),
    projectDefaultBranch: z.string(),
    repoId: z.string(),
    repoType: z.string(),
    branchId: z.string(),
    envId: z.string(),
    needValidate: z.boolean(),
    user: zUser,
    serverNowTs: z.number(),
    struct: zStructX,
    userMember: zMember,
    repo: zRepo
  })
  .meta({ id: 'ToBackendGetNavResponsePayload' });

export let zToBackendGetNavResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendGetNav}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetNavResponseInfo' });

export let zToBackendGetNavResponse = zMyResponse
  .extend({
    info: zToBackendGetNavResponseInfo,
    payload: zToBackendGetNavResponsePayload
  })
  .meta({ id: 'ToBackendGetNavResponse' });

export type ToBackendGetNavRequestPayload = z.infer<
  typeof zToBackendGetNavRequestPayload
>;
export type ToBackendGetNavRequest = z.infer<typeof zToBackendGetNavRequest>;
export type ToBackendGetNavResponsePayload = z.infer<
  typeof zToBackendGetNavResponsePayload
>;
export type ToBackendGetNavResponse = z.infer<typeof zToBackendGetNavResponse>;
