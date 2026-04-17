import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import { Prep } from '#backend/interfaces/prep';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import type {
  ToBackendResendUserEmailRequest,
  ToBackendResendUserEmailResponse
} from '#common/zod/to-backend/users/to-backend-resend-user-email';

let testId = 'resend-user-email__ok-verified-false';

let traceId = testId;

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123456';

test('1', async t => {
  let isPass: boolean;
  let prep: Prep;

  await retry(async (bail: any) => {
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
              isEmailVerified: false
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
        logger: prep?.logger,
        cs: prep?.cs
      });
      if (prep) {
        await prep.app.close();
      }
    }

    assert.equal(resp.info.error, undefined);
    assert.equal(resp.info.status, ResponseInfoStatusEnum.Ok);
    assert.equal(resp.payload.isEmailVerified, false);

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
