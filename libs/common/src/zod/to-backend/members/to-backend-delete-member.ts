import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendDeleteMemberRequestPayload = z
  .object({
    projectId: z.string(),
    memberId: z.string()
  })
  .meta({ id: 'ToBackendDeleteMemberRequestPayload' });

export let zToBackendDeleteMemberRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendDeleteMember)
  })
  .meta({ id: 'ToBackendDeleteMemberRequestInfo' });

export let zToBackendDeleteMemberRequest = zToBackendRequest
  .extend({
    info: zToBackendDeleteMemberRequestInfo,
    payload: zToBackendDeleteMemberRequestPayload
  })
  .meta({ id: 'ToBackendDeleteMemberRequest' });

export let zToBackendDeleteMemberResponsePayload = z
  .object({})
  .meta({ id: 'ToBackendDeleteMemberResponsePayload' });

export let zToBackendDeleteMemberResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendDeleteMember}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendDeleteMemberResponseInfo' });

export let zToBackendDeleteMemberResponse = zMyResponse
  .extend({
    info: zToBackendDeleteMemberResponseInfo,
    payload: zToBackendDeleteMemberResponsePayload
  })
  .meta({ id: 'ToBackendDeleteMemberResponse' });

export type ToBackendDeleteMemberRequestPayload = z.infer<
  typeof zToBackendDeleteMemberRequestPayload
>;
export type ToBackendDeleteMemberRequest = z.infer<
  typeof zToBackendDeleteMemberRequest
>;
export type ToBackendDeleteMemberResponsePayload = z.infer<
  typeof zToBackendDeleteMemberResponsePayload
>;
export type ToBackendDeleteMemberResponse = z.infer<
  typeof zToBackendDeleteMemberResponse
>;
