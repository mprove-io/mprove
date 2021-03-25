import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'backend-set-avatar__ok';

let traceId = testId;

let userId = common.makeId();
let email = `${testId}@example.com`;
let password = '123';

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendSetAvatarResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: {
        idempotencyKeys: [testId],
        emails: [email]
      },
      seedRecordsPayload: {
        users: [
          {
            userId,
            email,
            password,
            isEmailVerified: common.BoolEnum.TRUE
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    let req: apiToBackend.ToBackendSetAvatarRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetAvatar,
        traceId: traceId,
        idempotencyKey: testId
      },
      payload: {
        avatarBig: '123',
        avatarSmall: '123'
      }
    };

    resp = await helper.sendToBackend<apiToBackend.ToBackendSetAvatarResponse>({
      httpServer: prep.httpServer,
      loginToken: prep.loginToken,
      req: req
    });

    await prep.app.close();
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(resp.info.error, undefined);
  t.is(resp.info.status, common.ResponseInfoStatusEnum.Ok);
});
