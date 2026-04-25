import { z } from 'zod';
import { CodexDeviceAuthStatusEnum } from '#common/enums/codex-device-auth-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zUser } from '#common/zod/backend/user';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendPollUserCodexAuthRequestPayload = z
  .object({
    deviceAuthId: z.string(),
    userCode: z.string()
  })
  .meta({ id: 'ToBackendPollUserCodexAuthRequestPayload' });

export let zToBackendPollUserCodexAuthRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendPollUserCodexAuth)
  })
  .meta({ id: 'ToBackendPollUserCodexAuthRequestInfo' });

export let zToBackendPollUserCodexAuthRequest = zToBackendRequest
  .extend({
    info: zToBackendPollUserCodexAuthRequestInfo,
    payload: zToBackendPollUserCodexAuthRequestPayload
  })
  .meta({ id: 'ToBackendPollUserCodexAuthRequest' });

export let zToBackendPollUserCodexAuthResponsePayload = z
  .object({
    status: z.enum(CodexDeviceAuthStatusEnum),
    user: zUser.nullish()
  })
  .meta({ id: 'ToBackendPollUserCodexAuthResponsePayload' });

export let zToBackendPollUserCodexAuthResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendPollUserCodexAuth}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendPollUserCodexAuthResponseInfo' });

export let zToBackendPollUserCodexAuthResponse = zMyResponse
  .extend({
    info: zToBackendPollUserCodexAuthResponseInfo,
    payload: zToBackendPollUserCodexAuthResponsePayload
  })
  .meta({ id: 'ToBackendPollUserCodexAuthResponse' });

export type ToBackendPollUserCodexAuthRequestPayload = z.infer<
  typeof zToBackendPollUserCodexAuthRequestPayload
>;
export type ToBackendPollUserCodexAuthRequest = z.infer<
  typeof zToBackendPollUserCodexAuthRequest
>;
export type ToBackendPollUserCodexAuthResponsePayload = z.infer<
  typeof zToBackendPollUserCodexAuthResponsePayload
>;
export type ToBackendPollUserCodexAuthResponse = z.infer<
  typeof zToBackendPollUserCodexAuthResponse
>;
