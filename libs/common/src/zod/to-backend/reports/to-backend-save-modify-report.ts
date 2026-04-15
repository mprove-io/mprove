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

export let zToBackendSaveModifyReportRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    fromReportId: z.string(),
    modReportId: z.string(),
    title: z.string(),
    accessRoles: z.array(z.string()),
    timezone: z.string(),
    timeSpec: z.enum(TimeSpecEnum),
    timeRangeFractionBrick: z.string(),
    newReportFields: z.array(zReportField),
    chart: zMconfigChart
  })
  .meta({ id: 'ToBackendSaveModifyReportRequestPayload' });

export let zToBackendSaveModifyReportRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendSaveModifyReport)
  })
  .meta({ id: 'ToBackendSaveModifyReportRequestInfo' });

export let zToBackendSaveModifyReportRequest = zToBackendRequest
  .extend({
    info: zToBackendSaveModifyReportRequestInfo,
    payload: zToBackendSaveModifyReportRequestPayload
  })
  .meta({ id: 'ToBackendSaveModifyReportRequest' });

export let zToBackendSaveModifyReportResponsePayload = z
  .object({
    needValidate: z.boolean(),
    struct: zStructX,
    userMember: zMember,
    report: zReportX,
    reportPart: zReportX
  })
  .meta({ id: 'ToBackendSaveModifyReportResponsePayload' });

export let zToBackendSaveModifyReportResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendSaveModifyReport}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendSaveModifyReportResponseInfo' });

export let zToBackendSaveModifyReportResponse = zMyResponse
  .extend({
    info: zToBackendSaveModifyReportResponseInfo,
    payload: zToBackendSaveModifyReportResponsePayload
  })
  .meta({ id: 'ToBackendSaveModifyReportResponse' });

export type ToBackendSaveModifyReportRequestPayload = z.infer<
  typeof zToBackendSaveModifyReportRequestPayload
>;
export type ToBackendSaveModifyReportRequest = z.infer<
  typeof zToBackendSaveModifyReportRequest
>;
export type ToBackendSaveModifyReportResponsePayload = z.infer<
  typeof zToBackendSaveModifyReportResponsePayload
>;
export type ToBackendSaveModifyReportResponse = z.infer<
  typeof zToBackendSaveModifyReportResponse
>;
