import test from 'ava';

import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareSeed, prepareTest } from '~backend/functions/prepare-test';
import { PrepTest } from '~backend/interfaces/prep-test';

let testId = 'backend-get-chart__ok';

let traceId = testId;

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let testProjectId = 't1';
let projectId = makeId();
let projectName = testId;

let chartId = 'c1';

let prepTest: PrepTest;

test('1', async t => {
  let resp: apiToBackend.ToBackendGetChartResponse;

  try {
    prepTest = await prepareTest({});

    let c1Postgres: apiToBackend.ToBackendSeedRecordsRequestPayloadConnectionsItem =
      {
        envId: PROJECT_ENV_PROD,
        projectId: projectId,
        connectionId: 'c1_postgres',
        type: ConnectionTypeEnum.PostgreSQL,
        host: prepTest.cs.get<BackendConfig['firstProjectDwhPostgresHost']>(
          'firstProjectDwhPostgresHost'
        ),
        port: 5436,
        username: 'postgres',
        password: prepTest.cs.get<
          BackendConfig['firstProjectDwhPostgresPassword']
        >('firstProjectDwhPostgresPassword'),
        database: 'p_db'
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
            testProjectId,
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

    let req: apiToBackend.ToBackendGetChartRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetChart,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        projectId: projectId,
        isRepoProd: false,
        branchId: BRANCH_MAIN,
        envId: PROJECT_ENV_PROD,
        chartId: chartId,
        timezone: 'UTC'
      }
    };

    resp = await sendToBackend<apiToBackend.ToBackendGetChartResponse>({
      httpServer: prepTest.httpServer,
      loginToken: prepareSeedResult.loginToken,
      req: req
    });

    await prepTest.app.close();
  } catch (e) {
    logToConsoleBackend({
      log: e,
      logLevel: LogLevelEnum.Error,
      logger: prepTest.logger,
      cs: prepTest.cs
    });
  }

  t.is(resp.info.error, undefined);
  t.is(resp.info.status, ResponseInfoStatusEnum.Ok);
});
