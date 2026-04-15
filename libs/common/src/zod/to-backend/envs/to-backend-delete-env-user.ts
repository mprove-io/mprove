import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zEnv } from '#common/zod/backend/env';
import { zMember } from '#common/zod/backend/member';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendDeleteEnvUserRequestPayload = z
  .object({
    projectId: z.string(),
    envId: z.string(),
    envUserId: z.string()
  })
  .meta({ id: 'ToBackendDeleteEnvUserRequestPayload' });

export let zToBackendDeleteEnvUserRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendDeleteEnvUser)
  })
  .meta({ id: 'ToBackendDeleteEnvUserRequestInfo' });

export let zToBackendDeleteEnvUserRequest = zToBackendRequest
  .extend({
    info: zToBackendDeleteEnvUserRequestInfo,
    payload: zToBackendDeleteEnvUserRequestPayload
  })
  .meta({ id: 'ToBackendDeleteEnvUserRequest' });

export let zToBackendDeleteEnvUserResponsePayload = z
  .object({
    userMember: zMember,
    envs: z.array(zEnv)
  })
  .meta({ id: 'ToBackendDeleteEnvUserResponsePayload' });

export let zToBackendDeleteEnvUserResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendDeleteEnvUser}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendDeleteEnvUserResponseInfo' });

export let zToBackendDeleteEnvUserResponse = zMyResponse
  .extend({
    info: zToBackendDeleteEnvUserResponseInfo,
    payload: zToBackendDeleteEnvUserResponsePayload
  })
  .meta({ id: 'ToBackendDeleteEnvUserResponse' });

export type ToBackendDeleteEnvUserRequestPayload = z.infer<
  typeof zToBackendDeleteEnvUserRequestPayload
>;
export type ToBackendDeleteEnvUserRequest = z.infer<
  typeof zToBackendDeleteEnvUserRequest
>;
export type ToBackendDeleteEnvUserResponsePayload = z.infer<
  typeof zToBackendDeleteEnvUserResponsePayload
>;
export type ToBackendDeleteEnvUserResponse = z.infer<
  typeof zToBackendDeleteEnvUserResponse
>;
