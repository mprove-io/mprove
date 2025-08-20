import test from 'ava';

import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';

let testId = 'backend-get-org__forbidden-org';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';

let emailSecond = `second-${testId}@example.com`;

let orgId = testId;
let orgName = testId;

let prep: Prep;

test('1', async t => {
  let resp: ToBackendGetOrgResponse;

  try {
    prep = await prepareTestAndSeed({
      traceId: traceId,
      deleteRecordsPayload: {
        emails: [email, emailSecond],
        orgIds: [orgId]
      },
      seedRecordsPayload: {
        users: [
          {
            email,
            password,
            isEmailVerified: true
          },
          {
            email: emailSecond,
            password,
            isEmailVerified: true
          }
        ],
        orgs: [
          {
            orgId: orgId,
            ownerEmail: emailSecond,
            name: orgName
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    let req: ToBackendGetOrgRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendGetOrg,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        orgId: orgId
      }
    };

    resp = await sendToBackend<ToBackendGetOrgResponse>({
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

  t.is(resp.info.error.message, ErEnum.BACKEND_FORBIDDEN_ORG);
});
