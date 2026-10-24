import { Result } from '@praha/byethrow';
import type { ChartTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { ChartEnt } from '#backend/drizzle/postgres/schema/charts';
import { getEntProps } from '#backend/functions/get-ent-props/get-ent-props';
import { makeChartFullId } from '#backend/functions/hash/make-chart-full-id/make-chart-full-id';
import type { TabService } from '#backend/services/tab/tab.service';
import type { ChartLt } from '#common/types/shared/st-lt/charts/chart-lt';
import type { ChartSt } from '#common/types/shared/st-lt/charts/chart-st';

export function chartTabToEnt(item: {
  tab: ChartTab;
  tabService: TabService;
  isEncryptDb: boolean;
  isEncryptMetadata: boolean;
}): Result.Result<ChartEnt, never> {
  let { tab, tabService, isEncryptDb, isEncryptMetadata } = item;

  let chartSt: ChartSt = {
    title: tab.title,
    modelLabel: tab.modelLabel,
    filePath: tab.filePath,
    space: tab.space,
    accessRoles: tab.accessRoles || [],
    accessRolesCombined: tab.accessRolesCombined || [],
    tiles: tab.tiles
  };

  let chartLt: ChartLt = {};

  let chartEnt: ChartEnt = {
    chartFullId: makeChartFullId({
      structId: tab.structId,
      chartId: tab.chartId
    }),
    structId: tab.structId,
    chartId: tab.chartId,
    modelId: tab.modelId,
    creatorId: tab.creatorId,
    chartType: tab.chartType,
    draft: tab.draft,
    isExplorer: tab.isExplorer,
    sessionId: tab.sessionId,
    chartYaml: tab.chartYaml,
    serverTs: tab.serverTs,
    ...getEntProps({
      dataSt: chartSt,
      dataLt: chartLt,
      isMetadata: true,
      tabService: tabService,
      isEncryptDb: isEncryptDb,
      isEncryptMetadata: isEncryptMetadata
    })
  };

  return Result.succeed(chartEnt);
}
