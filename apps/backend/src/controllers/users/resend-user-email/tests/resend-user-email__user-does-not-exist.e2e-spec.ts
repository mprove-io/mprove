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
  ToBackendResendUserEmailRequest,
  ToBackendResendUserEmailResponse
} from '#common/interfaces/to-backend/users/to-backend-resend-user-email';

let testId = 'resend-user-email__user-does-not-exist';

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

  t.is(resp.info.error.message, ErEnum.BACKEND_USER_DOES_NOT_EXIST);
});
