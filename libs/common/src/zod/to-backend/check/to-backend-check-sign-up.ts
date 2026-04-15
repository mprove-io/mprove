import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendCheckSignUpRequestPayload = z
  .object({})
  .meta({ id: 'ToBackendCheckSignUpRequestPayload' });

export let zToBackendCheckSignUpRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendCheckSignUp)
  })
  .meta({ id: 'ToBackendCheckSignUpRequestInfo' });

export let zToBackendCheckSignUpRequest = zToBackendRequest
  .extend({
    info: zToBackendCheckSignUpRequestInfo,
    payload: zToBackendCheckSignUpRequestPayload
  })
  .meta({ id: 'ToBackendCheckSignUpRequest' });

export let zToBackendCheckSignUpResponsePayload = z
  .object({
    isRegisterOnlyInvitedUsers: z.boolean()
  })
  .meta({ id: 'ToBackendCheckSignUpResponsePayload' });

export let zToBackendCheckSignUpResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendCheckSignUp}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendCheckSignUpResponseInfo' });

export let zToBackendCheckSignUpResponse = zMyResponse
  .extend({
    info: zToBackendCheckSignUpResponseInfo,
    payload: zToBackendCheckSignUpResponsePayload
  })
  .meta({ id: 'ToBackendCheckSignUpResponse' });

export type ToBackendCheckSignUpRequestPayload = z.infer<
  typeof zToBackendCheckSignUpRequestPayload
>;
export type ToBackendCheckSignUpRequest = z.infer<
  typeof zToBackendCheckSignUpRequest
>;
export type ToBackendCheckSignUpResponsePayload = z.infer<
  typeof zToBackendCheckSignUpResponsePayload
>;
export type ToBackendCheckSignUpResponse = z.infer<
  typeof zToBackendCheckSignUpResponse
>;
