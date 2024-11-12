import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'backend-edit-draft-rep__ok';

let traceId = testId;

let userId = common.makeId();
let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let testProjectId = 't1';
let projectId = common.makeId();
let projectName = testId;

let prep: interfaces.Prep;

test('1', async t => {
  let resp2: apiToBackend.ToBackendEditDraftRepResponse;

  try {
    prep = await prepareTest({
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
            defaultBranch: common.BRANCH_MASTER,
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
            type: common.ConnectionTypeEnum.PostgreSQL
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    let req1: apiToBackend.ToBackendCreateDraftRepRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateDraftRep,
        traceId: traceId,
        idempotencyKey: common.makeId()
      },
      payload: {
        projectId: projectId,
        isRepoProd: false,
        branchId: common.BRANCH_MASTER,
        envId: common.PROJECT_ENV_PROD,
        rowIds: undefined,
        changeType: common.ChangeTypeEnum.AddEmpty,
        fromRepId: 'new',
        rowChange: { rowType: common.RowTypeEnum.Empty, showChart: false },
        timeRangeFractionBrick: 'last 5 months',
        timeSpec: common.TimeSpecEnum.Months,
        timezone: 'UTC'
      }
    };

    let resp1 =
      await helper.sendToBackend<apiToBackend.ToBackendCreateDraftRepResponse>({
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req1
      });

    let req2: apiToBackend.ToBackendEditDraftRepRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendEditDraftRep,
        traceId: traceId,
        idempotencyKey: common.makeId()
      },
      payload: {
        projectId: projectId,
        isRepoProd: false,
        branchId: common.BRANCH_MASTER,
        envId: common.PROJECT_ENV_PROD,
        repId: resp1.payload.rep.repId,
        rowIds: undefined,
        changeType: common.ChangeTypeEnum.AddEmpty,
        rowChange: { rowType: common.RowTypeEnum.Empty, showChart: false },
        timeRangeFractionBrick: 'last 5 months',
        timeSpec: common.TimeSpecEnum.Months,
        timezone: 'UTC'
      }
    };

    resp2 =
      await helper.sendToBackend<apiToBackend.ToBackendEditDraftRepResponse>({
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req2
      });

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
