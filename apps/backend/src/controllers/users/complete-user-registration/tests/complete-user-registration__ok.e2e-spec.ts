import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import { Prep } from '#backend/interfaces/prep';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { makeId } from '#common/functions/make-id/make-id';
import type { ToBackendCompleteUserRegistrationRequest } from '#common/types/backend/routes/users/complete-user-registration/complete-user-registration-request';
import type { ToBackendCompleteUserRegistrationResponse } from '#common/types/backend/routes/users/complete-user-registration/complete-user-registration-response';

let testId = 'backend-complete-user-registration__ok';

let traceId = testId;

let email = `${testId}@example.com`;
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
        deleteRecordsPayload: {
          emails: [email]
        },
        seedRecordsPayload: {
          users: [
            {
              email: email,
              isEmailVerified: false,
              emailVerificationToken: emailToken
            }
          ]
        }
      });

      let completeUserRegistrationReq: ToBackendCompleteUserRegistrationRequest =
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
        req: completeUserRegistrationReq
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

    assert.equal(resp.type, 'Success');

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
