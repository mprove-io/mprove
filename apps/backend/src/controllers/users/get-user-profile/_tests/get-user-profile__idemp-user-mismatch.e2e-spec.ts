import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/top/prepare-test-and-seed/prepare-test-and-seed';
import { sendToBackend } from '#backend/functions/top/send-to-backend/send-to-backend';
import { Prep } from '#backend/interfaces/prep';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';

import { makeId } from '#common/functions/make-id/make-id';
import { unwrapBackendResponseOutput } from '#common/functions/unwrap-backend-response-output/unwrap-backend-response-output';
import type { ToBackendGetUserProfileRequest } from '#common/types/backend/routes/users/get-user-profile/get-user-profile-request';
import type { ToBackendGetUserProfileResponse } from '#common/types/backend/routes/users/get-user-profile/get-user-profile-response';
import type { ToBackendLoginUserRequest } from '#common/types/backend/routes/users/login-user/login-user-request';

let testId = 'backend-get-user-profile__idemp-user-mismatch';

let traceId = testId;

let emailA = `${testId}-a@example.com`;
let emailB = `${testId}-b@example.com`;
let password = '123456';

test('1', async t => {
  let isPass: boolean;
  let prep: Prep;

  await retry(async (bail: any) => {
    let resp2: ToBackendGetUserProfileResponse;

    try {
      prep = await prepareTestAndSeed({
        traceId: traceId,
        deleteRecordsPayload: {
          emails: [emailA, emailB]
        },
        seedRecordsPayload: {
          users: [
            {
              email: emailA,
              password,
              isEmailVerified: true
            },
            {
              email: emailB,
              password,
              isEmailVerified: true
            }
          ]
        },
        loginUserPayload: { email: emailA, password }
      });

      let idempotencyKey = makeId();

      let getUserProfileReq: ToBackendGetUserProfileRequest = {
        operation: 'getUserProfile',
        traceId: traceId,
        idempotencyKey: idempotencyKey,
        input: {}
      };

      await sendToBackend({
        route: 'api/ToBackendGetUserProfile',
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: getUserProfileReq
      });

      let loginUserBReq: ToBackendLoginUserRequest = {
        operation: 'loginUser',
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          email: emailB,
          password: password
        }
      };

      let loginUserBResp = await sendToBackend({
        route: 'api/ToBackendLoginUser',
        httpServer: prep.httpServer,
        req: loginUserBReq
      });

      let loginTokenB = unwrapBackendResponseOutput({
        response: loginUserBResp
      }).token;

      resp2 = await sendToBackend({
        route: 'api/ToBackendGetUserProfile',
        httpServer: prep.httpServer,
        loginToken: loginTokenB,
        req: getUserProfileReq
      });

      await prep.app.close();
    } catch (e) {
      logToConsoleBackend({
        log: e,
        logLevel: 'Error',
        logger: prep?.logger,
        cs: prep?.cs
      });
      if (prep) {
        await prep.app.close();
      }
    }

    assert.ok(resp2.type === 'Failure');
    assert.equal(resp2.error?.code, 'BACKEND_IDEMP_USER_MISMATCH');

    isPass = true;
  }, BACKEND_E2E_RETRY_OPTIONS).catch((er: any) => {
    logToConsoleBackend({
      log: er,
      logLevel: 'Error',
      logger: prep?.logger,
      cs: prep?.cs
    });
  });

  t.is(isPass, true);
});
