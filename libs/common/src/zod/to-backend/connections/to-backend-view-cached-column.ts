import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zCachedColumn } from '#common/zod/to-backend/connections/cached-column';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendViewCachedColumnRequestPayload = z
  .object({
    projectId: z.string(),
    envId: z.string(),
    connectionId: z.string(),
    schemaName: z.string(),
    tableName: z.string(),
    columnName: z.string(),
    offset: z.number()
  })
  .meta({
    id: 'ToBackendViewCachedColumnRequestPayload'
  });

export let zToBackendViewCachedColumnRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendViewCachedColumn)
  })
  .meta({ id: 'ToBackendViewCachedColumnRequestInfo' });

export let zToBackendViewCachedColumnRequest = zToBackendRequest
  .extend({
    info: zToBackendViewCachedColumnRequestInfo,
    payload: zToBackendViewCachedColumnRequestPayload
  })
  .meta({ id: 'ToBackendViewCachedColumnRequest' });

export let zToBackendViewCachedColumnResponsePayload = z
  .object({
    cachedColumn: zCachedColumn.nullish(),
    columnNames: z.array(z.string()),
    rows: z.array(z.array(z.string())),
    errorMessage: z.string().nullish()
  })
  .meta({ id: 'ToBackendViewCachedColumnResponsePayload' });

export let zToBackendViewCachedColumnResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendViewCachedColumn}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendViewCachedColumnResponseInfo' });

export let zToBackendViewCachedColumnResponse = zMyResponse
  .extend({
    info: zToBackendViewCachedColumnResponseInfo,
    payload: zToBackendViewCachedColumnResponsePayload
  })
  .meta({ id: 'ToBackendViewCachedColumnResponse' });

export type ToBackendViewCachedColumnRequestPayload = z.infer<
  typeof zToBackendViewCachedColumnRequestPayload
>;
export type ToBackendViewCachedColumnRequest = z.infer<
  typeof zToBackendViewCachedColumnRequest
>;
export type ToBackendViewCachedColumnResponsePayload = z.infer<
  typeof zToBackendViewCachedColumnResponsePayload
>;
export type ToBackendViewCachedColumnResponse = z.infer<
  typeof zToBackendViewCachedColumnResponse
>;
