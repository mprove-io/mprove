import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMember } from '#common/zod/backend/member';
import { zStructX } from '#common/zod/backend/struct-x';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGetStructRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string()
  })
  .meta({ id: 'ToBackendGetStructRequestPayload' });

export let zToBackendGetStructRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetStruct)
  })
  .meta({ id: 'ToBackendGetStructRequestInfo' });

export let zToBackendGetStructRequest = zToBackendRequest
  .extend({
    info: zToBackendGetStructRequestInfo,
    payload: zToBackendGetStructRequestPayload
  })
  .meta({ id: 'ToBackendGetStructRequest' });

export let zToBackendGetStructResponsePayload = z
  .object({
    needValidate: z.boolean(),
    struct: zStructX,
    userMember: zMember
  })
  .meta({ id: 'ToBackendGetStructResponsePayload' });

export let zToBackendGetStructResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendGetStruct}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetStructResponseInfo' });

export let zToBackendGetStructResponse = zMyResponse
  .extend({
    info: zToBackendGetStructResponseInfo,
    payload: zToBackendGetStructResponsePayload
  })
  .meta({ id: 'ToBackendGetStructResponse' });

export type ToBackendGetStructRequestPayload = z.infer<
  typeof zToBackendGetStructRequestPayload
>;
export type ToBackendGetStructRequest = z.infer<
  typeof zToBackendGetStructRequest
>;
export type ToBackendGetStructResponsePayload = z.infer<
  typeof zToBackendGetStructResponsePayload
>;
export type ToBackendGetStructResponse = z.infer<
  typeof zToBackendGetStructResponse
>;
