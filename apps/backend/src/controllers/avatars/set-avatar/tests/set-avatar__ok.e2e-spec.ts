import test from 'ava';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';
import { sendToBackend } from '~backend/functions/send-to-backend';
import { Prep } from '~backend/interfaces/prep';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '~common/functions/make-id';
import {
  ToBackendSetAvatarRequest,
  ToBackendSetAvatarResponse
} from '~common/interfaces/to-backend/avatars/to-backend-set-avatar';

let testId = 'backend-set-avatar__ok';

let traceId = testId;

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123456';

let prep: Prep;

test('1', async t => {
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
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendSetAvatar,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        avatarBig: '123',
        avatarSmall: '123'
      }
    };

    resp = await sendToBackend<ToBackendSetAvatarResponse>({
      httpServer: prep.httpServer,
      loginToken: prep.loginToken,
      req: req
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
