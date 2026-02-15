import { sendToBackend } from '#backend/functions/send-to-backend';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import type { ToBackendGetAgentSessionResponse } from '#common/interfaces/to-backend/agent/to-backend-get-agent-session';

export async function forTestsWaitForSessionActive(item: {
  httpServer: any;
  loginToken: string;
  traceId: string;
  sessionId: string;
  maxRetries?: number;
}): Promise<void> {
  let maxRetries = item.maxRetries ?? 60;

  for (let i = 0; i < maxRetries; i++) {
    let resp = await sendToBackend<ToBackendGetAgentSessionResponse>({
      httpServer: item.httpServer,
      loginToken: item.loginToken,
      req: {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendGetAgentSession,
          traceId: item.traceId,
          idempotencyKey: makeId()
        },
        payload: {
          sessionId: item.sessionId
        }
      },
      checkIsOk: true
    });

    if (resp.payload.session.status === SessionStatusEnum.Active) {
      return;
    }

    if (resp.payload.session.status === SessionStatusEnum.Error) {
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
