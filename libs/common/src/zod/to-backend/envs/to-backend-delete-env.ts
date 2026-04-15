import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zEnv } from '#common/zod/backend/env';
import { zMember } from '#common/zod/backend/member';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendDeleteEnvRequestPayload = z
  .object({
    projectId: z.string(),
    envId: z.string()
  })
  .meta({ id: 'ToBackendDeleteEnvRequestPayload' });

export let zToBackendDeleteEnvRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendDeleteEnv)
  })
  .meta({ id: 'ToBackendDeleteEnvRequestInfo' });

export let zToBackendDeleteEnvRequest = zToBackendRequest
  .extend({
    info: zToBackendDeleteEnvRequestInfo,
    payload: zToBackendDeleteEnvRequestPayload
  })
  .meta({ id: 'ToBackendDeleteEnvRequest' });

export let zToBackendDeleteEnvResponsePayload = z
  .object({
    userMember: zMember,
    envs: z.array(zEnv)
  })
  .meta({ id: 'ToBackendDeleteEnvResponsePayload' });

export let zToBackendDeleteEnvResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendDeleteEnv}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendDeleteEnvResponseInfo' });

export let zToBackendDeleteEnvResponse = zMyResponse
  .extend({
    info: zToBackendDeleteEnvResponseInfo,
    payload: zToBackendDeleteEnvResponsePayload
  })
  .meta({ id: 'ToBackendDeleteEnvResponse' });

export type ToBackendDeleteEnvRequestPayload = z.infer<
  typeof zToBackendDeleteEnvRequestPayload
>;
export type ToBackendDeleteEnvRequest = z.infer<
  typeof zToBackendDeleteEnvRequest
>;
export type ToBackendDeleteEnvResponsePayload = z.infer<
  typeof zToBackendDeleteEnvResponsePayload
>;
export type ToBackendDeleteEnvResponse = z.infer<
  typeof zToBackendDeleteEnvResponse
>;
