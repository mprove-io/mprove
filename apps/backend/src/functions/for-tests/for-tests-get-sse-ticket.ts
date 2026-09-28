import { sendToBackend } from '#backend/functions/send-to-backend';
import { makeId } from '#common/functions/make-id/make-id';
import { unwrapBackendResponseOutput } from '#common/functions/unwrap-backend-response-output/unwrap-backend-response-output';

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
      operation: 'createSessionSseTicket',
      traceId: item.traceId,
      idempotencyKey: makeId(),
      input: {
        sessionId: item.sessionId
      }
    },
    checkIsOk: true
  });

  return unwrapBackendResponseOutput({ response: resp }).sseTicket;
}
