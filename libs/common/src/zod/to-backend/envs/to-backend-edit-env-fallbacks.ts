import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zEnv } from '#common/zod/backend/env';
import { zMember } from '#common/zod/backend/member';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendEditEnvFallbacksRequestPayload = z
  .object({
    projectId: z.string(),
    envId: z.string(),
    isFallbackToProdConnections: z.boolean(),
    isFallbackToProdVariables: z.boolean()
  })
  .meta({ id: 'ToBackendEditEnvFallbacksRequestPayload' });

export let zToBackendEditEnvFallbacksRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendEditEnvFallbacks)
  })
  .meta({ id: 'ToBackendEditEnvFallbacksRequestInfo' });

export let zToBackendEditEnvFallbacksRequest = zToBackendRequest
  .extend({
    info: zToBackendEditEnvFallbacksRequestInfo,
    payload: zToBackendEditEnvFallbacksRequestPayload
  })
  .meta({ id: 'ToBackendEditEnvFallbacksRequest' });

export let zToBackendEditEnvFallbacksResponsePayload = z
  .object({
    userMember: zMember,
    envs: z.array(zEnv)
  })
  .meta({ id: 'ToBackendEditEnvFallbacksResponsePayload' });

export let zToBackendEditEnvFallbacksResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendEditEnvFallbacks}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendEditEnvFallbacksResponseInfo' });

export let zToBackendEditEnvFallbacksResponse = zMyResponse
  .extend({
    info: zToBackendEditEnvFallbacksResponseInfo,
    payload: zToBackendEditEnvFallbacksResponsePayload
  })
  .meta({ id: 'ToBackendEditEnvFallbacksResponse' });

export type ToBackendEditEnvFallbacksRequestPayload = z.infer<
  typeof zToBackendEditEnvFallbacksRequestPayload
>;
export type ToBackendEditEnvFallbacksRequest = z.infer<
  typeof zToBackendEditEnvFallbacksRequest
>;
export type ToBackendEditEnvFallbacksResponsePayload = z.infer<
  typeof zToBackendEditEnvFallbacksResponsePayload
>;
export type ToBackendEditEnvFallbacksResponse = z.infer<
  typeof zToBackendEditEnvFallbacksResponse
>;
