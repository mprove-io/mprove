import { Inject, Injectable } from '@nestjs/common';
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
import { checkModelAccess } from '#backend/functions/check-model-access';
import { makeTilesX } from '#backend/functions/make-tiles-x';
import {
  MPROVE_USERS_FOLDER,
  MY_CHARTS_SPACE_TITLE
} from '#common/constants/top';
import { ChartTypeEnum } from '#common/enums/chart/chart-type.enum';
import { ErEnum } from '#common/enums/er.enum';
import { FavoriteTypeEnum } from '#common/enums/favorite-type.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { ServerError } from '#common/models/server-error';
import type { ChartUnit } from '#common/zod/backend/chart-unit';
import type { ChartX } from '#common/zod/backend/chart-x';
import type { MconfigX } from '#common/zod/backend/mconfig-x';
import type { Member } from '#common/zod/backend/member';
import type { ModelX } from '#common/zod/backend/model-x';
import type { SpaceNode } from '#common/zod/backend/space-node';
import type { SpaceUnit } from '#common/zod/backend/space-unit';
import type { Chart } from '#common/zod/blockml/chart';
import type { Query } from '#common/zod/blockml/query';
import type { Space } from '#common/zod/blockml/space';
import { HashService } from '../hash.service';
import { SpaceService } from '../space.service';
import { TabService } from '../tab.service';
import { UnitsService } from '../units.service';
import { FavoritesService } from './favorites.service';

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
  }): Promise<{
    chartUnitDrafts: ChartUnit[];
    chartSpaceNodes: SpaceNode[];
  }> {
    let { projectId, structId, user, apiUserMember, models, spaces } = item;

    let charts = await this.db.drizzle.query.chartsTable
      .findMany({
        where: and(
          eq(chartsTable.structId, structId),
          or(isNull(chartsTable.isExplorer), eq(chartsTable.isExplorer, false)),
          or(
            eq(chartsTable.draft, false),
            and(
              eq(chartsTable.draft, true),
              eq(chartsTable.creatorId, user.userId)
            )
          )
        )
      })
      .then(xs => xs.map(x => this.tabService.chartEntToTab(x)));

    let chartsGrantedAccess = charts.filter(chart => {
      let model = models.find(x => x.modelId === chart.modelId);

      return checkModelAccess({
        member: apiUserMember,
        modelAccessRoles: model.accessRolesCombined
      });
    });

    let draftCharts = chartsGrantedAccess.filter(chart => chart.draft === true);

    let savedCharts = chartsGrantedAccess.filter(
      chart => chart.draft === false
    );

    let favoriteChartIds = await this.favoritesService.getFavoriteTargetIds({
      projectId: projectId,
      userId: user.userId,
      type: FavoriteTypeEnum.Chart,
      targetIds: savedCharts.map(chart => chart.chartId)
    });

    let sortedDraftCharts = draftCharts.sort((a, b) => {
      let aTitle = (a.title || a.chartId).toLowerCase();
      let bTitle = (b.title || b.chartId).toLowerCase();

      return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
    });

    let sortedSavedCharts = savedCharts.sort((a, b) => {
      let aTitle = (a.title || a.chartId).toLowerCase();
      let bTitle = (b.title || b.chartId).toLowerCase();

      return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
    });

    let chartSpaceUnits: SpaceUnit[] = [];

    sortedSavedCharts.forEach(chart => {
      let model = models.find(x => x.modelId === chart.modelId);

      chartSpaceUnits.push(
        this.unitsService.makeChartSpaceUnit({
          chart: chart,
          model: model,
          member: apiUserMember,
          favoriteChartIds: favoriteChartIds
        })
      );
    });

    let chartUnitDrafts: ChartUnit[] = [];

    sortedDraftCharts.forEach(chart => {
      let model = models.find(x => x.modelId === chart.modelId);

      chartUnitDrafts.push(
        this.unitsService.makeChartUnit({
          chart: chart,
          model: model,
          member: apiUserMember,
          favoriteChartIds: [],
          space: model.space,
          displaySpace: model.space ?? ''
        })
      );
    });

    return {
      chartUnitDrafts: chartUnitDrafts,
      chartSpaceNodes: this.spaceService.makeSpaceNodes({
        spaces: spaces ?? [],
        units: chartSpaceUnits,
        member: apiUserMember,
        mySpaceTitle: MY_CHARTS_SPACE_TITLE
      })
    };
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

  apiToTab(item: { apiChart: Chart; chartType: ChartTypeEnum }): ChartTab {
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

    let chart = await this.db.drizzle.query.chartsTable
      .findFirst({
        where: and(
          eq(chartsTable.structId, structId),
          eq(chartsTable.chartId, chartId)
        )
      })
      .then(x => this.tabService.chartEntToTab(x));

    if (isUndefined(chart)) {
      throw new ServerError({
        message: ErEnum.BACKEND_CHART_DOES_NOT_EXIST
      });
    }

    if (chart.draft === true && chart.creatorId !== user.userId) {
      throw new ServerError({
        message: ErEnum.BACKEND_CHART_CREATOR_ID_MISMATCH
      });
    }

    return chart;
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
        message: ErEnum.BACKEND_FORBIDDEN_CHART_PATH
      });
    }
  }
}
