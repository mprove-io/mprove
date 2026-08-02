import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import type { Prep } from '#backend/interfaces/prep';
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
  ToBackendGetProvidersRequest,
  ToBackendGetProvidersResponse
} from '#common/zod/to-backend/providers/to-backend-get-providers';

let testId = 'backend-get-providers__ok';
let traceId = testId;

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let projectId = makeId();
let projectName = testId;

test('1', async t => {
  let isPass = false;
  let prep: Prep;

  await retry(async () => {
    let resp: ToBackendGetProvidersResponse;

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
              providerId: 'zeta',
              kind: ProviderKindEnum.LLM,
              type: ProviderLlmTypeEnum.OpenAICompatible,
              isEnabled: false,
              options: {
                baseURL: 'https://zeta.example.com/v1',
                apiKey: 'zeta-key',
                headers: [{ key: 'Authorization', value: 'zeta-secret' }],
                models: [{ modelId: 'zeta-model', name: 'Zeta Model' }]
              }
            },
            {
              projectId: projectId,
              providerId: 'alpha',
              kind: ProviderKindEnum.LLM,
              type: ProviderLlmTypeEnum.OpenAICompatible,
              isEnabled: true,
              options: {
                baseURL: 'https://alpha.example.com/v1',
                apiKey: 'alpha-key',
                headers: [{ key: 'Authorization', value: 'alpha-secret' }],
                queryParams: [{ key: 'version', value: '1' }],
                models: [{ modelId: 'alpha-model', name: 'Alpha Model' }]
              }
            }
          ]
        },
        overrideConfigOptions: {
          isEncryptDb: true
        },
        loginUserPayload: { email: email, password: password }
      });

      let req: ToBackendGetProvidersRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendGetProviders,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          projectId: projectId
        }
      };

      resp = await sendToBackend<ToBackendGetProvidersResponse>({
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req
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
    assert.equal(resp.payload.userMember.memberId, userId);
    assert.deepEqual(
      resp.payload.providers.map(provider => provider.providerId),
      ['alpha', 'zeta']
    );
    assert.equal(resp.payload.providers[0].options.apiKey, '');
    assert.deepEqual(resp.payload.providers[0].options.headers, [
      { key: 'Authorization', value: '' }
    ]);
    assert.deepEqual(resp.payload.providers[0].options.queryParams, [
      { key: 'version', value: '1' }
    ]);
    assert.equal(
      resp.payload.providers[0].options.baseURL,
      'https://alpha.example.com/v1'
    );
    assert.equal(resp.payload.providers[1].isEnabled, false);

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
