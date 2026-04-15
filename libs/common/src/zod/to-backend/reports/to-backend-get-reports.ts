import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMember } from '#common/zod/backend/member';
import { zModelX } from '#common/zod/backend/model-x';
import { zReportX } from '#common/zod/backend/report-x';
import { zStructX } from '#common/zod/backend/struct-x';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGetReportsRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string()
  })
  .meta({ id: 'ToBackendGetReportsRequestPayload' });

export let zToBackendGetReportsRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetReports)
  })
  .meta({ id: 'ToBackendGetReportsRequestInfo' });

export let zToBackendGetReportsRequest = zToBackendRequest
  .extend({
    info: zToBackendGetReportsRequestInfo,
    payload: zToBackendGetReportsRequestPayload
  })
  .meta({ id: 'ToBackendGetReportsRequest' });

export let zToBackendGetReportsResponsePayload = z
  .object({
    needValidate: z.boolean(),
    struct: zStructX,
    userMember: zMember,
    reports: z.array(zReportX),
    storeModels: z.array(zModelX)
  })
  .meta({ id: 'ToBackendGetReportsResponsePayload' });

export let zToBackendGetReportsResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendGetReports}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetReportsResponseInfo' });

export let zToBackendGetReportsResponse = zMyResponse
  .extend({
    info: zToBackendGetReportsResponseInfo,
    payload: zToBackendGetReportsResponsePayload
  })
  .meta({ id: 'ToBackendGetReportsResponse' });

export type ToBackendGetReportsRequestPayload = z.infer<
  typeof zToBackendGetReportsRequestPayload
>;
export type ToBackendGetReportsRequest = z.infer<
  typeof zToBackendGetReportsRequest
>;
export type ToBackendGetReportsResponsePayload = z.infer<
  typeof zToBackendGetReportsResponsePayload
>;
export type ToBackendGetReportsResponse = z.infer<
  typeof zToBackendGetReportsResponse
>;
