import type { ExecutionContext } from 'ava';
import { forTestsConnectSse } from '#backend/functions/for-tests-connect-sse';
import { forTestsExtractDialogLines } from '#backend/functions/for-tests-extract-dialog-lines';
import { forTestsGetSseTicket } from '#backend/functions/for-tests-get-sse-ticket';
import { forTestsInspectUi } from '#backend/functions/for-tests-inspect-ui';
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
  ToBackendSendUserMessageToAgentRequest,
  ToBackendSendUserMessageToAgentResponse
} from '#common/interfaces/to-backend/agent/to-backend-send-user-message-to-agent';

export async function forTestsRunAgentSessionE2x(item: {
  t: ExecutionContext;
  testId: string;
  inspectUI: boolean;
  projectApiKeys: {
    e2bApiKey: string;
    zenApiKey?: string;
    anthropicApiKey?: string;
    openaiApiKey?: string;
  };
  model?: string;
}): Promise<void> {
  let { t, testId, inspectUI } = item;

  if (inspectUI) {
    t.timeout(35 * 60 * 1000); // 35 minutes for inspection mode
  }

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
  let testError: unknown;
  let createSessionResp: ToBackendCreateAgentSessionResponse;
  let sendFirstMessageResp: ToBackendSendUserMessageToAgentResponse;
  let sendMessageResp: ToBackendSendUserMessageToAgentResponse;

  try {
    console.log('[test] preparing test and seeding...');
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
            e2bApiKey: item.projectApiKeys.e2bApiKey,
            zenApiKey: item.projectApiKeys.zenApiKey,
            anthropicApiKey: item.projectApiKeys.anthropicApiKey,
            openaiApiKey: item.projectApiKeys.openaiApiKey
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

    console.log('[test] seed complete, creating agent session...');

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
        provider: 'opencode',
        model: item.model,
        agent: 'plan',
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
    console.log(`[test] session created: ${sessionId}`);

    // Start listening so EventSource can connect
    await new Promise<void>(resolve => {
      prep.httpServer.listen(0, () => resolve());
    });

    console.log(
      '[test] http server listening, waiting for session activation...'
    );

    // Wait for async session activation to complete
    await forTestsWaitForSessionActive({
      httpServer: prep.httpServer,
      loginToken: prep.loginToken,
      traceId: traceId,
      sessionId: sessionId
    });

    console.log('[test] session active, connecting SSE...');

    // Get SSE ticket and connect before sending any messages
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

    console.log('[test] SSE connected, sending 1st message...');

    // Send 1st message (after SSE is connected)
    let sendFirstMessageReq: ToBackendSendUserMessageToAgentRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendSendUserMessageToAgent,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        sessionId: sessionId,
        interactionType: InteractionTypeEnum.Message,
        message: 'hello, what model is used?'
      }
    };

    sendFirstMessageResp =
      await sendToBackend<ToBackendSendUserMessageToAgentResponse>({
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: sendFirstMessageReq,
        checkIsOk: true
      });

    console.log('[test] 1st message sent, waiting for turn to complete...');

    // Wait for 1st turn to complete
    await forTestsWaitForTurnEnded({
      events: sse.events,
      count: 1,
      maxRetries: 60
    });

    console.log(
      `[test] 1st turn complete (${sse.events.length} events so far), sending 2nd message...`
    );

    // Send 2nd message
    let sendMessageReq: ToBackendSendUserMessageToAgentRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendSendUserMessageToAgent,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        sessionId: sessionId,
        interactionType: InteractionTypeEnum.Message,
        message: 'what is 2 + 2?'
      }
    };

    sendMessageResp =
      await sendToBackend<ToBackendSendUserMessageToAgentResponse>({
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: sendMessageReq,
        checkIsOk: true
      });

    console.log('[test] 2nd message sent, waiting for turn to complete...');

    // Wait for 2nd turn to complete
    await forTestsWaitForTurnEnded({
      events: sse.events,
      count: 1,
      maxRetries: 60
    });

    console.log(`[test] 2nd turn complete (${sse.events.length} events total)`);
  } catch (e) {
    console.log(`[test] ERROR: ${e instanceof Error ? e.message : e}`);
    if (sse) {
      console.log(`[test] events received so far: ${sse.events.length}`);
      let eventTypes = sse.events.map(ev => ev.eventType);
      console.log(`[test] event types: ${JSON.stringify(eventTypes)}`);
    }
    logToConsoleBackend({
      log: e,
      logLevel: LogLevelEnum.Error,
      logger: prep.logger,
      cs: prep.cs
    });
    testError = e;
  }

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
    t.is(sendFirstMessageResp.info.status, ResponseInfoStatusEnum.Ok);
    t.is(sendMessageResp.info.status, ResponseInfoStatusEnum.Ok);

    // Log event summary
    let eventTypeCounts: Record<string, number> = {};
    for (let ev of sse.events) {
      eventTypeCounts[ev.eventType] = (eventTypeCounts[ev.eventType] || 0) + 1;
    }
    console.log(
      `[test] event summary (${sse.events.length} total): ${JSON.stringify(eventTypeCounts, null, 2)}`
    );

    // // Log each event for debugging
    // for (let ev of sse.events) {
    //   let oc = ev.ocEvent;
    //   let detail = '';
    //   if (oc.type === 'message.updated') {
    //     detail = ` role=${oc.properties.info.role} msgId=${oc.properties.info.id}`;
    //   } else if (oc.type === 'message.part.updated') {
    //     detail = ` partType=${oc.properties.part.type} partId=${oc.properties.part.id} msgId=${oc.properties.part.messageID}`;
    //     if (oc.properties.part.type === 'text') {
    //       detail += ` text="${oc.properties.part.text?.substring(0, 80)}"`;
    //     }
    //   } else if (oc.type === 'message.part.delta') {
    //     let props = oc.properties;
    //     detail = ` partId=${props.partID} field=${props.field} delta="${props.delta?.substring(0, 80)}"`;
    //   }
    //   console.log(`[event ${ev.eventIndex}] ${ev.eventType}${detail}`);
    // }

    // Extract dialog messages from OpenCode events
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
}
