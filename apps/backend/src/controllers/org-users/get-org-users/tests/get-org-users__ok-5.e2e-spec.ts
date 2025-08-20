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
  ToBackendGetOrgUsersRequest,
  ToBackendGetOrgUsersResponse
} from '~common/interfaces/to-backend/org-users/to-backend-get-org-users';

let testId = 'backend-get-org-users__ok-5';

let traceId = testId;

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let prep: Prep;

test('1', async t => {
  let resp: ToBackendGetOrgUsersResponse;

  try {
    prep = await prepareTestAndSeed({
      traceId: traceId,
      deleteRecordsPayload: {
        emails: [email],
        orgIds: [orgId],
        projectIds: [],
        projectNames: []
      },
      seedRecordsPayload: {
        users: [
          {
            userId,
            email,
            password,
            isEmailVerified: true
          }
        ],
        orgs: [
          {
            orgId,
            name: orgName,
            ownerEmail: email
          }
        ],
        projects: [],
        members: []
      },
      loginUserPayload: { email, password }
    });

    let req: ToBackendGetOrgUsersRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendGetOrgUsers,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        orgId: orgId,
        perPage: 1,
        pageNum: 1
      }
    };

    resp = await sendToBackend<ToBackendGetOrgUsersResponse>({
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
  t.is(resp.payload.total, 0);
  t.is(resp.payload.orgUsersList.length, 0);
});
