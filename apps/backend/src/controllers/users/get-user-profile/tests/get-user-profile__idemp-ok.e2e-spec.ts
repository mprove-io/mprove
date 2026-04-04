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
import {
  ToBackendGetUserProfileRequest,
  ToBackendGetUserProfileResponse
} from '#common/interfaces/to-backend/users/to-backend-get-user-profile';

let testId = 'backend-get-user-profile__idemp-ok';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';

test('1', async t => {
  let isPass: boolean;
  let prep: Prep;

  await retry(async (bail: any) => {
    let resp1: ToBackendGetUserProfileResponse;
    let resp2: ToBackendGetUserProfileResponse;

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
              isEmailVerified: true
            }
          ]
        },
        loginUserPayload: { email, password }
      });

      let idempotencyKey = makeId();

      let getUserProfileReq: ToBackendGetUserProfileRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendGetUserProfile,
          traceId: traceId,
          idempotencyKey: idempotencyKey
        },
        payload: {}
      };

      resp1 = await sendToBackend<ToBackendGetUserProfileResponse>({
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: getUserProfileReq
      });

      resp2 = await sendToBackend<ToBackendGetUserProfileResponse>({
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: getUserProfileReq
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

    assert.equal(resp1.info.error, undefined);
    assert.equal(resp1.info.status, ResponseInfoStatusEnum.Ok);
    assert.equal(resp2.info.error, undefined);
    assert.equal(resp2.info.status, ResponseInfoStatusEnum.Ok);

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
