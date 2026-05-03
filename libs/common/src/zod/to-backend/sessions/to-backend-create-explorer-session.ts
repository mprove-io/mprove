import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendCreateExplorerSessionRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    provider: z.string(),
    model: z.string(),
    variant: z.string(),
    branchId: z.string(),
    envId: z.string(),
    firstMessage: z.string().nullish(),
    messageId: z.string(),
    partId: z.string(),
    useCodex: z.boolean()
  })
  .meta({ id: 'ToBackendCreateExplorerSessionRequestPayload' });

export let zToBackendCreateExplorerSessionRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendCreateExplorerSession)
  })
  .meta({ id: 'ToBackendCreateExplorerSessionRequestInfo' });

export let zToBackendCreateExplorerSessionRequest = zToBackendRequest
  .extend({
    info: zToBackendCreateExplorerSessionRequestInfo,
    payload: zToBackendCreateExplorerSessionRequestPayload
  })
  .meta({ id: 'ToBackendCreateExplorerSessionRequest' });

export let zToBackendCreateExplorerSessionResponsePayload = z
  .object({
    sessionId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string()
  })
  .meta({ id: 'ToBackendCreateExplorerSessionResponsePayload' });

export let zToBackendCreateExplorerSessionResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendCreateExplorerSession}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendCreateExplorerSessionResponseInfo' });

export let zToBackendCreateExplorerSessionResponse = zMyResponse
  .extend({
    info: zToBackendCreateExplorerSessionResponseInfo,
    payload: zToBackendCreateExplorerSessionResponsePayload
  })
  .meta({ id: 'ToBackendCreateExplorerSessionResponse' });

export type ToBackendCreateExplorerSessionRequestPayload = z.infer<
  typeof zToBackendCreateExplorerSessionRequestPayload
>;
export type ToBackendCreateExplorerSessionRequest = z.infer<
  typeof zToBackendCreateExplorerSessionRequest
>;
export type ToBackendCreateExplorerSessionResponsePayload = z.infer<
  typeof zToBackendCreateExplorerSessionResponsePayload
>;
export type ToBackendCreateExplorerSessionResponse = z.infer<
  typeof zToBackendCreateExplorerSessionResponse
>;
