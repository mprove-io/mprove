import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMember } from '#common/zod/backend/member';
import { zModelX } from '#common/zod/backend/model-x';
import { zStructX } from '#common/zod/backend/struct-x';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGetModelRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    modelId: z.string(),
    getMalloy: z.boolean()
  })
  .meta({ id: 'ToBackendGetModelRequestPayload' });

export let zToBackendGetModelRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetModel)
  })
  .meta({ id: 'ToBackendGetModelRequestInfo' });

export let zToBackendGetModelRequest = zToBackendRequest
  .extend({
    info: zToBackendGetModelRequestInfo,
    payload: zToBackendGetModelRequestPayload
  })
  .meta({ id: 'ToBackendGetModelRequest' });

export let zToBackendGetModelResponsePayload = z
  .object({
    needValidate: z.boolean(),
    struct: zStructX,
    userMember: zMember,
    model: zModelX
  })
  .meta({ id: 'ToBackendGetModelResponsePayload' });

export let zToBackendGetModelResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendGetModel}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetModelResponseInfo' });

export let zToBackendGetModelResponse = zMyResponse
  .extend({
    info: zToBackendGetModelResponseInfo,
    payload: zToBackendGetModelResponsePayload
  })
  .meta({ id: 'ToBackendGetModelResponse' });

export type ToBackendGetModelRequestPayload = z.infer<
  typeof zToBackendGetModelRequestPayload
>;
export type ToBackendGetModelRequest = z.infer<
  typeof zToBackendGetModelRequest
>;
export type ToBackendGetModelResponsePayload = z.infer<
  typeof zToBackendGetModelResponsePayload
>;
export type ToBackendGetModelResponse = z.infer<
  typeof zToBackendGetModelResponse
>;
