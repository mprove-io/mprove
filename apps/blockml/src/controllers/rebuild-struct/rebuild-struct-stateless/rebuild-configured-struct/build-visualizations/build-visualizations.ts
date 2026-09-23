import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { buildField } from '#blockml/functions/build-field/_build-field';
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
import { buildChart } from './build-chart/build-chart';
import { buildDashboard } from './build-dashboard/build-dashboard';
import { buildMconfigChart } from './build-mconfig-chart/build-mconfig-chart';
import { buildReport } from './build-report/build-report';
import { buildTile } from './build-tile/build-tile';
import { makeChartAccessRolesCombined } from './make-chart-access-roles-combined/make-chart-access-roles-combined';

export type BuildVisualizationsOutput = {
  dashboards: FileDashboard[];
  charts: FileChart[];
  reports: FileReport[];
};

export function buildVisualizations(item: {
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
  let { projectConfig } = item;

  let caseSensitiveStringFilters: boolean = toBooleanFromLowercaseString(
    projectConfig.case_sensitive_string_filters
  );

  return Result.pipe(
    Result.succeed({
      ...item,
      caseSensitiveStringFilters: caseSensitiveStringFilters
    }),
    Result.bind(
      'fieldBuiltDashboards',
      (v): Result.Result<FileDashboard[], never> =>
        buildField({
          entities: v.dashboards,
          projectConfig: v.projectConfig,
          structId: v.structId,
          errors: v.errors,
          caller: CallerEnum.BuildDashboardField,
          cs: v.cs
        })
    ),
    Result.bind(
      'builtDashboards',
      (v): Result.Result<FileDashboard[], never> =>
        buildDashboard({
          dashboards: v.fieldBuiltDashboards,
          spaces: v.spaces,
          stores: v.stores,
          structId: v.structId,
          caseSensitiveStringFilters: v.caseSensitiveStringFilters,
          errors: v.errors,
          caller: CallerEnum.BuildDashboard,
          cs: v.cs
        })
    ),
    Result.bind(
      'builtCharts',
      (v): Result.Result<FileChart[], never> =>
        buildChart({
          charts: v.charts,
          structId: v.structId,
          errors: v.errors,
          caller: CallerEnum.BuildChart,
          cs: v.cs
        })
    ),
    Result.bind(
      'tileBuiltDashboards',
      (v): Result.ResultAsync<FileDashboard[], never> =>
        buildTile({
          projectId: v.projectId,
          envId: v.envId,
          entities: v.builtDashboards,
          mconfigParentType: MconfigParentTypeEnum.Dashboard,
          apiModels: v.apiModels,
          malloyConnections: v.malloyConnections,
          projectConnections: v.projectConnections,
          stores: v.stores,
          weekStart: v.projectConfig.week_start,
          timezone: v.projectConfig.default_timezone,
          caseSensitiveStringFilters: v.caseSensitiveStringFilters,
          selectedGivens: v.selectedGivens,
          structId: v.structId,
          errors: v.errors,
          caller: CallerEnum.BuildDashboardTile,
          cs: v.cs
        })
    ),
    Result.bind(
      'tileBuiltCharts',
      (v): Result.ResultAsync<FileChart[], never> =>
        buildTile({
          projectId: v.projectId,
          envId: v.envId,
          entities: v.builtCharts,
          mconfigParentType: MconfigParentTypeEnum.Chart,
          apiModels: v.apiModels,
          malloyConnections: v.malloyConnections,
          projectConnections: v.projectConnections,
          stores: v.stores,
          weekStart: v.projectConfig.week_start,
          timezone: v.projectConfig.default_timezone,
          caseSensitiveStringFilters: v.caseSensitiveStringFilters,
          selectedGivens: v.selectedGivens,
          structId: v.structId,
          errors: v.errors,
          caller: CallerEnum.BuildChartTile,
          cs: v.cs
        })
    ),
    Result.bind(
      'accessRolesCombinedCharts',
      (v): Result.Result<FileChart[], never> =>
        makeChartAccessRolesCombined({
          charts: v.tileBuiltCharts,
          spaces: v.spaces,
          structId: v.structId,
          errors: v.errors,
          caller: CallerEnum.BuildChart,
          cs: v.cs
        })
    ),
    Result.bind(
      'mconfigChartBuiltDashboards',
      (v): Result.Result<FileDashboard[], never> =>
        buildMconfigChart({
          entities: v.tileBuiltDashboards,
          apiModels: v.apiModels,
          stores: v.stores,
          structId: v.structId,
          errors: v.errors,
          caller: CallerEnum.BuildDashboardTileCharts,
          cs: v.cs
        })
    ),
    Result.bind(
      'mconfigChartBuiltCharts',
      (v): Result.Result<FileChart[], never> =>
        buildMconfigChart({
          entities: v.accessRolesCombinedCharts,
          apiModels: v.apiModels,
          stores: v.stores,
          structId: v.structId,
          errors: v.errors,
          caller: CallerEnum.BuildChartTileCharts,
          cs: v.cs
        })
    ),
    Result.inspect(v => {
      v.reports.forEach(report => {
        report.tiles = [{ options: report.options }];
      });
    }),
    Result.bind(
      'mconfigChartBuiltReports',
      (v): Result.Result<FileReport[], never> =>
        buildMconfigChart({
          entities: v.reports,
          apiModels: v.apiModels,
          stores: v.stores,
          structId: v.structId,
          errors: v.errors,
          caller: CallerEnum.BuildReportCharts,
          cs: v.cs
        })
    ),
    Result.bind(
      'fieldBuiltReports',
      (v): Result.Result<FileReport[], never> =>
        buildField({
          entities: v.mconfigChartBuiltReports,
          projectConfig: v.projectConfig,
          structId: v.structId,
          errors: v.errors,
          caller: CallerEnum.BuildReportField,
          cs: v.cs
        })
    ),
    Result.bind(
      'builtReports',
      (v): Result.Result<FileReport[], never> =>
        buildReport({
          reports: v.fieldBuiltReports,
          spaces: v.spaces,
          metrics: v.metrics,
          apiModels: v.apiModels,
          stores: v.stores,
          structId: v.structId,
          caseSensitiveStringFilters: v.caseSensitiveStringFilters,
          errors: v.errors,
          caller: CallerEnum.BuildReport,
          cs: v.cs
        })
    ),
    Result.map(
      (v): BuildVisualizationsOutput => ({
        dashboards: v.mconfigChartBuiltDashboards,
        charts: v.mconfigChartBuiltCharts,
        reports: v.builtReports
      })
    )
  );
}
