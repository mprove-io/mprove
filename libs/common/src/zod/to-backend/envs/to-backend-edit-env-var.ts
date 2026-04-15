import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zEnv } from '#common/zod/backend/env';
import { zMember } from '#common/zod/backend/member';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendEditEnvVarRequestPayload = z
  .object({
    projectId: z.string(),
    envId: z.string(),
    evId: z.string(),
    val: z.string()
  })
  .meta({ id: 'ToBackendEditEnvVarRequestPayload' });

export let zToBackendEditEnvVarRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendEditEnvVar)
  })
  .meta({ id: 'ToBackendEditEnvVarRequestInfo' });

export let zToBackendEditEnvVarRequest = zToBackendRequest
  .extend({
    info: zToBackendEditEnvVarRequestInfo,
    payload: zToBackendEditEnvVarRequestPayload
  })
  .meta({ id: 'ToBackendEditEnvVarRequest' });

export let zToBackendEditEnvVarResponsePayload = z
  .object({
    userMember: zMember,
    envs: z.array(zEnv)
  })
  .meta({ id: 'ToBackendEditEnvVarResponsePayload' });

export let zToBackendEditEnvVarResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendEditEnvVar}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendEditEnvVarResponseInfo' });

export let zToBackendEditEnvVarResponse = zMyResponse
  .extend({
    info: zToBackendEditEnvVarResponseInfo,
    payload: zToBackendEditEnvVarResponsePayload
  })
  .meta({ id: 'ToBackendEditEnvVarResponse' });

export type ToBackendEditEnvVarRequestPayload = z.infer<
  typeof zToBackendEditEnvVarRequestPayload
>;
export type ToBackendEditEnvVarRequest = z.infer<
  typeof zToBackendEditEnvVarRequest
>;
export type ToBackendEditEnvVarResponsePayload = z.infer<
  typeof zToBackendEditEnvVarResponsePayload
>;
export type ToBackendEditEnvVarResponse = z.infer<
  typeof zToBackendEditEnvVarResponse
>;
