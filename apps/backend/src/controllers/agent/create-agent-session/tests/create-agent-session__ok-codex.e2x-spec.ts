import test from 'ava';
import { SSE_AGENT_EVENTS_PATH } from '#backend/controllers/agent/get-agent-events-sse/get-agent-events-sse.controller';
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

let inspectUI = true;

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

async function connectSse(item: {
  httpServer: any;
  sessionId: string;
  ticket: string;
}): Promise<{ events: AgentEvent[]; close: () => void }> {
  let events: AgentEvent[] = [];
  let address = item.httpServer.address();
  let port = typeof address === 'string' ? address : address.port;

  let url = `http://localhost:${port}/${SSE_AGENT_EVENTS_PATH}?sessionId=${item.sessionId}&ticket=${item.ticket}`;

  // console.log('connectSse url:', url);

  let es = new EventSource(url);

  // Wait for SSE connection to open (ticket consumed + Redis subscribed)
  await new Promise<void>((resolve, reject) => {
    es.onopen = () => resolve();
    es.onerror = (e: any) =>
      reject(new Error(`SSE connection error: ${e?.message}`));
  });

  es.addEventListener('agent-event', (event: MessageEvent) => {
    // console.log('SSE agent-event received:', e.data?.substring(0, 200));
    try {
      events.push(JSON.parse(event.data));
    } catch (e) {
      // ignore parse errors
      console.log('event listener json parse error:');
      console.log(e);
    }
  });

  return {
    events,
    close: () => es.close()
  };
}

async function waitForTurnEnded(item: {
  events: AgentEvent[];
  count: number;
  maxRetries: number;
}): Promise<void> {
  for (let i = 0; i < item.maxRetries; i++) {
    let ended = item.events.filter(e => e.type === 'turn.ended').length;
    if (ended >= item.count) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

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
    sse = await connectSse({
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
        message: 'hi'
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
    await waitForTurnEnded({
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
    await waitForTurnEnded({
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
  } finally {
    // Close SSE connection
    if (sse) {
      sse.close();
    }

    if (inspectUI) {
      // Do nothing — keep everything running so Inspector UI can work
    } else {
      // Cleanup: delete session
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
    }
  }

  if (inspectUI) {
    if (testError) {
      console.log('Test error (non-fatal for inspection):', testError);
    }

    if (createSessionResp) {
      console.log('sessionId:', createSessionResp.payload.sessionId);
    }

    t.pass('Session created for inspection');

    // Periodic health check
    let { SandboxService } = await import('#backend/services/sandbox.service');
    let { SessionsService } = await import(
      '#backend/services/db/sessions.service'
    );
    let sandboxService = prep.app.get(SandboxService);
    let sessionsService = prep.app.get(SessionsService);
    let session = await sessionsService.getSessionByIdCheckExists({
      sessionId
    });
    let client = sandboxService.getSaClient(sessionId);

    console.log(`\n=== INSPECTOR UI ===`);
    console.log(
      `${session.sandboxBaseUrl}/ui/?token=${session.sandboxAgentToken}`
    );
    console.log(`===================\n`);
    console.log('Sandbox kept alive for inspection. Waiting 30 minutes...');
    console.log('Press Ctrl+C to stop.');
    console.log('Health checking every 10s...\n');

    for (let i = 0; i < 180; i++) {
      await new Promise(resolve => setTimeout(resolve, 10_000));

      try {
        let sessions = await client.listSessions();
        console.log(
          `[${i * 10}s] sandbox-agent OK, sessions: ${sessions.sessions.length}`
        );
      } catch (err: any) {
        console.log(`[${i * 10}s] sandbox-agent FAILED: ${err?.message}`);
      }
    }
  } else {
    t.is(testError, undefined);
    t.is(createSessionResp.info.status, ResponseInfoStatusEnum.Ok);
    t.truthy(createSessionResp.payload.sessionId);
    t.truthy(createSessionResp.payload.sseTicket);
    t.is(sendFirstMessageResp.info.status, ResponseInfoStatusEnum.Ok);
    t.is(sendMessageResp.info.status, ResponseInfoStatusEnum.Ok);

    // Extract dialog messages from events
    let dialogLines = sse.events
      .filter(
        (e: any) =>
          e.type === 'item.completed' &&
          (e.eventData?.item?.role === 'user' ||
            e.eventData?.item?.role === 'assistant') &&
          Array.isArray(e.eventData?.item?.content)
      )
      .flatMap((e: any) => {
        let role = e.eventData.item.role === 'user' ? 'User' : 'Assistant';
        return e.eventData.item.content
          .filter((c: any) => c.type === 'text')
          .map((c: any) => `=== ${role}: ${c.text}`);
      });

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
