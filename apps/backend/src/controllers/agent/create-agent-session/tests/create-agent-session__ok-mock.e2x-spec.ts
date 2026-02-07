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

let testId = 'backend-create-agent-session__ok-mock';

let traceId = testId;

let email = `${testId}@example.com`;
let userId = makeId();
let password = '123456';

let orgId = testId;
let orgName = testId;

let projectId = makeId();
let projectName = testId;

let prep: Prep;

function connectSse(item: {
  httpServer: any;
  sessionId: string;
  ticket: string;
}): { events: AgentEvent[]; close: () => void } {
  let events: AgentEvent[] = [];
  let address = item.httpServer.address();
  let port = typeof address === 'string' ? address : address.port;

  let url = `http://localhost:${port}/${SSE_AGENT_EVENTS_PATH}?sessionId=${item.sessionId}&ticket=${item.ticket}`;

  // console.log('connectSse url:', url);

  let es = new EventSource(url);

  // es.onopen = () => {
  //   console.log('SSE connection opened');
  // };

  // es.onerror = (e: any) => {
  //   console.log('SSE error:', e?.type, e?.message, 'readyState:', es.readyState);
  // };

  es.addEventListener('agent-event', (e: MessageEvent) => {
    // console.log('SSE agent-event received:', e.data?.substring(0, 200));
    try {
      events.push(JSON.parse(e.data));
    } catch {
      // ignore parse errors
    }
  });

  return {
    events,
    close: () => es.close()
  };
}

async function waitForEvents(item: {
  events: AgentEvent[];
  minCount: number;
  afterSequence?: number;
  maxRetries?: number;
  delayMs?: number;
}): Promise<AgentEvent[]> {
  let maxRetries = item.maxRetries ?? 30;
  let delayMs = item.delayMs ?? 2000;

  for (let i = 0; i < maxRetries; i++) {
    let matching =
      item.afterSequence !== undefined
        ? item.events.filter(e => e.sequence > item.afterSequence)
        : item.events;

    if (matching.length >= item.minCount) {
      return matching;
    }

    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  return item.afterSequence !== undefined
    ? item.events.filter(e => e.sequence > item.afterSequence)
    : item.events;
}

test('1', async t => {
  let e2bApiKey = process.env.BACKEND_DEMO_PROJECT_E2B_API_KEY;
  let zenApiKey = process.env.BACKEND_DEMO_PROJECT_ZEN_API_KEY;
  let anthropicApiKey = process.env.BACKEND_DEMO_PROJECT_ANTHROPIC_API_KEY;
  let openaiApiKey = process.env.BACKEND_DEMO_PROJECT_OPENAI_API_KEY;

  if (!e2bApiKey || !anthropicApiKey) {
    t.pass(
      'Skipped: BACKEND_DEMO_PROJECT_E2B_API_KEY or BACKEND_DEMO_PROJECT_ANTHROPIC_API_KEY not set'
    );
    return;
  }

  let sessionId: string | undefined;
  let sse: { events: AgentEvent[]; close: () => void } | undefined;

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

    // Create agent session with firstMessage
    let createSessionReq: ToBackendCreateAgentSessionRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendCreateAgentSession,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        projectId: projectId,
        sandboxType: SandboxTypeEnum.E2B,
        agent: 'mock',
        model: undefined,
        agentMode: undefined,
        permissionMode: undefined,
        firstMessage: 'hello'
      }
    };

    let createSessionResp =
      await sendToBackend<ToBackendCreateAgentSessionResponse>({
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: createSessionReq
      });

    // console.log('createSessionResp.info:', JSON.stringify(createSessionResp.info, null, 2));

    t.is(createSessionResp.info.status, ResponseInfoStatusEnum.Ok);
    t.truthy(createSessionResp.payload.sessionId);
    t.truthy(createSessionResp.payload.sseTicket);

    sessionId = createSessionResp.payload.sessionId;

    // Start listening so EventSource can connect
    await new Promise<void>(resolve => {
      prep.httpServer.listen(0, () => resolve());
    });

    // Connect SSE
    sse = connectSse({
      httpServer: prep.httpServer,
      sessionId: sessionId,
      ticket: createSessionResp.payload.sseTicket
    });

    // Wait for events from firstMessage
    let firstEvents = await waitForEvents({
      events: sse.events,
      minCount: 1
    });

    t.true(firstEvents.length > 0, 'Expected events from firstMessage');

    let lastSequence = firstEvents[firstEvents.length - 1].sequence;

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

    let sendMessageResp =
      await sendToBackend<ToBackendSendAgentMessageResponse>({
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: sendMessageReq
      });

    t.is(sendMessageResp.info.status, ResponseInfoStatusEnum.Ok);

    // Wait for events from 2nd message
    let secondEvents = await waitForEvents({
      events: sse.events,
      minCount: 1,
      afterSequence: lastSequence
    });

    t.true(secondEvents.length > 0, 'Expected events from 2nd message');
  } catch (e) {
    logToConsoleBackend({
      log: e,
      logLevel: LogLevelEnum.Error,
      logger: prep?.logger,
      cs: prep?.cs
    });
    t.fail(String(e));
  } finally {
    // Close SSE connection
    if (sse) {
      sse.close();
    }

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
          req: deleteSessionReq
        });
      } catch (_) {
        // ignore cleanup errors
      }
    }

    if (prep) {
      await prep.app.close();
    }
  }
});
