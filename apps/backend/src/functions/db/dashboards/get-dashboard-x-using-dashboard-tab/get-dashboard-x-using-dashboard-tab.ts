import { Result } from '@praha/byethrow';
import { and, eq, inArray } from 'drizzle-orm';
import type { DashboardTab } from '#backend/drizzle/postgres/schema/_tabs';
import { mconfigsTable } from '#backend/drizzle/postgres/schema/mconfigs';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { queriesTable } from '#backend/drizzle/postgres/schema/queries';
import { checkModelAccess } from '#backend/functions/check-model-access/check-model-access';
import { dashboardTabToApi } from '#backend/functions/db/dashboards/get-dashboard-x-using-dashboard-tab/dashboard-tab-to-api/dashboard-tab-to-api';
import type { DbService } from '#backend/services/db/db.service';
import type { MconfigsService } from '#backend/services/db/mconfigs/mconfigs.service';
import type { ModelsService } from '#backend/services/db/models/models.service';
import type { QueriesService } from '#backend/services/db/queries/queries.service';
import type { GetDashboardXUsingDashboardTabError } from '#common/types/backend/function-errors/get-dashboard-x-using-dashboard-tab-error';
import type { DashboardX } from '#common/types/backend/parts/dashboard/dashboard-x';
import type { Member } from '#common/types/backend/parts/member';
import type { ModelX } from '#common/types/backend/parts/model/model-x';

type AssembleDashboardProjectionPayload = {
  apiModels: ModelX[];
  dashboardX: DashboardX;
};

export async function getDashboardXUsingDashboardTab(item: {
  db: DbService;
  modelsService: ModelsService;
  mconfigsService: MconfigsService;
  queriesService: QueriesService;
  dashboard: DashboardTab;
  structId: string;
  projectId: string;
  apiUserMember: Member; // do not use membersService inside dashboardsService (circular dep with blockmlService)
}): Result.ResultAsync<DashboardX, GetDashboardXUsingDashboardTabError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('mconfigIds', v =>
      Result.succeed(v.dashboard.tiles.map(x => x.mconfigId))
    ),
    Result.bind('mconfigs', async v =>
      v.mconfigIds.length === 0
        ? Result.succeed([])
        : v.db.mconfigs.findMany({
            where: inArray(mconfigsTable.mconfigId, v.mconfigIds)
          })
    ),
    Result.bind('queryIds', v =>
      Result.succeed(v.dashboard.tiles.map(x => x.queryId))
    ),
    Result.bind('queries', async v =>
      v.queryIds.length === 0
        ? Result.succeed([])
        : v.db.queries.findMany({
            where: and(
              inArray(queriesTable.queryId, v.queryIds),
              eq(queriesTable.projectId, v.projectId)
            )
          })
    ),
    Result.bind('models', v =>
      v.db.models.findMany({
        where: eq(modelsTable.structId, v.structId)
      })
    ),
    Result.bind('assembleDashboardProjectionPayload', v => {
      let apiModels: ModelX[] = v.models.map(model =>
        v.modelsService.tabToApi({
          model: model,
          hasAccess: checkModelAccess({
            member: v.apiUserMember,
            modelAccessRoles: model.accessRolesCombined
          })
        })
      );

      let dashboardX: DashboardX = dashboardTabToApi({
        dashboard: v.dashboard,
        mconfigs: v.mconfigs.map(x =>
          v.mconfigsService.tabToApi({
            mconfig: x,
            modelFields: apiModels.find(m => m.modelId === x.modelId).fields
          })
        ),
        queries: v.queries.map(x => v.queriesService.tabToApi({ query: x })),
        member: v.apiUserMember,
        models: apiModels,
        isAddMconfigAndQuery: true
      });

      let assembleDashboardProjectionPayload: AssembleDashboardProjectionPayload =
        {
          apiModels: apiModels,
          dashboardX: dashboardX
        };

      return Result.succeed(assembleDashboardProjectionPayload);
    }),
    Result.map(
      (v): DashboardX => v.assembleDashboardProjectionPayload.dashboardX
    )
  );
}
