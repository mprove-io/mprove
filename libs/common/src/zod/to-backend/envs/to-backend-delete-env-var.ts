import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zEnv } from '#common/zod/backend/env';
import { zMember } from '#common/zod/backend/member';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendDeleteEnvVarRequestPayload = z
  .object({
    projectId: z.string(),
    envId: z.string(),
    evId: z.string()
  })
  .meta({ id: 'ToBackendDeleteEnvVarRequestPayload' });

export let zToBackendDeleteEnvVarRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendDeleteEnvVar)
  })
  .meta({ id: 'ToBackendDeleteEnvVarRequestInfo' });

export let zToBackendDeleteEnvVarRequest = zToBackendRequest
  .extend({
    info: zToBackendDeleteEnvVarRequestInfo,
    payload: zToBackendDeleteEnvVarRequestPayload
  })
  .meta({ id: 'ToBackendDeleteEnvVarRequest' });

export let zToBackendDeleteEnvVarResponsePayload = z
  .object({
    userMember: zMember,
    envs: z.array(zEnv)
  })
  .meta({ id: 'ToBackendDeleteEnvVarResponsePayload' });

export let zToBackendDeleteEnvVarResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendDeleteEnvVar}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendDeleteEnvVarResponseInfo' });

export let zToBackendDeleteEnvVarResponse = zMyResponse
  .extend({
    info: zToBackendDeleteEnvVarResponseInfo,
    payload: zToBackendDeleteEnvVarResponsePayload
  })
  .meta({ id: 'ToBackendDeleteEnvVarResponse' });

export type ToBackendDeleteEnvVarRequestPayload = z.infer<
  typeof zToBackendDeleteEnvVarRequestPayload
>;
export type ToBackendDeleteEnvVarRequest = z.infer<
  typeof zToBackendDeleteEnvVarRequest
>;
export type ToBackendDeleteEnvVarResponsePayload = z.infer<
  typeof zToBackendDeleteEnvVarResponsePayload
>;
export type ToBackendDeleteEnvVarResponse = z.infer<
  typeof zToBackendDeleteEnvVarResponse
>;
