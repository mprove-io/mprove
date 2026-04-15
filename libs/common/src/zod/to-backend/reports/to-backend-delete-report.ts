import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendDeleteReportRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    reportId: z.string()
  })
  .meta({ id: 'ToBackendDeleteReportRequestPayload' });

export let zToBackendDeleteReportRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendDeleteReport)
  })
  .meta({ id: 'ToBackendDeleteReportRequestInfo' });

export let zToBackendDeleteReportRequest = zToBackendRequest
  .extend({
    info: zToBackendDeleteReportRequestInfo,
    payload: zToBackendDeleteReportRequestPayload
  })
  .meta({ id: 'ToBackendDeleteReportRequest' });

export let zToBackendDeleteReportResponsePayload = z
  .object({})
  .meta({ id: 'ToBackendDeleteReportResponsePayload' });

export let zToBackendDeleteReportResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendDeleteReport}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendDeleteReportResponseInfo' });

export let zToBackendDeleteReportResponse = zMyResponse
  .extend({
    info: zToBackendDeleteReportResponseInfo,
    payload: zToBackendDeleteReportResponsePayload
  })
  .meta({ id: 'ToBackendDeleteReportResponse' });

export type ToBackendDeleteReportRequestPayload = z.infer<
  typeof zToBackendDeleteReportRequestPayload
>;
export type ToBackendDeleteReportRequest = z.infer<
  typeof zToBackendDeleteReportRequest
>;
export type ToBackendDeleteReportResponsePayload = z.infer<
  typeof zToBackendDeleteReportResponsePayload
>;
export type ToBackendDeleteReportResponse = z.infer<
  typeof zToBackendDeleteReportResponse
>;
