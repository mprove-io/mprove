import test from 'ava';
import { forTestsConnectSse } from '#backend/functions/for-tests-connect-sse';
import { forTestsGetSseTicket } from '#backend/functions/for-tests-get-sse-ticket';
import { forTestsWaitForSessionActive } from '#backend/functions/for-tests-wait-for-session-active';
import { forTestsWaitForTurnEnded } from '#backend/functions/for-tests-wait-for-turn-ended';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import { Prep } from '#backend/interfaces/prep';
import type { AgentEvent } from '#backend/services/agent.service';
import { BRANCH_MAIN } from '#common/constants/top';
import { InteractionTypeEnum } from '#common/enums/interaction-type.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
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
  ToBackendGetAgentSessionRequest,
  ToBackendGetAgentSessionResponse
} from '#common/interfaces/to-backend/agent/to-backend-get-agent-session';
import {
  ToBackendSendUserMessageToAgentRequest,
  ToBackendSendUserMessageToAgentResponse
} from '#common/interfaces/to-backend/agent/to-backend-send-user-message-to-agent';

test('1', async t => {
  let e2bApiKey = process.env.BACKEND_DEMO_PROJECT_E2B_API_KEY;
  if (!e2bApiKey) {
    t.fail('BACKEND_DEMO_PROJECT_E2B_API_KEY not set');
    return;
  }

  let zenApiKey = process.env.BACKEND_DEMO_PROJECT_ZEN_API_KEY;
  if (!zenApiKey) {
    t.fail('BACKEND_DEMO_PROJECT_ZEN_API_KEY not set');
    return;
  }

  let testId = 'backend-get-agent-session__messages-persisted';
  let traceId = testId;
  let email = `${testId}@example.com`;
  let userId = makeId();
  let password = '123456';
  let orgId = testId;
  let orgName = testId;
  let projectId = makeId();
  let projectName = testId;

  let prep: Prep;
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

    // Create session
    let createSessionReq: ToBackendCreateAgentSessionRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendCreateAgentSession,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        projectId: projectId,
        sandboxType: SandboxTypeEnum.E2B,
        provider: 'opencode',
        model: 'opencode/big-pickle',
        agent: 'plan',
        permissionMode: 'default'
      }
    };

    let createResp = await sendToBackend<ToBackendCreateAgentSessionResponse>({
      httpServer: prep.httpServer,
      loginToken: prep.loginToken,
      req: createSessionReq,
      checkIsOk: true
    });

    sessionId = createResp.payload.sessionId;
    console.log(`[test] session created: ${sessionId}`);

    await new Promise<void>(resolve => {
      prep.httpServer.listen(0, () => resolve());
    });

    await forTestsWaitForSessionActive({
      httpServer: prep.httpServer,
      loginToken: prep.loginToken,
      traceId: traceId,
      sessionId: sessionId
    });

    console.log('[test] session active, connecting SSE...');

    let sseTicket = await forTestsGetSseTicket({
      httpServer: prep.httpServer,
      loginToken: prep.loginToken,
      traceId: traceId,
      sessionId: sessionId
    });

    sse = await forTestsConnectSse({
      httpServer: prep.httpServer,
      sessionId: sessionId,
      ticket: sseTicket
    });

    console.log('[test] SSE connected, sending message...');

    let sendMessageReq: ToBackendSendUserMessageToAgentRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendSendUserMessageToAgent,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        sessionId: sessionId,
        interactionType: InteractionTypeEnum.Message,
        message: 'what is 10 + 20?'
      }
    };

    await sendToBackend<ToBackendSendUserMessageToAgentResponse>({
      httpServer: prep.httpServer,
      loginToken: prep.loginToken,
      req: sendMessageReq,
      checkIsOk: true
    });

    console.log('[test] message sent, waiting for turn to complete...');

    await forTestsWaitForTurnEnded({
      events: sse.events,
      count: 1,
      maxRetries: 60
    });

    console.log(
      `[test] turn complete (${sse.events.length} events), waiting for drain...`
    );

    // Wait for drainQueue to flush (drains every 1s)
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Close SSE before fetching — simulates page reload
    sse.close();

    // Fetch session with messages and parts (simulates page reload)
    let getSessionReq: ToBackendGetAgentSessionRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendGetAgentSession,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        sessionId: sessionId,
        includeMessagesAndParts: true
      }
    };

    let getResp = await sendToBackend<ToBackendGetAgentSessionResponse>({
      httpServer: prep.httpServer,
      loginToken: prep.loginToken,
      req: getSessionReq,
      checkIsOk: true
    });

    let { messages, parts } = getResp.payload;

    console.log(
      `[test] GetAgentSession: messages=${messages?.length}, parts=${parts?.length}`
    );
    console.log(
      `[test] messages: ${JSON.stringify(messages?.map(m => ({ id: m.messageId, role: m.role })))}`
    );
    console.log(
      `[test] parts: ${JSON.stringify(parts?.map(p => ({ id: p.partId, msgId: p.messageId, type: p.ocPart?.type, textLen: p.ocPart?.type === 'text' ? (p.ocPart as any).text?.length : undefined })))}`
    );

    // Bug 1: messages must be returned (sessionId was wrong before fix)
    t.true(messages.length > 0, 'Expected messages to be returned from DB');

    let userMessages = messages.filter(m => m.role === 'user');
    let assistantMessages = messages.filter(m => m.role === 'assistant');

    t.true(userMessages.length > 0, 'Expected at least one user message');
    t.true(
      assistantMessages.length > 0,
      'Expected at least one assistant message'
    );

    // Bug 2: text parts must have non-empty text (deltas were not persisted before fix)
    let textParts = parts.filter(p => p.ocPart?.type === 'text');
    t.true(textParts.length > 0, 'Expected at least one text part');

    let assistantTextParts = textParts.filter(p =>
      assistantMessages.some(m => m.messageId === p.messageId)
    );
    t.true(
      assistantTextParts.length > 0,
      'Expected at least one assistant text part'
    );

    for (let part of assistantTextParts) {
      let text = (part.ocPart as any).text;
      console.log(
        `[test] assistant text part ${part.partId}: "${text?.substring(0, 100)}"`
      );
      t.true(
        typeof text === 'string' && text.length > 0,
        `Expected assistant text part ${part.partId} to have non-empty text`
      );
    }

    // Cleanup
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

    await prep.app.close();
  } catch (e) {
    console.log(`[test] ERROR: ${e instanceof Error ? e.message : e}`);
    if (sse) {
      sse.close();
    }
    logToConsoleBackend({
      log: e,
      logLevel: LogLevelEnum.Error,
      logger: prep.logger,
      cs: prep.cs
    });

    if (sessionId && prep) {
      try {
        await sendToBackend<ToBackendDeleteAgentSessionResponse>({
          httpServer: prep.httpServer,
          loginToken: prep.loginToken,
          req: {
            info: {
              name: ToBackendRequestInfoNameEnum.ToBackendDeleteAgentSession,
              traceId: traceId,
              idempotencyKey: makeId()
            },
            payload: { sessionId }
          },
          checkIsOk: true
        });
      } catch (_) {}
    }

    if (prep) {
      await prep.app.close();
    }

    t.fail(`Test failed: ${e instanceof Error ? e.message : e}`);
  }
});
