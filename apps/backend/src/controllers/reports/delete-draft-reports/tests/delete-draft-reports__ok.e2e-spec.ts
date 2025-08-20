import test from 'ava';

import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';

let testId = 'backend-delete-draft-reports__ok';

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
  let resp2: ToBackendDeleteDraftReportsResponse;

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
            type: ConnectionTypeEnum.GoogleApi
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

    let req2: ToBackendDeleteDraftReportsRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendDeleteDraftReports,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        projectId: projectId,
        isRepoProd: false,
        branchId: BRANCH_MAIN,
        envId: PROJECT_ENV_PROD,
        reportIds: [resp1.payload.report.reportId]
      }
    };

    resp2 = await sendToBackend<ToBackendDeleteDraftReportsResponse>({
      httpServer: prep.httpServer,
      loginToken: prep.loginToken,
      req: req2
    });

    // console.log(resp2);

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
