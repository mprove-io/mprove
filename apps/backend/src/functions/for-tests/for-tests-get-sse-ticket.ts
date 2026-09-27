import { sendToBackend } from '#backend/functions/send-to-backend';
import { makeId } from '#common/functions/make-id/make-id';
import { unwrapToBackendResponse } from '#common/functions/unwrap-to-backend-response/unwrap-to-backend-response';

export async function forTestsGetSseTicket(item: {
  httpServer: any;
  loginToken: string;
  traceId: string;
  sessionId: string;
}): Promise<string> {
  let resp = await sendToBackend({
    route: 'api/ToBackendCreateSessionSseTicket',
    httpServer: item.httpServer,
    loginToken: item.loginToken,
    req: {
      traceId: item.traceId,
      idempotencyKey: makeId(),
      input: {
        sessionId: item.sessionId
      }
    },
    checkIsOk: true
  });

  return unwrapToBackendResponse({ response: resp }).sseTicket;
}
