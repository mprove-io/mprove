import { z } from 'zod';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { StoreMethodEnum } from '#common/enums/store-method.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zConnectionOptions } from '#common/zod/backend/connection-parts/connection-options';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zTestConnectionResult = z
  .object({
    isSuccess: z.boolean(),
    errorMessage: z.string()
  })
  .meta({ id: 'TestConnectionResult' });

export let zToBackendTestConnectionRequestPayload = z
  .object({
    projectId: z.string(),
    envId: z.string(),
    connectionId: z.string(),
    type: z.enum(ConnectionTypeEnum),
    options: zConnectionOptions.nullish(),
    storeMethod: z.enum(StoreMethodEnum).nullish()
  })
  .meta({ id: 'ToBackendTestConnectionRequestPayload' });

export let zToBackendTestConnectionRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendTestConnection)
  })
  .meta({ id: 'ToBackendTestConnectionRequestInfo' });

export let zToBackendTestConnectionRequest = zToBackendRequest
  .extend({
    info: zToBackendTestConnectionRequestInfo,
    payload: zToBackendTestConnectionRequestPayload
  })
  .meta({ id: 'ToBackendTestConnectionRequest' });

export let zToBackendTestConnectionResponsePayload = z
  .object({
    testConnectionResult: zTestConnectionResult
  })
  .meta({ id: 'ToBackendTestConnectionResponsePayload' });

export let zToBackendTestConnectionResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendTestConnection}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendTestConnectionResponseInfo' });

export let zToBackendTestConnectionResponse = zMyResponse
  .extend({
    info: zToBackendTestConnectionResponseInfo,
    payload: zToBackendTestConnectionResponsePayload
  })
  .meta({ id: 'ToBackendTestConnectionResponse' });

export type TestConnectionResult = z.infer<typeof zTestConnectionResult>;
export type ToBackendTestConnectionRequestPayload = z.infer<
  typeof zToBackendTestConnectionRequestPayload
>;
export type ToBackendTestConnectionRequest = z.infer<
  typeof zToBackendTestConnectionRequest
>;
export type ToBackendTestConnectionResponsePayload = z.infer<
  typeof zToBackendTestConnectionResponsePayload
>;
export type ToBackendTestConnectionResponse = z.infer<
  typeof zToBackendTestConnectionResponse
>;
