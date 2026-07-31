import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zProvider } from '#common/zod/backend/provider';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendDeleteProviderModelRequestPayload = z
  .object({
    projectId: z.string(),
    providerId: z.string(),
    modelId: z.string().trim().min(1)
  })
  .meta({ id: 'ToBackendDeleteProviderModelRequestPayload' });

export let zToBackendDeleteProviderModelRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendDeleteProviderModel)
  })
  .meta({ id: 'ToBackendDeleteProviderModelRequestInfo' });

export let zToBackendDeleteProviderModelRequest = zToBackendRequest
  .extend({
    info: zToBackendDeleteProviderModelRequestInfo,
    payload: zToBackendDeleteProviderModelRequestPayload
  })
  .meta({ id: 'ToBackendDeleteProviderModelRequest' });

export let zToBackendDeleteProviderModelResponsePayload = z
  .object({ provider: zProvider })
  .meta({ id: 'ToBackendDeleteProviderModelResponsePayload' });

export let zToBackendDeleteProviderModelResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendDeleteProviderModel}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendDeleteProviderModelResponseInfo' });

export let zToBackendDeleteProviderModelResponse = zMyResponse
  .extend({
    info: zToBackendDeleteProviderModelResponseInfo,
    payload: zToBackendDeleteProviderModelResponsePayload
  })
  .meta({ id: 'ToBackendDeleteProviderModelResponse' });

export type ToBackendDeleteProviderModelRequestPayload = z.infer<
  typeof zToBackendDeleteProviderModelRequestPayload
>;
export type ToBackendDeleteProviderModelRequest = z.infer<
  typeof zToBackendDeleteProviderModelRequest
>;
export type ToBackendDeleteProviderModelResponsePayload = z.infer<
  typeof zToBackendDeleteProviderModelResponsePayload
>;
export type ToBackendDeleteProviderModelResponse = z.infer<
  typeof zToBackendDeleteProviderModelResponse
>;
