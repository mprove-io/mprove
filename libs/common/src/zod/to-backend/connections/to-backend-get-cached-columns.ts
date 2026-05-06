import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zCachedColumn } from '#common/zod/to-backend/connections/cached-column';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGetCachedColumnsRequestPayload = z
  .object({
    projectId: z.string(),
    envId: z.string(),
    columns: z.array(
      z.object({
        connectionId: z.string(),
        schemaName: z.string(),
        tableName: z.string(),
        columnName: z.string()
      })
    )
  })
  .meta({ id: 'ToBackendGetCachedColumnsRequestPayload' });

export let zToBackendGetCachedColumnsRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetCachedColumns)
  })
  .meta({ id: 'ToBackendGetCachedColumnsRequestInfo' });

export let zToBackendGetCachedColumnsRequest = zToBackendRequest
  .extend({
    info: zToBackendGetCachedColumnsRequestInfo,
    payload: zToBackendGetCachedColumnsRequestPayload
  })
  .meta({ id: 'ToBackendGetCachedColumnsRequest' });

export let zToBackendGetCachedColumnsResponsePayload = z
  .object({
    cachedColumns: z.array(zCachedColumn)
  })
  .meta({ id: 'ToBackendGetCachedColumnsResponsePayload' });

export let zToBackendGetCachedColumnsResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendGetCachedColumns}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetCachedColumnsResponseInfo' });

export let zToBackendGetCachedColumnsResponse = zMyResponse
  .extend({
    info: zToBackendGetCachedColumnsResponseInfo,
    payload: zToBackendGetCachedColumnsResponsePayload
  })
  .meta({ id: 'ToBackendGetCachedColumnsResponse' });

export type ToBackendGetCachedColumnsRequestPayload = z.infer<
  typeof zToBackendGetCachedColumnsRequestPayload
>;
export type ToBackendGetCachedColumnsResponse = z.infer<
  typeof zToBackendGetCachedColumnsResponse
>;
export type ToBackendGetCachedColumnsResponsePayload = z.infer<
  typeof zToBackendGetCachedColumnsResponsePayload
>;
