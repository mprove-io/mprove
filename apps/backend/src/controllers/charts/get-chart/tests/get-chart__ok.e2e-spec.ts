import test from 'ava';
import { BackendConfig } from '~backend/config/backend-config';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareSeed, prepareTest } from '~backend/functions/prepare-test';
import { sendToBackend } from '~backend/functions/send-to-backend';
import { PrepTest } from '~backend/interfaces/prep-test';
import { BRANCH_MAIN, PROJECT_ENV_PROD } from '~common/constants/top';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '~common/functions/make-id';
import {
  ToBackendGetChartRequest,
  ToBackendGetChartResponse
} from '~common/interfaces/to-backend/charts/to-backend-get-chart';
import { ToBackendSeedRecordsRequestPayloadConnectionsItem } from '~common/interfaces/to-backend/test-routes/to-backend-seed-records';

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
  let resp: ToBackendGetChartResponse;

  try {
    prepTest = await prepareTest({});

    let c1Postgres: ToBackendSeedRecordsRequestPayloadConnectionsItem = {
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
          username: 'postgres',
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

    let req: ToBackendGetChartRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendGetChart,
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

    resp = await sendToBackend<ToBackendGetChartResponse>({
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
