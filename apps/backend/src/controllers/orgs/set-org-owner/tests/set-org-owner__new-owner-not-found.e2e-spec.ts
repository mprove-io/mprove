import test from 'ava';

import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';

let testId = 'backend-set-org-owner__new-owner-not-found';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';

let newOwnerEmail = `new-${testId}@example.com`;

let orgId = testId;
let orgName = testId;

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendSetOrgOwnerResponse;

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

    let req: apiToBackend.ToBackendSetOrgOwnerRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetOrgOwner,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        orgId: orgId,
        ownerEmail: newOwnerEmail
      }
    };

    resp = await sendToBackend<apiToBackend.ToBackendSetOrgOwnerResponse>({
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

  t.is(resp.info.error.message, ErEnum.BACKEND_NEW_OWNER_NOT_FOUND);
});
