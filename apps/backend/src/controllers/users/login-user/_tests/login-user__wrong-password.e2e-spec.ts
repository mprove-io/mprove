import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/top/prepare-test-and-seed/prepare-test-and-seed';
import { sendToBackend } from '#backend/functions/top/send-to-backend/send-to-backend';
import { Prep } from '#backend/interfaces/prep';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';

import { makeId } from '#common/functions/make-id/make-id';
import type { ToBackendLoginUserRequest } from '#common/types/backend/routes/users/login-user/login-user-request';
import type { ToBackendLoginUserResponse } from '#common/types/backend/routes/users/login-user/login-user-response';

let testId = 'backend-login-user__wrong-password';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';
let wrongPassword = '456';

test('1', async t => {
  let isPass: boolean;
  let prep: Prep;

  await retry(async (bail: any) => {
    let resp: ToBackendLoginUserResponse;

    try {
      prep = await prepareTestAndSeed({
        traceId: traceId,
        deleteRecordsPayload: {
          emails: [email]
        },
        seedRecordsPayload: {
          users: [
            {
              email: email,
              password: password,
              isEmailVerified: true
            }
          ]
        }
      });

      let loginUserReq: ToBackendLoginUserRequest = {
        operation: 'loginUser',
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          email: email,
          password: wrongPassword
        }
      };

      resp = await sendToBackend({
        route: 'api/ToBackendLoginUser',
        httpServer: prep.httpServer,
        req: loginUserReq
      });

      await prep.app.close();
    } catch (e) {
      logToConsoleBackend({
        log: e,
        logLevel: 'Error',
        logger: prep?.logger,
        cs: prep?.cs
      });
      if (prep) {
        await prep.app.close();
      }
    }

    assert.ok(resp.type === 'Failure');
    assert.equal(resp.error.code, 'BACKEND_WRONG_PASSWORD');

    isPass = true;
  }, BACKEND_E2E_RETRY_OPTIONS).catch((er: any) => {
    logToConsoleBackend({
      log: er,
      logLevel: 'Error',
      logger: prep?.logger,
      cs: prep?.cs
    });
  });

  t.is(isPass, true);
});
