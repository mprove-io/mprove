import test from 'ava';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';
import { sendToBackend } from '~backend/functions/send-to-backend';
import { Prep } from '~backend/interfaces/prep';
import { ErEnum } from '~common/enums/er.enum';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '~common/functions/make-id';
import {
  ToBackendCompleteUserRegistrationRequest,
  ToBackendCompleteUserRegistrationResponse
} from '~common/interfaces/to-backend/users/to-backend-complete-user-registration';

let testId = 'backend-confirm-user-email__user-already-registered';

let traceId = testId;

let email = `${testId}@example.com`;
let emailToken = makeId();

let newPassword = '456';

let prep: Prep;

test('1', async t => {
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
            isEmailVerified: true,
            emailVerificationToken: emailToken
          }
        ]
      }
    });

    let completeUserRegistrationRequest: ToBackendCompleteUserRegistrationRequest =
      {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendCompleteUserRegistration,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          emailVerificationToken: emailToken,
          newPassword: newPassword
        }
      };

    resp = await sendToBackend<ToBackendCompleteUserRegistrationResponse>({
      httpServer: prep.httpServer,
      req: completeUserRegistrationRequest
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

  t.is(resp.info.error.message, ErEnum.BACKEND_USER_ALREADY_REGISTERED);
});
