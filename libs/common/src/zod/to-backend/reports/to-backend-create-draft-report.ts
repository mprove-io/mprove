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

export let zToBackendCreateDraftReportRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    fromReportId: z.string(),
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
  .meta({ id: 'ToBackendCreateDraftReportRequestPayload' });

export let zToBackendCreateDraftReportRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendCreateDraftReport)
  })
  .meta({ id: 'ToBackendCreateDraftReportRequestInfo' });

export let zToBackendCreateDraftReportRequest = zToBackendRequest
  .extend({
    info: zToBackendCreateDraftReportRequestInfo,
    payload: zToBackendCreateDraftReportRequestPayload
  })
  .meta({ id: 'ToBackendCreateDraftReportRequest' });

export let zToBackendCreateDraftReportResponsePayload = z
  .object({
    needValidate: z.boolean(),
    struct: zStructX,
    userMember: zMember,
    report: zReportX
  })
  .meta({ id: 'ToBackendCreateDraftReportResponsePayload' });

export let zToBackendCreateDraftReportResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendCreateDraftReport}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendCreateDraftReportResponseInfo' });

export let zToBackendCreateDraftReportResponse = zMyResponse
  .extend({
    info: zToBackendCreateDraftReportResponseInfo,
    payload: zToBackendCreateDraftReportResponsePayload
  })
  .meta({ id: 'ToBackendCreateDraftReportResponse' });

export type ToBackendCreateDraftReportRequestPayload = z.infer<
  typeof zToBackendCreateDraftReportRequestPayload
>;
export type ToBackendCreateDraftReportRequest = z.infer<
  typeof zToBackendCreateDraftReportRequest
>;
export type ToBackendCreateDraftReportResponsePayload = z.infer<
  typeof zToBackendCreateDraftReportResponsePayload
>;
export type ToBackendCreateDraftReportResponse = z.infer<
  typeof zToBackendCreateDraftReportResponse
>;
