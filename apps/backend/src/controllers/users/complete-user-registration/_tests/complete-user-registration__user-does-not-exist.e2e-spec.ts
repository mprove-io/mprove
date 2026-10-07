import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/top/prepare-test-and-seed/prepare-test-and-seed';
import { sendToBackend } from '#backend/functions/top/send-to-backend/send-to-backend';
import { Prep } from '#backend/interfaces/prep';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';

import { makeId } from '#common/functions/make-id/make-id';
import type { ToBackendCompleteUserRegistrationRequest } from '#common/types/backend/routes/users/complete-user-registration/complete-user-registration-request';
import type { ToBackendCompleteUserRegistrationResponse } from '#common/types/backend/routes/users/complete-user-registration/complete-user-registration-response';

let testId = 'backend-confirm-user-email__user-does-not-exist';

let traceId = testId;
let emailToken = makeId();

let newPassword = '456';

test('1', async t => {
  let isPass: boolean;
  let prep: Prep;

  await retry(async (bail: any) => {
    let resp: ToBackendCompleteUserRegistrationResponse;

    try {
      prep = await prepareTestAndSeed({
        traceId: traceId,
        deleteRecordsPayload: {}
      });

      let completeUserRegistrationRequest: ToBackendCompleteUserRegistrationRequest =
        {
          operation: 'completeUserRegistration',
          traceId: traceId,
          idempotencyKey: makeId(),
          input: {
            emailVerificationToken: emailToken,
            newPassword: newPassword
          }
        };

      resp = await sendToBackend({
        route: 'api/ToBackendCompleteUserRegistration',
        httpServer: prep.httpServer,
        req: completeUserRegistrationRequest
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
    assert.equal(resp.error.code, 'BACKEND_USER_DOES_NOT_EXIST');

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
