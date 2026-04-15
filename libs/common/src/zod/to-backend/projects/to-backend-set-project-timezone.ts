import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zProject } from '#common/zod/backend/project';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendSetProjectTimezoneRequestPayload = z
  .object({
    projectId: z.string(),
    timezone: z.string()
  })
  .meta({ id: 'ToBackendSetProjectTimezoneRequestPayload' });

export let zToBackendSetProjectTimezoneRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendSetProjectTimezone)
  })
  .meta({ id: 'ToBackendSetProjectTimezoneRequestInfo' });

export let zToBackendSetProjectTimezoneRequest = zToBackendRequest
  .extend({
    info: zToBackendSetProjectTimezoneRequestInfo,
    payload: zToBackendSetProjectTimezoneRequestPayload
  })
  .meta({ id: 'ToBackendSetProjectTimezoneRequest' });

export let zToBackendSetProjectTimezoneResponsePayload = z
  .object({
    project: zProject
  })
  .meta({ id: 'ToBackendSetProjectTimezoneResponsePayload' });

export let zToBackendSetProjectTimezoneResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendSetProjectTimezone}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendSetProjectTimezoneResponseInfo' });

export let zToBackendSetProjectTimezoneResponse = zMyResponse
  .extend({
    info: zToBackendSetProjectTimezoneResponseInfo,
    payload: zToBackendSetProjectTimezoneResponsePayload
  })
  .meta({ id: 'ToBackendSetProjectTimezoneResponse' });

export type ToBackendSetProjectTimezoneRequestPayload = z.infer<
  typeof zToBackendSetProjectTimezoneRequestPayload
>;
export type ToBackendSetProjectTimezoneRequest = z.infer<
  typeof zToBackendSetProjectTimezoneRequest
>;
export type ToBackendSetProjectTimezoneResponsePayload = z.infer<
  typeof zToBackendSetProjectTimezoneResponsePayload
>;
export type ToBackendSetProjectTimezoneResponse = z.infer<
  typeof zToBackendSetProjectTimezoneResponse
>;
