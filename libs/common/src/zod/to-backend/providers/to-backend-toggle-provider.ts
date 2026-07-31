import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zProvider } from '#common/zod/backend/provider';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendToggleProviderRequestPayload = z
  .object({
    projectId: z.string(),
    providerId: z.string(),
    isEnabled: z.boolean()
  })
  .meta({ id: 'ToBackendToggleProviderRequestPayload' });

export let zToBackendToggleProviderRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendToggleProvider)
  })
  .meta({ id: 'ToBackendToggleProviderRequestInfo' });

export let zToBackendToggleProviderRequest = zToBackendRequest
  .extend({
    info: zToBackendToggleProviderRequestInfo,
    payload: zToBackendToggleProviderRequestPayload
  })
  .meta({ id: 'ToBackendToggleProviderRequest' });

export let zToBackendToggleProviderResponsePayload = z
  .object({ provider: zProvider })
  .meta({ id: 'ToBackendToggleProviderResponsePayload' });

export let zToBackendToggleProviderResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendToggleProvider}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendToggleProviderResponseInfo' });

export let zToBackendToggleProviderResponse = zMyResponse
  .extend({
    info: zToBackendToggleProviderResponseInfo,
    payload: zToBackendToggleProviderResponsePayload
  })
  .meta({ id: 'ToBackendToggleProviderResponse' });

export type ToBackendToggleProviderRequestPayload = z.infer<
  typeof zToBackendToggleProviderRequestPayload
>;
export type ToBackendToggleProviderRequest = z.infer<
  typeof zToBackendToggleProviderRequest
>;
export type ToBackendToggleProviderResponsePayload = z.infer<
  typeof zToBackendToggleProviderResponsePayload
>;
export type ToBackendToggleProviderResponse = z.infer<
  typeof zToBackendToggleProviderResponse
>;
