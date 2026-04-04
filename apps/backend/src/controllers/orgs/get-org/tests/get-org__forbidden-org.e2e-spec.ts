import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import { Prep } from '#backend/interfaces/prep';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import {
  ToBackendGetOrgRequest,
  ToBackendGetOrgResponse
} from '#common/interfaces/to-backend/orgs/to-backend-get-org';

let testId = 'backend-get-org__forbidden-org';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';

let emailSecond = `second-${testId}@example.com`;

let orgId = testId;
let orgName = testId;

test('1', async t => {
  let isPass: boolean;
  let prep: Prep;

  await retry(async (bail: any) => {
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
        logger: prep?.logger,
        cs: prep?.cs
      });
      if (prep) {
        await prep.app.close();
      }
    }

    assert.equal(resp.info.error.message, ErEnum.BACKEND_FORBIDDEN_ORG);

    isPass = true;
  }, BACKEND_E2E_RETRY_OPTIONS).catch((er: any) => {
    logToConsoleBackend({
      log: er,
      logLevel: LogLevelEnum.Error,
      logger: prep?.logger,
      cs: prep?.cs
    });
  });

  t.is(isPass, true);
});
