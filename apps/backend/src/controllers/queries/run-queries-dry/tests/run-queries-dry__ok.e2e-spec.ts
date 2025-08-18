import test from 'ava';
import * as fse from 'fs-extra';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { getConfig } from '~backend/config/get.config';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';
import { BRANCH_MAIN, PROJECT_ENV_PROD } from '~common/_index';

let testId = 'backend-run-queries-dry__ok';

let traceId = testId;

let userId = common.makeId();
let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let testProjectId = 't2';
let projectId = common.makeId();
let projectName = testId;

let prep: interfaces.Prep;

let config = getConfig();
let bigqueryTestCredentials = JSON.parse(
  fse.readFileSync(config.firstProjectDwhBigqueryCredentialsPath).toString()
);

test('1', async t => {
  let resp2: apiToBackend.ToBackendRunQueriesDryResponse;

  try {
    prep = await prepareTestAndSeed({
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
        connections: [
          {
            projectId: projectId,
            connectionId: 'c1',
            envId: common.PROJECT_ENV_PROD,
            type: common.ConnectionTypeEnum.BigQuery,
            serviceAccountCredentials: bigqueryTestCredentials
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    let req1: apiToBackend.ToBackendGetChartsRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetCharts,
        traceId: traceId,
        idempotencyKey: common.makeId()
      },
      payload: {
        projectId: projectId,
        isRepoProd: false,
        branchId: common.BRANCH_MAIN,
        envId: common.PROJECT_ENV_PROD
      }
    };

    let resp1 =
      await helper.sendToBackend<apiToBackend.ToBackendGetChartsResponse>({
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req1
      });

    let chart = resp1.payload.charts.find(x => x.chartId === 's_s1');

    let req2: apiToBackend.ToBackendRunQueriesDryRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRunQueriesDry,
        traceId: traceId,
        idempotencyKey: common.makeId()
      },
      payload: {
        projectId: projectId,
        isRepoProd: false,
        branchId: BRANCH_MAIN,
        envId: PROJECT_ENV_PROD,
        mconfigIds: [chart.tiles[0].mconfigId],
        dryId: common.makeId()
      }
    };

    resp2 =
      await helper.sendToBackend<apiToBackend.ToBackendRunQueriesDryResponse>({
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req2
      });

    await prep.app.close();
  } catch (e) {
    logToConsoleBackend({
      log: e,
      logLevel: common.LogLevelEnum.Error,
      logger: prep.logger,
      cs: prep.cs
    });
  }

  t.is(resp2.info.error, undefined);
  t.is(resp2.info.status, common.ResponseInfoStatusEnum.Ok);
});
