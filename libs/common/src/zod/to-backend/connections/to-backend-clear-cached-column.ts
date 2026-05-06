import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendClearCachedColumnRequestPayload = z
  .object({
    projectId: z.string(),
    envId: z.string(),
    connectionId: z.string(),
    schemaName: z.string(),
    tableName: z.string(),
    columnName: z.string()
  })
  .meta({
    id: 'ToBackendClearCachedColumnRequestPayload'
  });

export let zToBackendClearCachedColumnRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendClearCachedColumn)
  })
  .meta({ id: 'ToBackendClearCachedColumnRequestInfo' });

export let zToBackendClearCachedColumnRequest = zToBackendRequest
  .extend({
    info: zToBackendClearCachedColumnRequestInfo,
    payload: zToBackendClearCachedColumnRequestPayload
  })
  .meta({ id: 'ToBackendClearCachedColumnRequest' });

export let zToBackendClearCachedColumnResponsePayload = z
  .object({})
  .meta({ id: 'ToBackendClearCachedColumnResponsePayload' });

export let zToBackendClearCachedColumnResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendClearCachedColumn}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendClearCachedColumnResponseInfo' });

export let zToBackendClearCachedColumnResponse = zMyResponse
  .extend({
    info: zToBackendClearCachedColumnResponseInfo,
    payload: zToBackendClearCachedColumnResponsePayload
  })
  .meta({ id: 'ToBackendClearCachedColumnResponse' });

export type ToBackendClearCachedColumnRequestPayload = z.infer<
  typeof zToBackendClearCachedColumnRequestPayload
>;
export type ToBackendClearCachedColumnResponse = z.infer<
  typeof zToBackendClearCachedColumnResponse
>;
