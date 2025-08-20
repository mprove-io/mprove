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
  ToBackendIsOrgExistRequest,
  ToBackendIsOrgExistResponse
} from '~common/interfaces/to-backend/orgs/to-backend-is-org-exist';

let testId = 'backend-is-org-exist__ok__is-exist-true';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let prep: Prep;

test('1', async t => {
  let resp: ToBackendIsOrgExistResponse;

  try {
    prep = await prepareTestAndSeed({
      traceId: traceId,
      deleteRecordsPayload: {
        emails: [email],
        orgIds: [orgId]
      },
      seedRecordsPayload: {
        users: [
          {
            email,
            password,
            isEmailVerified: true
          }
        ],
        orgs: [
          {
            orgId: orgId,
            ownerEmail: email,
            name: orgName
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    let req: ToBackendIsOrgExistRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendIsOrgExist,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        name: orgName
      }
    };

    resp = await sendToBackend<ToBackendIsOrgExistResponse>({
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
  t.is(resp.payload.isExist, true);
});
