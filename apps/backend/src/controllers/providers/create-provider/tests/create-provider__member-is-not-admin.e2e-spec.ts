import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import type { Prep } from '#backend/interfaces/prep';
import { BRANCH_MAIN } from '#common/constants/top';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { ProviderKindEnum } from '#common/enums/provider-kind.enum';
import { ProviderLlmTypeEnum } from '#common/enums/provider-llm-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import type {
  ToBackendCreateProviderRequest,
  ToBackendCreateProviderResponse
} from '#common/zod/to-backend/providers/to-backend-create-provider';

let testId = 'backend-create-provider__member-is-not-admin';
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
    let resp: ToBackendCreateProviderResponse;

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
              isAdmin: false,
              isEditor: true,
              isExplorer: true
            }
          ]
        },
        overrideConfigOptions: {
          apiAllowHosts: 'api.example.com'
        },
        loginUserPayload: { email: email, password: password }
      });

      let req: ToBackendCreateProviderRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendCreateProvider,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          projectId: projectId,
          providerId: 'non_admin_provider',
          kind: ProviderKindEnum.LLM,
          type: ProviderLlmTypeEnum.OpenAICompatible,
          isEnabled: true,
          options: {
            baseURL: 'https://api.example.com/v1',
            apiKey: 'provider-api-key',
            headers: {
              Authorization: 'Bearer provider-header-secret'
            },
            queryParams: {
              token: 'provider-query-secret'
            },
            includeUsage: true,
            supportsStructuredOutputs: true,
            models: [
              {
                modelId: 'model-1',
                name: 'Model One'
              }
            ]
          }
        }
      };

      resp = await sendToBackend<ToBackendCreateProviderResponse>({
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

    assert.equal(resp.info.error.message, ErEnum.BACKEND_MEMBER_IS_NOT_ADMIN);

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
