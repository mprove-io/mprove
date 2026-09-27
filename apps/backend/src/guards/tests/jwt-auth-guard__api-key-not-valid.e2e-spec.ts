import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import { Prep } from '#backend/interfaces/prep';
import { BRANCH_MAIN, PROJECT_ENV_PROD } from '#common/constants/top';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { makeId } from '#common/functions/make-id/make-id';
import { unwrapBackendResponseOutput } from '#common/functions/unwrap-backend-response-output/unwrap-backend-response-output';
import type { ToBackendGetRepoRequest } from '#common/zod/backend/routes/repos/get-repo/get-repo-request';
import type { ToBackendGetRepoResponse } from '#common/zod/backend/routes/repos/get-repo/get-repo-response';
import type { ToBackendGenerateUserApiKeyRequest } from '#common/zod/backend/routes/users/generate-user-api-key/generate-user-api-key-request';

let testId = 'backend-jwt-auth-guard__api-key-not-valid';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';

test('1', async t => {
  let isPass: boolean;
  let prep: Prep;

  await retry(async (bail: any) => {
    let resp: ToBackendGetRepoResponse;

    try {
      prep = await prepareTestAndSeed({
        traceId: traceId,
        deleteRecordsPayload: {
          emails: [email]
        },
        seedRecordsPayload: {
          users: [
            {
              email,
              password,
              isEmailVerified: true
            }
          ]
        },
        loginUserPayload: { email, password }
      });

      let generateReq: ToBackendGenerateUserApiKeyRequest = {
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {}
      };

      let generateResp = await sendToBackend({
        route: 'api/ToBackendGenerateUserApiKey',
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: generateReq,
        checkIsOk: true
      });

      let req: ToBackendGetRepoRequest = {
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          projectId: 'unk',
          repoId: 'unk',
          branchId: BRANCH_MAIN,
          envId: PROJECT_ENV_PROD,
          isFetch: false
        }
      };

      let parts = unwrapBackendResponseOutput({
        response: generateResp
      }).apiKey.split('-');
      parts[parts.length - 1] = 'wrongsecret1234567890abcdef1234567890abcdef';
      let wrongApiKey = parts.join('-');

      resp = await sendToBackend({
        route: 'api/ToBackendGetRepo',
        httpServer: prep.httpServer,
        apiKey: wrongApiKey,
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

    assert.equal(resp.result.type, 'Failure');
    assert.ok(resp.result.type === 'Failure');
    assert.equal(resp.result.error.message, ErEnum.BACKEND_API_KEY_NOT_VALID);

    isPass = true;
  }, BACKEND_E2E_RETRY_OPTIONS).catch((er: any) => {
    logToConsoleBackend({
      log: er,
      logLevel: LogLevelEnum.Error,
      logger: prep?.logger,
      cs: prep?.cs
    });
  });

  t.is(isPass, true);
});
