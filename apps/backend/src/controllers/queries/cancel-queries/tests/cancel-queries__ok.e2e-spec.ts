import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'backend-cancel-queries__ok';

let traceId = testId;

let userId = common.makeId();
let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let projectId = common.makeId();
let projectName = testId;

let connectionId = 'c1';
let connectionType = common.ConnectionTypeEnum.PostgreSQL;

let queryId = common.makeId();
let queryJobId = common.makeId();

let structId = common.makeId();
let mconfigId = common.makeId();

let prep: interfaces.Prep;

test('1', async t => {
  let resp1: apiToBackend.ToBackendCancelQueriesResponse;

  let mconfig: common.Mconfig = {
    structId: structId,
    mconfigId: mconfigId,
    queryId: queryId,
    modelId: 'abc',
    modelLabel: 'abc',
    select: [],
    sortings: [],
    sorts: undefined,
    timezone: common.UTC,
    limit: 500,
    filters: [],
    chart: {
      isValid: true,
      type: common.ChartTypeEnum.Table
    },
    temp: true,
    serverTs: 1
  };

  let query: common.Query = {
    projectId: projectId,
    connectionId: connectionId,
    connectionType: connectionType,
    queryId: queryId,
    sql: '123',
    data: undefined,
    status: common.QueryStatusEnum.Running,
    lastRunBy: userId,
    lastRunTs: 1,
    lastCancelTs: undefined,
    lastCompleteTs: undefined,
    lastCompleteDuration: undefined,
    lastErrorMessage: undefined,
    lastErrorTs: undefined,
    queryJobId: queryJobId,
    bigqueryQueryJobId: undefined,
    bigqueryConsecutiveErrorsGetJob: 0,
    bigqueryConsecutiveErrorsGetResults: 0,
    serverTs: 1
  };

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: {
        idempotencyKeys: [testId],
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
            name: projectName,
            remoteType: common.ProjectRemoteTypeEnum.Managed,
            defaultBranch: common.BRANCH_MASTER
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
            connectionId: connectionId,
            type: connectionType
          }
        ],
        queries: [query],
        mconfigs: [mconfig]
      },
      loginUserPayload: { email, password }
    });

    let req1: apiToBackend.ToBackendCancelQueriesRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCancelQueries,
        traceId: traceId,
        idempotencyKey: testId
      },
      payload: {
        queryIds: [queryId]
      }
    };

    resp1 = await helper.sendToBackend<apiToBackend.ToBackendCancelQueriesResponse>(
      {
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req1
      }
    );

    await prep.app.close();
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(resp1.info.error, undefined);
  t.is(resp1.info.status, common.ResponseInfoStatusEnum.Ok);
  t.is(resp1.payload.queries.length, 1);
});
