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
import { CODEX_PROVIDER_ID } from '#common/constants/providers';
import { BRANCH_MAIN } from '#common/constants/top';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { ProviderTypeEnum } from '#common/enums/provider-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import type { ToBackendCreateLlmModelRequest } from '#common/zod/to-backend/llm-models/create-llm-model/create-llm-model-request';
import type { ToBackendCreateLlmModelResponse } from '#common/zod/to-backend/llm-models/create-llm-model/create-llm-model-response';

type ResponseModelPart = {
  modelId: string;
  name: string;
  contextLimit?: number;
  inputLimit?: number;
  outputLimit?: number;
  isExplorer: boolean;
  isBuilder: boolean;
};

let testId = 'backend-create-llm-model__ok';

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

  let codexResp: ToBackendCreateLlmModelResponse;

  let codexProviderTab: ProviderTab;

  await retry(async () => {
    let resp: ToBackendCreateLlmModelResponse;

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
            },
            {
              projectId: projectId,
              providerId: CODEX_PROVIDER_ID,
              type: ProviderTypeEnum.OpenAICodex,
              isEnabled: true,
              models: [],
              options: {}
            }
          ]
        },
        overrideConfigOptions: {
          isEncryptDb: true
        },
        loginUserPayload: { email: email, password: password }
      });

      let req: ToBackendCreateLlmModelRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendCreateLlmModel,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          projectId: projectId,
          providerId: providerId,
          modelId: 'model-2',
          name: 'Model Two',
          isManual: false,
          contextLimit: 128_000,
          inputLimit: 96_000,
          outputLimit: 32_000,
          isExplorer: false,
          isBuilder: false
        }
      };

      resp = await sendToBackend<ToBackendCreateLlmModelResponse>({
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req
      });

      let codexReq: ToBackendCreateLlmModelRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendCreateLlmModel,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          projectId: projectId,
          providerId: CODEX_PROVIDER_ID,
          modelId: 'gpt-codex-manual',
          name: 'Manual Codex Model',
          isManual: true,
          contextLimit: 256_000,
          inputLimit: 224_000,
          outputLimit: 32_000,
          isExplorer: true,
          isBuilder: true
        }
      };

      codexResp = await sendToBackend<ToBackendCreateLlmModelResponse>({
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: codexReq
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

      let foundCodexProviderEnt: ProviderEnt =
        (await db.drizzle.query.providersTable.findFirst({
          where: and(
            eq(providersTable.projectId, projectId),
            eq(providersTable.providerId, CODEX_PROVIDER_ID)
          )
        })) as ProviderEnt;

      codexProviderTab = tabService.providerEntToTab({
        providerEnt: foundCodexProviderEnt
      });

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

    assert.equal(codexResp.info.error, undefined);

    assert.equal(codexResp.info.status, ResponseInfoStatusEnum.Ok);

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
        queryParams: [{ key: 'version', value: '1' }]
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
        name: 'Model Two',
        contextLimit: 128_000,
        inputLimit: 96_000,
        outputLimit: 32_000,
        isExplorer: false,
        isBuilder: false
      }
    ]);

    assert.deepEqual(providerTab.options, {
      baseURL: 'https://api.example.com/v1',
      apiKey: 'provider-api-key',
      headers: [{ key: 'Authorization', value: 'provider-header-secret' }],
      queryParams: [{ key: 'version', value: '1' }]
    });

    assert.equal(providerTab.models[1].isExplorer, false);

    assert.equal(providerTab.models[1].isBuilder, false);

    assert.equal(providerTab.models[1].isOpencodeSupported, true);

    assert.deepEqual(providerTab.models[1].explorerInactiveReasons, []);

    assert.deepEqual(providerTab.models[1].builderInactiveReasons, []);

    assert.equal(codexProviderTab.models[0].modelId, 'gpt-codex-manual');

    assert.equal(codexProviderTab.models[0].name, 'Manual Codex Model');

    assert.equal(codexProviderTab.models[0].isManual, true);

    assert.equal(codexProviderTab.models[0].contextLimit, 256_000);

    assert.equal(codexProviderTab.models[0].inputLimit, 224_000);

    assert.equal(codexProviderTab.models[0].outputLimit, 32_000);

    assert.equal(codexProviderTab.models[0].isOpencodeSupported, true);

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
