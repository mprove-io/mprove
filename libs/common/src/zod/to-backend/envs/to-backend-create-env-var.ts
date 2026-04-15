import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zEnv } from '#common/zod/backend/env';
import { zMember } from '#common/zod/backend/member';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendCreateEnvVarRequestPayload = z
  .object({
    projectId: z.string(),
    envId: z.string(),
    evId: z.string(),
    val: z.string()
  })
  .meta({ id: 'ToBackendCreateEnvVarRequestPayload' });

export let zToBackendCreateEnvVarRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendCreateEnvVar)
  })
  .meta({ id: 'ToBackendCreateEnvVarRequestInfo' });

export let zToBackendCreateEnvVarRequest = zToBackendRequest
  .extend({
    info: zToBackendCreateEnvVarRequestInfo,
    payload: zToBackendCreateEnvVarRequestPayload
  })
  .meta({ id: 'ToBackendCreateEnvVarRequest' });

export let zToBackendCreateEnvVarResponsePayload = z
  .object({
    userMember: zMember,
    envs: z.array(zEnv)
  })
  .meta({ id: 'ToBackendCreateEnvVarResponsePayload' });

export let zToBackendCreateEnvVarResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendCreateEnvVar}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendCreateEnvVarResponseInfo' });

export let zToBackendCreateEnvVarResponse = zMyResponse
  .extend({
    info: zToBackendCreateEnvVarResponseInfo,
    payload: zToBackendCreateEnvVarResponsePayload
  })
  .meta({ id: 'ToBackendCreateEnvVarResponse' });

export type ToBackendCreateEnvVarRequestPayload = z.infer<
  typeof zToBackendCreateEnvVarRequestPayload
>;
export type ToBackendCreateEnvVarRequest = z.infer<
  typeof zToBackendCreateEnvVarRequest
>;
export type ToBackendCreateEnvVarResponsePayload = z.infer<
  typeof zToBackendCreateEnvVarResponsePayload
>;
export type ToBackendCreateEnvVarResponse = z.infer<
  typeof zToBackendCreateEnvVarResponse
>;
