import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGetConnectionSampleRequestPayload = z
  .object({
    projectId: z.string(),
    envId: z.string(),
    connectionId: z.string(),
    schemaName: z.string(),
    tableName: z.string(),
    columnName: z.string().nullish(),
    offset: z.number().nullish()
  })
  .meta({ id: 'ToBackendGetConnectionSampleRequestPayload' });

export let zToBackendGetConnectionSampleRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetConnectionSample)
  })
  .meta({ id: 'ToBackendGetConnectionSampleRequestInfo' });

export let zToBackendGetConnectionSampleRequest = zToBackendRequest
  .extend({
    info: zToBackendGetConnectionSampleRequestInfo,
    payload: zToBackendGetConnectionSampleRequestPayload
  })
  .meta({ id: 'ToBackendGetConnectionSampleRequest' });

export let zToBackendGetConnectionSampleResponsePayload = z
  .object({
    columnNames: z.array(z.string()),
    rows: z.array(z.array(z.string())),
    errorMessage: z.string().nullish()
  })
  .meta({ id: 'ToBackendGetConnectionSampleResponsePayload' });

export let zToBackendGetConnectionSampleResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendGetConnectionSample}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetConnectionSampleResponseInfo' });

export let zToBackendGetConnectionSampleResponse = zMyResponse
  .extend({
    info: zToBackendGetConnectionSampleResponseInfo,
    payload: zToBackendGetConnectionSampleResponsePayload
  })
  .meta({ id: 'ToBackendGetConnectionSampleResponse' });

export type ToBackendGetConnectionSampleRequestPayload = z.infer<
  typeof zToBackendGetConnectionSampleRequestPayload
>;
export type ToBackendGetConnectionSampleRequest = z.infer<
  typeof zToBackendGetConnectionSampleRequest
>;
export type ToBackendGetConnectionSampleResponsePayload = z.infer<
  typeof zToBackendGetConnectionSampleResponsePayload
>;
export type ToBackendGetConnectionSampleResponse = z.infer<
  typeof zToBackendGetConnectionSampleResponse
>;
