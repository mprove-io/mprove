import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { buildChart } from '#blockml/functions/build-chart/_build-chart';
import { makeChartAccessRolesCombined } from '#blockml/functions/build-chart/make-chart-access-roles-combined';
import { buildDashboard } from '#blockml/functions/build-dashboard/_build-dashboard';
import { buildField } from '#blockml/functions/build-field/_build-field';
import { buildMconfigChart } from '#blockml/functions/build-mconfig-chart/_build-mconfig-chart';
import { buildReport } from '#blockml/functions/build-report/_build-report';
import { buildTile } from '#blockml/functions/build-tile/_build-tile';
import { MconfigParentTypeEnum } from '#common/enums/mconfig-parent-type.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { toBooleanFromLowercaseString } from '#common/functions/to-boolean-from-lowercase-string';
import type { ProjectConnection } from '#common/zod/backend/project-connection';
import type { SelectedGiven } from '#common/zod/backend/selected-given';
import type { FileChart } from '#common/zod/blockml/internal/file-chart';
import type { FileDashboard } from '#common/zod/blockml/internal/file-dashboard';
import type { FilePartSpace } from '#common/zod/blockml/internal/file-part-space';
import type { FileProjectConf } from '#common/zod/blockml/internal/file-project-conf';
import type { FileReport } from '#common/zod/blockml/internal/file-report';
import type { FileStore } from '#common/zod/blockml/internal/file-store';
import type { Model } from '#common/zod/blockml/model';
import type { ModelMetric } from '#common/zod/blockml/model-metric';
import type { MalloyConnection } from '#node-common/functions/make-malloy-connections';

export type BuildVisualizationsOutput = {
  dashboards: FileDashboard[];
  charts: FileChart[];
  reports: FileReport[];
};

export async function buildVisualizations(item: {
  projectConfig: FileProjectConf;
  dashboards: FileDashboard[];
  charts: FileChart[];
  reports: FileReport[];
  spaces: FilePartSpace[];
  stores: FileStore[];
  structId: string;
  errors: BmError[];
  cs: ConfigService<BlockmlConfig>;
  projectId: string;
  envId: string;
  apiModels: Model[];
  malloyConnections: MalloyConnection[];
  projectConnections: ProjectConnection[];
  selectedGivens: SelectedGiven[];
  metrics: ModelMetric[];
}): Result.ResultAsync<BuildVisualizationsOutput, never> {
  let caseSensitiveStringFilters: boolean = toBooleanFromLowercaseString(
    item.projectConfig.case_sensitive_string_filters
  );

  let dashboards: FileDashboard[] = buildField(
    {
      entities: item.dashboards,
      projectConfig: item.projectConfig,
      structId: item.structId,
      errors: item.errors,
      caller: CallerEnum.BuildDashboardField
    },
    item.cs
  );

  dashboards = buildDashboard(
    {
      dashboards: dashboards,
      spaces: item.spaces,
      stores: item.stores,
      structId: item.structId,
      caseSensitiveStringFilters: caseSensitiveStringFilters,
      errors: item.errors,
      caller: CallerEnum.BuildDashboard
    },
    item.cs
  );

  let charts: FileChart[] = buildChart(
    {
      charts: item.charts,
      structId: item.structId,
      errors: item.errors,
      caller: CallerEnum.BuildChart
    },
    item.cs
  );

  dashboards = await buildTile(
    {
      projectId: item.projectId,
      envId: item.envId,
      entities: dashboards,
      mconfigParentType: MconfigParentTypeEnum.Dashboard,
      apiModels: item.apiModels,
      malloyConnections: item.malloyConnections,
      projectConnections: item.projectConnections,
      stores: item.stores,
      weekStart: item.projectConfig.week_start,
      timezone: item.projectConfig.default_timezone,
      caseSensitiveStringFilters: caseSensitiveStringFilters,
      selectedGivens: item.selectedGivens,
      structId: item.structId,
      errors: item.errors,
      caller: CallerEnum.BuildDashboardTile
    },
    item.cs
  );

  charts = await buildTile(
    {
      projectId: item.projectId,
      envId: item.envId,
      entities: charts,
      mconfigParentType: MconfigParentTypeEnum.Chart,
      apiModels: item.apiModels,
      malloyConnections: item.malloyConnections,
      projectConnections: item.projectConnections,
      stores: item.stores,
      weekStart: item.projectConfig.week_start,
      timezone: item.projectConfig.default_timezone,
      caseSensitiveStringFilters: caseSensitiveStringFilters,
      selectedGivens: item.selectedGivens,
      structId: item.structId,
      errors: item.errors,
      caller: CallerEnum.BuildChartTile
    },
    item.cs
  );

  charts = makeChartAccessRolesCombined(
    {
      charts: charts,
      spaces: item.spaces,
      structId: item.structId,
      errors: item.errors,
      caller: CallerEnum.BuildChart
    },
    item.cs
  );

  dashboards = buildMconfigChart(
    {
      entities: dashboards,
      apiModels: item.apiModels,
      stores: item.stores,
      structId: item.structId,
      errors: item.errors,
      caller: CallerEnum.BuildDashboardTileCharts
    },
    item.cs
  );

  charts = buildMconfigChart(
    {
      entities: charts,
      apiModels: item.apiModels,
      stores: item.stores,
      structId: item.structId,
      errors: item.errors,
      caller: CallerEnum.BuildChartTileCharts
    },
    item.cs
  );

  let reports: FileReport[] = item.reports;

  reports.forEach(report => {
    report.tiles = [{ options: report.options }];
  });

  reports = buildMconfigChart(
    {
      entities: reports,
      apiModels: item.apiModels,
      stores: item.stores,
      structId: item.structId,
      errors: item.errors,
      caller: CallerEnum.BuildReportCharts
    },
    item.cs
  );

  reports = buildField(
    {
      entities: reports,
      projectConfig: item.projectConfig,
      structId: item.structId,
      errors: item.errors,
      caller: CallerEnum.BuildReportField
    },
    item.cs
  );

  reports = buildReport(
    {
      reports: reports,
      spaces: item.spaces,
      metrics: item.metrics,
      apiModels: item.apiModels,
      stores: item.stores,
      structId: item.structId,
      caseSensitiveStringFilters: caseSensitiveStringFilters,
      errors: item.errors,
      caller: CallerEnum.BuildReport
    },
    item.cs
  );

  let output: BuildVisualizationsOutput = {
    dashboards: dashboards,
    charts: charts,
    reports: reports
  };

  return Result.succeed(output);
}
