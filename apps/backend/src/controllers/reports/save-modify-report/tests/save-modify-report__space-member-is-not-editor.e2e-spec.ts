import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { and, eq } from 'drizzle-orm';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import type { Prep } from '#backend/interfaces/prep';
import { DEFAULT_CHART } from '#common/constants/mconfig-chart';
import { BRANCH_MAIN, PROJECT_ENV_PROD } from '#common/constants/top';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';
import { ChangeTypeEnum } from '#common/enums/change-type.enum';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { RowTypeEnum } from '#common/enums/row-type.enum';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeCopy } from '#common/functions/make-copy';
import { makeId } from '#common/functions/make-id';
import type {
  ToBackendCreateDraftReportRequest,
  ToBackendCreateDraftReportResponse
} from '#common/zod/to-backend/reports/to-backend-create-draft-report';
import type {
  ToBackendSaveCreateReportRequest,
  ToBackendSaveCreateReportResponse
} from '#common/zod/to-backend/reports/to-backend-save-create-report';
import type {
  ToBackendSaveModifyReportRequest,
  ToBackendSaveModifyReportResponse
} from '#common/zod/to-backend/reports/to-backend-save-modify-report';

let testId = 'backend-save-modify-report__space-member-is-not-editor';

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
              isAdmin: false,
              isEditor: true,
              isExplorer: true
            }
          ]
        },
        loginUserPayload: { email: email, password: password }
      });

      let createFirstDraftReq: ToBackendCreateDraftReportRequest = {
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

      let createFirstDraftResp =
        await sendToBackend<ToBackendCreateDraftReportResponse>({
          httpServer: prep.httpServer,
          loginToken: prep.loginToken,
          req: createFirstDraftReq
        });

      let saveCreateReq: ToBackendSaveCreateReportRequest = {
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
          newReportId: 'r5',
          fromReportId: createFirstDraftResp.payload.report.reportId,
          title: 'Created Personal',
          space: undefined,
          accessRoles: [],
          timezone: 'UTC',
          timeSpec: TimeSpecEnum.Months,
          timeRangeFractionBrick: 'f`last 5 months`',
          newReportFields: [],
          chart: makeCopy(DEFAULT_CHART)
        }
      };

      let saveCreateResp =
        await sendToBackend<ToBackendSaveCreateReportResponse>({
          httpServer: prep.httpServer,
          loginToken: prep.loginToken,
          req: saveCreateReq
        });

      let createSecondDraftReq: ToBackendCreateDraftReportRequest = {
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
          fromReportId: saveCreateResp.payload.report.reportId,
          rowChange: { rowType: RowTypeEnum.Empty, showChart: false },
          timeRangeFractionBrick: 'f`last 5 months`',
          timeSpec: TimeSpecEnum.Months,
          timezone: 'UTC',
          newReportFields: [],
          chart: makeCopy(DEFAULT_CHART)
        }
      };

      let createSecondDraftResp =
        await sendToBackend<ToBackendCreateDraftReportResponse>({
          httpServer: prep.httpServer,
          loginToken: prep.loginToken,
          req: createSecondDraftReq
        });

      let db = prep.moduleRef.get<Db>(DRIZZLE);

      await db.drizzle
        .update(membersTable)
        .set({ isEditor: false })
        .where(
          and(
            eq(membersTable.memberId, userId),
            eq(membersTable.projectId, projectId)
          )
        );

      let saveModifyReq: ToBackendSaveModifyReportRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendSaveModifyReport,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          projectId: projectId,
          repoId: userId,
          branchId: BRANCH_MAIN,
          envId: PROJECT_ENV_PROD,
          fromReportId: createSecondDraftResp.payload.report.reportId,
          modReportId: saveCreateResp.payload.report.reportId,
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

      resp = await sendToBackend<ToBackendSaveModifyReportResponse>({
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: saveModifyReq
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

    assert.equal(
      resp.info.error.message,
      ErEnum.BACKEND_MEMBER_IS_NOT_EDITOR_OR_ADMIN
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
