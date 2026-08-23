import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { and, eq } from 'drizzle-orm';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { ProviderTab } from '#backend/drizzle/postgres/schema/_tabs';
import {
  type ProviderEnt,
  providersTable
} from '#backend/drizzle/postgres/schema/providers';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import type { Prep } from '#backend/interfaces/prep';
import { TabService } from '#backend/services/tab.service';
import { BRANCH_MAIN } from '#common/constants/top';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { ProviderTypeEnum } from '#common/enums/provider-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import type { ToBackendEditLlmModelRequest } from '#common/zod/to-backend/llm-models/edit-llm-model/edit-llm-model-request';
import type { ToBackendEditLlmModelResponse } from '#common/zod/to-backend/llm-models/edit-llm-model/edit-llm-model-response';

type ResponseModelPart = {
  modelId: string;
  name: string;
  contextLimit?: number;
  inputLimit?: number;
  outputLimit?: number;
  isExplorer: boolean;
  isBuilder: boolean;
};

let testId = 'backend-edit-llm-model__ok';

let traceId = testId;

let userId: string = makeId();

let email = `${testId}@example.com`;

let password = '123456';

let orgId = testId;

let orgName = testId;

let projectId: string = makeId();

let projectName = testId;

let providerId = 'custom_llm';

test('1', async t => {
  let isPass = false;

  let prep: Prep;

  await retry(async () => {
    let resp: ToBackendEditLlmModelResponse;

    let providerEnt: ProviderEnt;

    let providerTab: ProviderTab;

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
              userId: userId,
              email: email,
              password: password,
              isEmailVerified: true
            }
          ],
          orgs: [
            {
              orgId: orgId,
              name: orgName,
              ownerEmail: email
            }
          ],
          projects: [
            {
              orgId: orgId,
              projectId: projectId,
              name: projectName,
              remoteType: ProjectRemoteTypeEnum.Managed,
              defaultBranch: BRANCH_MAIN
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
              providerId: providerId,
              type: ProviderTypeEnum.OpenAICompatible,
              name: 'Custom LLM',
              isEnabled: true,
              models: [
                {
                  modelId: 'model-1',
                  name: 'Model One',
                  isExplorer: true,
                  isBuilder: true
                },
                {
                  modelId: 'model-2',
                  name: 'Model Two',
                  isExplorer: true,
                  isBuilder: true
                },
                {
                  modelId: 'model-3',
                  name: 'Model Three',
                  isExplorer: true,
                  isBuilder: true
                }
              ],
              options: {
                baseURL: 'https://api.example.com/v1',
                apiKey: 'provider-api-key',
                headers: [
                  { key: 'Authorization', value: 'provider-header-secret' }
                ],
                queryParams: [{ key: 'version', value: '1' }]
              }
            }
          ]
        },
        overrideConfigOptions: {
          isEncryptDb: true
        },
        loginUserPayload: { email: email, password: password }
      });

      let req: ToBackendEditLlmModelRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendEditLlmModel,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          projectId: projectId,
          providerId: providerId,
          modelId: 'model-2',
          name: 'Renamed Model Two',
          contextLimit: 200_000,
          inputLimit: 160_000,
          outputLimit: 40_000,
          isExplorer: false,
          isBuilder: false
        }
      };

      resp = await sendToBackend<ToBackendEditLlmModelResponse>({
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req
      });

      let db: Db = prep.moduleRef.get<Db>(DRIZZLE);

      let foundProviderEnt: ProviderEnt =
        (await db.drizzle.query.providersTable.findFirst({
          where: and(
            eq(providersTable.projectId, projectId),
            eq(providersTable.providerId, providerId)
          )
        })) as ProviderEnt;

      assert.notEqual(foundProviderEnt, undefined);

      providerEnt = foundProviderEnt;

      let tabService: TabService = prep.moduleRef.get<TabService>(TabService);

      providerTab = tabService.providerEntToTab({ providerEnt: providerEnt });

      await prep.app.close();
    } catch (e) {
      logToConsoleBackend({
        log: e,
        logLevel: LogLevelEnum.Error,
        logger: prep?.logger,
        cs: prep?.cs
      });

      if (prep) {
        await prep.app.close();
      }
    }

    assert.equal(resp.info.error, undefined);

    assert.equal(resp.info.status, ResponseInfoStatusEnum.Ok);

    let {
      serverTs,
      models: responseModels,
      ...providerWithoutServerTsAndModels
    } = resp.payload.provider;

    let responseModelParts: ResponseModelPart[] = responseModels.map(model => ({
      modelId: model.modelId,
      name: model.name,
      contextLimit: model.contextLimit,
      inputLimit: model.inputLimit,
      outputLimit: model.outputLimit,
      isExplorer: model.isExplorer,
      isBuilder: model.isBuilder
    }));

    assert.deepEqual(providerWithoutServerTsAndModels, {
      projectId: projectId,
      providerId: providerId,
      type: ProviderTypeEnum.OpenAICompatible,
      name: 'Custom LLM',
      isEnabled: true,
      options: {
        baseURL: 'https://api.example.com/v1',
        apiKey: '',
        headers: [{ key: 'Authorization', value: '' }],
        queryParams: [{ key: 'version', value: '' }]
      }
    });

    assert.deepEqual(responseModelParts, [
      {
        modelId: 'model-1',
        name: 'Model One',
        contextLimit: undefined,
        inputLimit: undefined,
        outputLimit: undefined,
        isExplorer: true,
        isBuilder: true
      },
      {
        modelId: 'model-2',
        name: 'Renamed Model Two',
        contextLimit: 200_000,
        inputLimit: 160_000,
        outputLimit: 40_000,
        isExplorer: false,
        isBuilder: false
      },
      {
        modelId: 'model-3',
        name: 'Model Three',
        contextLimit: undefined,
        inputLimit: undefined,
        outputLimit: undefined,
        isExplorer: true,
        isBuilder: true
      }
    ]);

    assert.deepEqual(providerTab.options, {
      baseURL: 'https://api.example.com/v1',
      apiKey: 'provider-api-key',
      headers: [{ key: 'Authorization', value: 'provider-header-secret' }],
      queryParams: [{ key: 'version', value: '1' }]
    });

    assert.equal(providerTab.models[1].name, 'Renamed Model Two');

    assert.equal(providerTab.models[1].isExplorer, false);

    assert.equal(providerTab.models[1].isBuilder, false);

    isPass = true;
  }, BACKEND_E2E_RETRY_OPTIONS).catch((er: unknown) => {
    logToConsoleBackend({
      log: er,
      logLevel: LogLevelEnum.Error,
      logger: prep?.logger,
      cs: prep?.cs
    });
  });

  t.is(isPass, true);
});
