import { z } from 'zod';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zConnectionOptions } from '#common/zod/backend/connection-parts/connection-options';
import { zProjectConnection } from '#common/zod/backend/project-connection';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendCreateConnectionRequestPayload = z
  .object({
    projectId: z.string(),
    envId: z.string(),
    connectionId: z.string(),
    type: z.enum(ConnectionTypeEnum),
    options: zConnectionOptions.nullish()
  })
  .meta({ id: 'ToBackendCreateConnectionRequestPayload' });

export let zToBackendCreateConnectionRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendCreateConnection)
  })
  .meta({ id: 'ToBackendCreateConnectionRequestInfo' });

export let zToBackendCreateConnectionRequest = zToBackendRequest
  .extend({
    info: zToBackendCreateConnectionRequestInfo,
    payload: zToBackendCreateConnectionRequestPayload
  })
  .meta({ id: 'ToBackendCreateConnectionRequest' });

export let zToBackendCreateConnectionResponsePayload = z
  .object({
    connection: zProjectConnection
  })
  .meta({ id: 'ToBackendCreateConnectionResponsePayload' });

export let zToBackendCreateConnectionResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendCreateConnection}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendCreateConnectionResponseInfo' });

export let zToBackendCreateConnectionResponse = zMyResponse
  .extend({
    info: zToBackendCreateConnectionResponseInfo,
    payload: zToBackendCreateConnectionResponsePayload
  })
  .meta({ id: 'ToBackendCreateConnectionResponse' });

export type ToBackendCreateConnectionRequestPayload = z.infer<
  typeof zToBackendCreateConnectionRequestPayload
>;
export type ToBackendCreateConnectionRequest = z.infer<
  typeof zToBackendCreateConnectionRequest
>;
export type ToBackendCreateConnectionResponsePayload = z.infer<
  typeof zToBackendCreateConnectionResponsePayload
>;
export type ToBackendCreateConnectionResponse = z.infer<
  typeof zToBackendCreateConnectionResponse
>;
