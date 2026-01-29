import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import { Prep } from '#backend/interfaces/prep';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import {
  ToBackendUpdateUserPasswordRequest,
  ToBackendUpdateUserPasswordResponse
} from '#common/interfaces/to-backend/users/to-backend-update-user-password';

let testId = 'backend-update-user-password__token-expired';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';
let newPassword = '456';
let passwordResetToken = 'dj293d4958734d95';
let expiredPasswordResetExpiresTs = 1;

let prep: Prep;

test('1', async t => {
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
            passwordResetToken,
            passwordResetExpiresTs: expiredPasswordResetExpiresTs
          }
        ]
      }
    });

    let updateUserPasswordReq: ToBackendUpdateUserPasswordRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendUpdateUserPassword,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        passwordResetToken,
        newPassword
      }
    };

    resp = await sendToBackend<ToBackendUpdateUserPasswordResponse>({
      httpServer: prep.httpServer,
      loginToken: prep.loginToken,
      req: updateUserPasswordReq
    });

    await prep.app.close();
  } catch (e) {
    logToConsoleBackend({
      log: e,
      logLevel: LogLevelEnum.Error,
      logger: prep.logger,
      cs: prep.cs
    });
  }

  t.is(resp.info.error.message, ErEnum.BACKEND_UPDATE_PASSWORD_TOKEN_EXPIRED);
});
