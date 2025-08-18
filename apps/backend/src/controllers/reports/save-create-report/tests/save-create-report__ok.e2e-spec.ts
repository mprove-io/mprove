import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';

let testId = 'backend-save-create-report__ok';

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

test('1', async t => {
  let resp2: apiToBackend.ToBackendSaveCreateReportResponse;

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
            connectionId: 'c7',
            envId: common.PROJECT_ENV_PROD,
            type: common.ConnectionTypeEnum.GoogleApi
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    let req1: apiToBackend.ToBackendCreateDraftReportRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum
          .ToBackendCreateDraftReport,
        traceId: traceId,
        idempotencyKey: common.makeId()
      },
      payload: {
        projectId: projectId,
        isRepoProd: false,
        branchId: common.BRANCH_MAIN,
        envId: common.PROJECT_ENV_PROD,
        rowIds: undefined,
        changeType: common.ChangeTypeEnum.AddEmpty,
        fromReportId: 'new',
        rowChange: { rowType: common.RowTypeEnum.Empty, showChart: false },
        timeRangeFractionBrick: 'f`last 5 months`',
        timeSpec: common.TimeSpecEnum.Months,
        timezone: 'UTC',
        newReportFields: [],
        chart: common.makeCopy(common.DEFAULT_CHART)
      }
    };

    let resp1 =
      await helper.sendToBackend<apiToBackend.ToBackendCreateDraftReportResponse>(
        {
          httpServer: prep.httpServer,
          loginToken: prep.loginToken,
          req: req1
        }
      );

    let req2: apiToBackend.ToBackendSaveCreateReportRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum
          .ToBackendSaveCreateReport,
        traceId: traceId,
        idempotencyKey: common.makeId()
      },
      payload: {
        projectId: projectId,
        isRepoProd: false,
        branchId: common.BRANCH_MAIN,
        envId: common.PROJECT_ENV_PROD,
        newReportId: 'abcd',
        fromReportId: resp1.payload.report.reportId,
        title: 'new title',
        accessRoles: [],
        timezone: 'UTC',
        timeSpec: common.TimeSpecEnum.Months,
        timeRangeFractionBrick: 'f`last 5 months`',
        newReportFields: [],
        chart: common.makeCopy(common.DEFAULT_CHART)
      }
    };

    resp2 =
      await helper.sendToBackend<apiToBackend.ToBackendSaveCreateReportResponse>(
        {
          httpServer: prep.httpServer,
          loginToken: prep.loginToken,
          req: req2
        }
      );

    // console.log(resp2);

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
