import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';

let testId = 'backend-confirm-user-email__user-does-not-exist';

let traceId = testId;
let emailToken = common.makeId();

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendConfirmUserEmailResponse;

  try {
    prep = await prepareTestAndSeed({
      traceId: traceId,
      deleteRecordsPayload: {}
    });

    let confirmUserEmailRequest: apiToBackend.ToBackendConfirmUserEmailRequest =
      {
        info: {
          name: apiToBackend.ToBackendRequestInfoNameEnum
            .ToBackendConfirmUserEmail,
          traceId: traceId,
          idempotencyKey: common.makeId()
        },
        payload: {
          token: emailToken
        }
      };

    resp =
      await helper.sendToBackend<apiToBackend.ToBackendConfirmUserEmailResponse>(
        {
          httpServer: prep.httpServer,
          req: confirmUserEmailRequest
        }
      );

    await prep.app.close();
  } catch (e) {
    logToConsoleBackend({
      log: e,
      logLevel: common.LogLevelEnum.Error,
      logger: prep.logger,
      cs: prep.cs
    });
  }

  t.is(resp.info.error.message, common.ErEnum.BACKEND_USER_DOES_NOT_EXIST);
});
