import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendIsOrgExistRequestPayload = z
  .object({
    name: z.string()
  })
  .meta({ id: 'ToBackendIsOrgExistRequestPayload' });

export let zToBackendIsOrgExistRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendIsOrgExist)
  })
  .meta({ id: 'ToBackendIsOrgExistRequestInfo' });

export let zToBackendIsOrgExistRequest = zToBackendRequest
  .extend({
    info: zToBackendIsOrgExistRequestInfo,
    payload: zToBackendIsOrgExistRequestPayload
  })
  .meta({ id: 'ToBackendIsOrgExistRequest' });

export let zToBackendIsOrgExistResponsePayload = z
  .object({
    isExist: z.boolean()
  })
  .meta({ id: 'ToBackendIsOrgExistResponsePayload' });

export let zToBackendIsOrgExistResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendIsOrgExist}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendIsOrgExistResponseInfo' });

export let zToBackendIsOrgExistResponse = zMyResponse
  .extend({
    info: zToBackendIsOrgExistResponseInfo,
    payload: zToBackendIsOrgExistResponsePayload
  })
  .meta({ id: 'ToBackendIsOrgExistResponse' });

export type ToBackendIsOrgExistRequestPayload = z.infer<
  typeof zToBackendIsOrgExistRequestPayload
>;
export type ToBackendIsOrgExistRequest = z.infer<
  typeof zToBackendIsOrgExistRequest
>;
export type ToBackendIsOrgExistResponsePayload = z.infer<
  typeof zToBackendIsOrgExistResponsePayload
>;
export type ToBackendIsOrgExistResponse = z.infer<
  typeof zToBackendIsOrgExistResponse
>;
