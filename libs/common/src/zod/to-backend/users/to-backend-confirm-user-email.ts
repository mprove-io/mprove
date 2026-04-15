import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zUser } from '#common/zod/backend/user';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendConfirmUserEmailRequestPayload = z
  .object({
    emailVerificationToken: z.string()
  })
  .meta({ id: 'ToBackendConfirmUserEmailRequestPayload' });

export let zToBackendConfirmUserEmailRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendConfirmUserEmail)
  })
  .meta({ id: 'ToBackendConfirmUserEmailRequestInfo' });

export let zToBackendConfirmUserEmailRequest = zToBackendRequest
  .extend({
    info: zToBackendConfirmUserEmailRequestInfo,
    payload: zToBackendConfirmUserEmailRequestPayload
  })
  .meta({ id: 'ToBackendConfirmUserEmailRequest' });

export let zToBackendConfirmUserEmailResponsePayload = z
  .object({
    token: z.string().nullish(),
    user: zUser.nullish()
  })
  .meta({ id: 'ToBackendConfirmUserEmailResponsePayload' });

export let zToBackendConfirmUserEmailResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendConfirmUserEmail}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendConfirmUserEmailResponseInfo' });

export let zToBackendConfirmUserEmailResponse = zMyResponse
  .extend({
    info: zToBackendConfirmUserEmailResponseInfo,
    payload: zToBackendConfirmUserEmailResponsePayload
  })
  .meta({ id: 'ToBackendConfirmUserEmailResponse' });

export type ToBackendConfirmUserEmailRequestPayload = z.infer<
  typeof zToBackendConfirmUserEmailRequestPayload
>;
export type ToBackendConfirmUserEmailRequest = z.infer<
  typeof zToBackendConfirmUserEmailRequest
>;
export type ToBackendConfirmUserEmailResponsePayload = z.infer<
  typeof zToBackendConfirmUserEmailResponsePayload
>;
export type ToBackendConfirmUserEmailResponse = z.infer<
  typeof zToBackendConfirmUserEmailResponse
>;
