import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend.js';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import { BRANCH_MAIN } from '#common/constants/top';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import type {
  ToBackendGetSessionProviderModelsRequest,
  ToBackendGetSessionProviderModelsResponse
} from '#common/zod/to-backend/sessions/to-backend-get-session-provider-models';

test('1', async t => {
  let openaiApiKey = process.env.BACKEND_DEMO_PROJECT_OPENAI_API_KEY;
  if (!openaiApiKey) {
    t.fail('BACKEND_DEMO_PROJECT_OPENAI_API_KEY not set');
    return;
  }

  let testId = 'backend-get-session-provider-models__ok';
  let traceId = testId;
  let email = `${testId}@example.com`;
  let password = '123456';
  let orgId = testId;
  let orgName = testId;
  let projectId = makeId();
  let projectName = testId;

  let prep;
  let resp;

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
            openaiApiKey: openaiApiKey
          }
        ],
        members: [
          {
            memberId: makeId(),
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

    let req: ToBackendGetSessionProviderModelsRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendGetSessionProviderModels,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        projectId: projectId,
        sessionTypes: [SessionTypeEnum.Explorer, SessionTypeEnum.Editor]
      }
    };

    resp = await sendToBackend<ToBackendGetSessionProviderModelsResponse>({
      httpServer: prep.httpServer,
      loginToken: prep.loginToken,
      req: req,
      checkIsOk: true
    });

    await prep.app.close();
  } catch (e) {
    logToConsoleBackend({
      log: e,
      logLevel: LogLevelEnum.Error,
      logger: prep.logger,
      cs: prep.cs
    });
  }

  console.log(
    `[test] returned ${resp.payload.modelsOpencode.length} opencode models and ${resp.payload.modelsAi.length} ai models`
  );

  t.true(
    resp.payload.modelsOpencode.length > 0,
    'Expected at least one opencode model'
  );

  t.true(resp.payload.modelsAi.length > 0, 'Expected at least one ai model');
});
