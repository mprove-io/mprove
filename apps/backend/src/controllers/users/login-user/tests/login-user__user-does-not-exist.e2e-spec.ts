import test from 'ava';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';
import { sendToBackend } from '~backend/functions/send-to-backend';
import { Prep } from '~backend/interfaces/prep';
import { ErEnum } from '~common/enums/er.enum';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '~common/functions/make-id';
import {
  ToBackendLoginUserRequest,
  ToBackendLoginUserResponse
} from '~common/interfaces/to-backend/users/to-backend-login-user';

let testId = 'backend-login-user__user-does-not-exist';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';

let prep: Prep;

test('1', async t => {
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
      logger: prep.logger,
      cs: prep.cs
    });
  }

  t.is(resp.info.error.message, ErEnum.BACKEND_USER_DOES_NOT_EXIST);
});
