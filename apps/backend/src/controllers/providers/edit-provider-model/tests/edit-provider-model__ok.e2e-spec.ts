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
import { ProviderKindEnum } from '#common/enums/provider-kind.enum';
import { ProviderLlmTypeEnum } from '#common/enums/provider-llm-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import type {
  ToBackendEditProviderModelRequest,
  ToBackendEditProviderModelResponse
} from '#common/zod/to-backend/providers/to-backend-edit-provider-model';

let testId = 'backend-edit-provider-model__ok';
let traceId = testId;

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let projectId = makeId();
let projectName = testId;
let providerId = 'custom_llm';

test('1', async t => {
  let isPass = false;
  let prep: Prep;

  await retry(async () => {
    let resp: ToBackendEditProviderModelResponse;
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
              kind: ProviderKindEnum.LLM,
              type: ProviderLlmTypeEnum.OpenAICompatible,
              isEnabled: true,
              options: {
                baseURL: 'https://api.example.com/v1',
                apiKey: 'provider-api-key',
                headers: [
                  { key: 'Authorization', value: 'provider-header-secret' }
                ],
                queryParams: [{ key: 'version', value: '1' }],
                models: [
                  { modelId: 'model-1', name: 'Model One' },
                  { modelId: 'model-2', name: 'Model Two' },
                  { modelId: 'model-3', name: 'Model Three' }
                ]
              }
            }
          ]
        },
        overrideConfigOptions: {
          isEncryptDb: true
        },
        loginUserPayload: { email: email, password: password }
      });

      let req: ToBackendEditProviderModelRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendEditProviderModel,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          projectId: projectId,
          providerId: providerId,
          modelId: 'model-2',
          name: 'Renamed Model Two'
        }
      };

      resp = await sendToBackend<ToBackendEditProviderModelResponse>({
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req
      });

      let db = prep.moduleRef.get<Db>(DRIZZLE);
      let foundProviderEnt = await db.drizzle.query.providersTable.findFirst({
        where: and(
          eq(providersTable.projectId, projectId),
          eq(providersTable.providerId, providerId)
        )
      });
      assert.notEqual(foundProviderEnt, undefined);
      providerEnt = foundProviderEnt;

      let tabService = prep.moduleRef.get<TabService>(TabService);
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

    let { serverTs, ...providerWithoutServerTs } = resp.payload.provider;

    assert.deepEqual(providerWithoutServerTs, {
      projectId: projectId,
      providerId: providerId,
      kind: ProviderKindEnum.LLM,
      type: ProviderLlmTypeEnum.OpenAICompatible,
      isEnabled: true,
      options: {
        baseURL: 'https://api.example.com/v1',
        apiKey: '',
        headers: [{ key: 'Authorization', value: '' }],
        queryParams: [{ key: 'version', value: '1' }],
        models: [
          { modelId: 'model-1', name: 'Model One' },
          { modelId: 'model-2', name: 'Renamed Model Two' },
          { modelId: 'model-3', name: 'Model Three' }
        ]
      }
    });

    assert.deepEqual(providerTab.options, {
      baseURL: 'https://api.example.com/v1',
      apiKey: 'provider-api-key',
      headers: [{ key: 'Authorization', value: 'provider-header-secret' }],
      queryParams: [{ key: 'version', value: '1' }],
      models: [
        { modelId: 'model-1', name: 'Model One' },
        { modelId: 'model-2', name: 'Renamed Model Two' },
        { modelId: 'model-3', name: 'Model Three' }
      ]
    });

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
