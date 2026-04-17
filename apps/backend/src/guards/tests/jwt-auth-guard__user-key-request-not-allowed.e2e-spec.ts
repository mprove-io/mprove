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
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import type {
  ToBackendGenerateUserApiKeyRequest,
  ToBackendGenerateUserApiKeyResponse
} from '#common/zod/to-backend/users/to-backend-generate-user-api-key';
import type {
  ToBackendSetUserNameRequest,
  ToBackendSetUserNameResponse
} from '#common/zod/to-backend/users/to-backend-set-user-name';

let testId = 'backend-jwt-auth-guard__user-key-request-not-allowed';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';

test('1', async t => {
  let isPass: boolean;
  let prep: Prep;

  await retry(async (bail: any) => {
    let resp: ToBackendSetUserNameResponse;

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

      let generateReq: ToBackendGenerateUserApiKeyRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendGenerateUserApiKey,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {}
      };

      let generateResp =
        await sendToBackend<ToBackendGenerateUserApiKeyResponse>({
          httpServer: prep.httpServer,
          loginToken: prep.loginToken,
          req: generateReq,
          checkIsOk: true
        });

      // non-MCLI endpoint
      let setNameReq: ToBackendSetUserNameRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendSetUserName,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          firstName: 'Test',
          lastName: 'User'
        }
      };

      resp = await sendToBackend<ToBackendSetUserNameResponse>({
        httpServer: prep.httpServer,
        apiKey: generateResp.payload.apiKey,
        req: setNameReq
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

    assert.equal(resp.info.status, ResponseInfoStatusEnum.Error);
    assert.equal(
      resp.info.error.message,
      ErEnum.BACKEND_USER_API_KEY_REQUEST_NOT_ALLOWED
    );

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
