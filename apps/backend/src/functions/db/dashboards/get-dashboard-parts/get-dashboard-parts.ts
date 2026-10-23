import { Result } from '@praha/byethrow';
import { and, eq, or } from 'drizzle-orm';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import {
  type DashboardEnt,
  dashboardsTable
} from '#backend/drizzle/postgres/schema/dashboards';
import { checkAccess } from '#backend/functions/check-access/check-access';
import { tabToDashboardPart } from '#backend/functions/db/dashboards/get-dashboard-parts/tab-to-dashboard-part/tab-to-dashboard-part';
import type { DbService } from '#backend/services/db/db.service';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { GetDashboardPartsError } from '#common/types/backend/function-errors/get-dashboard-parts-error';
import type { DashboardPart } from '#common/types/backend/parts/dashboard/dashboard-part';
import type { Member } from '#common/types/backend/parts/member';

export async function getDashboardParts(item: {
  db: DbService;
  structId: string;
  user: UserTab;
  apiUserMember: Member;
}): Result.ResultAsync<DashboardPart[], GetDashboardPartsError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('dashboards', v =>
      v.db.drizzle
        .select({
          keyTag: dashboardsTable.keyTag,
          dashboardId: dashboardsTable.dashboardId,
          draft: dashboardsTable.draft,
          creatorId: dashboardsTable.creatorId,
          st: dashboardsTable.st
          // lt: {},
        })
        .from(dashboardsTable)
        .where(
          and(
            eq(dashboardsTable.structId, v.structId),
            or(
              eq(dashboardsTable.draft, false),
              eq(dashboardsTable.creatorId, v.user.userId)
            )
          )
        )
        .then(xs =>
          Result.sequence(xs, x =>
            isUndefined(x as DashboardEnt)
              ? Result.succeed(undefined)
              : v.db.dashboards.entToTab({
                  ent: x as DashboardEnt
                })
          )
        )
    ),
    Result.bind('dashboardsGrantedAccess', v =>
      Result.succeed(
        v.dashboards.filter(dashboard =>
          dashboard.draft === true
            ? true
            : checkAccess({
                member: v.apiUserMember,
                accessRoles: dashboard.accessRolesCombined,
                filePath: dashboard.filePath
              })
        )
      )
    ),
    Result.map((v): DashboardPart[] =>
      v.dashboardsGrantedAccess.map(dashboard =>
        tabToDashboardPart({
          dashboard: dashboard,
          member: v.apiUserMember
        })
      )
    )
  );
}
