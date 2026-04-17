import { z } from 'zod';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMember } from '#common/zod/backend/member';
import { zReportX } from '#common/zod/backend/report-x';
import { zStructX } from '#common/zod/backend/struct-x';
import { zMconfigChart } from '#common/zod/blockml/mconfig-chart';
import { zReportField } from '#common/zod/blockml/report-field';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';
import { zTimezone } from '#common/zod/z-timezone';

export let zToBackendSaveCreateReportRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    fromReportId: z.string(),
    newReportId: z.string(),
    title: z.string(),
    accessRoles: z.array(z.string()),
    timezone: zTimezone,
    timeSpec: z.enum(TimeSpecEnum),
    timeRangeFractionBrick: z.string(),
    newReportFields: z.array(zReportField),
    chart: zMconfigChart
  })
  .meta({ id: 'ToBackendSaveCreateReportRequestPayload' });

export let zToBackendSaveCreateReportRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendSaveCreateReport)
  })
  .meta({ id: 'ToBackendSaveCreateReportRequestInfo' });

export let zToBackendSaveCreateReportRequest = zToBackendRequest
  .extend({
    info: zToBackendSaveCreateReportRequestInfo,
    payload: zToBackendSaveCreateReportRequestPayload
  })
  .meta({ id: 'ToBackendSaveCreateReportRequest' });

export let zToBackendSaveCreateReportResponsePayload = z
  .object({
    needValidate: z.boolean(),
    struct: zStructX,
    userMember: zMember,
    report: zReportX,
    reportPart: zReportX
  })
  .meta({ id: 'ToBackendSaveCreateReportResponsePayload' });

export let zToBackendSaveCreateReportResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendSaveCreateReport}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendSaveCreateReportResponseInfo' });

export let zToBackendSaveCreateReportResponse = zMyResponse
  .extend({
    info: zToBackendSaveCreateReportResponseInfo,
    payload: zToBackendSaveCreateReportResponsePayload
  })
  .meta({ id: 'ToBackendSaveCreateReportResponse' });

export type ToBackendSaveCreateReportRequestPayload = z.infer<
  typeof zToBackendSaveCreateReportRequestPayload
>;
export type ToBackendSaveCreateReportRequest = z.infer<
  typeof zToBackendSaveCreateReportRequest
>;
export type ToBackendSaveCreateReportResponsePayload = z.infer<
  typeof zToBackendSaveCreateReportResponsePayload
>;
export type ToBackendSaveCreateReportResponse = z.infer<
  typeof zToBackendSaveCreateReportResponse
>;
