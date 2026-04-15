import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMember } from '#common/zod/backend/member';
import { zModelX } from '#common/zod/backend/model-x';
import { zStructX } from '#common/zod/backend/struct-x';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGetModelsRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    filterByModelIds: z.array(z.string()).nullish()
  })
  .meta({ id: 'ToBackendGetModelsRequestPayload' });

export let zToBackendGetModelsRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetModels)
  })
  .meta({ id: 'ToBackendGetModelsRequestInfo' });

export let zToBackendGetModelsRequest = zToBackendRequest
  .extend({
    info: zToBackendGetModelsRequestInfo,
    payload: zToBackendGetModelsRequestPayload
  })
  .meta({ id: 'ToBackendGetModelsRequest' });

export let zToBackendGetModelsResponsePayload = z
  .object({
    needValidate: z.boolean(),
    struct: zStructX,
    userMember: zMember,
    models: z.array(zModelX)
  })
  .meta({ id: 'ToBackendGetModelsResponsePayload' });

export let zToBackendGetModelsResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendGetModels}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetModelsResponseInfo' });

export let zToBackendGetModelsResponse = zMyResponse
  .extend({
    info: zToBackendGetModelsResponseInfo,
    payload: zToBackendGetModelsResponsePayload
  })
  .meta({ id: 'ToBackendGetModelsResponse' });

export type ToBackendGetModelsRequestPayload = z.infer<
  typeof zToBackendGetModelsRequestPayload
>;
export type ToBackendGetModelsRequest = z.infer<
  typeof zToBackendGetModelsRequest
>;
export type ToBackendGetModelsResponsePayload = z.infer<
  typeof zToBackendGetModelsResponsePayload
>;
export type ToBackendGetModelsResponse = z.infer<
  typeof zToBackendGetModelsResponse
>;
