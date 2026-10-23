import { Result } from '@praha/byethrow';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { getDashboardCheckExistsAndAccess } from '#backend/functions/db/dashboards/get-dashboard-check-exists-and-access/get-dashboard-check-exists-and-access';
import { getDashboardXUsingDashboardTab } from '#backend/functions/db/dashboards/get-dashboard-x-using-dashboard-tab/get-dashboard-x-using-dashboard-tab';
import type { DbService } from '#backend/services/db/db.service';
import type { MconfigsService } from '#backend/services/db/mconfigs/mconfigs.service';
import type { ModelsService } from '#backend/services/db/models/models.service';
import type { QueriesService } from '#backend/services/db/queries/queries.service';
import type { GetDashboardXCheckExistsAndAccessError } from '#common/types/backend/function-errors/get-dashboard-x-check-exists-and-access-error';
import type { DashboardX } from '#common/types/backend/parts/dashboard/dashboard-x';
import type { Member } from '#common/types/backend/parts/member';

export async function getDashboardXCheckExistsAndAccess(item: {
  db: DbService;
  modelsService: ModelsService;
  mconfigsService: MconfigsService;
  queriesService: QueriesService;
  dashboardId: string;
  structId: string;
  projectId: string;
  user: UserTab;
  apiUserMember: Member; // do not use membersService inside dashboardsService (circular dep with blockmlService)
}): Result.ResultAsync<DashboardX, GetDashboardXCheckExistsAndAccessError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('dashboard', v =>
      getDashboardCheckExistsAndAccess({
        db: v.db,
        structId: v.structId,
        dashboardId: v.dashboardId,
        userMember: v.apiUserMember,
        user: v.user
      })
    ),
    Result.bind('dashboardX', v =>
      getDashboardXUsingDashboardTab({
        db: v.db,
        modelsService: v.modelsService,
        mconfigsService: v.mconfigsService,
        queriesService: v.queriesService,
        dashboard: v.dashboard,
        structId: v.structId,
        projectId: v.projectId,
        apiUserMember: v.apiUserMember
      })
    ),
    Result.map((v): DashboardX => v.dashboardX)
  );
}
