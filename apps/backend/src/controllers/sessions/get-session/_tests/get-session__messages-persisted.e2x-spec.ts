import test from 'ava';
import { OPENAI_GPT_5_6_LUNA_MODEL_INFO } from '#backend/controllers/sessions/get-session/_tests/fixtures/openai-gpt-5-6-luna-model-info.fixture';
import { forTestsConnectSse } from '#backend/functions/top/for-tests-run-editor-session-e2x/for-tests-connect-sse/for-tests-connect-sse';
import { forTestsGetSseTicket } from '#backend/functions/top/for-tests-run-editor-session-e2x/for-tests-get-sse-ticket/for-tests-get-sse-ticket';
import { forTestsWaitForSessionActive } from '#backend/functions/top/for-tests-run-editor-session-e2x/for-tests-wait-for-session-active/for-tests-wait-for-session-active';
import { forTestsWaitForTurnEnded } from '#backend/functions/top/for-tests-run-editor-session-e2x/for-tests-wait-for-turn-ended/for-tests-wait-for-turn-ended';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/top/prepare-test-and-seed/prepare-test-and-seed';
import { sendToBackend } from '#backend/functions/top/send-to-backend/send-to-backend';
import { AscendingIdService } from '#backend/services/ascending-id/ascending-id.service';
import { OPENAI_PROVIDER_ID } from '#common/constants/providers';
import { BRANCH_MAIN, PROJECT_ENV_PROD } from '#common/constants/top';

import { makeId } from '#common/functions/make-id/make-id';
import { unwrapBackendResponseOutput } from '#common/functions/unwrap-backend-response-output/unwrap-backend-response-output';
import type { ToBackendCreateEditorSessionRequest } from '#common/types/backend/routes/sessions/create-editor-session/create-editor-session-request';
import type { ToBackendDeleteSessionRequest } from '#common/types/backend/routes/sessions/delete-session/delete-session-request';
import type { ToBackendGetSessionOutput } from '#common/types/backend/routes/sessions/get-session/get-session-output';
import type { ToBackendGetSessionRequest } from '#common/types/backend/routes/sessions/get-session/get-session-request';
import type { ToBackendSendMessageToEditorSessionRequest } from '#common/types/backend/routes/sessions/send-message-to-editor-session/send-message-to-editor-session-request';

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
            remoteType: 'Managed',
            defaultBranch: BRANCH_MAIN,
            e2bApiKey: e2bApiKey
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
        ],
        providers: [
          {
            projectId: projectId,
            providerId: OPENAI_PROVIDER_ID,
            type: 'OpenAI',
            isEnabled: true,
            models: [
              {
                modelId: OPENAI_GPT_5_6_LUNA_MODEL_INFO.modelsDev.id,
                name: OPENAI_GPT_5_6_LUNA_MODEL_INFO.modelsDev.name,
                providerModelInfo: { ...OPENAI_GPT_5_6_LUNA_MODEL_INFO },
                isExplorer: true,
                isBuilder: true
              }
            ],
            options: {
              apiKey: openaiApiKey
            }
          }
        ]
      },
      loginUserPayload: { email: email, password: password }
    });

    // Create session
    let ascendingIdService: AscendingIdService =
      prep.app.get(AscendingIdService);

    let createSessionReq: ToBackendCreateEditorSessionRequest = {
      operation: 'createEditorSession',
      traceId: traceId,
      idempotencyKey: makeId(),
      input: {
        projectId: projectId,
        sandboxType: 'E2B',
        providerId: OPENAI_PROVIDER_ID,
        modelId: OPENAI_GPT_5_6_LUNA_MODEL_INFO.modelsDev.id,
        agent: 'plan',
        variant: 'default',
        envId: PROJECT_ENV_PROD,
        initialBranch: BRANCH_MAIN,
        messageId: ascendingIdService.makeAscendingId({ prefix: 'msg' }),
        partId: ascendingIdService.makeAscendingId({ prefix: 'prt' })
      }
    };

    let createResp = await sendToBackend({
      route: 'api/ToBackendCreateEditorSession',
      httpServer: prep.httpServer,
      loginToken: prep.loginToken,
      req: createSessionReq,
      checkIsOk: true
    });

    let sessionId = unwrapBackendResponseOutput({
      response: createResp
    }).sessionId;
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
      operation: 'sendMessageToEditorSession',
      traceId: traceId,
      idempotencyKey: makeId(),
      input: {
        sessionId: sessionId,
        interactionType: 'Message',
        message: 'what is 10 + 20?',
        agent: 'plan',
        providerId: OPENAI_PROVIDER_ID,
        modelId: OPENAI_GPT_5_6_LUNA_MODEL_INFO.modelsDev.id,
        variant: 'default'
      }
    };

    await sendToBackend({
      route: 'api/ToBackendSendMessageToEditorSession',
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
      operation: 'getSession',
      traceId: traceId,
      idempotencyKey: makeId(),
      input: {
        sessionId: sessionId,
        isFetchFromOpencode: true
      }
    };

    let getResp = await sendToBackend({
      route: 'api/ToBackendGetSession',
      httpServer: prep.httpServer,
      loginToken: prep.loginToken,
      req: getSessionReq,
      checkIsOk: true
    });

    let output: ToBackendGetSessionOutput = unwrapBackendResponseOutput({
      response: getResp
    });

    messages = output.messages;

    parts = output.parts;

    console.log(
      `[test] GetSession: messages=${messages?.length}, parts=${parts?.length}`
    );

    let deleteSessionReq: ToBackendDeleteSessionRequest = {
      operation: 'deleteSession',
      traceId: traceId,
      idempotencyKey: makeId(),
      input: {
        sessionId: sessionId
      }
    };

    await sendToBackend({
      route: 'api/ToBackendDeleteSession',
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
      logLevel: 'Error',
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
