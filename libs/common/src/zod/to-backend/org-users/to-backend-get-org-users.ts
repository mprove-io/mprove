import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGetOrgUsersRequestPayload = z
  .object({
    orgId: z.string(),
    pageNum: z.number(),
    perPage: z.number()
  })
  .meta({ id: 'ToBackendGetOrgUsersRequestPayload' });

export let zToBackendGetOrgUsersRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetOrgUsers)
  })
  .meta({ id: 'ToBackendGetOrgUsersRequestInfo' });

export let zToBackendGetOrgUsersRequest = zToBackendRequest
  .extend({
    info: zToBackendGetOrgUsersRequestInfo,
    payload: zToBackendGetOrgUsersRequestPayload
  })
  .meta({ id: 'ToBackendGetOrgUsersRequest' });

export let zOrgUsersItem = z
  .object({
    userId: z.string(),
    avatarSmall: z.string(),
    email: z.string(),
    alias: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    fullName: z.string(),
    adminProjects: z.array(z.string()),
    editorProjects: z.array(z.string()),
    explorerProjects: z.array(z.string()),
    projectUserProjects: z.array(z.string())
  })
  .meta({ id: 'OrgUsersItem' });

export let zToBackendGetOrgUsersResponsePayload = z
  .object({
    orgUsersList: z.array(zOrgUsersItem),
    total: z.number()
  })
  .meta({ id: 'ToBackendGetOrgUsersResponsePayload' });

export let zToBackendGetOrgUsersResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendGetOrgUsers}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetOrgUsersResponseInfo' });

export let zToBackendGetOrgUsersResponse = zMyResponse
  .extend({
    info: zToBackendGetOrgUsersResponseInfo,
    payload: zToBackendGetOrgUsersResponsePayload
  })
  .meta({ id: 'ToBackendGetOrgUsersResponse' });

export type OrgUsersItem = z.infer<typeof zOrgUsersItem>;
export type ToBackendGetOrgUsersRequestPayload = z.infer<
  typeof zToBackendGetOrgUsersRequestPayload
>;
export type ToBackendGetOrgUsersRequest = z.infer<
  typeof zToBackendGetOrgUsersRequest
>;
export type ToBackendGetOrgUsersResponsePayload = z.infer<
  typeof zToBackendGetOrgUsersResponsePayload
>;
export type ToBackendGetOrgUsersResponse = z.infer<
  typeof zToBackendGetOrgUsersResponse
>;
