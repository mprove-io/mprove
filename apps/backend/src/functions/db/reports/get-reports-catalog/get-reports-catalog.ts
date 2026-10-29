import { Result } from '@praha/byethrow';
import { and, eq, or } from 'drizzle-orm';
import type { MemberTab } from '#backend/drizzle/postgres/tables/members';
import { reportsTable } from '#backend/drizzle/postgres/tables/reports';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { checkAccess } from '#backend/functions/check-access/check-access';
import { getFavoriteTargetIds } from '#backend/functions/db/favorites/get-favorite-target-ids/get-favorite-target-ids';
import { makeReportSpaceUnit } from '#backend/functions/db/reports/get-reports-catalog/make-report-space-unit/make-report-space-unit';
import { makeReportUnit } from '#backend/functions/db/reports/get-reports-catalog/make-report-unit/make-report-unit';
import { makeSpaceNodes } from '#backend/functions/space/make-space-nodes/make-space-nodes';
import type { DbService } from '#backend/services/db/db.service';
import { MY_REPORTS_SPACE_TITLE } from '#common/constants/top';
import type { GetReportsCatalogError } from '#common/types/backend/function-errors/get-reports-catalog-error';
import type { Member } from '#common/types/backend/parts/member';
import type { ReportUnit } from '#common/types/backend/parts/report/report-unit';
import type { SpaceNode } from '#common/types/backend/parts/space-node';
import type { Space } from '#common/types/blockml/parts/space';

export type ReportsCatalog = {
  reportUnitDrafts: ReportUnit[];
  reportSpaceNodes: SpaceNode[];
};

export async function getReportsCatalog(item: {
  projectId: string;
  structId: string;
  user: UserTab;
  userMember: MemberTab;
  apiUserMember: Member;
  spaces: Space[];
  db: DbService;
}): Result.ResultAsync<ReportsCatalog, GetReportsCatalogError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('reports', v =>
      v.db.reports.findMany({
        where: and(
          eq(reportsTable.structId, v.structId),
          or(
            eq(reportsTable.draft, false),
            and(
              eq(reportsTable.draft, true),
              eq(reportsTable.creatorId, v.user.userId)
            )
          )
        )
      })
    ),
    Result.bind('draftReports', v =>
      Result.succeed(v.reports.filter(report => report.draft === true))
    ),
    Result.bind('savedReports', v =>
      Result.succeed(v.reports.filter(report => report.draft === false))
    ),
    Result.bind('reportsGrantedAccess', v =>
      Result.succeed(
        v.savedReports.filter(report =>
          checkAccess({
            member: v.userMember,
            accessRoles: report.accessRolesCombined,
            filePath: report.filePath
          })
        )
      )
    ),
    Result.bind('sortedDraftReports', v =>
      Result.succeed(
        v.draftReports
          .sort((a, b) =>
            a.draftCreatedTs > b.draftCreatedTs
              ? 1
              : b.draftCreatedTs > a.draftCreatedTs
                ? -1
                : 0
          )
          .reverse()
      )
    ),
    Result.bind('sortedNonDraftReports', v =>
      Result.succeed(
        v.reportsGrantedAccess.sort((a, b) => {
          let aTitle: string =
            a.title.toLowerCase() || a.reportId.toLowerCase();

          let bTitle: string =
            b.title.toLowerCase() || b.reportId.toLowerCase();

          return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
        })
      )
    ),
    Result.bind('reportTargetIds', v =>
      Result.succeed(v.sortedNonDraftReports.map(report => report.reportId))
    ),
    Result.bind('favoriteReportIds', v =>
      getFavoriteTargetIds({
        db: v.db,
        projectId: v.projectId,
        userId: v.user.userId,
        type: 'Report',
        targetIds: v.reportTargetIds
      }).then(ids => Result.succeed(ids))
    ),
    Result.bind('reportSpaceUnits', v =>
      Result.succeed(
        v.sortedNonDraftReports.map(report =>
          makeReportSpaceUnit({
            report: report,
            member: v.apiUserMember,
            favoriteReportIds: v.favoriteReportIds
          })
        )
      )
    ),
    Result.bind('reportSpaceNodes', v =>
      Result.succeed(
        makeSpaceNodes({
          spaces: v.spaces ?? [],
          units: v.reportSpaceUnits,
          member: v.apiUserMember,
          mySpaceTitle: MY_REPORTS_SPACE_TITLE
        })
      )
    ),
    Result.map(
      (v): ReportsCatalog => ({
        reportUnitDrafts: v.sortedDraftReports.map(report =>
          makeReportUnit({
            report: report,
            member: v.apiUserMember,
            favoriteReportIds: [],
            space: report.space,
            spaceFullTitle: report.space
              ? v.spaces.find(space => space.space === report.space)?.fullTitle
              : ''
          })
        ),
        reportSpaceNodes: v.reportSpaceNodes
      })
    )
  );
}
