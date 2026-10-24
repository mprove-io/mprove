import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type {
  MemberTab,
  ReportTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { reportsTable } from '#backend/drizzle/postgres/schema/reports';
import { checkAccess } from '#backend/functions/check-access/check-access';
import { makeReport } from '#backend/functions/db/reports/make-report/make-report';
import type { DbService } from '#backend/services/db/db.service';
import { DEFAULT_CHART } from '#common/constants/mconfig-chart';
import { EMPTY_REPORT_ID } from '#common/constants/top';
import { makeCopy } from '#common/functions/make-copy/make-copy';
import type { GetReportCheckExistsAndAccessError } from '#common/types/backend/function-errors/get-report-check-exists-and-access-error';
import type { Member } from '#common/types/backend/parts/member';
import type { MconfigChart } from '#common/types/blockml/parts/mconfig/mconfig-chart';

export async function getReportCheckExistsAndAccess(item: {
  projectId: string;
  reportId: string;
  structId: string;
  user: UserTab;
  userMember: MemberTab | Member;
  db: DbService;
}): Result.ResultAsync<ReportTab, GetReportCheckExistsAndAccessError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('report', async v => {
      let chart: MconfigChart = makeCopy(DEFAULT_CHART);

      chart.type = 'line';

      let emptyReport: ReportTab = makeReport({
        structId: undefined,
        reportId: v.reportId,
        projectId: v.projectId,
        creatorId: undefined,
        filePath: undefined,
        space: undefined,
        accessRoles: [],
        title: v.reportId,
        fields: [],
        rows: [],
        chart: chart,
        draft: false
      });

      if (v.reportId === EMPTY_REPORT_ID) {
        return Result.succeed(emptyReport);
      }

      return v.db.reports.findFirstCheckExists({
        where: and(
          eq(reportsTable.projectId, v.projectId),
          eq(reportsTable.structId, v.structId),
          eq(reportsTable.reportId, v.reportId)
        )
      });
    }),
    Result.andThrough(v =>
      v.reportId !== EMPTY_REPORT_ID &&
      v.report.draft === true &&
      v.report.creatorId !== v.user.userId
        ? Result.fail({ code: 'BACKEND_REPORT_CREATOR_ID_MISMATCH' })
        : Result.succeed()
    ),
    Result.andThrough(v =>
      v.report.draft === false &&
      checkAccess({
        member: v.userMember,
        accessRoles: v.report.accessRolesCombined,
        filePath: v.report.filePath
      }) === false
        ? Result.fail({ code: 'BACKEND_FORBIDDEN_REPORT' })
        : Result.succeed()
    ),
    Result.map((v): ReportTab => v.report)
  );
}
