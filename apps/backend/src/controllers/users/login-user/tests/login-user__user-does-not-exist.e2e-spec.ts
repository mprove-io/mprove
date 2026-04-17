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
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import type {
  ToBackendLoginUserRequest,
  ToBackendLoginUserResponse
} from '#common/zod/to-backend/users/to-backend-login-user';

let testId = 'backend-login-user__user-does-not-exist';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';

test('1', async t => {
  let isPass: boolean;
  let prep: Prep;

  await retry(async (bail: any) => {
    let resp: ToBackendLoginUserResponse;

    try {
      prep = await prepareTestAndSeed({
        traceId: traceId,
        deleteRecordsPayload: {
          emails: [email]
        }
      });

      let loginUserReq: ToBackendLoginUserRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendLoginUser,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          email: email,
          password: password
        }
      };

      resp = await sendToBackend<ToBackendLoginUserResponse>({
        httpServer: prep.httpServer,
        req: loginUserReq
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

    assert.equal(resp.info.error.message, ErEnum.BACKEND_USER_DOES_NOT_EXIST);

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
