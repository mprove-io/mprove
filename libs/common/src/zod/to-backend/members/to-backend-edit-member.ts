import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMember } from '#common/zod/backend/member';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendEditMemberRequestPayload = z
  .object({
    projectId: z.string(),
    memberId: z.string(),
    isAdmin: z.boolean(),
    isEditor: z.boolean(),
    isExplorer: z.boolean(),
    roles: z.array(z.string())
  })
  .meta({ id: 'ToBackendEditMemberRequestPayload' });

export let zToBackendEditMemberRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendEditMember)
  })
  .meta({ id: 'ToBackendEditMemberRequestInfo' });

export let zToBackendEditMemberRequest = zToBackendRequest
  .extend({
    info: zToBackendEditMemberRequestInfo,
    payload: zToBackendEditMemberRequestPayload
  })
  .meta({ id: 'ToBackendEditMemberRequest' });

export let zToBackendEditMemberResponsePayload = z
  .object({
    member: zMember
  })
  .meta({ id: 'ToBackendEditMemberResponsePayload' });

export let zToBackendEditMemberResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendEditMember}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendEditMemberResponseInfo' });

export let zToBackendEditMemberResponse = zMyResponse
  .extend({
    info: zToBackendEditMemberResponseInfo,
    payload: zToBackendEditMemberResponsePayload
  })
  .meta({ id: 'ToBackendEditMemberResponse' });

export type ToBackendEditMemberRequestPayload = z.infer<
  typeof zToBackendEditMemberRequestPayload
>;
export type ToBackendEditMemberRequest = z.infer<
  typeof zToBackendEditMemberRequest
>;
export type ToBackendEditMemberResponsePayload = z.infer<
  typeof zToBackendEditMemberResponsePayload
>;
export type ToBackendEditMemberResponse = z.infer<
  typeof zToBackendEditMemberResponse
>;
