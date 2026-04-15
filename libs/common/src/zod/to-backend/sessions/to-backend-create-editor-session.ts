import { z } from 'zod';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendCreateEditorSessionRequestPayload = z
  .object({
    projectId: z.string(),
    sandboxType: z.enum(SandboxTypeEnum),
    provider: z.string(),
    model: z.string(),
    agent: z.string(),
    variant: z.string(),
    envId: z.string(),
    initialBranch: z.string(),
    firstMessage: z.string().nullish(),
    messageId: z.string(),
    partId: z.string(),
    useCodex: z.boolean()
  })
  .meta({ id: 'ToBackendCreateEditorSessionRequestPayload' });

export let zToBackendCreateEditorSessionRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendCreateEditorSession)
  })
  .meta({ id: 'ToBackendCreateEditorSessionRequestInfo' });

export let zToBackendCreateEditorSessionRequest = zToBackendRequest
  .extend({
    info: zToBackendCreateEditorSessionRequestInfo,
    payload: zToBackendCreateEditorSessionRequestPayload
  })
  .meta({ id: 'ToBackendCreateEditorSessionRequest' });

export let zToBackendCreateEditorSessionResponsePayload = z
  .object({
    sessionId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string()
  })
  .meta({ id: 'ToBackendCreateEditorSessionResponsePayload' });

export let zToBackendCreateEditorSessionResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendCreateEditorSession}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendCreateEditorSessionResponseInfo' });

export let zToBackendCreateEditorSessionResponse = zMyResponse
  .extend({
    info: zToBackendCreateEditorSessionResponseInfo,
    payload: zToBackendCreateEditorSessionResponsePayload
  })
  .meta({ id: 'ToBackendCreateEditorSessionResponse' });

export type ToBackendCreateEditorSessionRequestPayload = z.infer<
  typeof zToBackendCreateEditorSessionRequestPayload
>;
export type ToBackendCreateEditorSessionRequest = z.infer<
  typeof zToBackendCreateEditorSessionRequest
>;
export type ToBackendCreateEditorSessionResponsePayload = z.infer<
  typeof zToBackendCreateEditorSessionResponsePayload
>;
export type ToBackendCreateEditorSessionResponse = z.infer<
  typeof zToBackendCreateEditorSessionResponse
>;
