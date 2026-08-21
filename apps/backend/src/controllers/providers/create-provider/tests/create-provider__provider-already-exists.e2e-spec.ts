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
import { ProviderTypeEnum } from '#common/enums/provider-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import type { ToBackendCreateProviderRequest } from '#common/zod/to-backend/providers/create-provider/create-provider-request';
import type { ToBackendCreateProviderResponse } from '#common/zod/to-backend/providers/create-provider/create-provider-response';

let testId = 'backend-create-provider__provider-already-exists';

let traceId = testId;

let userId: string = makeId();

let email = `${testId}@example.com`;

let password = '123456';

let orgId = testId;

let orgName = testId;

let projectId: string = makeId();

let projectName = testId;

let providerId = 'duplicate_provider';

test('1', async t => {
  let isPass = false;

  let prep: Prep;

  await retry(async () => {
    let firstResp: ToBackendCreateProviderResponse;

    let duplicateResp: ToBackendCreateProviderResponse;

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
          ]
        },
        overrideConfigOptions: {
          apiAllowHosts: 'api.example.com'
        },
        loginUserPayload: { email: email, password: password }
      });

      let payload: ToBackendCreateProviderRequest['payload'] = {
        projectId: projectId,
        providerId: providerId,
        type: ProviderTypeEnum.OpenAICompatible,
        name: 'Custom Provider',
        options: {
          baseURL: 'https://api.example.com/v1',
          apiKey: 'provider-api-key',
          headers: [
            {
              key: 'Authorization',
              value: 'Bearer provider-header-secret'
            }
          ],
          queryParams: [{ key: 'token', value: 'provider-query-secret' }]
        }
      };

      let firstReq: ToBackendCreateProviderRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendCreateProvider,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: payload
      };

      firstResp = await sendToBackend<ToBackendCreateProviderResponse>({
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: firstReq
      });

      let duplicateReq: ToBackendCreateProviderRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendCreateProvider,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: payload
      };

      duplicateResp = await sendToBackend<ToBackendCreateProviderResponse>({
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: duplicateReq
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

    assert.equal(firstResp.info.error, undefined);

    assert.equal(firstResp.info.status, ResponseInfoStatusEnum.Ok);

    assert.equal(
      duplicateResp.info.error.message,
      ErEnum.BACKEND_PROVIDER_ALREADY_EXISTS
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
