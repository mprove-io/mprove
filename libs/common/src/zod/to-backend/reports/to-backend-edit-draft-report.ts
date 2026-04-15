import { z } from 'zod';
import { ChangeTypeEnum } from '#common/enums/change-type.enum';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMember } from '#common/zod/backend/member';
import { zReportX } from '#common/zod/backend/report-x';
import { zStructX } from '#common/zod/backend/struct-x';
import { zListener } from '#common/zod/blockml/listener';
import { zMconfigChart } from '#common/zod/blockml/mconfig-chart';
import { zReportField } from '#common/zod/blockml/report-field';
import { zRowChange } from '#common/zod/blockml/row-change';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendEditDraftReportRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    reportId: z.string(),
    changeType: z.enum(ChangeTypeEnum),
    rowChange: zRowChange.nullish(),
    rowIds: z.array(z.string()).nullish(),
    timezone: z.string(),
    timeSpec: z.enum(TimeSpecEnum),
    timeRangeFractionBrick: z.string(),
    newReportFields: z.array(zReportField),
    listeners: z.array(zListener).nullish(),
    chart: zMconfigChart
  })
  .meta({ id: 'ToBackendEditDraftReportRequestPayload' });

export let zToBackendEditDraftReportRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendEditDraftReport)
  })
  .meta({ id: 'ToBackendEditDraftReportRequestInfo' });

export let zToBackendEditDraftReportRequest = zToBackendRequest
  .extend({
    info: zToBackendEditDraftReportRequestInfo,
    payload: zToBackendEditDraftReportRequestPayload
  })
  .meta({ id: 'ToBackendEditDraftReportRequest' });

export let zToBackendEditDraftReportResponsePayload = z
  .object({
    needValidate: z.boolean(),
    struct: zStructX,
    userMember: zMember,
    report: zReportX
  })
  .meta({ id: 'ToBackendEditDraftReportResponsePayload' });

export let zToBackendEditDraftReportResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendEditDraftReport}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendEditDraftReportResponseInfo' });

export let zToBackendEditDraftReportResponse = zMyResponse
  .extend({
    info: zToBackendEditDraftReportResponseInfo,
    payload: zToBackendEditDraftReportResponsePayload
  })
  .meta({ id: 'ToBackendEditDraftReportResponse' });

export type ToBackendEditDraftReportRequestPayload = z.infer<
  typeof zToBackendEditDraftReportRequestPayload
>;
export type ToBackendEditDraftReportRequest = z.infer<
  typeof zToBackendEditDraftReportRequest
>;
export type ToBackendEditDraftReportResponsePayload = z.infer<
  typeof zToBackendEditDraftReportResponsePayload
>;
export type ToBackendEditDraftReportResponse = z.infer<
  typeof zToBackendEditDraftReportResponse
>;
