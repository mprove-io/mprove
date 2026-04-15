import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zEnv } from '#common/zod/backend/env';
import { zMember } from '#common/zod/backend/member';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendCreateEnvUserRequestPayload = z
  .object({
    projectId: z.string(),
    envId: z.string(),
    envUserId: z.string()
  })
  .meta({ id: 'ToBackendCreateEnvUserRequestPayload' });

export let zToBackendCreateEnvUserRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendCreateEnvUser)
  })
  .meta({ id: 'ToBackendCreateEnvUserRequestInfo' });

export let zToBackendCreateEnvUserRequest = zToBackendRequest
  .extend({
    info: zToBackendCreateEnvUserRequestInfo,
    payload: zToBackendCreateEnvUserRequestPayload
  })
  .meta({ id: 'ToBackendCreateEnvUserRequest' });

export let zToBackendCreateEnvUserResponsePayload = z
  .object({
    userMember: zMember,
    envs: z.array(zEnv)
  })
  .meta({ id: 'ToBackendCreateEnvUserResponsePayload' });

export let zToBackendCreateEnvUserResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendCreateEnvUser}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendCreateEnvUserResponseInfo' });

export let zToBackendCreateEnvUserResponse = zMyResponse
  .extend({
    info: zToBackendCreateEnvUserResponseInfo,
    payload: zToBackendCreateEnvUserResponsePayload
  })
  .meta({ id: 'ToBackendCreateEnvUserResponse' });

export type ToBackendCreateEnvUserRequestPayload = z.infer<
  typeof zToBackendCreateEnvUserRequestPayload
>;
export type ToBackendCreateEnvUserRequest = z.infer<
  typeof zToBackendCreateEnvUserRequest
>;
export type ToBackendCreateEnvUserResponsePayload = z.infer<
  typeof zToBackendCreateEnvUserResponsePayload
>;
export type ToBackendCreateEnvUserResponse = z.infer<
  typeof zToBackendCreateEnvUserResponse
>;
