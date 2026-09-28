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
import { RowTypeEnum } from '#common/enums/row-type.enum';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { makeCopy } from '#common/functions/make-copy/make-copy';
import { makeId } from '#common/functions/make-id/make-id';
import { unwrapBackendResponseOutput } from '#common/functions/unwrap-backend-response-output/unwrap-backend-response-output';
import type { ToBackendCreateDraftReportRequest } from '#common/zod/backend/routes/reports/create-draft-report/create-draft-report-request';
import type { ToBackendSaveModifyReportRequest } from '#common/zod/backend/routes/reports/save-modify-report/save-modify-report-request';
import type { ToBackendSaveModifyReportResponse } from '#common/zod/backend/routes/reports/save-modify-report/save-modify-report-response';

let testId = 'backend-save-modify-report__space-path-parent';

let traceId = testId;

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let seedProjectId = 't6-report-spaces';
let projectId = makeId();
let projectName = testId;

test('1', async t => {
  let isPass = false;
  let prep: Prep;

  await retry(async () => {
    let resp: ToBackendSaveModifyReportResponse;

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
              seedProjectId: seedProjectId,
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
        operation: 'createDraftReport',
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
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

      let resp1 = await sendToBackend({
        route: 'api/ToBackendCreateDraftReport',
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req1
      });

      let req2: ToBackendSaveModifyReportRequest = {
        operation: 'saveModifyReport',
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          projectId: projectId,
          repoId: userId,
          branchId: BRANCH_MAIN,
          envId: PROJECT_ENV_PROD,
          fromReportId: unwrapBackendResponseOutput({ response: resp1 }).report
            .reportId,
          modReportId: 'r2',
          title: 'Modified Space',
          space: 's1',
          accessRoles: [],
          timezone: 'UTC',
          timeSpec: TimeSpecEnum.Months,
          timeRangeFractionBrick: 'f`last 5 months`',
          newReportFields: [],
          chart: makeCopy(DEFAULT_CHART)
        }
      };

      resp = await sendToBackend({
        route: 'api/ToBackendSaveModifyReport',
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

    assert.equal(resp.type, 'Success');
    assert.equal(
      unwrapBackendResponseOutput({ response: resp }).report.filePath,
      `${projectId}/data/s1/reports/r2.report`
    );

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
