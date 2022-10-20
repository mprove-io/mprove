import test from 'ava';
import * as fse from 'fs-extra';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { getConfig } from '~backend/config/get.config';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'backend-run-queries__ok-bigquery';

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
  fse.readFileSync(config.backendBigqueryPath).toString()
);

test('1', async t => {
  let resp2: apiToBackend.ToBackendRunQueriesResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: {
        idempotencyKeys: [testId, testId + '2'],
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
            isEmailVerified: common.BoolEnum.TRUE
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
            defaultBranch: common.BRANCH_MASTER,
            remoteType: common.ProjectRemoteTypeEnum.Managed
          }
        ],
        members: [
          {
            memberId: userId,
            email,
            projectId,
            isAdmin: common.BoolEnum.TRUE,
            isEditor: common.BoolEnum.TRUE,
            isExplorer: common.BoolEnum.TRUE
          }
        ],
        connections: [
          {
            projectId: projectId,
            connectionId: 'c1',
            envId: common.PROJECT_ENV_PROD,
            type: common.ConnectionTypeEnum.BigQuery,
            bigqueryCredentials: bigqueryTestCredentials
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    let req1: apiToBackend.ToBackendGetVizsRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetVizs,
        traceId: traceId,
        idempotencyKey: testId
      },
      payload: {
        projectId: projectId,
        isRepoProd: false,
        branchId: common.BRANCH_MASTER,
        envId: common.PROJECT_ENV_PROD
      }
    };

    let resp1 = await helper.sendToBackend<apiToBackend.ToBackendGetVizsResponse>(
      {
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req1
      }
    );

    let viz = resp1.payload.vizs.find(x => x.vizId === 's_s1');

    let req2: apiToBackend.ToBackendRunQueriesRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRunQueries,
        traceId: traceId,
        idempotencyKey: testId + '2'
      },
      payload: {
        queryIds: [viz.reports[0].queryId]
      }
    };

    resp2 = await helper.sendToBackend<apiToBackend.ToBackendRunQueriesResponse>(
      {
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req2
      }
    );

    await prep.app.close();
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(resp2.info.error, undefined);
  t.is(resp2.info.status, common.ResponseInfoStatusEnum.Ok);
});
