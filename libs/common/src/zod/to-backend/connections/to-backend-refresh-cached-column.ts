import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zCachedColumn } from '#common/zod/to-backend/connections/cached-column';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendRefreshCachedColumnRequestPayload = z
  .object({
    projectId: z.string(),
    envId: z.string(),
    connectionId: z.string(),
    schemaName: z.string(),
    tableName: z.string(),
    columnName: z.string(),
    refreshType: z.enum(['full', 'sample']),
    sampleSize: z.number().nullish()
  })
  .meta({ id: 'ToBackendRefreshCachedColumnRequestPayload' });

export let zToBackendRefreshCachedColumnRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendRefreshCachedColumn)
  })
  .meta({ id: 'ToBackendRefreshCachedColumnRequestInfo' });

export let zToBackendRefreshCachedColumnRequest = zToBackendRequest
  .extend({
    info: zToBackendRefreshCachedColumnRequestInfo,
    payload: zToBackendRefreshCachedColumnRequestPayload
  })
  .meta({ id: 'ToBackendRefreshCachedColumnRequest' });

export let zToBackendRefreshCachedColumnResponsePayload = z
  .object({
    cachedColumn: zCachedColumn.nullish()
  })
  .meta({ id: 'ToBackendRefreshCachedColumnResponsePayload' });

export let zToBackendRefreshCachedColumnResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendRefreshCachedColumn}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendRefreshCachedColumnResponseInfo' });

export let zToBackendRefreshCachedColumnResponse = zMyResponse
  .extend({
    info: zToBackendRefreshCachedColumnResponseInfo,
    payload: zToBackendRefreshCachedColumnResponsePayload
  })
  .meta({ id: 'ToBackendRefreshCachedColumnResponse' });

export type ToBackendRefreshCachedColumnRequestPayload = z.infer<
  typeof zToBackendRefreshCachedColumnRequestPayload
>;
export type ToBackendRefreshCachedColumnResponse = z.infer<
  typeof zToBackendRefreshCachedColumnResponse
>;
