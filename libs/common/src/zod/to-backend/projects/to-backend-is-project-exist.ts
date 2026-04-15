import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendIsProjectExistRequestPayload = z
  .object({
    orgId: z.string(),
    name: z.string()
  })
  .meta({ id: 'ToBackendIsProjectExistRequestPayload' });

export let zToBackendIsProjectExistRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendIsProjectExist)
  })
  .meta({ id: 'ToBackendIsProjectExistRequestInfo' });

export let zToBackendIsProjectExistRequest = zToBackendRequest
  .extend({
    info: zToBackendIsProjectExistRequestInfo,
    payload: zToBackendIsProjectExistRequestPayload
  })
  .meta({ id: 'ToBackendIsProjectExistRequest' });

export let zToBackendIsProjectExistResponsePayload = z
  .object({
    isExist: z.boolean()
  })
  .meta({ id: 'ToBackendIsProjectExistResponsePayload' });

export let zToBackendIsProjectExistResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendIsProjectExist}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendIsProjectExistResponseInfo' });

export let zToBackendIsProjectExistResponse = zMyResponse
  .extend({
    info: zToBackendIsProjectExistResponseInfo,
    payload: zToBackendIsProjectExistResponsePayload
  })
  .meta({ id: 'ToBackendIsProjectExistResponse' });

export type ToBackendIsProjectExistRequestPayload = z.infer<
  typeof zToBackendIsProjectExistRequestPayload
>;
export type ToBackendIsProjectExistRequest = z.infer<
  typeof zToBackendIsProjectExistRequest
>;
export type ToBackendIsProjectExistResponsePayload = z.infer<
  typeof zToBackendIsProjectExistResponsePayload
>;
export type ToBackendIsProjectExistResponse = z.infer<
  typeof zToBackendIsProjectExistResponse
>;
