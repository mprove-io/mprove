import { Result } from '@praha/byethrow';
import { and, eq, isNull, or } from 'drizzle-orm';
import { chartsTable } from '#backend/drizzle/postgres/tables/charts';
import type { ModelTab } from '#backend/drizzle/postgres/tables/models';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { checkAccess } from '#backend/functions/check-access/check-access';
import { checkModelAccess } from '#backend/functions/check-model-access/check-model-access';
import { addModelLevelToChartSpaceNodesRecursive } from '#backend/functions/db/charts/get-charts-catalog/add-model-level-to-chart-space-nodes-recursive/add-model-level-to-chart-space-nodes-recursive';
import { makeChartSpaceUnit } from '#backend/functions/db/charts/get-charts-catalog/make-chart-space-unit/make-chart-space-unit';
import { makeChartUnit } from '#backend/functions/db/charts/get-charts-catalog/make-chart-unit/make-chart-unit';
import { getFavoriteTargetIds } from '#backend/functions/db/favorites/get-favorite-target-ids/get-favorite-target-ids';
import { makeSpaceNodes } from '#backend/functions/space/make-space-nodes/make-space-nodes';
import type { DbService } from '#backend/services/db/db.service';
import { MY_CHARTS_SPACE_TITLE } from '#common/constants/top';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { GetChartsCatalogError } from '#common/types/backend/function-errors/get-charts-catalog-error';
import type { ChartUnit } from '#common/types/backend/parts/chart/chart-unit';
import type { Member } from '#common/types/backend/parts/member';
import type { SpaceNode } from '#common/types/backend/parts/space-node';
import type { Space } from '#common/types/blockml/parts/space';

export type GetChartsCatalogOutput = {
  chartUnitDrafts: ChartUnit[];
  chartSpaceNodes: SpaceNode[];
};

export async function getChartsCatalog(item: {
  db: DbService;
  projectId: string;
  structId: string;
  user: UserTab;
  apiUserMember: Member;
  models: ModelTab[];
  spaces: Space[];
}): Result.ResultAsync<GetChartsCatalogOutput, GetChartsCatalogError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('charts', v =>
      v.db.charts.findMany({
        where: and(
          eq(chartsTable.structId, v.structId),
          or(isNull(chartsTable.isExplorer), eq(chartsTable.isExplorer, false)),
          or(
            eq(chartsTable.draft, false),
            and(
              eq(chartsTable.draft, true),
              eq(chartsTable.creatorId, v.user.userId)
            )
          )
        )
      })
    ),
    Result.bind('chartsGrantedAccess', v =>
      Result.succeed(
        v.charts.filter(chart => {
          if (chart.draft === true) {
            let model: ModelTab = v.models.find(
              model => model.modelId === chart.modelId
            );

            if (isUndefined(model)) {
              return false;
            }

            let isModelAccessGranted: boolean = checkModelAccess({
              member: v.apiUserMember,
              modelAccessRoles: model.accessRolesCombined
            });

            return isModelAccessGranted === true;
          }

          let isChartAccessGranted: boolean = checkAccess({
            member: v.apiUserMember,
            accessRoles: chart.accessRolesCombined,
            filePath: chart.filePath
          });

          return isChartAccessGranted === true;
        })
      )
    ),
    Result.bind('draftCharts', v =>
      Result.succeed(
        v.chartsGrantedAccess.filter(chart => chart.draft === true)
      )
    ),
    Result.bind('savedCharts', v =>
      Result.succeed(
        v.chartsGrantedAccess.filter(chart => chart.draft === false)
      )
    ),
    Result.bind('favoriteChartIds', v =>
      getFavoriteTargetIds({
        db: v.db,
        projectId: v.projectId,
        userId: v.user.userId,
        type: 'Chart',
        targetIds: v.savedCharts.map(chart => chart.chartId)
      }).then(ids => Result.succeed(ids))
    ),
    Result.bind('sortedDraftCharts', v =>
      Result.succeed(
        v.draftCharts.sort((a, b) => {
          let aTitle: string = (a.title || a.chartId).toLowerCase();

          let bTitle: string = (b.title || b.chartId).toLowerCase();

          return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
        })
      )
    ),
    Result.bind('sortedSavedCharts', v =>
      Result.succeed(
        v.savedCharts.sort((a, b) => {
          let aTitle: string = (a.title || a.chartId).toLowerCase();

          let bTitle: string = (b.title || b.chartId).toLowerCase();

          return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
        })
      )
    ),
    Result.bind('chartSpaceUnits', v =>
      Result.succeed(
        v.sortedSavedCharts.map(chart =>
          makeChartSpaceUnit({
            chart: chart,
            model: v.models.find(model => model.modelId === chart.modelId),
            member: v.apiUserMember,
            favoriteChartIds: v.favoriteChartIds
          })
        )
      )
    ),
    Result.bind('chartUnitDrafts', v =>
      Result.succeed(
        v.sortedDraftCharts.map(chart =>
          makeChartUnit({
            chart: chart,
            model: v.models.find(model => model.modelId === chart.modelId),
            member: v.apiUserMember,
            favoriteChartIds: [],
            space: chart.space,
            spaceFullTitle: chart.space
              ? v.spaces.find(space => space.space === chart.space)?.fullTitle
              : ''
          })
        )
      )
    ),
    Result.bind('chartSpaceNodes', v =>
      Result.succeed(
        makeSpaceNodes({
          spaces: v.spaces ?? [],
          units: v.chartSpaceUnits,
          member: v.apiUserMember,
          mySpaceTitle: MY_CHARTS_SPACE_TITLE
        })
      )
    ),
    Result.map(
      (v): GetChartsCatalogOutput => ({
        chartUnitDrafts: v.chartUnitDrafts,
        chartSpaceNodes: addModelLevelToChartSpaceNodesRecursive({
          nodes: v.chartSpaceNodes
        })
      })
    )
  );
}
