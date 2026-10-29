import { Result } from '@praha/byethrow';
import { and, eq, or } from 'drizzle-orm';
import { dashboardsTable } from '#backend/drizzle/postgres/tables/dashboards';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { checkAccess } from '#backend/functions/check-access/check-access';
import { makeDashboardSpaceUnit } from '#backend/functions/db/dashboards/get-dashboards-catalog/make-dashboard-space-unit/make-dashboard-space-unit';
import { makeDashboardUnit } from '#backend/functions/db/dashboards/get-dashboards-catalog/make-dashboard-unit/make-dashboard-unit';
import { getFavoriteTargetIds } from '#backend/functions/db/favorites/get-favorite-target-ids/get-favorite-target-ids';
import { makeSpaceNodes } from '#backend/functions/space/make-space-nodes/make-space-nodes';
import type { DbService } from '#backend/services/db/db.service';
import { MY_DASHBOARDS_SPACE_TITLE } from '#common/constants/top';
import type { GetDashboardsCatalogError } from '#common/types/backend/function-errors/get-dashboards-catalog-error';
import type { DashboardUnit } from '#common/types/backend/parts/dashboard/dashboard-unit';
import type { Member } from '#common/types/backend/parts/member';
import type { SpaceNode } from '#common/types/backend/parts/space-node';
import type { Space } from '#common/types/blockml/parts/space';

export type GetDashboardsCatalogOutput = {
  dashboardUnitDrafts: DashboardUnit[];
  dashboardSpaceNodes: SpaceNode[];
};

export async function getDashboardsCatalog(item: {
  db: DbService;
  projectId: string;
  structId: string;
  user: UserTab;
  apiUserMember: Member;
  spaces: Space[];
}): Result.ResultAsync<GetDashboardsCatalogOutput, GetDashboardsCatalogError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('dashboards', v =>
      v.db.dashboards.findMany({
        where: and(
          eq(dashboardsTable.structId, v.structId),
          or(
            eq(dashboardsTable.draft, false),
            and(
              eq(dashboardsTable.draft, true),
              eq(dashboardsTable.creatorId, v.user.userId)
            )
          )
        )
      })
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
    Result.bind('draftDashboards', v =>
      Result.succeed(
        v.dashboardsGrantedAccess.filter(dashboard => dashboard.draft === true)
      )
    ),
    Result.bind('savedDashboards', v =>
      Result.succeed(
        v.dashboardsGrantedAccess.filter(dashboard => dashboard.draft === false)
      )
    ),
    Result.bind('dashboardTargetIds', v =>
      Result.succeed(v.savedDashboards.map(dashboard => dashboard.dashboardId))
    ),
    Result.bind('favoriteDashboardIds', v =>
      getFavoriteTargetIds({
        db: v.db,
        projectId: v.projectId,
        userId: v.user.userId,
        type: 'Dashboard',
        targetIds: v.dashboardTargetIds
      }).then(ids => Result.succeed(ids))
    ),
    Result.bind('dashboardSpaceUnits', v =>
      Result.succeed(
        v.savedDashboards.map(dashboard =>
          makeDashboardSpaceUnit({
            dashboard: dashboard,
            member: v.apiUserMember,
            favoriteDashboardIds: v.favoriteDashboardIds
          })
        )
      )
    ),
    Result.map(
      (v): GetDashboardsCatalogOutput => ({
        dashboardUnitDrafts: v.draftDashboards.map(dashboard =>
          makeDashboardUnit({
            dashboard: dashboard,
            member: v.apiUserMember,
            favoriteDashboardIds: [],
            space: dashboard.space,
            spaceFullTitle: dashboard.space
              ? v.spaces.find(space => space.space === dashboard.space)
                  ?.fullTitle
              : ''
          })
        ),
        dashboardSpaceNodes: makeSpaceNodes({
          spaces: v.spaces ?? [],
          units: v.dashboardSpaceUnits,
          member: v.apiUserMember,
          mySpaceTitle: MY_DASHBOARDS_SPACE_TITLE
        })
      })
    )
  );
}
