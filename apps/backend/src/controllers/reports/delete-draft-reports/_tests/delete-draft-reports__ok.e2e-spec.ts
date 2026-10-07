import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/top/prepare-test-and-seed/prepare-test-and-seed';
import { sendToBackend } from '#backend/functions/top/send-to-backend/send-to-backend';
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
import type { ToBackendCreateDraftReportRequest } from '#common/types/backend/routes/reports/create-draft-report/create-draft-report-request';
import type { ToBackendDeleteDraftReportsRequest } from '#common/types/backend/routes/reports/delete-draft-reports/delete-draft-reports-request';
import type { ToBackendDeleteDraftReportsResponse } from '#common/types/backend/routes/reports/delete-draft-reports/delete-draft-reports-response';

let testId = 'backend-delete-draft-reports__ok';

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

      let req2: ToBackendDeleteDraftReportsRequest = {
        operation: 'deleteDraftReports',
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          projectId: projectId,
          repoId: userId,
          branchId: BRANCH_MAIN,
          envId: PROJECT_ENV_PROD,
          reportIds: [
            unwrapBackendResponseOutput({ response: resp1 }).report.reportId
          ]
        }
      };

      resp2 = await sendToBackend({
        route: 'api/ToBackendDeleteDraftReports',
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
