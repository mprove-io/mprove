import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import { Prep } from '#backend/interfaces/prep';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { makeId } from '#common/functions/make-id/make-id';
import type { ToBackendSetAvatarRequest } from '#common/types/backend/routes/avatars/set-avatar/set-avatar-request';
import type { ToBackendSetAvatarResponse } from '#common/types/backend/routes/avatars/set-avatar/set-avatar-response';

let testId = 'backend-set-avatar__wrong-request-params';

let traceId = testId;

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123456';

test('1', async t => {
  let isPass: boolean;
  let prep: Prep;

  await retry(async (bail: any) => {
    let resp: ToBackendSetAvatarResponse;

    try {
      prep = await prepareTestAndSeed({
        traceId: traceId,
        deleteRecordsPayload: {
          emails: [email]
        },
        seedRecordsPayload: {
          users: [
            {
              userId,
              email,
              password,
              isEmailVerified: true
            }
          ]
        },
        loginUserPayload: { email, password }
      });

      let req: ToBackendSetAvatarRequest = {
        operation: 'setAvatar',
        traceId: traceId,
        idempotencyKey: makeId(),
        input: <any>{
          unk: '123'
        }
      };

      resp = await sendToBackend({
        route: 'api/ToBackendSetAvatar',
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req
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

    assert.equal(resp.error.code, 'BACKEND_INVALID_REQUEST');

    assert.equal(resp.error.displayData[0].code, 'invalid_type');

    assert.equal(resp.error.displayData[0].path, 'input.avatarSmall');

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
