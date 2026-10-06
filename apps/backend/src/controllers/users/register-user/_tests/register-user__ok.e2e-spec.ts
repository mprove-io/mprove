import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import { Prep } from '#backend/interfaces/prep';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';

import { makeId } from '#common/functions/make-id/make-id';
import type { ToBackendRegisterUserRequest } from '#common/types/backend/routes/users/register-user/register-user-request';
import type { ToBackendRegisterUserResponse } from '#common/types/backend/routes/users/register-user/register-user-response';

let testId = 'backend-register-user__ok';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';

test('1', async t => {
  let isPass: boolean;
  let prep: Prep;

  await retry(async (bail: any) => {
    let resp: ToBackendRegisterUserResponse;

    try {
      prep = await prepareTestAndSeed({
        traceId: traceId,
        deleteRecordsPayload: {
          emails: [email]
        }
      });

      let registerUserReq: ToBackendRegisterUserRequest = {
        operation: 'registerUser',
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          email: email,
          password: password
        }
      };

      resp = await sendToBackend({
        route: 'api/ToBackendRegisterUser',
        httpServer: prep.httpServer,
        req: registerUserReq
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

    assert.equal(resp.type, 'Success');

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
