import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zEnvUser } from '#common/zod/backend/env-user';
import { zMember } from '#common/zod/backend/member';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGetMembersListRequestPayload = z
  .object({
    projectId: z.string()
  })
  .meta({ id: 'ToBackendGetMembersListRequestPayload' });

export let zToBackendGetMembersListRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetMembersList)
  })
  .meta({ id: 'ToBackendGetMembersListRequestInfo' });

export let zToBackendGetMembersListRequest = zToBackendRequest
  .extend({
    info: zToBackendGetMembersListRequestInfo,
    payload: zToBackendGetMembersListRequestPayload
  })
  .meta({ id: 'ToBackendGetMembersListRequest' });

export let zToBackendGetMembersListResponsePayload = z
  .object({
    userMember: zMember,
    membersList: z.array(zEnvUser)
  })
  .meta({ id: 'ToBackendGetMembersListResponsePayload' });

export let zToBackendGetMembersListResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendGetMembersList}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetMembersListResponseInfo' });

export let zToBackendGetMembersListResponse = zMyResponse
  .extend({
    info: zToBackendGetMembersListResponseInfo,
    payload: zToBackendGetMembersListResponsePayload
  })
  .meta({ id: 'ToBackendGetMembersListResponse' });

export type ToBackendGetMembersListRequestPayload = z.infer<
  typeof zToBackendGetMembersListRequestPayload
>;
export type ToBackendGetMembersListRequest = z.infer<
  typeof zToBackendGetMembersListRequest
>;
export type ToBackendGetMembersListResponsePayload = z.infer<
  typeof zToBackendGetMembersListResponsePayload
>;
export type ToBackendGetMembersListResponse = z.infer<
  typeof zToBackendGetMembersListResponse
>;
