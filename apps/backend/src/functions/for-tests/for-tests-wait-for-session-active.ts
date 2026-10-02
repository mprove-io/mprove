import { sendToBackend } from '#backend/functions/send-to-backend';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { makeId } from '#common/functions/make-id/make-id';
import { unwrapBackendResponseOutput } from '#common/functions/unwrap-backend-response-output/unwrap-backend-response-output';
import type { ToBackendGetSessionOutput } from '#common/types/backend/routes/sessions/get-session/get-session-output';

export async function forTestsWaitForSessionActive(item: {
  httpServer: any;
  loginToken: string;
  traceId: string;
  sessionId: string;
  maxRetries?: number;
}): Promise<void> {
  let maxRetries = item.maxRetries ?? 60;

  for (let i = 0; i < maxRetries; i++) {
    let resp = await sendToBackend({
      route: 'api/ToBackendGetSession',
      httpServer: item.httpServer,
      loginToken: item.loginToken,
      req: {
        operation: 'getSession',
        traceId: item.traceId,
        idempotencyKey: makeId(),
        input: {
          sessionId: item.sessionId,
          isFetchFromOpencode: false
        }
      },
      checkIsOk: true
    });

    let output: ToBackendGetSessionOutput = unwrapBackendResponseOutput({
      response: resp
    });

    if (output.session.status === SessionStatusEnum.Active) {
      return;
    }

    if (output.session.status === SessionStatusEnum.Error) {
      throw new Error(
        `forTestsWaitForSessionActive: session ${item.sessionId} entered Error status`
      );
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  throw new Error(
    `forTestsWaitForSessionActive: timed out after ${maxRetries}s waiting for session ${item.sessionId} to become Active`
  );
}
