import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/top/prepare-test-and-seed/prepare-test-and-seed';
import { sendToBackend } from '#backend/functions/top/send-to-backend/send-to-backend';
import { Prep } from '#backend/interfaces/prep';
import { BRANCH_MAIN, PROJECT_ENV_PROD } from '#common/constants/top';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';

import { makeId } from '#common/functions/make-id/make-id';
import type { ToBackendGetStateRequest } from '#common/types/backend/routes/state/get-state/get-state-request';
import type { ToBackendGetStateResponse } from '#common/types/backend/routes/state/get-state/get-state-response';

let testId = 'backend-jwt-auth-guard__wrong-api-key-format';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';

test('1', async t => {
  let isPass: boolean;
  let prep: Prep;

  await retry(async (bail: any) => {
    let resp: ToBackendGetStateResponse;

    try {
      prep = await prepareTestAndSeed({
        traceId: traceId,
        deleteRecordsPayload: {
          emails: [email]
        },
        seedRecordsPayload: {
          users: [
            {
              email,
              password,
              isEmailVerified: true
            }
          ]
        }
      });

      // Use a key with wrong format (2 parts instead of 4)
      let badFormatKey = 'PK-WRONG-FORMAT';

      let req: ToBackendGetStateRequest = {
        operation: 'getState',
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          projectId: 'unk',
          repoId: 'unk',
          branchId: BRANCH_MAIN,
          envId: PROJECT_ENV_PROD,
          isFetch: false,
          getErrors: false,
          getRepo: false,
          getRepoNodes: false,
          getModels: false,
          getDashboards: false,
          getCharts: false,
          getMetrics: false,
          getReports: false
        }
      };

      resp = await sendToBackend({
        route: 'api/ToBackendGetState',
        httpServer: prep.httpServer,
        apiKey: badFormatKey,
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

    assert.equal(resp.type, 'Failure');
    assert.equal(resp.error.code, 'BACKEND_WRONG_API_KEY_FORMAT');

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
