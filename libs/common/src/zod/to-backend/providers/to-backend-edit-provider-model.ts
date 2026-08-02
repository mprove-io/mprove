import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zProvider } from '#common/zod/backend/provider';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendEditProviderModelRequestPayload = z
  .object({
    projectId: z.string(),
    providerId: z.string(),
    modelId: z.string().trim().min(1),
    name: z.string().trim().nullish()
  })
  .meta({ id: 'ToBackendEditProviderModelRequestPayload' });

export let zToBackendEditProviderModelRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendEditProviderModel)
  })
  .meta({ id: 'ToBackendEditProviderModelRequestInfo' });

export let zToBackendEditProviderModelRequest = zToBackendRequest
  .extend({
    info: zToBackendEditProviderModelRequestInfo,
    payload: zToBackendEditProviderModelRequestPayload
  })
  .meta({ id: 'ToBackendEditProviderModelRequest' });

export let zToBackendEditProviderModelResponsePayload = z
  .object({ provider: zProvider })
  .meta({ id: 'ToBackendEditProviderModelResponsePayload' });

export let zToBackendEditProviderModelResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendEditProviderModel}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendEditProviderModelResponseInfo' });

export let zToBackendEditProviderModelResponse = zMyResponse
  .extend({
    info: zToBackendEditProviderModelResponseInfo,
    payload: zToBackendEditProviderModelResponsePayload
  })
  .meta({ id: 'ToBackendEditProviderModelResponse' });

export type ToBackendEditProviderModelRequestPayload = z.infer<
  typeof zToBackendEditProviderModelRequestPayload
>;
export type ToBackendEditProviderModelRequest = z.infer<
  typeof zToBackendEditProviderModelRequest
>;
export type ToBackendEditProviderModelResponsePayload = z.infer<
  typeof zToBackendEditProviderModelResponsePayload
>;
export type ToBackendEditProviderModelResponse = z.infer<
  typeof zToBackendEditProviderModelResponse
>;
