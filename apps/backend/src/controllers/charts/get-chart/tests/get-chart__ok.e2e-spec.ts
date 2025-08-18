import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareSeed, prepareTest } from '~backend/functions/prepare-test';
import { PrepTest } from '~backend/interfaces/prep-test';

let testId = 'backend-get-chart__ok';

let traceId = testId;

let userId = common.makeId();
let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let testProjectId = 't1';
let projectId = common.makeId();
let projectName = testId;

let chartId = 'c1';

let prepTest: PrepTest;

test('1', async t => {
  let resp: apiToBackend.ToBackendGetChartResponse;

  try {
    prepTest = await prepareTest({});

    let c1Postgres: apiToBackend.ToBackendSeedRecordsRequestPayloadConnectionsItem =
      {
        envId: common.PROJECT_ENV_PROD,
        projectId: projectId,
        connectionId: 'c1_postgres',
        type: common.ConnectionTypeEnum.PostgreSQL,
        host: prepTest.cs.get<interfaces.Config['firstProjectDwhPostgresHost']>(
          'firstProjectDwhPostgresHost'
        ),
        port: 5436,
        username: 'postgres',
        password: prepTest.cs.get<
          interfaces.Config['firstProjectDwhPostgresPassword']
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
            defaultBranch: common.BRANCH_MAIN,
            remoteType: common.ProjectRemoteTypeEnum.Managed
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
        idempotencyKey: common.makeId()
      },
      payload: {
        projectId: projectId,
        isRepoProd: false,
        branchId: common.BRANCH_MAIN,
        envId: common.PROJECT_ENV_PROD,
        chartId: chartId,
        timezone: 'UTC'
      }
    };

    resp = await helper.sendToBackend<apiToBackend.ToBackendGetChartResponse>({
      httpServer: prepTest.httpServer,
      loginToken: prepareSeedResult.loginToken,
      req: req
    });

    await prepTest.app.close();
  } catch (e) {
    logToConsoleBackend({
      log: e,
      logLevel: common.LogLevelEnum.Error,
      logger: prepTest.logger,
      cs: prepTest.cs
    });
  }

  t.is(resp.info.error, undefined);
  t.is(resp.info.status, common.ResponseInfoStatusEnum.Ok);
});
