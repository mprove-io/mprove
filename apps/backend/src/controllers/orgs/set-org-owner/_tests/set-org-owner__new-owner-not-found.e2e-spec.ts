import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import { Prep } from '#backend/interfaces/prep';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';

import { makeId } from '#common/functions/make-id/make-id';
import type { ToBackendSetOrgOwnerRequest } from '#common/types/backend/routes/orgs/set-org-owner/set-org-owner-request';
import type { ToBackendSetOrgOwnerResponse } from '#common/types/backend/routes/orgs/set-org-owner/set-org-owner-response';

let testId = 'backend-set-org-owner__new-owner-not-found';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';

let newOwnerEmail = `new-${testId}@example.com`;

let orgId = testId;
let orgName = testId;

test('1', async t => {
  let isPass: boolean;
  let prep: Prep;

  await retry(async (bail: any) => {
    let resp: ToBackendSetOrgOwnerResponse;

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

      let req: ToBackendSetOrgOwnerRequest = {
        operation: 'setOrgOwner',
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          orgId: orgId,
          ownerEmail: newOwnerEmail
        }
      };

      resp = await sendToBackend({
        route: 'api/ToBackendSetOrgOwner',
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req
      });

      await prep.app.close();
    } catch (e) {
      logToConsoleBackend({
        log: e,
        logLevel: 'Error',
        logger: prep?.logger,
        cs: prep?.cs
      });
      if (prep) {
        await prep.app.close();
      }
    }

    assert.ok(resp.type === 'Failure');
    assert.equal(resp.error.code, 'BACKEND_NEW_OWNER_NOT_FOUND');

    isPass = true;
  }, BACKEND_E2E_RETRY_OPTIONS).catch((er: any) => {
    logToConsoleBackend({
      log: er,
      logLevel: 'Error',
      logger: prep?.logger,
      cs: prep?.cs
    });
  });

  t.is(isPass, true);
});
