import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendResendUserEmailRequestPayload = z
  .object({
    userId: z.string()
  })
  .meta({ id: 'ToBackendResendUserEmailRequestPayload' });

export let zToBackendResendUserEmailRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendResendUserEmail)
  })
  .meta({ id: 'ToBackendResendUserEmailRequestInfo' });

export let zToBackendResendUserEmailRequest = zToBackendRequest
  .extend({
    info: zToBackendResendUserEmailRequestInfo,
    payload: zToBackendResendUserEmailRequestPayload
  })
  .meta({ id: 'ToBackendResendUserEmailRequest' });

export let zToBackendResendUserEmailResponsePayload = z
  .object({
    isEmailVerified: z.boolean()
  })
  .meta({ id: 'ToBackendResendUserEmailResponsePayload' });

export let zToBackendResendUserEmailResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendResendUserEmail}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendResendUserEmailResponseInfo' });

export let zToBackendResendUserEmailResponse = zMyResponse
  .extend({
    info: zToBackendResendUserEmailResponseInfo,
    payload: zToBackendResendUserEmailResponsePayload
  })
  .meta({ id: 'ToBackendResendUserEmailResponse' });

export type ToBackendResendUserEmailRequestPayload = z.infer<
  typeof zToBackendResendUserEmailRequestPayload
>;
export type ToBackendResendUserEmailRequest = z.infer<
  typeof zToBackendResendUserEmailRequest
>;
export type ToBackendResendUserEmailResponsePayload = z.infer<
  typeof zToBackendResendUserEmailResponsePayload
>;
export type ToBackendResendUserEmailResponse = z.infer<
  typeof zToBackendResendUserEmailResponse
>;
