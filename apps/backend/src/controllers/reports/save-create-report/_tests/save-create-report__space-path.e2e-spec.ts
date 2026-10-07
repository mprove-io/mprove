import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/top/prepare-test-and-seed/prepare-test-and-seed';
import { sendToBackend } from '#backend/functions/top/send-to-backend/send-to-backend';
import type { Prep } from '#backend/interfaces/prep';
import { DEFAULT_CHART } from '#common/constants/mconfig-chart';
import { BRANCH_MAIN, PROJECT_ENV_PROD } from '#common/constants/top';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';

import { makeCopy } from '#common/functions/make-copy/make-copy';
import { makeId } from '#common/functions/make-id/make-id';
import { makeSpaceUnits } from '#common/functions/make-space-units/make-space-units';
import { unwrapBackendResponseOutput } from '#common/functions/unwrap-backend-response-output/unwrap-backend-response-output';
import type { ToBackendCreateDraftReportRequest } from '#common/types/backend/routes/reports/create-draft-report/create-draft-report-request';
import type { ToBackendSaveCreateReportOutput } from '#common/types/backend/routes/reports/save-create-report/save-create-report-output';
import type { ToBackendSaveCreateReportRequest } from '#common/types/backend/routes/reports/save-create-report/save-create-report-request';
import type { ToBackendSaveCreateReportResponse } from '#common/types/backend/routes/reports/save-create-report/save-create-report-response';

let testId = 'backend-save-create-report__space-path';

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
              seedProjectId: seedProjectId,
              name: projectName,
              defaultBranch: BRANCH_MAIN,
              remoteType: 'Managed'
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
          changeType: 'AddEmpty',
          fromReportId: 'new',
          rowChange: { rowType: 'empty', showChart: false },
          timeRangeFractionBrick: 'f`last 5 months`',
          timeSpec: 'months',
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

      draftReportId = unwrapBackendResponseOutput({ response: resp1 }).report
        .reportId;

      let req2: ToBackendSaveCreateReportRequest = {
        operation: 'saveCreateReport',
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          projectId: projectId,
          repoId: userId,
          branchId: BRANCH_MAIN,
          envId: PROJECT_ENV_PROD,
          newReportId: 'created_space',
          fromReportId: draftReportId,
          title: 'Created Space',
          space: 's1',
          accessRoles: [],
          timezone: 'UTC',
          timeSpec: 'months',
          timeRangeFractionBrick: 'f`last 5 months`',
          newReportFields: [],
          chart: makeCopy(DEFAULT_CHART)
        }
      };

      resp = await sendToBackend({
        route: 'api/ToBackendSaveCreateReport',
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req2
      });

      await prep.app.close();
    } catch (e) {
      logToConsoleBackend({
        log: e,
        logLevel: 'Error',
        logger: prep?.logger,
        cs: prep?.cs
      });
      if (prep) {
        await prep.app.close();
      }
    }

    assert.equal(resp.type, 'Success');

    let output: ToBackendSaveCreateReportOutput = unwrapBackendResponseOutput({
      response: resp
    });

    assert.equal(
      output.report.filePath,
      `${projectId}/data/s1/reports/created_space.report`
    );

    let draftReportIds: string[] = output.reportUnitDrafts.map(x => x.reportId);

    assert.equal(draftReportIds.indexOf(draftReportId), -1);

    let reportSpaceUnits = makeSpaceUnits({
      spaceNodes: output.reportSpaceNodes
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
      logLevel: 'Error',
      logger: prep?.logger,
      cs: prep?.cs
    });
  });

  t.is(isPass, true);
});
