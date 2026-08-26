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
import type { LlmModelVariant } from '#common/zod/backend/llm-models/llm-model-variant';
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

  let codexResp: ToBackendEditLlmModelResponse;

  let codexProviderTab: ProviderTab;

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
            },
            {
              projectId: projectId,
              providerId: CODEX_PROVIDER_ID,
              type: ProviderTypeEnum.OpenAICodex,
              isEnabled: true,
              models: [
                {
                  modelId: 'gpt-5.5',
                  name: 'Manual Codex Model',
                  isManual: true,
                  contextLimit: 256_000,
                  inputLimit: 224_000,
                  outputLimit: 32_000,
                  isExplorer: true,
                  isBuilder: true
                }
              ],
              options: {}
            }
          ]
        },
        overrideConfigOptions: {
          isEncryptDb: true
        },
        loginUserPayload: { email: email, password: password }
      });

      let addVariantsReq: ToBackendEditLlmModelRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendEditLlmModel,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          projectId: projectId,
          providerId: providerId,
          modelId: 'model-2',
          name: 'Model Two',
          contextLimit: 128_000,
          inputLimit: 96_000,
          outputLimit: 32_000,
          variants: [
            {
              variant: 'default',
              isExplorer: false,
              isBuilder: false,
              isExplorerRecommended: false,
              isBuilderRecommended: false
            },
            {
              variant: 'low',
              isExplorer: false,
              isBuilder: false,
              isExplorerRecommended: false,
              isBuilderRecommended: false
            }
          ],
          isExplorer: false,
          isBuilder: false
        }
      };

      let addVariantsResp: ToBackendEditLlmModelResponse =
        await sendToBackend<ToBackendEditLlmModelResponse>({
          httpServer: prep.httpServer,
          loginToken: prep.loginToken,
          req: addVariantsReq
        });

      assert.equal(addVariantsResp.info.error, undefined);

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
          variants: [
            {
              variant: 'default',
              isExplorer: false,
              isBuilder: false,
              isExplorerRecommended: false,
              isBuilderRecommended: false
            },
            {
              variant: 'medium',
              isExplorer: false,
              isBuilder: false,
              isExplorerRecommended: false,
              isBuilderRecommended: false
            }
          ],
          isExplorer: false,
          isBuilder: false
        }
      };

      resp = await sendToBackend<ToBackendEditLlmModelResponse>({
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req
      });

      let codexReq: ToBackendEditLlmModelRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendEditLlmModel,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          projectId: projectId,
          providerId: CODEX_PROVIDER_ID,
          modelId: 'gpt-5.5',
          name: 'Manual Codex Model',
          contextLimit: 256_000,
          inputLimit: 224_000,
          outputLimit: 32_000,
          variants: [
            {
              variant: 'default',
              isExplorer: true,
              isBuilder: true,
              isExplorerRecommended: false,
              isBuilderRecommended: false
            },
            {
              variant: 'custom-effort',
              isExplorer: true,
              isBuilder: true,
              isExplorerRecommended: true,
              isBuilderRecommended: true
            }
          ],
          isExplorer: true,
          isBuilder: true
        }
      };

      codexResp = await sendToBackend<ToBackendEditLlmModelResponse>({
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

    let expectedVariants: LlmModelVariant[] = [
      {
        variant: 'default',
        isExplorer: false,
        isBuilder: false,
        isExplorerRecommended: false,
        isBuilderRecommended: false
      },
      {
        variant: 'medium',
        isExplorer: false,
        isBuilder: false,
        isExplorerRecommended: false,
        isBuilderRecommended: false
      }
    ];

    assert.deepEqual(responseModels[1].variants, expectedVariants);

    assert.deepEqual(providerTab.models[1].variants, expectedVariants);

    let expectedCodexVariants: LlmModelVariant[] = [
      {
        variant: 'default',
        isExplorer: true,
        isBuilder: true,
        isExplorerRecommended: false,
        isBuilderRecommended: false
      },
      {
        variant: 'custom-effort',
        isExplorer: true,
        isBuilder: true,
        isExplorerRecommended: true,
        isBuilderRecommended: true
      }
    ];

    assert.equal(codexResp.info.error, undefined);

    assert.deepEqual(
      codexResp.payload.provider.models[0].variants,
      expectedCodexVariants
    );

    assert.deepEqual(
      codexProviderTab.models[0].variants,
      expectedCodexVariants
    );

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
