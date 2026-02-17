import test from 'ava';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import { AgentModelsService } from '#backend/services/agent-models.service';
import { BRANCH_MAIN } from '#common/constants/top';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
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

  let prep = await prepareTestAndSeed({
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

  // Load models (skipped in TEST mode onModuleInit)
  let agentModelsService =
    prep.moduleRef.get<AgentModelsService>(AgentModelsService);
  await agentModelsService.loadModels();

  let providers = ['opencode', 'openai', 'anthropic'];

  for (let provider of providers) {
    let req: ToBackendGetAgentProviderModelsRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendGetAgentProviderModels,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        provider: provider
      }
    };

    let resp = await sendToBackend<ToBackendGetAgentProviderModelsResponse>({
      httpServer: prep.httpServer,
      loginToken: prep.loginToken,
      req: req,
      checkIsOk: true
    });

    t.is(resp.info.status, ResponseInfoStatusEnum.Ok);
    t.true(Array.isArray(resp.payload.models));
    t.true(
      resp.payload.models.length > 0,
      `Expected at least one model for provider '${provider}'`
    );

    for (let model of resp.payload.models) {
      t.truthy(model.id, 'model.id should be defined');
      t.truthy(model.name, 'model.name should be defined');
      t.is(model.providerId, provider);
      t.truthy(model.providerName, 'model.providerName should be defined');
    }

    console.log(
      `[test] provider '${provider}' returned ${resp.payload.models.length} models:`
    );
    for (let model of resp.payload.models) {
      console.log(`[test]   ${model.providerId}/${model.id} - ${model.name}`);
    }
  }

  await prep.app.close();
});
