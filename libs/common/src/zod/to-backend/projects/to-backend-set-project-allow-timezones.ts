import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zProject } from '#common/zod/backend/project';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendSetProjectAllowTimezonesRequestPayload = z
  .object({
    projectId: z.string(),
    allowTimezones: z.boolean()
  })
  .meta({ id: 'ToBackendSetProjectAllowTimezonesRequestPayload' });

export let zToBackendSetProjectAllowTimezonesRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(
      ToBackendRequestInfoNameEnum.ToBackendSetProjectAllowTimezones
    )
  })
  .meta({ id: 'ToBackendSetProjectAllowTimezonesRequestInfo' });

export let zToBackendSetProjectAllowTimezonesRequest = zToBackendRequest
  .extend({
    info: zToBackendSetProjectAllowTimezonesRequestInfo,
    payload: zToBackendSetProjectAllowTimezonesRequestPayload
  })
  .meta({ id: 'ToBackendSetProjectAllowTimezonesRequest' });

export let zToBackendSetProjectAllowTimezonesResponsePayload = z
  .object({
    project: zProject
  })
  .meta({ id: 'ToBackendSetProjectAllowTimezonesResponsePayload' });

export let zToBackendSetProjectAllowTimezonesResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendSetProjectAllowTimezones}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendSetProjectAllowTimezonesResponseInfo' });

export let zToBackendSetProjectAllowTimezonesResponse = zMyResponse
  .extend({
    info: zToBackendSetProjectAllowTimezonesResponseInfo,
    payload: zToBackendSetProjectAllowTimezonesResponsePayload
  })
  .meta({ id: 'ToBackendSetProjectAllowTimezonesResponse' });

export type ToBackendSetProjectAllowTimezonesRequestPayload = z.infer<
  typeof zToBackendSetProjectAllowTimezonesRequestPayload
>;
export type ToBackendSetProjectAllowTimezonesRequest = z.infer<
  typeof zToBackendSetProjectAllowTimezonesRequest
>;
export type ToBackendSetProjectAllowTimezonesResponsePayload = z.infer<
  typeof zToBackendSetProjectAllowTimezonesResponsePayload
>;
export type ToBackendSetProjectAllowTimezonesResponse = z.infer<
  typeof zToBackendSetProjectAllowTimezonesResponse
>;
