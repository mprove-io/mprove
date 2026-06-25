import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import type { Prep } from '#backend/interfaces/prep';
import { DEFAULT_CHART } from '#common/constants/mconfig-chart';
import { BRANCH_MAIN, PROJECT_ENV_PROD } from '#common/constants/top';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';
import { ChangeTypeEnum } from '#common/enums/change-type.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { RowTypeEnum } from '#common/enums/row-type.enum';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeCopy } from '#common/functions/make-copy';
import { makeId } from '#common/functions/make-id';
import { makeSpaceUnits } from '#common/functions/space/make-space-units';
import type {
  ToBackendCreateDraftReportRequest,
  ToBackendCreateDraftReportResponse
} from '#common/zod/to-backend/reports/to-backend-create-draft-report';
import type {
  ToBackendSaveCreateReportRequest,
  ToBackendSaveCreateReportResponse
} from '#common/zod/to-backend/reports/to-backend-save-create-report';

let testId = 'backend-save-create-report__space-path';

let traceId = testId;

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let testProjectId = 't6-report-spaces';
let projectId = makeId();
let projectName = testId;

test('1', async t => {
  let isPass = false;
  let prep: Prep;

  await retry(async () => {
    let resp: ToBackendSaveCreateReportResponse;
    let draftReportId: string;

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
              userId: userId,
              email: email,
              password: password,
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
              orgId: orgId,
              projectId: projectId,
              testProjectId: testProjectId,
              name: projectName,
              defaultBranch: BRANCH_MAIN,
              remoteType: ProjectRemoteTypeEnum.Managed
            }
          ],
          members: [
            {
              memberId: userId,
              email: email,
              projectId: projectId,
              isAdmin: true,
              isEditor: true,
              isExplorer: true
            }
          ]
        },
        loginUserPayload: { email: email, password: password }
      });

      let req1: ToBackendCreateDraftReportRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendCreateDraftReport,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          projectId: projectId,
          repoId: userId,
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

      draftReportId = resp1.payload.report.reportId;

      let req2: ToBackendSaveCreateReportRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendSaveCreateReport,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          projectId: projectId,
          repoId: userId,
          branchId: BRANCH_MAIN,
          envId: PROJECT_ENV_PROD,
          newReportId: 'created_space',
          fromReportId: resp1.payload.report.reportId,
          title: 'Created Space',
          space: 's1',
          accessRoles: [],
          timezone: 'UTC',
          timeSpec: TimeSpecEnum.Months,
          timeRangeFractionBrick: 'f`last 5 months`',
          newReportFields: [],
          chart: makeCopy(DEFAULT_CHART)
        }
      };

      resp = await sendToBackend<ToBackendSaveCreateReportResponse>({
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req2
      });

      await prep.app.close();
    } catch (e) {
      logToConsoleBackend({
        log: e,
        logLevel: LogLevelEnum.Error,
        logger: prep?.logger,
        cs: prep?.cs
      });
      if (prep) {
        await prep.app.close();
      }
    }

    assert.equal(resp.info.error, undefined);
    assert.equal(resp.info.status, ResponseInfoStatusEnum.Ok);
    assert.equal(
      resp.payload.report.filePath,
      `${projectId}/data/s1/created_space.report`
    );

    let draftReportIds = resp.payload.reportUnitDrafts.map(x => x.reportId);
    assert.equal(draftReportIds.indexOf(draftReportId), -1);

    let reportSpaceUnits = makeSpaceUnits({
      spaceNodes: resp.payload.reportSpaceNodes
    });
    let createdSpaceUnit = reportSpaceUnits.find(
      x => x.unitId === 'created_space'
    );

    assert.equal(createdSpaceUnit?.space, 's1');
    assert.equal(createdSpaceUnit?.title, 'Created Space');

    isPass = true;
  }, BACKEND_E2E_RETRY_OPTIONS).catch((er: any) => {
    logToConsoleBackend({
      log: er,
      logLevel: LogLevelEnum.Error,
      logger: prep?.logger,
      cs: prep?.cs
    });
  });

  t.is(isPass, true);
});
