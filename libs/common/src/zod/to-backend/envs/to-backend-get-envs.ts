import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zEnv } from '#common/zod/backend/env';
import { zMember } from '#common/zod/backend/member';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGetEnvsRequestPayload = z
  .object({
    projectId: z.string()
  })
  .meta({ id: 'ToBackendGetEnvsRequestPayload' });

export let zToBackendGetEnvsRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetEnvs)
  })
  .meta({ id: 'ToBackendGetEnvsRequestInfo' });

export let zToBackendGetEnvsRequest = zToBackendRequest
  .extend({
    info: zToBackendGetEnvsRequestInfo,
    payload: zToBackendGetEnvsRequestPayload
  })
  .meta({ id: 'ToBackendGetEnvsRequest' });

export let zToBackendGetEnvsResponsePayload = z
  .object({
    userMember: zMember,
    envs: z.array(zEnv)
  })
  .meta({ id: 'ToBackendGetEnvsResponsePayload' });

export let zToBackendGetEnvsResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendGetEnvs}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetEnvsResponseInfo' });

export let zToBackendGetEnvsResponse = zMyResponse
  .extend({
    info: zToBackendGetEnvsResponseInfo,
    payload: zToBackendGetEnvsResponsePayload
  })
  .meta({ id: 'ToBackendGetEnvsResponse' });

export type ToBackendGetEnvsRequestPayload = z.infer<
  typeof zToBackendGetEnvsRequestPayload
>;
export type ToBackendGetEnvsRequest = z.infer<typeof zToBackendGetEnvsRequest>;
export type ToBackendGetEnvsResponsePayload = z.infer<
  typeof zToBackendGetEnvsResponsePayload
>;
export type ToBackendGetEnvsResponse = z.infer<
  typeof zToBackendGetEnvsResponse
>;
