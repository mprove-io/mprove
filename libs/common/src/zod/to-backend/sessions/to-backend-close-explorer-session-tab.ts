import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendCloseExplorerSessionTabRequestPayload = z
  .object({
    sessionId: z.string(),
    closedExplorerTabIds: z.array(z.string())
  })
  .meta({ id: 'ToBackendCloseExplorerSessionTabRequestPayload' });

export let zToBackendCloseExplorerSessionTabRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(
      ToBackendRequestInfoNameEnum.ToBackendCloseExplorerSessionTab
    )
  })
  .meta({ id: 'ToBackendCloseExplorerSessionTabRequestInfo' });

export let zToBackendCloseExplorerSessionTabRequest = zToBackendRequest
  .extend({
    info: zToBackendCloseExplorerSessionTabRequestInfo,
    payload: zToBackendCloseExplorerSessionTabRequestPayload
  })
  .meta({ id: 'ToBackendCloseExplorerSessionTabRequest' });

export let zToBackendCloseExplorerSessionTabResponsePayload = z
  .object({})
  .meta({ id: 'ToBackendCloseExplorerSessionTabResponsePayload' });

export let zToBackendCloseExplorerSessionTabResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendCloseExplorerSessionTab}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendCloseExplorerSessionTabResponseInfo' });

export let zToBackendCloseExplorerSessionTabResponse = zMyResponse
  .extend({
    info: zToBackendCloseExplorerSessionTabResponseInfo,
    payload: zToBackendCloseExplorerSessionTabResponsePayload
  })
  .meta({ id: 'ToBackendCloseExplorerSessionTabResponse' });

export type ToBackendCloseExplorerSessionTabRequestPayload = z.infer<
  typeof zToBackendCloseExplorerSessionTabRequestPayload
>;
export type ToBackendCloseExplorerSessionTabRequest = z.infer<
  typeof zToBackendCloseExplorerSessionTabRequest
>;
export type ToBackendCloseExplorerSessionTabResponsePayload = z.infer<
  typeof zToBackendCloseExplorerSessionTabResponsePayload
>;
export type ToBackendCloseExplorerSessionTabResponse = z.infer<
  typeof zToBackendCloseExplorerSessionTabResponse
>;
