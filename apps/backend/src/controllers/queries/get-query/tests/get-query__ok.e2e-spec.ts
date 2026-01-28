import test from 'ava';
import {
  BRANCH_MAIN,
  EMPTY_STORE_GOOGLE_API_OPTIONS,
  PROJECT_ENV_PROD
} from '#common/constants/top';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import {
  ToBackendGetDashboardRequest,
  ToBackendGetDashboardResponse
} from '#common/interfaces/to-backend/dashboards/to-backend-get-dashboard';
import {
  ToBackendGetQueryRequest,
  ToBackendGetQueryResponse
} from '#common/interfaces/to-backend/queries/to-backend-get-query';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';
import { sendToBackend } from '~backend/functions/send-to-backend';
import { Prep } from '~backend/interfaces/prep';

let testId = 'backend-get-query__ok';

let traceId = testId;

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let testProjectId = 't2';
let projectId = makeId();
let projectName = testId;

let prep: Prep;

test('1', async t => {
  let resp2: ToBackendGetQueryResponse;

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
        connections: [
          {
            projectId: projectId,
            connectionId: 'c7',
            envId: PROJECT_ENV_PROD,
            type: ConnectionTypeEnum.GoogleApi,
            options: {
              storeGoogleApi: EMPTY_STORE_GOOGLE_API_OPTIONS
            }
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    let req1: ToBackendGetDashboardRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendGetDashboard,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        projectId: projectId,
        isRepoProd: false,
        branchId: BRANCH_MAIN,
        envId: PROJECT_ENV_PROD,
        dashboardId: 'd1',
        timezone: 'UTC'
      }
    };

    let resp1 = await sendToBackend<ToBackendGetDashboardResponse>({
      httpServer: prep.httpServer,
      loginToken: prep.loginToken,
      req: req1
    });

    let req2: ToBackendGetQueryRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendGetQuery,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        projectId: projectId,
        isRepoProd: false,
        branchId: BRANCH_MAIN,
        envId: PROJECT_ENV_PROD,
        mconfigId: resp1.payload.dashboard.tiles[0].mconfigId,
        queryId: resp1.payload.dashboard.tiles[0].queryId
      }
    };

    resp2 = await sendToBackend<ToBackendGetQueryResponse>({
      httpServer: prep.httpServer,
      loginToken: prep.loginToken,
      req: req2
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

  t.is(resp2.info.error, undefined);
  t.is(resp2.info.status, ResponseInfoStatusEnum.Ok);
});
