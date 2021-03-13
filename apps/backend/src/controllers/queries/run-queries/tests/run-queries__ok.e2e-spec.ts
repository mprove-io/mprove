import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'backend-run-queries__ok';

let traceId = testId;

let userId = common.makeId();
let email = `${testId}@example.com`;
let password = '123';

let orgId = testId;
let orgName = testId;

let testProjectId = 't1';
let projectId = common.makeId();
let projectName = 'p1';

let prep: interfaces.Prep;

test('1', async t => {
  let resp2: apiToBackend.ToBackendRunQueriesResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: {
        emails: [email],
        orgIds: [orgId],
        projectIds: [projectId]
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
            name: projectName
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
            type: common.ConnectionTypeEnum.PostgreSQL,
            postgresHost: '0.0.0.0',
            postgresPort: 5432,
            postgresDatabase: 'p_db',
            postgresUser: 'p_user',
            postgresPassword: 'p_pass'
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    let req1: apiToBackend.ToBackendGetVizsRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetVizs,
        traceId: traceId
      },
      payload: {
        projectId: projectId,
        repoId: userId,
        branchId: common.BRANCH_MASTER
      }
    };

    let resp1 = await helper.sendToBackend<apiToBackend.ToBackendGetVizsResponse>(
      {
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req1
      }
    );

    let viz = resp1.payload.vizs.find(x => x.vizId === 's_z1');

    let req2: apiToBackend.ToBackendRunQueriesRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRunQueries,
        traceId: traceId
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
