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
import type { ToBackendUpdateUserPasswordRequest } from '#common/types/backend/routes/users/update-user-password/update-user-password-request';
import type { ToBackendUpdateUserPasswordResponse } from '#common/types/backend/routes/users/update-user-password/update-user-password-response';

let testId = 'backend-update-user-password__ok';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';
let newPassword = '456';
let passwordResetToken = 'jf29734j57293458';

test('1', async t => {
  let isPass: boolean;
  let prep: Prep;

  await retry(async (bail: any) => {
    let resp: ToBackendUpdateUserPasswordResponse;

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
              isEmailVerified: true,
              passwordResetToken
            }
          ]
        }
      });

      let updateUserPasswordReq: ToBackendUpdateUserPasswordRequest = {
        operation: 'updateUserPassword',
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          passwordResetToken,
          newPassword
        }
      };

      resp = await sendToBackend({
        route: 'api/ToBackendUpdateUserPassword',
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: updateUserPasswordReq
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
