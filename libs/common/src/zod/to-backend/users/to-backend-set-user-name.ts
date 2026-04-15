import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zUser } from '#common/zod/backend/user';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendSetUserNameRequestPayload = z
  .object({
    firstName: z.string(),
    lastName: z.string()
  })
  .meta({ id: 'ToBackendSetUserNameRequestPayload' });

export let zToBackendSetUserNameRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendSetUserName)
  })
  .meta({ id: 'ToBackendSetUserNameRequestInfo' });

export let zToBackendSetUserNameRequest = zToBackendRequest
  .extend({
    info: zToBackendSetUserNameRequestInfo,
    payload: zToBackendSetUserNameRequestPayload
  })
  .meta({ id: 'ToBackendSetUserNameRequest' });

export let zToBackendSetUserNameResponsePayload = z
  .object({
    user: zUser
  })
  .meta({ id: 'ToBackendSetUserNameResponsePayload' });

export let zToBackendSetUserNameResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendSetUserName}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendSetUserNameResponseInfo' });

export let zToBackendSetUserNameResponse = zMyResponse
  .extend({
    info: zToBackendSetUserNameResponseInfo,
    payload: zToBackendSetUserNameResponsePayload
  })
  .meta({ id: 'ToBackendSetUserNameResponse' });

export type ToBackendSetUserNameRequestPayload = z.infer<
  typeof zToBackendSetUserNameRequestPayload
>;
export type ToBackendSetUserNameRequest = z.infer<
  typeof zToBackendSetUserNameRequest
>;
export type ToBackendSetUserNameResponsePayload = z.infer<
  typeof zToBackendSetUserNameResponsePayload
>;
export type ToBackendSetUserNameResponse = z.infer<
  typeof zToBackendSetUserNameResponse
>;
