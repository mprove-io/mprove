import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendStartUserCodexAuthRequestPayload = z
  .object({})
  .meta({ id: 'ToBackendStartUserCodexAuthRequestPayload' });

export let zToBackendStartUserCodexAuthRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendStartUserCodexAuth)
  })
  .meta({ id: 'ToBackendStartUserCodexAuthRequestInfo' });

export let zToBackendStartUserCodexAuthRequest = zToBackendRequest
  .extend({
    info: zToBackendStartUserCodexAuthRequestInfo,
    payload: zToBackendStartUserCodexAuthRequestPayload
  })
  .meta({ id: 'ToBackendStartUserCodexAuthRequest' });

export let zToBackendStartUserCodexAuthResponsePayload = z
  .object({
    userCode: z.string(),
    verificationUrl: z.string(),
    deviceAuthId: z.string(),
    intervalSec: z.number()
  })
  .meta({ id: 'ToBackendStartUserCodexAuthResponsePayload' });

export let zToBackendStartUserCodexAuthResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendStartUserCodexAuth}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendStartUserCodexAuthResponseInfo' });

export let zToBackendStartUserCodexAuthResponse = zMyResponse
  .extend({
    info: zToBackendStartUserCodexAuthResponseInfo,
    payload: zToBackendStartUserCodexAuthResponsePayload
  })
  .meta({ id: 'ToBackendStartUserCodexAuthResponse' });

export type ToBackendStartUserCodexAuthRequestPayload = z.infer<
  typeof zToBackendStartUserCodexAuthRequestPayload
>;
export type ToBackendStartUserCodexAuthRequest = z.infer<
  typeof zToBackendStartUserCodexAuthRequest
>;
export type ToBackendStartUserCodexAuthResponsePayload = z.infer<
  typeof zToBackendStartUserCodexAuthResponsePayload
>;
export type ToBackendStartUserCodexAuthResponse = z.infer<
  typeof zToBackendStartUserCodexAuthResponse
>;
