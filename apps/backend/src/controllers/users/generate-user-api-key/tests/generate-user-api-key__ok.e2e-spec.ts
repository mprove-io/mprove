import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import { Prep } from '#backend/interfaces/prep';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';
import { ApiKeyTypeEnum } from '#common/enums/api-key-type.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { makeId } from '#common/functions/make-id/make-id';
import { unwrapBackendResponseOutput } from '#common/functions/unwrap-backend-response-output/unwrap-backend-response-output';
import type { ToBackendGenerateUserApiKeyRequest } from '#common/zod/backend/routes/users/generate-user-api-key/generate-user-api-key-request';
import type {
  ToBackendGenerateUserApiKeyOutput,
  ToBackendGenerateUserApiKeyResponse
} from '#common/zod/backend/routes/users/generate-user-api-key/generate-user-api-key-response';

let testId = 'backend-generate-user-api-key__ok';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';

test('1', async t => {
  let isPass: boolean;
  let prep: Prep;

  await retry(async (bail: any) => {
    let resp: ToBackendGenerateUserApiKeyResponse;

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

      let req: ToBackendGenerateUserApiKeyRequest = {
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {}
      };

      resp = await sendToBackend({
        route: 'api/ToBackendGenerateUserApiKey',
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

    assert.equal(resp.result.type, 'Success');

    let output: ToBackendGenerateUserApiKeyOutput = unwrapBackendResponseOutput(
      {
        response: resp
      }
    );

    t.truthy(output.apiKey);

    t.truthy(output.apiKeyPrefix);

    t.true(output.apiKey.startsWith(`${ApiKeyTypeEnum.PK}-`));

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
