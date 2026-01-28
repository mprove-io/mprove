import test from 'ava';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import {
  ToBackendCompleteUserRegistrationRequest,
  ToBackendCompleteUserRegistrationResponse
} from '#common/interfaces/to-backend/users/to-backend-complete-user-registration';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';
import { sendToBackend } from '~backend/functions/send-to-backend';
import { Prep } from '~backend/interfaces/prep';

let testId = 'backend-complete-user-registration__ok';

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
            isEmailVerified: false,
            emailVerificationToken: emailToken
          }
        ]
      }
    });

    let completeUserRegistrationReq: ToBackendCompleteUserRegistrationRequest =
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
      req: completeUserRegistrationReq
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

  t.is(resp.info.error, undefined);
  t.is(resp.info.status, ResponseInfoStatusEnum.Ok);
});
