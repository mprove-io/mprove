import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import { Prep } from '#backend/interfaces/prep';
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
  AgentEventItem,
  ToBackendGetAgentEventsStreamRequest,
  ToBackendGetAgentEventsStreamResponse
} from '#common/interfaces/to-backend/agent/to-backend-get-agent-events-stream';
import {
  ToBackendSendAgentMessageRequest,
  ToBackendSendAgentMessageResponse
} from '#common/interfaces/to-backend/agent/to-backend-send-agent-message';

let testId = 'backend-create-agent-session__ok';

let traceId = testId;

let email = `${testId}@example.com`;
let userId = makeId();
let password = '123456';

let orgId = testId;
let orgName = testId;

let projectId = makeId();
let projectName = testId;

let prep: Prep;

async function pollEvents(item: {
  httpServer: any;
  loginToken: string;
  sessionId: string;
  lastSequence?: number;
  maxRetries?: number;
  delayMs?: number;
}): Promise<AgentEventItem[]> {
  let maxRetries = item.maxRetries ?? 30;
  let delayMs = item.delayMs ?? 2000;

  for (let i = 0; i < maxRetries; i++) {
    let getEventsReq: ToBackendGetAgentEventsStreamRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendGetAgentEventsStream,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        sessionId: item.sessionId,
        lastSequence: item.lastSequence
      }
    };

    let getEventsResp =
      await sendToBackend<ToBackendGetAgentEventsStreamResponse>({
        httpServer: item.httpServer,
        loginToken: item.loginToken,
        req: getEventsReq
      });

    if (
      getEventsResp.info.status === ResponseInfoStatusEnum.Ok &&
      getEventsResp.payload.events.length > 0
    ) {
      return getEventsResp.payload.events;
    }

    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  return [];
}

test('1', async t => {
  let e2bApiKey = process.env.BACKEND_DEMO_PROJECT_E2B_API_KEY;
  let zenApiKey = process.env.BACKEND_DEMO_PROJECT_ZEN_API_KEY;

  if (!e2bApiKey || !zenApiKey) {
    t.pass(
      'Skipped: BACKEND_DEMO_PROJECT_E2B_API_KEY or BACKEND_DEMO_PROJECT_ZEN_API_KEY not set'
    );
    return;
  }

  let sessionId: string | undefined;

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
            zenApiKey: zenApiKey
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
        agent: 'opencode',
        firstMessage: 'hello'
      }
    };

    let createSessionResp =
      await sendToBackend<ToBackendCreateAgentSessionResponse>({
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: createSessionReq
      });

    t.is(createSessionResp.info.status, ResponseInfoStatusEnum.Ok);
    t.truthy(createSessionResp.payload.sessionId);

    sessionId = createSessionResp.payload.sessionId;

    // Poll for events from firstMessage
    let firstEvents = await pollEvents({
      httpServer: prep.httpServer,
      loginToken: prep.loginToken,
      sessionId: sessionId
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

    // Poll for events from 2nd message
    let secondEvents = await pollEvents({
      httpServer: prep.httpServer,
      loginToken: prep.loginToken,
      sessionId: sessionId,
      lastSequence: lastSequence
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
