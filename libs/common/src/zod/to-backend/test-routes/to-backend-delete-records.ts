import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendDeleteRecordsRequestPayload = z
  .object({
    emails: z.array(z.string()).nullish(),
    orgNames: z.array(z.string()).nullish(),
    orgIds: z.array(z.string()).nullish(),
    projectNames: z.array(z.string()).nullish(),
    projectIds: z.array(z.string()).nullish()
  })
  .meta({ id: 'ToBackendDeleteRecordsRequestPayload' });

export let zToBackendDeleteRecordsRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendDeleteRecords)
  })
  .meta({ id: 'ToBackendDeleteRecordsRequestInfo' });

export let zToBackendDeleteRecordsRequest = zToBackendRequest
  .extend({
    info: zToBackendDeleteRecordsRequestInfo,
    payload: zToBackendDeleteRecordsRequestPayload
  })
  .meta({ id: 'ToBackendDeleteRecordsRequest' });

export let zToBackendDeleteRecordsResponsePayload = z
  .object({})
  .meta({ id: 'ToBackendDeleteRecordsResponsePayload' });

export let zToBackendDeleteRecordsResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendDeleteRecords}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendDeleteRecordsResponseInfo' });

export let zToBackendDeleteRecordsResponse = zMyResponse
  .extend({
    info: zToBackendDeleteRecordsResponseInfo,
    payload: zToBackendDeleteRecordsResponsePayload
  })
  .meta({ id: 'ToBackendDeleteRecordsResponse' });

export type ToBackendDeleteRecordsRequestPayload = z.infer<
  typeof zToBackendDeleteRecordsRequestPayload
>;
export type ToBackendDeleteRecordsRequest = z.infer<
  typeof zToBackendDeleteRecordsRequest
>;
export type ToBackendDeleteRecordsResponsePayload = z.infer<
  typeof zToBackendDeleteRecordsResponsePayload
>;
export type ToBackendDeleteRecordsResponse = z.infer<
  typeof zToBackendDeleteRecordsResponse
>;
