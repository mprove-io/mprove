import test from 'ava';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';
import { sendToBackend } from '~backend/functions/send-to-backend';
import { Prep } from '~backend/interfaces/prep';
import { DEFAULT_CHART } from '~common/constants/mconfig-chart';
import {
  BRANCH_MAIN,
  EMPTY_STORE_GOOGLE_API_OPTIONS,
  PROJECT_ENV_PROD
} from '~common/constants/top';
import { ChangeTypeEnum } from '~common/enums/change-type.enum';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { RowTypeEnum } from '~common/enums/row-type.enum';
import { TimeSpecEnum } from '~common/enums/timespec.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { makeCopy } from '~common/functions/make-copy';
import { makeId } from '~common/functions/make-id';
import {
  ToBackendCreateDraftReportRequest,
  ToBackendCreateDraftReportResponse
} from '~common/interfaces/to-backend/reports/to-backend-create-draft-report';
import {
  ToBackendSaveModifyReportRequest,
  ToBackendSaveModifyReportResponse
} from '~common/interfaces/to-backend/reports/to-backend-save-modify-report';

let testId = 'backend-save-modify-report__ok';

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
  let resp2: ToBackendSaveModifyReportResponse;

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

    let req1: ToBackendCreateDraftReportRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendCreateDraftReport,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        projectId: projectId,
        isRepoProd: false,
        branchId: BRANCH_MAIN,
        envId: PROJECT_ENV_PROD,
        rowIds: undefined,
        changeType: ChangeTypeEnum.AddEmpty,
        fromReportId: 'new',
        rowChange: { rowType: RowTypeEnum.Empty, showChart: false },
        timeRangeFractionBrick: 'f`last 5 months`',
        timeSpec: TimeSpecEnum.Months,
        timezone: 'UTC',
        newReportFields: [],
        chart: makeCopy(DEFAULT_CHART)
      }
    };

    let resp1 = await sendToBackend<ToBackendCreateDraftReportResponse>({
      httpServer: prep.httpServer,
      loginToken: prep.loginToken,
      req: req1
    });

    let req2: ToBackendSaveModifyReportRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendSaveModifyReport,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        projectId: projectId,
        isRepoProd: false,
        branchId: BRANCH_MAIN,
        envId: PROJECT_ENV_PROD,
        fromReportId: resp1.payload.report.reportId,
        modReportId: 'r1',
        title: 'new title',
        accessRoles: [],
        timezone: 'UTC',
        timeSpec: TimeSpecEnum.Months,
        timeRangeFractionBrick: 'f`last 5 months`',
        newReportFields: [],
        chart: resp1.payload.report.chart
      }
    };

    resp2 = await sendToBackend<ToBackendSaveModifyReportResponse>({
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
