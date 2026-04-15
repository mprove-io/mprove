import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zUser } from '#common/zod/backend/user';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendCompleteUserRegistrationRequestPayload = z
  .object({
    emailVerificationToken: z.string(),
    newPassword: z.string()
  })
  .meta({ id: 'ToBackendCompleteUserRegistrationRequestPayload' });

export let zToBackendCompleteUserRegistrationRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(
      ToBackendRequestInfoNameEnum.ToBackendCompleteUserRegistration
    )
  })
  .meta({ id: 'ToBackendCompleteUserRegistrationRequestInfo' });

export let zToBackendCompleteUserRegistrationRequest = zToBackendRequest
  .extend({
    info: zToBackendCompleteUserRegistrationRequestInfo,
    payload: zToBackendCompleteUserRegistrationRequestPayload
  })
  .meta({ id: 'ToBackendCompleteUserRegistrationRequest' });

export let zToBackendCompleteUserRegistrationResponsePayload = z
  .object({
    token: z.string().nullish(),
    user: zUser.nullish()
  })
  .meta({ id: 'ToBackendCompleteUserRegistrationResponsePayload' });

export let zToBackendCompleteUserRegistrationResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendCompleteUserRegistration}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendCompleteUserRegistrationResponseInfo' });

export let zToBackendCompleteUserRegistrationResponse = zMyResponse
  .extend({
    info: zToBackendCompleteUserRegistrationResponseInfo,
    payload: zToBackendCompleteUserRegistrationResponsePayload
  })
  .meta({ id: 'ToBackendCompleteUserRegistrationResponse' });

export type ToBackendCompleteUserRegistrationRequestPayload = z.infer<
  typeof zToBackendCompleteUserRegistrationRequestPayload
>;
export type ToBackendCompleteUserRegistrationRequest = z.infer<
  typeof zToBackendCompleteUserRegistrationRequest
>;
export type ToBackendCompleteUserRegistrationResponsePayload = z.infer<
  typeof zToBackendCompleteUserRegistrationResponsePayload
>;
export type ToBackendCompleteUserRegistrationResponse = z.infer<
  typeof zToBackendCompleteUserRegistrationResponse
>;
