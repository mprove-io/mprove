import test from 'ava';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';

let testId = 'backend-delete-org__ok';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let prep: Prep;

test('1', async t => {
  let resp: ToBackendDeleteOrgResponse;

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

    let req: ToBackendDeleteOrgRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendDeleteOrg,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        orgId: orgId
      }
    };

    resp = await sendToBackend<ToBackendDeleteOrgResponse>({
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
