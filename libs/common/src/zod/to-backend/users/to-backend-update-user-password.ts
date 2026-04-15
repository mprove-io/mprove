import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendUpdateUserPasswordRequestPayload = z
  .object({
    passwordResetToken: z.string(),
    newPassword: z.string()
  })
  .meta({ id: 'ToBackendUpdateUserPasswordRequestPayload' });

export let zToBackendUpdateUserPasswordRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendUpdateUserPassword)
  })
  .meta({ id: 'ToBackendUpdateUserPasswordRequestInfo' });

export let zToBackendUpdateUserPasswordRequest = zToBackendRequest
  .extend({
    info: zToBackendUpdateUserPasswordRequestInfo,
    payload: zToBackendUpdateUserPasswordRequestPayload
  })
  .meta({ id: 'ToBackendUpdateUserPasswordRequest' });

export let zToBackendUpdateUserPasswordResponsePayload = z
  .object({})
  .meta({ id: 'ToBackendUpdateUserPasswordResponsePayload' });

export let zToBackendUpdateUserPasswordResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendUpdateUserPassword}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendUpdateUserPasswordResponseInfo' });

export let zToBackendUpdateUserPasswordResponse = zMyResponse
  .extend({
    info: zToBackendUpdateUserPasswordResponseInfo,
    payload: zToBackendUpdateUserPasswordResponsePayload
  })
  .meta({ id: 'ToBackendUpdateUserPasswordResponse' });

export type ToBackendUpdateUserPasswordRequestPayload = z.infer<
  typeof zToBackendUpdateUserPasswordRequestPayload
>;
export type ToBackendUpdateUserPasswordRequest = z.infer<
  typeof zToBackendUpdateUserPasswordRequest
>;
export type ToBackendUpdateUserPasswordResponsePayload = z.infer<
  typeof zToBackendUpdateUserPasswordResponsePayload
>;
export type ToBackendUpdateUserPasswordResponse = z.infer<
  typeof zToBackendUpdateUserPasswordResponse
>;
