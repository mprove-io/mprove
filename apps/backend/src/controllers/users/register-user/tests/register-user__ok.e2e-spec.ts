import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import { Prep } from '#backend/interfaces/prep';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import {
  ToBackendRegisterUserRequest,
  ToBackendRegisterUserResponse
} from '#common/interfaces/to-backend/users/to-backend-register-user';

let testId = 'backend-register-user__ok';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';

let prep: Prep;

test('1', async t => {
  let resp: ToBackendRegisterUserResponse;

  try {
    prep = await prepareTestAndSeed({
      traceId: traceId,
      deleteRecordsPayload: {
        emails: [email]
      }
    });

    let registerUserReq: ToBackendRegisterUserRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendRegisterUser,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        email: email,
        password: password
      }
    };

    resp = await sendToBackend<ToBackendRegisterUserResponse>({
      httpServer: prep.httpServer,
      req: registerUserReq
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

  t.is(resp.info.error, undefined);
  t.is(resp.info.status, ResponseInfoStatusEnum.Ok);
});
