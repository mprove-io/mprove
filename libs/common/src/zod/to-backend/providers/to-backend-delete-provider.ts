import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendDeleteProviderRequestPayload = z
  .object({
    projectId: z.string(),
    providerId: z.string()
  })
  .meta({ id: 'ToBackendDeleteProviderRequestPayload' });

export let zToBackendDeleteProviderRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendDeleteProvider)
  })
  .meta({ id: 'ToBackendDeleteProviderRequestInfo' });

export let zToBackendDeleteProviderRequest = zToBackendRequest
  .extend({
    info: zToBackendDeleteProviderRequestInfo,
    payload: zToBackendDeleteProviderRequestPayload
  })
  .meta({ id: 'ToBackendDeleteProviderRequest' });

export let zToBackendDeleteProviderResponsePayload = z
  .object({})
  .meta({ id: 'ToBackendDeleteProviderResponsePayload' });

export let zToBackendDeleteProviderResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendDeleteProvider}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendDeleteProviderResponseInfo' });

export let zToBackendDeleteProviderResponse = zMyResponse
  .extend({
    info: zToBackendDeleteProviderResponseInfo,
    payload: zToBackendDeleteProviderResponsePayload
  })
  .meta({ id: 'ToBackendDeleteProviderResponse' });

export type ToBackendDeleteProviderRequestPayload = z.infer<
  typeof zToBackendDeleteProviderRequestPayload
>;
export type ToBackendDeleteProviderRequest = z.infer<
  typeof zToBackendDeleteProviderRequest
>;
export type ToBackendDeleteProviderResponsePayload = z.infer<
  typeof zToBackendDeleteProviderResponsePayload
>;
export type ToBackendDeleteProviderResponse = z.infer<
  typeof zToBackendDeleteProviderResponse
>;
