import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend.js';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import { BRANCH_MAIN } from '#common/constants/top';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import {
  ToBackendGetAgentProviderModelsRequest,
  ToBackendGetAgentProviderModelsResponse
} from '#common/interfaces/to-backend/agent/to-backend-get-agent-provider-models';

test('1', async t => {
  let testId = 'backend-get-agent-provider-models__ok';
  let traceId = testId;
  let email = `${testId}@example.com`;
  let password = '123456';
  let orgId = testId;
  let orgName = testId;
  let projectId = makeId();
  let projectName = testId;

  let prep;
  let provider = 'openai';
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
            defaultBranch: BRANCH_MAIN
          }
        ],
        members: [
          {
            memberId: makeId(),
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

    let req: ToBackendGetAgentProviderModelsRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendGetAgentProviderModels,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {}
    };

    resp = await sendToBackend<ToBackendGetAgentProviderModelsResponse>({
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
    `[test] provider '${provider}' returned ${resp.payload.models.length} models`
  );
  // for (let model of resp.payload.models) {
  //   console.log(`[test]   ${model.providerId}/${model.id} - ${model.name}`);
  // }

  t.true(
    resp.payload.models.length > 0,
    `Expected at least one model for provider '${provider}'`
  );
});
