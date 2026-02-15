import { sendToBackend } from '#backend/functions/send-to-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import type { ToBackendCreateAgentSseTicketResponse } from '#common/interfaces/to-backend/agent/to-backend-create-agent-sse-ticket';

export async function forTestsGetSseTicket(item: {
  httpServer: any;
  loginToken: string;
  traceId: string;
  sessionId: string;
}): Promise<string> {
  let resp = await sendToBackend<ToBackendCreateAgentSseTicketResponse>({
    httpServer: item.httpServer,
    loginToken: item.loginToken,
    req: {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendCreateAgentSseTicket,
        traceId: item.traceId,
        idempotencyKey: makeId()
      },
      payload: {
        sessionId: item.sessionId
      }
    },
    checkIsOk: true
  });

  return resp.payload.sseTicket;
}
