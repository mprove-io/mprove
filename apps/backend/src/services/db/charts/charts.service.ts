import { Inject, Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { and, eq, isNull, or } from 'drizzle-orm';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  ChartTab,
  MemberTab,
  ModelTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { chartsTable } from '#backend/drizzle/postgres/schema/charts';
import { checkAccess } from '#backend/functions/check-access/check-access';
import { checkModelAccess } from '#backend/functions/check-model-access/check-model-access';
import { makeTilesX } from '#backend/functions/make-tiles-x/make-tiles-x';
import { sortSpaceNodesRecursive as sortSpaceNodes } from '#backend/functions/space/sort-space-nodes-recursive/sort-space-nodes-recursive';
import { FavoritesService } from '#backend/services/db/favorites/favorites.service';
import { HashService } from '#backend/services/hash/hash.service';
import { SpaceService } from '#backend/services/space/space.service';
import { TabService } from '#backend/services/tab/tab.service';
import { UnitsService } from '#backend/services/units/units.service';
import { ServerError } from '#common/classes/server-error/server-error';
import {
  MPROVE_USERS_FOLDER,
  MY_CHARTS_SPACE_TITLE
} from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ChartEntToTabResultError } from '#common/types/backend/function-errors/chart-ent-to-tab-result-error';
import type { CheckChartOrModelAccessResultError } from '#common/types/backend/function-errors/check-chart-or-model-access-result-error';
import type { GetChartCheckExistsResultError } from '#common/types/backend/function-errors/get-chart-check-exists-result-error';
import type { GetChartsCatalogResultError } from '#common/types/backend/function-errors/get-charts-catalog-result-error';
import type { ChartUnit } from '#common/types/backend/parts/chart/chart-unit';
import type { ChartX } from '#common/types/backend/parts/chart/chart-x';
import type { MconfigX } from '#common/types/backend/parts/mconfig/mconfig-x';
import type { Member } from '#common/types/backend/parts/member';
import type { ModelX } from '#common/types/backend/parts/model/model-x';
import type { SpaceFolder } from '#common/types/backend/parts/space-folder';
import type { SpaceNode } from '#common/types/backend/parts/space-node';
import type { SpaceUnit } from '#common/types/backend/parts/space-unit';
import type { Chart } from '#common/types/blockml/parts/chart/chart';
import type { ChartType } from '#common/types/blockml/parts/chart/chart-type';
import type { Query } from '#common/types/blockml/parts/query/query';
import type { Space } from '#common/types/blockml/parts/space';

export type ChartOrModelAccess = {
  hasChartAccess: boolean;
  hasModelAccess: boolean;
};

export type ChartsCatalog = {
  chartUnitDrafts: ChartUnit[];
  chartSpaceNodes: SpaceNode[];
};

@Injectable()
export class ChartsService {
  constructor(
    private hashService: HashService,
    private favoritesService: FavoritesService,
    private spaceService: SpaceService,
    private tabService: TabService,
    private unitsService: UnitsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async getChartsCatalog(item: {
    projectId: string;
    structId: string;
    user: UserTab;
    apiUserMember: Member;
    models: ModelTab[];
    spaces: Space[];
  }): Promise<ChartsCatalog> {
    let { projectId, structId, user, apiUserMember, models, spaces } = item;

    let result: Result.Result<ChartsCatalog, GetChartsCatalogResultError> =
      await this.getChartsCatalogResult({
        projectId: projectId,
        structId: structId,
        user: user,
        apiUserMember: apiUserMember,
        models: models,
        spaces: spaces
      });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let catalog: ChartsCatalog = result.value;

    return catalog;
  }

  async getChartsCatalogResult(item: {
    projectId: string;
    structId: string;
    user: UserTab;
    apiUserMember: Member;
    models: ModelTab[];
    spaces: Space[];
  }): Result.ResultAsync<ChartsCatalog, GetChartsCatalogResultError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'charts',
        (v): Result.ResultAsync<ChartTab[], ChartEntToTabResultError> =>
          this.db.drizzle.query.chartsTable
            .findMany({
              where: and(
                eq(chartsTable.structId, v.structId),
                or(
                  isNull(chartsTable.isExplorer),
                  eq(chartsTable.isExplorer, false)
                ),
                or(
                  eq(chartsTable.draft, false),
                  and(
                    eq(chartsTable.draft, true),
                    eq(chartsTable.creatorId, v.user.userId)
                  )
                )
              )
            })
            .then(xs =>
              Result.sequence(xs, x =>
                this.tabService.chartEntToTabResult({ chartEnt: x })
              )
            )
      ),
      Result.bind(
        'chartsGrantedAccess',
        (v): Result.Result<ChartTab[], never> =>
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
      Result.bind(
        'draftCharts',
        (v): Result.Result<ChartTab[], never> =>
          Result.succeed(
            v.chartsGrantedAccess.filter(chart => chart.draft === true)
          )
      ),
      Result.bind(
        'savedCharts',
        (v): Result.Result<ChartTab[], never> =>
          Result.succeed(
            v.chartsGrantedAccess.filter(chart => chart.draft === false)
          )
      ),
      Result.bind(
        'favoriteChartIds',
        (v): Result.ResultAsync<string[], never> =>
          this.favoritesService
            .getFavoriteTargetIds({
              projectId: v.projectId,
              userId: v.user.userId,
              type: 'Chart',
              targetIds: v.savedCharts.map(chart => chart.chartId)
            })
            .then(ids => Result.succeed(ids))
      ),
      Result.bind(
        'sortedDraftCharts',
        (v): Result.Result<ChartTab[], never> =>
          Result.succeed(
            v.draftCharts.sort((a, b) => {
              let aTitle: string = (a.title || a.chartId).toLowerCase();

              let bTitle: string = (b.title || b.chartId).toLowerCase();

              return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
            })
          )
      ),
      Result.bind(
        'sortedSavedCharts',
        (v): Result.Result<ChartTab[], never> =>
          Result.succeed(
            v.savedCharts.sort((a, b) => {
              let aTitle: string = (a.title || a.chartId).toLowerCase();

              let bTitle: string = (b.title || b.chartId).toLowerCase();

              return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
            })
          )
      ),
      Result.bind(
        'chartSpaceUnits',
        (v): Result.Result<SpaceUnit[], never> =>
          Result.succeed(
            v.sortedSavedCharts.map(chart =>
              this.unitsService.makeChartSpaceUnit({
                chart: chart,
                model: v.models.find(model => model.modelId === chart.modelId),
                member: v.apiUserMember,
                favoriteChartIds: v.favoriteChartIds
              })
            )
          )
      ),
      Result.bind(
        'chartUnitDrafts',
        (v): Result.Result<ChartUnit[], never> =>
          Result.succeed(
            v.sortedDraftCharts.map(chart =>
              this.unitsService.makeChartUnit({
                chart: chart,
                model: v.models.find(model => model.modelId === chart.modelId),
                member: v.apiUserMember,
                favoriteChartIds: [],
                space: chart.space,
                spaceFullTitle: chart.space
                  ? v.spaces.find(space => space.space === chart.space)
                      ?.fullTitle
                  : ''
              })
            )
          )
      ),
      Result.bind(
        'chartSpaceNodes',
        (v): Result.Result<SpaceNode[], never> =>
          Result.succeed(
            this.spaceService.makeSpaceNodes({
              spaces: v.spaces ?? [],
              units: v.chartSpaceUnits,
              member: v.apiUserMember,
              mySpaceTitle: MY_CHARTS_SPACE_TITLE
            })
          )
      ),
      Result.map(
        (v): ChartsCatalog => ({
          chartUnitDrafts: v.chartUnitDrafts,
          chartSpaceNodes: this.addModelLevelToChartSpaceNodes({
            nodes: v.chartSpaceNodes
          })
        })
      )
    );
  }

  addModelLevelToChartSpaceNodes(item: { nodes: SpaceNode[] }): SpaceNode[] {
    let { nodes } = item;

    return nodes.map(node => {
      if (node.type === 'spaceUnit') {
        return node;
      }

      let children = this.addModelLevelToChartSpaceNodes({
        nodes: node.children ?? []
      });

      let folderChildren = children.filter(
        child => child.type === 'spaceFolder'
      );

      let unitChildren = children.filter(
        child => child.type === 'spaceUnit'
      ) as SpaceUnit[];

      let modelFolders: SpaceFolder[] = [];

      unitChildren.forEach(chartUnit => {
        let modelId = chartUnit.modelId ?? '';
        let modelLabel = chartUnit.modelLabel ?? modelId;
        let modelFolderId = `${node.id}/model/${modelId}`;
        let modelFolder = modelFolders.find(
          folder => folder.id === modelFolderId
        );

        if (isUndefined(modelFolder)) {
          modelFolder = {
            type: 'spaceFolder',
            id: modelFolderId,
            space: `${node.space}/model/${modelId}`,
            filePath: '',
            title: modelLabel,
            accessRoles: [],
            accessRolesCombined: [],
            isSynthetic: true,
            modelId: modelId,
            modelLabel: modelLabel,
            children: []
          };

          modelFolders.push(modelFolder);
        }

        modelFolder.children.push(chartUnit);
      });

      return {
        ...node,
        children: sortSpaceNodes({
          nodes: [...folderChildren, ...modelFolders]
        })
      };
    });
  }

  tabToApi(item: {
    chart: ChartTab;
    mconfigs: MconfigX[];
    queries: Query[];
    member: Member;
    isAddMconfigAndQuery: boolean;
    models: ModelX[];
  }): ChartX {
    let { chart, mconfigs, queries, member, isAddMconfigAndQuery, models } =
      item;

    let filePathArray = isDefined(chart.filePath)
      ? chart.filePath.split('/')
      : [];

    let usersFolderIndex = filePathArray.findIndex(
      x => x === MPROVE_USERS_FOLDER
    );

    let author =
      usersFolderIndex > -1 && filePathArray.length > usersFolderIndex + 1
        ? filePathArray[usersFolderIndex + 1]
        : undefined;

    let canEditOrDeleteChart =
      member.isEditor || member.isAdmin || author === member.alias;

    let apiChart: ChartX = {
      structId: chart.structId,
      chartId: chart.chartId,
      draft: chart.draft,
      creatorId: chart.creatorId,
      author: author,
      canEditOrDeleteChart: canEditOrDeleteChart,
      title: chart.title,
      chartType: chart.chartType,
      modelId: chart.modelId,
      modelLabel: chart.modelLabel,
      filePath: chart.filePath,
      space: chart.space,
      accessRoles: chart.accessRoles,
      accessRolesCombined: chart.accessRolesCombined,
      tiles: makeTilesX({
        tiles: chart.tiles,
        mconfigs: mconfigs,
        queries: queries,
        isAddMconfigAndQuery: isAddMconfigAndQuery,
        models: models,
        dashboardExtendedFilters: undefined
      }),
      serverTs: Number(chart.serverTs)
    };

    return apiChart;
  }

  apiToTab(item: { apiChart: Chart; chartType: ChartType }): ChartTab {
    let { apiChart, chartType } = item;

    if (isUndefined(apiChart)) {
      return;
    }

    let chart: ChartTab = {
      chartFullId: this.hashService.makeChartFullId({
        structId: apiChart.structId,
        chartId: apiChart.chartId
      }),
      structId: apiChart.structId,
      chartId: apiChart.chartId,
      modelId: apiChart.modelId,
      creatorId: apiChart.creatorId,
      chartType: chartType,
      draft: apiChart.draft,
      isExplorer: apiChart.isExplorer,
      sessionId: apiChart.sessionId,
      chartYaml: apiChart.chartYaml,
      title: apiChart.title,
      modelLabel: apiChart.modelLabel,
      filePath: apiChart.filePath,
      space: apiChart.space,
      accessRoles: apiChart.accessRoles,
      accessRolesCombined: apiChart.accessRolesCombined,
      tiles: apiChart.tiles,
      keyTag: undefined,
      serverTs: apiChart.serverTs
    };

    return chart;
  }

  async getChartCheckExists(item: {
    chartId: string;
    structId: string;
    userMember: MemberTab;
    user: UserTab;
  }): Promise<ChartTab> {
    let { chartId, structId, userMember, user } = item;

    let result: Result.Result<ChartTab, GetChartCheckExistsResultError> =
      await this.getChartCheckExistsResult({
        chartId: chartId,
        structId: structId,
        userMember: userMember,
        user: user
      });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let chart: ChartTab = result.value;

    return chart;
  }

  async getChartCheckExistsResult(item: {
    chartId: string;
    structId: string;
    userMember: MemberTab;
    user: UserTab;
  }): Result.ResultAsync<ChartTab, GetChartCheckExistsResultError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'chart',
        (v): Result.ResultAsync<ChartTab, ChartEntToTabResultError> =>
          this.db.drizzle.query.chartsTable
            .findFirst({
              where: and(
                eq(chartsTable.structId, v.structId),
                eq(chartsTable.chartId, v.chartId)
              )
            })
            .then(x =>
              isUndefined(x)
                ? Result.succeed(undefined)
                : this.tabService.chartEntToTabResult({ chartEnt: x })
            )
      ),
      Result.andThrough(v =>
        isUndefined(v.chart)
          ? Result.fail({ code: 'BACKEND_CHART_DOES_NOT_EXIST' })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        v.chart.draft === true && v.chart.creatorId !== v.user.userId
          ? Result.fail({ code: 'BACKEND_CHART_CREATOR_ID_MISMATCH' })
          : Result.succeed()
      ),
      Result.map((v): ChartTab => v.chart)
    );
  }

  checkChartOrModelAccess(item: {
    chart: ChartTab;
    model: ModelTab;
    userMember: MemberTab | Member;
  }): ChartOrModelAccess {
    let { chart, model, userMember } = item;

    let result: Result.Result<
      ChartOrModelAccess,
      CheckChartOrModelAccessResultError
    > = this.checkChartOrModelAccessResult({
      chart: chart,
      model: model,
      userMember: userMember
    });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let access: ChartOrModelAccess = result.value;

    return access;
  }

  checkChartOrModelAccessResult(item: {
    chart: ChartTab;
    model: ModelTab;
    userMember: MemberTab | Member;
  }): Result.Result<ChartOrModelAccess, CheckChartOrModelAccessResultError> {
    let { chart, model, userMember } = item;

    let hasChartAccess: boolean = checkAccess({
      member: userMember,
      accessRoles: chart.accessRolesCombined,
      filePath: chart.filePath
    });

    let hasModelAccess: boolean = checkModelAccess({
      member: userMember,
      modelAccessRoles: model.accessRolesCombined
    });

    if (hasChartAccess === false && hasModelAccess === false) {
      return Result.fail({ code: 'BACKEND_FORBIDDEN_MODEL' });
    }

    return Result.succeed({
      hasChartAccess: hasChartAccess,
      hasModelAccess: hasModelAccess
    });
  }

  checkChartPath(item: { filePath: string; userAlias: string }) {
    let filePathArray = item.filePath.split('/');

    let usersFolderIndex = filePathArray.findIndex(
      x => x === MPROVE_USERS_FOLDER
    );

    if (
      usersFolderIndex < 0 ||
      filePathArray.length === usersFolderIndex + 1 ||
      filePathArray[usersFolderIndex + 1] !== item.userAlias
    ) {
      throw new ServerError({
        message: 'BACKEND_FORBIDDEN_CHART_PATH'
      });
    }
  }
}
