import test from 'ava';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import {
  ToBackendResendUserEmailRequest,
  ToBackendResendUserEmailResponse
} from '#common/interfaces/to-backend/users/to-backend-resend-user-email';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';
import { sendToBackend } from '~backend/functions/send-to-backend';
import { Prep } from '~backend/interfaces/prep';

let testId = 'resend-user-email__ok-verified-true';

let traceId = testId;

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123456';

let prep: Prep;

test('1', async t => {
  let resp: ToBackendResendUserEmailResponse;

  try {
    prep = await prepareTestAndSeed({
      traceId: traceId,
      deleteRecordsPayload: {
        emails: [email]
      },
      seedRecordsPayload: {
        users: [
          {
            userId: userId,
            email: email,
            password: password,
            isEmailVerified: true
          }
        ]
      }
    });

    let resendUserEmailReq: ToBackendResendUserEmailRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendResendUserEmail,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        userId: userId
      }
    };

    resp = await sendToBackend<ToBackendResendUserEmailResponse>({
      httpServer: prep.httpServer,
      req: resendUserEmailReq
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
  t.is(resp.payload.isEmailVerified, true);
});
