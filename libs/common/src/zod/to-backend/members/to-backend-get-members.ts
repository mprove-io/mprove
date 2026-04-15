import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMember } from '#common/zod/backend/member';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGetMembersRequestPayload = z
  .object({
    projectId: z.string(),
    pageNum: z.number(),
    perPage: z.number()
  })
  .meta({ id: 'ToBackendGetMembersRequestPayload' });

export let zToBackendGetMembersRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetMembers)
  })
  .meta({ id: 'ToBackendGetMembersRequestInfo' });

export let zToBackendGetMembersRequest = zToBackendRequest
  .extend({
    info: zToBackendGetMembersRequestInfo,
    payload: zToBackendGetMembersRequestPayload
  })
  .meta({ id: 'ToBackendGetMembersRequest' });

export let zToBackendGetMembersResponsePayload = z
  .object({
    userMember: zMember,
    members: z.array(zMember),
    total: z.number()
  })
  .meta({ id: 'ToBackendGetMembersResponsePayload' });

export let zToBackendGetMembersResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendGetMembers}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetMembersResponseInfo' });

export let zToBackendGetMembersResponse = zMyResponse
  .extend({
    info: zToBackendGetMembersResponseInfo,
    payload: zToBackendGetMembersResponsePayload
  })
  .meta({ id: 'ToBackendGetMembersResponse' });

export type ToBackendGetMembersRequestPayload = z.infer<
  typeof zToBackendGetMembersRequestPayload
>;
export type ToBackendGetMembersRequest = z.infer<
  typeof zToBackendGetMembersRequest
>;
export type ToBackendGetMembersResponsePayload = z.infer<
  typeof zToBackendGetMembersResponsePayload
>;
export type ToBackendGetMembersResponse = z.infer<
  typeof zToBackendGetMembersResponse
>;
