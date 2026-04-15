import { z } from 'zod';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zSessionModelApi } from '#common/zod/backend/session-model-api';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGetSessionProviderModelsRequestPayload = z
  .object({
    projectId: z.string(),
    sessionTypes: z.array(z.enum(SessionTypeEnum)),
    forceLoadFromCache: z.boolean().nullish()
  })
  .meta({ id: 'ToBackendGetSessionProviderModelsRequestPayload' });

export let zToBackendGetSessionProviderModelsRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(
      ToBackendRequestInfoNameEnum.ToBackendGetSessionProviderModels
    )
  })
  .meta({ id: 'ToBackendGetSessionProviderModelsRequestInfo' });

export let zToBackendGetSessionProviderModelsRequest = zToBackendRequest
  .extend({
    info: zToBackendGetSessionProviderModelsRequestInfo,
    payload: zToBackendGetSessionProviderModelsRequestPayload
  })
  .meta({ id: 'ToBackendGetSessionProviderModelsRequest' });

export let zToBackendGetSessionProviderModelsResponsePayload = z
  .object({
    modelsOpencode: z.array(zSessionModelApi),
    modelsAi: z.array(zSessionModelApi)
  })
  .meta({ id: 'ToBackendGetSessionProviderModelsResponsePayload' });

export let zToBackendGetSessionProviderModelsResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendGetSessionProviderModels}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetSessionProviderModelsResponseInfo' });

export let zToBackendGetSessionProviderModelsResponse = zMyResponse
  .extend({
    info: zToBackendGetSessionProviderModelsResponseInfo,
    payload: zToBackendGetSessionProviderModelsResponsePayload
  })
  .meta({ id: 'ToBackendGetSessionProviderModelsResponse' });

export type ToBackendGetSessionProviderModelsRequestPayload = z.infer<
  typeof zToBackendGetSessionProviderModelsRequestPayload
>;
export type ToBackendGetSessionProviderModelsRequest = z.infer<
  typeof zToBackendGetSessionProviderModelsRequest
>;
export type ToBackendGetSessionProviderModelsResponsePayload = z.infer<
  typeof zToBackendGetSessionProviderModelsResponsePayload
>;
export type ToBackendGetSessionProviderModelsResponse = z.infer<
  typeof zToBackendGetSessionProviderModelsResponse
>;
