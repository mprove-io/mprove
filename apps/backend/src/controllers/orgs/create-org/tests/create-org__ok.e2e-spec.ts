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
  ToBackendCreateOrgRequest,
  ToBackendCreateOrgResponse
} from '~common/interfaces/to-backend/orgs/to-backend-create-org';

let testId = 'backend-create-org__ok';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';

let orgName = testId;

let prep: Prep;

test('1', async t => {
  let resp: ToBackendCreateOrgResponse;

  try {
    prep = await prepareTestAndSeed({
      traceId: traceId,
      deleteRecordsPayload: {
        emails: [email],
        orgNames: [orgName]
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

    let req: ToBackendCreateOrgRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendCreateOrg,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        name: orgName
      }
    };

    resp = await sendToBackend<ToBackendCreateOrgResponse>({
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
