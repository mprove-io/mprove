import { Result } from '@praha/byethrow';
import { and, eq, inArray } from 'drizzle-orm';
import type { DashboardTab } from '#backend/drizzle/postgres/tables/dashboards';
import { mconfigsTable } from '#backend/drizzle/postgres/tables/mconfigs';
import { modelsTable } from '#backend/drizzle/postgres/tables/models';
import { queriesTable } from '#backend/drizzle/postgres/tables/queries';
import { dashboardTabToApi } from '#backend/functions/db/dashboards/get-dashboard-x-using-dashboard-tab/dashboard-tab-to-api/dashboard-tab-to-api';
import { mconfigTabToApi } from '#backend/functions/db/mconfigs/mconfig-tab-to-api/mconfig-tab-to-api';
import { checkModelAccess } from '#backend/functions/db/models/check-model-access/check-model-access';
import { modelTabToApi } from '#backend/functions/db/models/model-tab-to-api/model-tab-to-api';
import { queryTabToApi } from '#backend/functions/db/queries/query-tab-to-api/query-tab-to-api';
import type { DbService } from '#backend/services/db/db.service';
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
        modelTabToApi({
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
          mconfigTabToApi({
            mconfig: x,
            modelFields: apiModels.find(m => m.modelId === x.modelId).fields
          })
        ),
        queries: v.queries.map(x =>
          queryTabToApi({
            query: x
          })
        ),
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
