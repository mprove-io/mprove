import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendResetUserPasswordRequestPayload = z
  .object({
    email: z.string()
  })
  .meta({ id: 'ToBackendResetUserPasswordRequestPayload' });

export let zToBackendResetUserPasswordRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendResetUserPassword)
  })
  .meta({ id: 'ToBackendResetUserPasswordRequestInfo' });

export let zToBackendResetUserPasswordRequest = zToBackendRequest
  .extend({
    info: zToBackendResetUserPasswordRequestInfo,
    payload: zToBackendResetUserPasswordRequestPayload
  })
  .meta({ id: 'ToBackendResetUserPasswordRequest' });

export let zToBackendResetUserPasswordResponsePayload = z
  .object({})
  .meta({ id: 'ToBackendResetUserPasswordResponsePayload' });

export let zToBackendResetUserPasswordResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendResetUserPassword}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendResetUserPasswordResponseInfo' });

export let zToBackendResetUserPasswordResponse = zMyResponse
  .extend({
    info: zToBackendResetUserPasswordResponseInfo,
    payload: zToBackendResetUserPasswordResponsePayload
  })
  .meta({ id: 'ToBackendResetUserPasswordResponse' });

export type ToBackendResetUserPasswordRequestPayload = z.infer<
  typeof zToBackendResetUserPasswordRequestPayload
>;
export type ToBackendResetUserPasswordRequest = z.infer<
  typeof zToBackendResetUserPasswordRequest
>;
export type ToBackendResetUserPasswordResponsePayload = z.infer<
  typeof zToBackendResetUserPasswordResponsePayload
>;
export type ToBackendResetUserPasswordResponse = z.infer<
  typeof zToBackendResetUserPasswordResponse
>;
