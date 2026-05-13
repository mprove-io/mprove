import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zServerUsersMembershipItem = z
  .object({
    orgId: z.string(),
    isOrgOwner: z.boolean(),
    projectId: z.string(),
    isAdmin: z.boolean(),
    isFileEditor: z.boolean(),
    isExplorer: z.boolean()
  })
  .meta({ id: 'ServerUsersMembershipItem' });

export let zServerUsersItem = z
  .object({
    userId: z.string(),
    avatarSmall: z.string().nullish(),
    email: z.string(),
    alias: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    fullName: z.string(),
    createdTs: z.number().nullish(),
    memberships: z.array(zServerUsersMembershipItem)
  })
  .meta({ id: 'ServerUsersItem' });

export let zToBackendGetServerUsersRequestPayload = z
  .object({
    pageNum: z.number(),
    perPage: z.number()
  })
  .meta({ id: 'ToBackendGetServerUsersRequestPayload' });

export let zToBackendGetServerUsersRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetServerUsers)
  })
  .meta({ id: 'ToBackendGetServerUsersRequestInfo' });

export let zToBackendGetServerUsersRequest = zToBackendRequest
  .extend({
    info: zToBackendGetServerUsersRequestInfo,
    payload: zToBackendGetServerUsersRequestPayload
  })
  .meta({ id: 'ToBackendGetServerUsersRequest' });

export let zToBackendGetServerUsersResponsePayload = z
  .object({
    serverUsersList: z.array(zServerUsersItem),
    total: z.number()
  })
  .meta({ id: 'ToBackendGetServerUsersResponsePayload' });

export let zToBackendGetServerUsersResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendGetServerUsers}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetServerUsersResponseInfo' });

export let zToBackendGetServerUsersResponse = zMyResponse
  .extend({
    info: zToBackendGetServerUsersResponseInfo,
    payload: zToBackendGetServerUsersResponsePayload
  })
  .meta({ id: 'ToBackendGetServerUsersResponse' });

export type ServerUsersMembershipItem = z.infer<
  typeof zServerUsersMembershipItem
>;
export type ServerUsersItem = z.infer<typeof zServerUsersItem>;
export type ToBackendGetServerUsersRequestPayload = z.infer<
  typeof zToBackendGetServerUsersRequestPayload
>;
export type ToBackendGetServerUsersRequest = z.infer<
  typeof zToBackendGetServerUsersRequest
>;
export type ToBackendGetServerUsersResponsePayload = z.infer<
  typeof zToBackendGetServerUsersResponsePayload
>;
export type ToBackendGetServerUsersResponse = z.infer<
  typeof zToBackendGetServerUsersResponse
>;
