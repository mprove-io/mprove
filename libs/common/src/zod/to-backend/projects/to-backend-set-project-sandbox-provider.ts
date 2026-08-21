import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zProject } from '#common/zod/backend/project';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendSetProjectSandboxProviderRequestPayload = z
  .object({
    projectId: z.string(),
    e2bApiKey: z.string().nullish()
  })
  .meta({ id: 'ToBackendSetProjectSandboxProviderRequestPayload' });

export let zToBackendSetProjectSandboxProviderRequestInfo =
  zToBackendRequestInfo
    .extend({
      name: z.literal(
        ToBackendRequestInfoNameEnum.ToBackendSetProjectSandboxProvider
      )
    })
    .meta({ id: 'ToBackendSetProjectSandboxProviderRequestInfo' });

export let zToBackendSetProjectSandboxProviderRequest = zToBackendRequest
  .extend({
    info: zToBackendSetProjectSandboxProviderRequestInfo,
    payload: zToBackendSetProjectSandboxProviderRequestPayload
  })
  .meta({ id: 'ToBackendSetProjectSandboxProviderRequest' });

export let zToBackendSetProjectSandboxProviderResponsePayload = z
  .object({
    project: zProject
  })
  .meta({ id: 'ToBackendSetProjectSandboxProviderResponsePayload' });

export let zToBackendSetProjectSandboxProviderResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendSetProjectSandboxProvider}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendSetProjectSandboxProviderResponseInfo' });

export let zToBackendSetProjectSandboxProviderResponse = zMyResponse
  .extend({
    info: zToBackendSetProjectSandboxProviderResponseInfo,
    payload: zToBackendSetProjectSandboxProviderResponsePayload
  })
  .meta({ id: 'ToBackendSetProjectSandboxProviderResponse' });

export type ToBackendSetProjectSandboxProviderRequestPayload = z.infer<
  typeof zToBackendSetProjectSandboxProviderRequestPayload
>;
export type ToBackendSetProjectSandboxProviderRequest = z.infer<
  typeof zToBackendSetProjectSandboxProviderRequest
>;
export type ToBackendSetProjectSandboxProviderResponsePayload = z.infer<
  typeof zToBackendSetProjectSandboxProviderResponsePayload
>;
export type ToBackendSetProjectSandboxProviderResponse = z.infer<
  typeof zToBackendSetProjectSandboxProviderResponse
>;
