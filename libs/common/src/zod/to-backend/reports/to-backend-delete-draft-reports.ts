import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendDeleteDraftReportsRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    reportIds: z.array(z.string())
  })
  .meta({ id: 'ToBackendDeleteDraftReportsRequestPayload' });

export let zToBackendDeleteDraftReportsRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendDeleteDraftReports)
  })
  .meta({ id: 'ToBackendDeleteDraftReportsRequestInfo' });

export let zToBackendDeleteDraftReportsRequest = zToBackendRequest
  .extend({
    info: zToBackendDeleteDraftReportsRequestInfo,
    payload: zToBackendDeleteDraftReportsRequestPayload
  })
  .meta({ id: 'ToBackendDeleteDraftReportsRequest' });

export let zToBackendDeleteDraftReportsResponsePayload = z
  .object({})
  .meta({ id: 'ToBackendDeleteDraftReportsResponsePayload' });

export let zToBackendDeleteDraftReportsResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendDeleteDraftReports}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendDeleteDraftReportsResponseInfo' });

export let zToBackendDeleteDraftReportsResponse = zMyResponse
  .extend({
    info: zToBackendDeleteDraftReportsResponseInfo,
    payload: zToBackendDeleteDraftReportsResponsePayload
  })
  .meta({ id: 'ToBackendDeleteDraftReportsResponse' });

export type ToBackendDeleteDraftReportsRequestPayload = z.infer<
  typeof zToBackendDeleteDraftReportsRequestPayload
>;
export type ToBackendDeleteDraftReportsRequest = z.infer<
  typeof zToBackendDeleteDraftReportsRequest
>;
export type ToBackendDeleteDraftReportsResponsePayload = z.infer<
  typeof zToBackendDeleteDraftReportsResponsePayload
>;
export type ToBackendDeleteDraftReportsResponse = z.infer<
  typeof zToBackendDeleteDraftReportsResponse
>;
