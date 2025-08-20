import test from 'ava';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';
import { sendToBackend } from '~backend/functions/send-to-backend';
import { Prep } from '~backend/interfaces/prep';
import { DEFAULT_CHART } from '~common/constants/mconfig-chart';
import { BRANCH_MAIN, PROJECT_ENV_PROD, UTC } from '~common/constants/top';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { ErEnum } from '~common/enums/er.enum';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { QueryStatusEnum } from '~common/enums/query-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { makeCopy } from '~common/functions/make-copy';
import { makeId } from '~common/functions/make-id';
import { Mconfig } from '~common/interfaces/blockml/mconfig';
import { Query } from '~common/interfaces/blockml/query';
import {
  ToBackendCancelQueriesRequest,
  ToBackendCancelQueriesResponse
} from '~common/interfaces/to-backend/queries/to-backend-cancel-queries';

let testId = 'backend-cancel-queries__array-empty';

let traceId = testId;

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let projectId = makeId();
let projectName = testId;

let connectionId = 'c1';
let connectionType = ConnectionTypeEnum.PostgreSQL;

let queryId = makeId();
let queryJobId = makeId();

let structId = makeId();
let mconfigId = makeId();

let prep: Prep;

test('1', async t => {
  let resp1: ToBackendCancelQueriesResponse;

  let mconfig: Mconfig = {
    structId: structId,
    mconfigId: mconfigId,
    queryId: queryId,
    modelId: 'abc',
    modelType: ModelTypeEnum.Malloy,
    // isStoreModel: false,
    dateRangeIncludesRightSide: false,
    storePart: undefined,
    modelLabel: 'abc',
    modelFilePath: 'abc',
    compiledQuery: undefined,
    malloyQuery: undefined,
    select: [],
    // unsafeSelect: [],
    // warnSelect: [],
    // joinAggregations: [],
    sortings: [],
    sorts: undefined,
    timezone: UTC,
    limit: 500,
    filters: [],
    chart: makeCopy(DEFAULT_CHART),
    temp: true,
    serverTs: 1
  };

  let query: Query = {
    projectId: projectId,
    envId: PROJECT_ENV_PROD,
    connectionId: connectionId,
    connectionType: connectionType,
    queryId: queryId,
    sql: '123',
    apiMethod: undefined,
    apiUrl: undefined,
    apiBody: undefined,
    data: undefined,
    status: QueryStatusEnum.Running,
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
            name: projectName,
            remoteType: ProjectRemoteTypeEnum.Managed,
            defaultBranch: BRANCH_MAIN
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
            connectionId: connectionId,
            envId: PROJECT_ENV_PROD,
            type: connectionType
          }
        ],
        queries: [query],
        mconfigs: [mconfig]
      },
      loginUserPayload: { email, password }
    });

    let req1: ToBackendCancelQueriesRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendCancelQueries,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        projectId: projectId,
        isRepoProd: true,
        branchId: BRANCH_MAIN,
        envId: PROJECT_ENV_PROD,
        mconfigIds: []
      }
    };

    resp1 = await sendToBackend<ToBackendCancelQueriesResponse>({
      httpServer: prep.httpServer,
      loginToken: prep.loginToken,
      req: req1
    });

    await prep.app.close();
  } catch (e) {
    logToConsoleBackend({
      log: e,
      logLevel: LogLevelEnum.Error,
      logger: prep.logger,
      cs: prep.cs
    });
  }

  t.is(resp1.info.error.message, ErEnum.BACKEND_WRONG_REQUEST_PARAMS);
  t.is(
    resp1.info.error.data[0].arrayNotEmpty,
    'mconfigIds should not be empty'
  );
});
