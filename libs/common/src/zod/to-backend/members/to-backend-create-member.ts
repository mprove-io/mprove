import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMember } from '#common/zod/backend/member';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendCreateMemberRequestPayload = z
  .object({
    projectId: z.string(),
    email: z.string()
  })
  .meta({ id: 'ToBackendCreateMemberRequestPayload' });

export let zToBackendCreateMemberRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendCreateMember)
  })
  .meta({ id: 'ToBackendCreateMemberRequestInfo' });

export let zToBackendCreateMemberRequest = zToBackendRequest
  .extend({
    info: zToBackendCreateMemberRequestInfo,
    payload: zToBackendCreateMemberRequestPayload
  })
  .meta({ id: 'ToBackendCreateMemberRequest' });

export let zToBackendCreateMemberResponsePayload = z
  .object({
    member: zMember
  })
  .meta({ id: 'ToBackendCreateMemberResponsePayload' });

export let zToBackendCreateMemberResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendCreateMember}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendCreateMemberResponseInfo' });

export let zToBackendCreateMemberResponse = zMyResponse
  .extend({
    info: zToBackendCreateMemberResponseInfo,
    payload: zToBackendCreateMemberResponsePayload
  })
  .meta({ id: 'ToBackendCreateMemberResponse' });

export type ToBackendCreateMemberRequestPayload = z.infer<
  typeof zToBackendCreateMemberRequestPayload
>;
export type ToBackendCreateMemberRequest = z.infer<
  typeof zToBackendCreateMemberRequest
>;
export type ToBackendCreateMemberResponsePayload = z.infer<
  typeof zToBackendCreateMemberResponsePayload
>;
export type ToBackendCreateMemberResponse = z.infer<
  typeof zToBackendCreateMemberResponse
>;
