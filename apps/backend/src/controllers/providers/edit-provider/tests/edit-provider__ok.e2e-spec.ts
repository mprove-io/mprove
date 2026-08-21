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
import type { ToBackendEditProviderRequest } from '#common/zod/to-backend/providers/edit-provider/edit-provider-request';
import type { ToBackendEditProviderResponse } from '#common/zod/to-backend/providers/edit-provider/edit-provider-response';

let testId = 'backend-edit-provider__ok';

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
    let resp: ToBackendEditProviderResponse;

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
              name: 'Old Provider Name',
              isEnabled: true,
              models: [
                {
                  modelId: 'old-model',
                  name: 'Old Model',
                  isExplorer: true,
                  isBuilder: true
                }
              ],
              options: {
                baseURL: 'https://old.example.com/v1',
                apiKey: 'old-key'
              }
            }
          ]
        },
        overrideConfigOptions: {
          isEncryptDb: true,
          apiAllowHosts: 'new.example.com'
        },
        loginUserPayload: { email: email, password: password }
      });

      let req: ToBackendEditProviderRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendEditProvider,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          projectId: projectId,
          providerId: providerId,
          name: 'New Provider Name',
          options: {
            baseURL: 'https://new.example.com/v1',
            apiKey: 'new-key',
            headers: [{ key: 'Authorization', value: 'new-header-secret' }],
            queryParams: [{ key: 'version', value: '2' }]
          }
        }
      };

      resp = await sendToBackend<ToBackendEditProviderResponse>({
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

    assert.equal(resp.payload.provider.isEnabled, true);

    assert.equal(resp.payload.provider.name, 'New Provider Name');

    assert.equal(resp.payload.provider.type, ProviderTypeEnum.OpenAICompatible);

    if (resp.payload.provider.type !== ProviderTypeEnum.OpenAICompatible) {
      throw new Error('Expected an OpenAI-compatible provider');
    }

    assert.equal(
      resp.payload.provider.options.baseURL,
      'https://new.example.com/v1'
    );

    assert.equal(resp.payload.provider.options.apiKey, '');

    assert.deepEqual(resp.payload.provider.options.headers, [
      { key: 'Authorization', value: '' }
    ]);

    assert.deepEqual(resp.payload.provider.options.queryParams, [
      { key: 'version', value: '2' }
    ]);

    assert.equal(providerTab.isEnabled, true);

    assert.equal(providerTab.name, 'New Provider Name');

    assert.deepEqual(providerTab.options, {
      baseURL: 'https://new.example.com/v1',
      apiKey: 'new-key',
      headers: [{ key: 'Authorization', value: 'new-header-secret' }],
      queryParams: [{ key: 'version', value: '2' }]
    });

    assert.deepEqual(providerTab.models, [
      { modelId: 'old-model', name: 'Old Model' }
    ]);

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
