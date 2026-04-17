import test from 'ava';
import { forTestsConnectSse } from '#backend/functions/for-tests/for-tests-connect-sse';
import { forTestsGetSseTicket } from '#backend/functions/for-tests/for-tests-get-sse-ticket';
import { forTestsWaitForSessionActive } from '#backend/functions/for-tests/for-tests-wait-for-session-active';
import { forTestsWaitForTurnEnded } from '#backend/functions/for-tests/for-tests-wait-for-turn-ended';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import { BRANCH_MAIN, PROJECT_ENV_PROD } from '#common/constants/top';
import { InteractionTypeEnum } from '#common/enums/interaction-type.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeAscendingId } from '#common/functions/make-ascending-id';
import { makeId } from '#common/functions/make-id';
import type {
  ToBackendCreateEditorSessionRequest,
  ToBackendCreateEditorSessionResponse
} from '#common/zod/to-backend/sessions/to-backend-create-editor-session';
import type {
  ToBackendDeleteSessionRequest,
  ToBackendDeleteSessionResponse
} from '#common/zod/to-backend/sessions/to-backend-delete-session';
import type {
  ToBackendGetSessionRequest,
  ToBackendGetSessionResponse
} from '#common/zod/to-backend/sessions/to-backend-get-session';
import type {
  ToBackendSendMessageToEditorSessionRequest,
  ToBackendSendMessageToEditorSessionResponse
} from '#common/zod/to-backend/sessions/to-backend-send-message-to-editor-session';

test('1', async t => {
  let e2bApiKey = process.env.BACKEND_DEMO_PROJECT_E2B_API_KEY;
  if (!e2bApiKey) {
    t.fail('BACKEND_DEMO_PROJECT_E2B_API_KEY not set');
    return;
  }

  let openaiApiKey = process.env.BACKEND_DEMO_PROJECT_OPENAI_API_KEY;
  if (!openaiApiKey) {
    t.fail('BACKEND_DEMO_PROJECT_OPENAI_API_KEY not set');
    return;
  }

  let testId = 'backend-get-session__messages-persisted';
  let traceId = testId;
  let email = `${testId}@example.com`;
  let userId = makeId();
  let password = '123456';
  let orgId = testId;
  let orgName = testId;
  let projectId = makeId();
  let projectName = testId;

  let prep: Awaited<ReturnType<typeof prepareTestAndSeed>>;
  let messages;
  let parts;

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
            email: email,
            password: password,
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
            orgId: orgId,
            projectId: projectId,
            name: projectName,
            remoteType: ProjectRemoteTypeEnum.Managed,
            defaultBranch: BRANCH_MAIN,
            e2bApiKey: e2bApiKey,
            openaiApiKey: openaiApiKey
          }
        ],
        members: [
          {
            memberId: userId,
            email: email,
            projectId: projectId,
            isAdmin: true,
            isEditor: true,
            isExplorer: true
          }
        ]
      },
      loginUserPayload: { email: email, password: password }
    });

    // Create session
    let createSessionReq: ToBackendCreateEditorSessionRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendCreateEditorSession,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        projectId: projectId,
        sandboxType: SandboxTypeEnum.E2B,
        provider: 'opencode',
        model: 'openai/gpt-5.1-codex-mini',
        agent: 'plan',
        variant: 'default',
        envId: PROJECT_ENV_PROD,
        initialBranch: BRANCH_MAIN,
        messageId: makeAscendingId({ prefix: 'msg' }),
        partId: makeAscendingId({ prefix: 'prt' }),
        useCodex: false
      }
    };

    let createResp = await sendToBackend<ToBackendCreateEditorSessionResponse>({
      httpServer: prep.httpServer,
      loginToken: prep.loginToken,
      req: createSessionReq,
      checkIsOk: true
    });

    let sessionId = createResp.payload.sessionId;
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

    let sse = await forTestsConnectSse({
      httpServer: prep.httpServer,
      sessionId: sessionId,
      ticket: sseTicket
    });

    console.log('[test] SSE connected, sending message...');

    let sendMessageReq: ToBackendSendMessageToEditorSessionRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendSendMessageToEditorSession,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        sessionId: sessionId,
        interactionType: InteractionTypeEnum.Message,
        message: 'what is 10 + 20?',
        agent: 'plan',
        model: 'openai/gpt-5.1-codex-mini',
        variant: 'default'
      }
    };

    await sendToBackend<ToBackendSendMessageToEditorSessionResponse>({
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
    let getSessionReq: ToBackendGetSessionRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendGetSession,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        sessionId: sessionId,
        isFetchFromOpencode: true
      }
    };

    let getResp = await sendToBackend<ToBackendGetSessionResponse>({
      httpServer: prep.httpServer,
      loginToken: prep.loginToken,
      req: getSessionReq,
      checkIsOk: true
    });

    messages = getResp.payload.messages;
    parts = getResp.payload.parts;

    console.log(
      `[test] GetSession: messages=${messages?.length}, parts=${parts?.length}`
    );

    let deleteSessionReq: ToBackendDeleteSessionRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendDeleteSession,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        sessionId: sessionId
      }
    };

    await sendToBackend<ToBackendDeleteSessionResponse>({
      httpServer: prep.httpServer,
      loginToken: prep.loginToken,
      req: deleteSessionReq,
      checkIsOk: true
    });

    // Wait for stream stop to complete (stopDelay=0 in TEST env)
    await new Promise(resolve => setTimeout(resolve, 500));

    await prep.app.close();
  } catch (e) {
    logToConsoleBackend({
      log: e,
      logLevel: LogLevelEnum.Error,
      logger: prep.logger,
      cs: prep.cs
    });
  }

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

  assistantTextParts.forEach(part => {
    let text = (part.ocPart as any).text;
    console.log(
      `[test] assistant text part ${part.partId}: "${text?.substring(0, 100)}"`
    );
    t.true(
      typeof text === 'string' && text.length > 0,
      `Expected assistant text part ${part.partId} to have non-empty text`
    );
  });
});
