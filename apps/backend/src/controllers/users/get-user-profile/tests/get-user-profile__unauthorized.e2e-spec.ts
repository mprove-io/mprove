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
import type { ToBackendGetUserProfileRequest } from '#common/zod/backend/routes/users/get-user-profile/get-user-profile-request';
import type { ToBackendGetUserProfileResponse } from '#common/zod/backend/routes/users/get-user-profile/get-user-profile-response';

let testId = 'backend-get-user-profile__unauthorized';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';

test('1', async t => {
  let isPass: boolean;
  let prep: Prep;

  await retry(async (bail: any) => {
    let resp: ToBackendGetUserProfileResponse;

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
        }
      });

      let getUserProfileReq: ToBackendGetUserProfileRequest = {
        operation: 'getUserProfile',
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {}
      };

      resp = await sendToBackend({
        route: 'api/ToBackendGetUserProfile',
        httpServer: prep.httpServer,
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

    assert.ok(resp.type === 'Failure');
    assert.equal(resp?.error?.code, ErEnum.BACKEND_UNAUTHORIZED);

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
