import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zEnv } from '#common/zod/backend/env';
import { zMember } from '#common/zod/backend/member';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendCreateEnvRequestPayload = z
  .object({
    projectId: z.string(),
    envId: z.string()
  })
  .meta({ id: 'ToBackendCreateEnvRequestPayload' });

export let zToBackendCreateEnvRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendCreateEnv)
  })
  .meta({ id: 'ToBackendCreateEnvRequestInfo' });

export let zToBackendCreateEnvRequest = zToBackendRequest
  .extend({
    info: zToBackendCreateEnvRequestInfo,
    payload: zToBackendCreateEnvRequestPayload
  })
  .meta({ id: 'ToBackendCreateEnvRequest' });

export let zToBackendCreateEnvResponsePayload = z
  .object({
    userMember: zMember,
    envs: z.array(zEnv)
  })
  .meta({ id: 'ToBackendCreateEnvResponsePayload' });

export let zToBackendCreateEnvResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendCreateEnv}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendCreateEnvResponseInfo' });

export let zToBackendCreateEnvResponse = zMyResponse
  .extend({
    info: zToBackendCreateEnvResponseInfo,
    payload: zToBackendCreateEnvResponsePayload
  })
  .meta({ id: 'ToBackendCreateEnvResponse' });

export type ToBackendCreateEnvRequestPayload = z.infer<
  typeof zToBackendCreateEnvRequestPayload
>;
export type ToBackendCreateEnvRequest = z.infer<
  typeof zToBackendCreateEnvRequest
>;
export type ToBackendCreateEnvResponsePayload = z.infer<
  typeof zToBackendCreateEnvResponsePayload
>;
export type ToBackendCreateEnvResponse = z.infer<
  typeof zToBackendCreateEnvResponse
>;
