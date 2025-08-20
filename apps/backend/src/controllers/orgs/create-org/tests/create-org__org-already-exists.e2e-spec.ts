import test from 'ava';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';

let testId = 'backend-create-org__org-already-exists';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let prep: Prep;

test('1', async t => {
  let resp: ToBackendCreateOrgResponse;

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
            orgId,
            name: orgName,
            ownerEmail: email
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

  t.is(resp.info.error.message, ErEnum.BACKEND_ORG_ALREADY_EXISTS);
});
