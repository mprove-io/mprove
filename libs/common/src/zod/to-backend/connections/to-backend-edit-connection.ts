import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zConnectionOptions } from '#common/zod/backend/connection-parts/connection-options';
import { zProjectConnection } from '#common/zod/backend/project-connection';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendEditConnectionRequestPayload = z
  .object({
    projectId: z.string(),
    envId: z.string(),
    connectionId: z.string(),
    options: zConnectionOptions.nullish()
  })
  .meta({ id: 'ToBackendEditConnectionRequestPayload' });

export let zToBackendEditConnectionRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendEditConnection)
  })
  .meta({ id: 'ToBackendEditConnectionRequestInfo' });

export let zToBackendEditConnectionRequest = zToBackendRequest
  .extend({
    info: zToBackendEditConnectionRequestInfo,
    payload: zToBackendEditConnectionRequestPayload
  })
  .meta({ id: 'ToBackendEditConnectionRequest' });

export let zToBackendEditConnectionResponsePayload = z
  .object({
    connection: zProjectConnection
  })
  .meta({ id: 'ToBackendEditConnectionResponsePayload' });

export let zToBackendEditConnectionResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendEditConnection}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendEditConnectionResponseInfo' });

export let zToBackendEditConnectionResponse = zMyResponse
  .extend({
    info: zToBackendEditConnectionResponseInfo,
    payload: zToBackendEditConnectionResponsePayload
  })
  .meta({ id: 'ToBackendEditConnectionResponse' });

export type ToBackendEditConnectionRequestPayload = z.infer<
  typeof zToBackendEditConnectionRequestPayload
>;
export type ToBackendEditConnectionRequest = z.infer<
  typeof zToBackendEditConnectionRequest
>;
export type ToBackendEditConnectionResponsePayload = z.infer<
  typeof zToBackendEditConnectionResponsePayload
>;
export type ToBackendEditConnectionResponse = z.infer<
  typeof zToBackendEditConnectionResponse
>;
