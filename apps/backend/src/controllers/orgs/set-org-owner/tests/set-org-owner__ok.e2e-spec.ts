import test from 'ava';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import {
  ToBackendSetOrgOwnerRequest,
  ToBackendSetOrgOwnerResponse
} from '#common/interfaces/to-backend/orgs/to-backend-set-org-owner';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';
import { sendToBackend } from '~backend/functions/send-to-backend';
import { Prep } from '~backend/interfaces/prep';

let testId = 'backend-set-org-owner__ok';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let newOwnerEmail = `new-${testId}@example.com`;
let newOwnerPassword = '123';

let prep: Prep;

test('1', async t => {
  let resp: ToBackendSetOrgOwnerResponse;

  try {
    prep = await prepareTestAndSeed({
      traceId: traceId,
      deleteRecordsPayload: {
        emails: [email, newOwnerEmail],
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
            email: newOwnerEmail,
            password: newOwnerPassword,
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

    let req: ToBackendSetOrgOwnerRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendSetOrgOwner,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        orgId: orgId,
        ownerEmail: newOwnerEmail
      }
    };

    resp = await sendToBackend<ToBackendSetOrgOwnerResponse>({
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
