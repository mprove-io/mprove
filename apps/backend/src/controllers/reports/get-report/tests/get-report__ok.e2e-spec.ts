import test from 'ava';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';
import { sendToBackend } from '~backend/functions/send-to-backend';
import { Prep } from '~backend/interfaces/prep';
import {
  BRANCH_MAIN,
  EMPTY_STORE_GOOGLE_API_OPTIONS,
  PROJECT_ENV_PROD
} from '~common/constants/top';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { TimeSpecEnum } from '~common/enums/timespec.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '~common/functions/make-id';
import {
  ToBackendGetReportRequest,
  ToBackendGetReportResponse
} from '~common/interfaces/to-backend/reports/to-backend-get-report';

let testId = 'backend-get-report__ok';

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
  let resp: ToBackendGetReportResponse;

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
            storeGoogleApiOptions: EMPTY_STORE_GOOGLE_API_OPTIONS
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    let req: ToBackendGetReportRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendGetReport,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        projectId: projectId,
        branchId: BRANCH_MAIN,
        envId: PROJECT_ENV_PROD,
        isRepoProd: false,
        reportId: 'r1',
        timeRangeFractionBrick: 'f`last 5 months`',
        timeSpec: TimeSpecEnum.Months,
        timezone: 'UTC'
      }
    };

    resp = await sendToBackend<ToBackendGetReportResponse>({
      httpServer: prep.httpServer,
      loginToken: prep.loginToken,
      req: req
    });

    // console.log(resp);

    await prep.app.close();
  } catch (e) {
    logToConsoleBackend({
      log: e,
      logLevel: LogLevelEnum.Error,
      logger: prep.logger,
      cs: prep.cs
    });
  }

  t.is(resp.info.error, undefined);
  t.is(resp.info.status, ResponseInfoStatusEnum.Ok);
});
