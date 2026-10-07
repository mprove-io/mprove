import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/top/prepare-test-and-seed/prepare-test-and-seed';
import { sendToBackend } from '#backend/functions/top/send-to-backend/send-to-backend';
import { Prep } from '#backend/interfaces/prep';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';

import { makeId } from '#common/functions/make-id/make-id';
import { unwrapBackendResponseOutput } from '#common/functions/unwrap-backend-response-output/unwrap-backend-response-output';
import type { ToBackendSetUserNameOutput } from '#common/types/backend/routes/users/set-user-name/set-user-name-output';
import type { ToBackendSetUserNameRequest } from '#common/types/backend/routes/users/set-user-name/set-user-name-request';
import type { ToBackendSetUserNameResponse } from '#common/types/backend/routes/users/set-user-name/set-user-name-response';

let testId = 'backend-set-user-name__ok';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';
let firstName = 'John';
let lastName = 'Smith';

test('1', async t => {
  let isPass: boolean;
  let prep: Prep;

  await retry(async (bail: any) => {
    let resp: ToBackendSetUserNameResponse;

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

      let setUserNameReq: ToBackendSetUserNameRequest = {
        operation: 'setUserName',
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          firstName: firstName,
          lastName: lastName
        }
      };

      resp = await sendToBackend({
        route: 'api/ToBackendSetUserName',
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: setUserNameReq
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

    let output: ToBackendSetUserNameOutput = unwrapBackendResponseOutput({
      response: resp
    });

    assert.equal(output.user.firstName, firstName);

    assert.equal(output.user.lastName, lastName);

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
