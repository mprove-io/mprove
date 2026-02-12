import test from 'ava';
import { forTestsConnectSse } from '#backend/functions/for-tests-connect-sse';
import { forTestsExtractDialogLines } from '#backend/functions/for-tests-extract-dialog-lines';
import { forTestsInspectUi } from '#backend/functions/for-tests-inspect-ui';
import { forTestsWaitForTurnEnded } from '#backend/functions/for-tests-wait-for-turn-ended';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import { Prep } from '#backend/interfaces/prep';
import type { AgentEvent } from '#backend/services/agent.service';
import { BRANCH_MAIN } from '#common/constants/top';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import {
  ToBackendCreateAgentSessionRequest,
  ToBackendCreateAgentSessionResponse
} from '#common/interfaces/to-backend/agent/to-backend-create-agent-session';
import {
  ToBackendDeleteAgentSessionRequest,
  ToBackendDeleteAgentSessionResponse
} from '#common/interfaces/to-backend/agent/to-backend-delete-agent-session';
import {
  ToBackendSendAgentMessageRequest,
  ToBackendSendAgentMessageResponse
} from '#common/interfaces/to-backend/agent/to-backend-send-agent-message';

let inspectUI: boolean = false;
let suppressAcpSdkNoise: boolean = false;

let testId = 'backend-create-agent-session__ok-codex';

let traceId = testId;

let email = `${testId}@example.com`;
let userId = makeId();
let password = '123456';

let orgId = testId;
let orgName = testId;

let projectId = makeId();
let projectName = testId;

let prep: Prep;

test('1', async t => {
  if (inspectUI) {
    t.timeout(35 * 60 * 1000); // 35 minutes for inspection mode
  }

  let e2bApiKey = process.env.BACKEND_DEMO_PROJECT_E2B_API_KEY;
  let zenApiKey = process.env.BACKEND_DEMO_PROJECT_ZEN_API_KEY;
  let anthropicApiKey = process.env.BACKEND_DEMO_PROJECT_ANTHROPIC_API_KEY;
  let openaiApiKey = process.env.BACKEND_DEMO_PROJECT_OPENAI_API_KEY;

  if (!e2bApiKey || !openaiApiKey) {
    t.pass(
      'Skipped: BACKEND_DEMO_PROJECT_E2B_API_KEY or BACKEND_DEMO_PROJECT_OPENAI_API_KEY not set'
    );
    return;
  }

  let sessionId: string | undefined;
  let sse: { events: AgentEvent[]; close: () => void } | undefined;
  let testError: unknown;
  let createSessionResp: ToBackendCreateAgentSessionResponse;
  let sendFirstMessageResp: ToBackendSendAgentMessageResponse;
  let sendMessageResp: ToBackendSendAgentMessageResponse;

  // Suppress known ACP SDK noise: "Got response to unknown request"
  let originalConsoleError = console.error;

  if (suppressAcpSdkNoise) {
    console.error = (...args: unknown[]) => {
      if (
        typeof args[0] === 'string' &&
        args[0].startsWith('Got response to unknown request')
      ) {
        return;
      }
      originalConsoleError.apply(console, args);
    };
  }

  try {
    prep = await prepareTestAndSeed({
      traceId: traceId,
      deleteRecordsPayload: {
        emails: [email],
        orgIds: [orgId],
        projectIds: [projectId],
        projectNames: [projectName]
      },
      seedRecordsPayload: {
        users: [
          {
            email,
            password,
            isEmailVerified: true
          }
        ],
        orgs: [
          {
            orgId: orgId,
            ownerEmail: email,
            name: orgName
          }
        ],
        projects: [
          {
            orgId,
            projectId,
            name: projectName,
            remoteType: ProjectRemoteTypeEnum.Managed,
            defaultBranch: BRANCH_MAIN,
            e2bApiKey: e2bApiKey,
            zenApiKey: zenApiKey,
            anthropicApiKey: anthropicApiKey,
            openaiApiKey: openaiApiKey
          }
        ],
        members: [
          {
            memberId: userId,
            email,
            projectId,
            isAdmin: true,
            isEditor: true,
            isExplorer: true
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    // Create agent session without firstMessage to avoid race condition:
    // SSE must be connected before messages are sent, otherwise events
    // published to Redis pub/sub before SSE subscription are lost.
    let createSessionReq: ToBackendCreateAgentSessionRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendCreateAgentSession,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        projectId: projectId,
        sandboxType: SandboxTypeEnum.E2B,
        agent: 'codex',
        model: 'gpt-5.1-codex-mini',
        agentMode: 'plan',
        permissionMode: 'default'
      }
    };

    createSessionResp =
      await sendToBackend<ToBackendCreateAgentSessionResponse>({
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: createSessionReq,
        checkIsOk: true
      });

    sessionId = createSessionResp.payload.sessionId;

    // Start listening so EventSource can connect
    await new Promise<void>(resolve => {
      prep.httpServer.listen(0, () => resolve());
    });

    // Connect SSE before sending any messages
    sse = await forTestsConnectSse({
      httpServer: prep.httpServer,
      sessionId: sessionId,
      ticket: createSessionResp.payload.sseTicket
    });

    // Send 1st message (after SSE is connected)
    let sendFirstMessageReq: ToBackendSendAgentMessageRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendSendAgentMessage,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        sessionId: sessionId,
        message: 'hello'
      }
    };

    sendFirstMessageResp =
      await sendToBackend<ToBackendSendAgentMessageResponse>({
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: sendFirstMessageReq,
        checkIsOk: true
      });

    // Wait for 1st turn to complete
    await forTestsWaitForTurnEnded({
      events: sse.events,
      count: 1,
      maxRetries: 40
    });

    // Send 2nd message
    let sendMessageReq: ToBackendSendAgentMessageRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendSendAgentMessage,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        sessionId: sessionId,
        message: 'what is 2 + 2?'
      }
    };

    sendMessageResp = await sendToBackend<ToBackendSendAgentMessageResponse>({
      httpServer: prep.httpServer,
      loginToken: prep.loginToken,
      req: sendMessageReq,
      checkIsOk: true
    });

    // Wait for 2nd turn to complete
    await forTestsWaitForTurnEnded({
      events: sse.events,
      count: 2,
      maxRetries: 40
    });
  } catch (e) {
    logToConsoleBackend({
      log: e,
      logLevel: LogLevelEnum.Error,
      logger: prep.logger,
      cs: prep.cs
    });
    testError = e;
  }

  console.error = originalConsoleError;

  if (sse) {
    sse.close();
  }

  if (!!inspectUI) {
    await forTestsInspectUi({
      t,
      prep,
      sessionId,
      testError,
      createSessionResp
    });
  }

  if (!inspectUI) {
    // Cleanup
    if (sessionId && prep) {
      try {
        let deleteSessionReq: ToBackendDeleteAgentSessionRequest = {
          info: {
            name: ToBackendRequestInfoNameEnum.ToBackendDeleteAgentSession,
            traceId: traceId,
            idempotencyKey: makeId()
          },
          payload: {
            sessionId: sessionId
          }
        };

        await sendToBackend<ToBackendDeleteAgentSessionResponse>({
          httpServer: prep.httpServer,
          loginToken: prep.loginToken,
          req: deleteSessionReq,
          checkIsOk: true
        });
      } catch (er) {
        logToConsoleBackend({
          log: er,
          logLevel: LogLevelEnum.Error,
          logger: prep.logger,
          cs: prep.cs
        });
      }
    }

    if (prep) {
      await prep.app.close();
    }

    t.is(testError, undefined);
    t.is(createSessionResp.info.status, ResponseInfoStatusEnum.Ok);
    t.truthy(createSessionResp.payload.sessionId);
    t.truthy(createSessionResp.payload.sseTicket);
    t.is(sendFirstMessageResp.info.status, ResponseInfoStatusEnum.Ok);
    t.is(sendMessageResp.info.status, ResponseInfoStatusEnum.Ok);

    // Extract dialog messages from ACP events
    let dialogLines = forTestsExtractDialogLines({ events: sse.events });

    console.log('\n' + dialogLines.join('\n'));

    t.true(
      dialogLines.some(l => l.startsWith('=== Assistant:')),
      'Expected assistant text answer in dialog'
    );

    t.true(
      dialogLines.some(l => l.startsWith('=== User:')),
      'Expected user text message in dialog'
    );
  }
});
