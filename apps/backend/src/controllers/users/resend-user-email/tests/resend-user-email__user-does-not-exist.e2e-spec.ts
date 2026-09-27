import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import { Prep } from '#backend/interfaces/prep';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { makeId } from '#common/functions/make-id/make-id';
import type { ToBackendResendUserEmailRequest } from '#common/zod/backend/routes/users/resend-user-email/resend-user-email-request';
import type { ToBackendResendUserEmailResponse } from '#common/zod/backend/routes/users/resend-user-email/resend-user-email-response';

let testId = 'resend-user-email__user-does-not-exist';

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
        }
      });

      let resendUserEmailReq: ToBackendResendUserEmailRequest = {
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          userId: userId
        }
      };

      resp = await sendToBackend({
        route: 'api/ToBackendResendUserEmail',
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

    assert.ok(resp.result.type === 'Failure');
    assert.equal(resp.result.error.message, ErEnum.BACKEND_USER_DOES_NOT_EXIST);

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
