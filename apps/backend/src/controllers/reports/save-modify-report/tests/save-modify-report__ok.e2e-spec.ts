import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import { Prep } from '#backend/interfaces/prep';
import { DEFAULT_CHART } from '#common/constants/mconfig-chart';
import {
  BRANCH_MAIN,
  EMPTY_STORE_GOOGLE_API_OPTIONS,
  PROJECT_ENV_PROD
} from '#common/constants/top';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';

import { makeCopy } from '#common/functions/make-copy/make-copy';
import { makeId } from '#common/functions/make-id/make-id';
import { unwrapBackendResponseOutput } from '#common/functions/unwrap-backend-response-output/unwrap-backend-response-output';
import type { ToBackendCreateDraftReportOutput } from '#common/types/backend/routes/reports/create-draft-report/create-draft-report-output';
import type { ToBackendCreateDraftReportRequest } from '#common/types/backend/routes/reports/create-draft-report/create-draft-report-request';
import type { ToBackendSaveModifyReportRequest } from '#common/types/backend/routes/reports/save-modify-report/save-modify-report-request';
import type { ToBackendSaveModifyReportResponse } from '#common/types/backend/routes/reports/save-modify-report/save-modify-report-response';

let testId = 'backend-save-modify-report__ok';

let traceId = testId;

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let seedProjectId = 't2';
let projectId = makeId();
let projectName = testId;

test('1', async t => {
  let isPass: boolean;
  let prep: Prep;

  await retry(async (bail: any) => {
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
              seedProjectId: seedProjectId,
              name: projectName,
              defaultBranch: BRANCH_MAIN,
              remoteType: 'Managed'
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
              type: 'GoogleApi',
              options: {
                storeGoogleApi: EMPTY_STORE_GOOGLE_API_OPTIONS
              }
            }
          ]
        },
        loginUserPayload: { email, password }
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

      let createDraftReportOutput: ToBackendCreateDraftReportOutput =
        unwrapBackendResponseOutput({ response: resp1 });

      let req2: ToBackendSaveModifyReportRequest = {
        operation: 'saveModifyReport',
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          projectId: projectId,
          repoId: userId,
          branchId: BRANCH_MAIN,
          envId: PROJECT_ENV_PROD,
          fromReportId: createDraftReportOutput.report.reportId,
          modReportId: 'r1',
          title: 'new title',
          space: undefined,
          accessRoles: [],
          timezone: 'UTC',
          timeSpec: 'months',
          timeRangeFractionBrick: 'f`last 5 months`',
          newReportFields: [],
          chart: createDraftReportOutput.report.chart
        }
      };

      resp2 = await sendToBackend({
        route: 'api/ToBackendSaveModifyReport',
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

    assert.equal(resp2.type, 'Success');

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
