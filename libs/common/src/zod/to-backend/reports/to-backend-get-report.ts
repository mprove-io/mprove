import { z } from 'zod';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMember } from '#common/zod/backend/member';
import { zReportX } from '#common/zod/backend/report-x';
import { zStructX } from '#common/zod/backend/struct-x';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';
import { zTimezone } from '#common/zod/z-timezone';

export let zToBackendGetReportRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    reportId: z.string(),
    timezone: zTimezone,
    timeSpec: z.enum(TimeSpecEnum),
    timeRangeFractionBrick: z.string()
  })
  .meta({ id: 'ToBackendGetReportRequestPayload' });

export let zToBackendGetReportRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetReport)
  })
  .meta({ id: 'ToBackendGetReportRequestInfo' });

export let zToBackendGetReportRequest = zToBackendRequest
  .extend({
    info: zToBackendGetReportRequestInfo,
    payload: zToBackendGetReportRequestPayload
  })
  .meta({ id: 'ToBackendGetReportRequest' });

export let zToBackendGetReportResponsePayload = z
  .object({
    needValidate: z.boolean(),
    struct: zStructX,
    userMember: zMember,
    report: zReportX
  })
  .meta({ id: 'ToBackendGetReportResponsePayload' });

export let zToBackendGetReportResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendGetReport}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetReportResponseInfo' });

export let zToBackendGetReportResponse = zMyResponse
  .extend({
    info: zToBackendGetReportResponseInfo,
    payload: zToBackendGetReportResponsePayload
  })
  .meta({ id: 'ToBackendGetReportResponse' });

export type ToBackendGetReportRequestPayload = z.infer<
  typeof zToBackendGetReportRequestPayload
>;
export type ToBackendGetReportRequest = z.infer<
  typeof zToBackendGetReportRequest
>;
export type ToBackendGetReportResponsePayload = z.infer<
  typeof zToBackendGetReportResponsePayload
>;
export type ToBackendGetReportResponse = z.infer<
  typeof zToBackendGetReportResponse
>;
