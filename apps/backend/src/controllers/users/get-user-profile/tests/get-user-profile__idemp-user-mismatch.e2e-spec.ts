import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import { Prep } from '#backend/interfaces/prep';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import {
  ToBackendGetUserProfileRequest,
  ToBackendGetUserProfileResponse
} from '#common/interfaces/to-backend/users/to-backend-get-user-profile';
import {
  ToBackendLoginUserRequest,
  ToBackendLoginUserResponse
} from '#common/interfaces/to-backend/users/to-backend-login-user';

let testId = 'backend-get-user-profile__idemp-user-mismatch';

let traceId = testId;

let emailA = `${testId}-a@example.com`;
let emailB = `${testId}-b@example.com`;
let password = '123456';

let prep: Prep;

test('1', async t => {
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
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendGetUserProfile,
        traceId: traceId,
        idempotencyKey: idempotencyKey
      },
      payload: {}
    };

    await sendToBackend<ToBackendGetUserProfileResponse>({
      httpServer: prep.httpServer,
      loginToken: prep.loginToken,
      req: getUserProfileReq
    });

    let loginUserBReq: ToBackendLoginUserRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendLoginUser,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        email: emailB,
        password: password
      }
    };

    let loginUserBResp = await sendToBackend<ToBackendLoginUserResponse>({
      httpServer: prep.httpServer,
      req: loginUserBReq
    });

    let loginTokenB = loginUserBResp.payload.token;

    resp2 = await sendToBackend<ToBackendGetUserProfileResponse>({
      httpServer: prep.httpServer,
      loginToken: loginTokenB,
      req: getUserProfileReq
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

  t.is(resp2.info.status, ResponseInfoStatusEnum.Error);
  t.is(resp2.info.error?.message, ErEnum.BACKEND_IDEMP_USER_MISMATCH);
});
