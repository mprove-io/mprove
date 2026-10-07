import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { BackendConfig } from '#backend/config/backend-config';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { prepareSeed } from '#backend/functions/top/prepare-test-and-seed/prepare-seed/prepare-seed';
import { prepareTest } from '#backend/functions/top/prepare-test-and-seed/prepare-test/prepare-test';
import { sendToBackend } from '#backend/functions/top/send-to-backend/send-to-backend';
import { PrepTest } from '#backend/interfaces/prep-test';
import { BRANCH_MAIN, PROJECT_ENV_PROD } from '#common/constants/top';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';

import { makeId } from '#common/functions/make-id/make-id';
import type { ToBackendSeedRecordsInputConnectionsItem } from '#common/types/backend/parts/test-routes/to-backend-seed-records-input-connections-item';
import type { ToBackendGetChartRequest } from '#common/types/backend/routes/charts/get-chart/get-chart-request';
import type { ToBackendGetChartResponse } from '#common/types/backend/routes/charts/get-chart/get-chart-response';

let testId = 'backend-get-chart__ok';

let traceId = testId;

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let seedProjectId = 't1';
let projectId = makeId();
let projectName = testId;

let chartId = 'c1';

test('1', async t => {
  let isPass: boolean;
  let prepTest: PrepTest;

  await retry(async (bail: any) => {
    let resp: ToBackendGetChartResponse;

    try {
      prepTest = await prepareTest({});

      let c1Postgres: ToBackendSeedRecordsInputConnectionsItem = {
        envId: PROJECT_ENV_PROD,
        projectId: projectId,
        connectionId: 'c1_postgres',
        type: 'PostgreSQL',
        options: {
          postgres: {
            host: prepTest.cs.get<BackendConfig['demoProjectDwhPostgresHost']>(
              'demoProjectDwhPostgresHost'
            ),
            port: 5436,
            username: prepTest.cs.get<
              BackendConfig['demoProjectDwhPostgresUser']
            >('demoProjectDwhPostgresUser'),
            password: prepTest.cs.get<
              BackendConfig['demoProjectDwhPostgresPassword']
            >('demoProjectDwhPostgresPassword'),
            database: 'p_db',
            isSSL: false
          }
        }
      };

      let prepareSeedResult = await prepareSeed({
        httpServer: prepTest.httpServer,
        traceId: traceId,
        deleteRecordsPayload: {
          emails: [email],
          orgIds: [orgId],
          projectIds: [projectId],
          projectNames: [projectName]
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
              orgId: orgId,
              ownerEmail: email,
              name: orgName
            }
          ],
          projects: [
            {
              orgId,
              projectId,
              seedProjectId: seedProjectId,
              name: projectName,
              defaultBranch: BRANCH_MAIN,
              remoteType: 'Managed'
            }
          ],
          members: [
            {
              memberId: userId,
              email,
              projectId,
              isAdmin: true,
              isEditor: true,
              isExplorer: true
            }
          ],
          connections: [c1Postgres]
        },
        loginUserPayload: { email, password }
      });

      let req: ToBackendGetChartRequest = {
        operation: 'getChart',
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          projectId: projectId,
          repoId: userId,
          branchId: BRANCH_MAIN,
          envId: PROJECT_ENV_PROD,
          chartId: chartId,
          timezone: 'UTC'
        }
      };

      resp = await sendToBackend({
        route: 'api/ToBackendGetChart',
        httpServer: prepTest.httpServer,
        loginToken: prepareSeedResult.loginToken,
        req: req
      });

      await prepTest.app.close();
    } catch (e) {
      logToConsoleBackend({
        log: e,
        logLevel: 'Error',
        logger: prepTest?.logger,
        cs: prepTest?.cs
      });
      if (prepTest) {
        await prepTest.app.close();
      }
    }

    assert.equal(resp.type, 'Success');

    isPass = true;
  }, BACKEND_E2E_RETRY_OPTIONS).catch((er: any) => {
    logToConsoleBackend({
      log: er,
      logLevel: 'Error',
      logger: prepTest?.logger,
      cs: prepTest?.cs
    });
  });

  t.is(isPass, true);
});
