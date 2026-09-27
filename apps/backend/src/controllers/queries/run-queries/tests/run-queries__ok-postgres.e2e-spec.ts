import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { BackendConfig } from '#backend/config/backend-config';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareSeed, prepareTest } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import { PrepTest } from '#backend/interfaces/prep-test';
import { BRANCH_MAIN, PROJECT_ENV_PROD, UTC } from '#common/constants/top';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { QueryStatusEnum } from '#common/enums/query-status.enum';
import { makeId } from '#common/functions/make-id/make-id';
import { makeSpaceUnits } from '#common/functions/make-space-units/make-space-units';
import { spaceUnitToChartUnit } from '#common/functions/space-unit-to-chart-unit/space-unit-to-chart-unit';
import { unwrapBackendResponseOutput } from '#common/functions/unwrap-backend-response-output/unwrap-backend-response-output';
import type { ToBackendGetChartRequest } from '#common/zod/backend/routes/charts/get-chart/get-chart-request';
import type { ToBackendGetChartsRequest } from '#common/zod/backend/routes/charts/get-charts/get-charts-request';
import type { ToBackendGetQueryRequest } from '#common/zod/backend/routes/queries/get-query/get-query-request';
import type { ToBackendRunQueriesRequest } from '#common/zod/backend/routes/queries/run-queries/run-queries-request';
import type { ToBackendRunQueriesResponse } from '#common/zod/backend/routes/queries/run-queries/run-queries-response';
import type { ToBackendSeedRecordsInputConnectionsItem } from '#common/zod/backend/test-routes/to-backend-seed-records-input-connections-item';

let testId = 'backend-run-queries__ok-postgres';

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
    let resp2: ToBackendRunQueriesResponse;

    try {
      prepTest = await prepareTest({});

      let c1Postgres: ToBackendSeedRecordsInputConnectionsItem = {
        envId: PROJECT_ENV_PROD,
        projectId: projectId,
        connectionId: 'c1_postgres',
        type: ConnectionTypeEnum.PostgreSQL,
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
              remoteType: ProjectRemoteTypeEnum.Managed
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

      let req1: ToBackendGetChartsRequest = {
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          projectId: projectId,
          repoId: userId,
          branchId: BRANCH_MAIN,
          envId: PROJECT_ENV_PROD
        }
      };

      let resp1 = await sendToBackend({
        route: 'api/ToBackendGetCharts',
        httpServer: prepTest.httpServer,
        loginToken: prepareSeedResult.loginToken,
        req: req1
      });

      let chartUnit = makeSpaceUnits({
        spaceNodes: unwrapBackendResponseOutput({ response: resp1 })
          .chartSpaceNodes
      })
        .map(spaceUnit => spaceUnitToChartUnit({ spaceUnit: spaceUnit }))
        .find(x => x.chartId === chartId);

      assert.ok(chartUnit);

      let reqGetChart: ToBackendGetChartRequest = {
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          projectId: projectId,
          repoId: userId,
          branchId: BRANCH_MAIN,
          envId: PROJECT_ENV_PROD,
          chartId: chartUnit.chartId,
          timezone: UTC
        }
      };

      let respGetChart = await sendToBackend({
        route: 'api/ToBackendGetChart',
        httpServer: prepTest.httpServer,
        loginToken: prepareSeedResult.loginToken,
        req: reqGetChart
      });

      let chart = unwrapBackendResponseOutput({ response: respGetChart }).chart;

      let req2: ToBackendRunQueriesRequest = {
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          projectId: projectId,
          repoId: userId,
          branchId: BRANCH_MAIN,
          envId: PROJECT_ENV_PROD,
          mconfigIds: [chart.tiles[0].mconfigId]
        }
      };

      resp2 = await sendToBackend({
        route: 'api/ToBackendRunQueries',
        httpServer: prepTest.httpServer,
        loginToken: prepareSeedResult.loginToken,
        req: req2
      });

      // Wait for query to complete before closing to avoid "pool closed" error
      let queryId = unwrapBackendResponseOutput({ response: resp2 })
        .runningQueries[0]?.queryId;
      if (queryId) {
        let maxWaitMs = 10000;
        let waited = 0;
        while (waited < maxWaitMs) {
          let reqGetQuery: ToBackendGetQueryRequest = {
            traceId: traceId,
            idempotencyKey: makeId(),
            input: {
              projectId: projectId,
              repoId: userId,
              branchId: BRANCH_MAIN,
              envId: PROJECT_ENV_PROD,
              queryId: queryId,
              mconfigId: chart.tiles[0].mconfigId
            }
          };

          let respGetQuery = await sendToBackend({
            route: 'api/ToBackendGetQuery',
            httpServer: prepTest.httpServer,
            loginToken: prepareSeedResult.loginToken,
            req: reqGetQuery
          });

          let status = unwrapBackendResponseOutput({ response: respGetQuery })
            .query?.status;
          if (status !== QueryStatusEnum.Running) {
            break;
          }

          await new Promise(resolve => setTimeout(resolve, 200));
          waited += 200;
        }
      }

      await prepTest.app.close();
    } catch (e) {
      logToConsoleBackend({
        log: e,
        logLevel: LogLevelEnum.Error,
        logger: prepTest?.logger,
        cs: prepTest?.cs
      });
      if (prepTest) {
        await prepTest.app.close();
      }
    }

    assert.equal(resp2.result.type, 'Success');

    isPass = true;
  }, BACKEND_E2E_RETRY_OPTIONS).catch((er: any) => {
    logToConsoleBackend({
      log: er,
      logLevel: LogLevelEnum.Error,
      logger: prepTest?.logger,
      cs: prepTest?.cs
    });
  });

  t.is(isPass, true);
});
