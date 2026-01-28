import test from 'ava';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import {
  ToBackendConfirmUserEmailRequest,
  ToBackendConfirmUserEmailResponse
} from '#common/interfaces/to-backend/users/to-backend-confirm-user-email';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';
import { sendToBackend } from '~backend/functions/send-to-backend';
import { Prep } from '~backend/interfaces/prep';

let testId = 'backend-confirm-user-email__ok';

let traceId = testId;

let email = `${testId}@example.com`;
let emailToken = makeId();
let password = '123456';

let prep: Prep;

test('1', async t => {
  let resp: ToBackendConfirmUserEmailResponse;

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
            isEmailVerified: false,
            emailVerificationToken: emailToken
          }
        ]
      }
    });

    let confirmUserEmailReq: ToBackendConfirmUserEmailRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendConfirmUserEmail,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        emailVerificationToken: emailToken
      }
    };

    resp = await sendToBackend<ToBackendConfirmUserEmailResponse>({
      httpServer: prep.httpServer,
      req: confirmUserEmailReq
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
