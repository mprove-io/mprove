import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { barBuilder } from '~blockml/barrels/bar-builder';
import { barSpecial } from '~blockml/barrels/bar-special';
import { barWrapper } from '~blockml/barrels/bar-wrapper';
import { barYaml } from '~blockml/barrels/bar-yaml';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { nodeCommon } from '~blockml/barrels/node-common';
import { getMproveConfigFile } from '~blockml/functions/get-mprove-config-file';
import { BmError } from '~blockml/models/bm-error';
import { RabbitService } from '~blockml/services/rabbit.service';

@Injectable()
export class RebuildStructService {
  constructor(
    private rabbitService: RabbitService,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger
  ) {}

  async rebuild(request: any) {
    if (
      request.info?.name !==
      apiToBlockml.ToBlockmlRequestInfoNameEnum.ToBlockmlRebuildStruct
    ) {
      throw new common.ServerError({
        message: common.ErEnum.BLOCKML_WRONG_REQUEST_INFO_NAME
      });
    }

    let reqValid = nodeCommon.transformValidSync({
      classType: apiToBlockml.ToBlockmlRebuildStructRequest,
      object: request,
      errorMessage: common.ErEnum.BLOCKML_WRONG_REQUEST_PARAMS,
      logIsJson:
        this.cs.get<interfaces.Config['blockmlLogIsJson']>('blockmlLogIsJson'),
      logger: this.logger
    });

    let {
      structId,
      orgId,
      projectId,
      files,
      connections,
      envId,
      evs,
      mproveDir,
      overrideTimezone
    } = reqValid.payload;

    let {
      errors,
      stores,
      dashboards,
      metrics,
      models,
      reports,
      udfsDict,
      views,
      charts,
      mproveDirValue,
      weekStart,
      allowTimezones,
      defaultTimezone,
      formatNumber,
      currencyPrefix,
      currencySuffix,
      caseSensitiveStringFilters,
      simplifySafeAggregates
    } = await this.rebuildStructStateless({
      traceId: reqValid.info.traceId,
      files: files,
      structId: structId,
      envId: envId,
      evs: evs,
      connections: connections,
      mproveDir: mproveDir,
      overrideTimezone: overrideTimezone
    });

    let apiErrors = barWrapper.wrapErrors({ errors: errors });

    let apiViews = barWrapper.wrapViews({ views: views });

    let apiModels = barWrapper.wrapModels({
      structId: structId,
      models: models,
      stores: stores
    });

    let apiReports = barWrapper.wrapReports({
      projectId: projectId,
      structId: structId,
      reports: reports,
      metrics: metrics,
      models: apiModels,
      formatNumber: formatNumber,
      currencyPrefix: currencyPrefix,
      currencySuffix: currencySuffix
    });

    let apiStores = barWrapper.wrapStores({
      stores: stores
    });

    let { apiDashboards, dashMconfigs, dashQueries } =
      barWrapper.wrapDashboards({
        structId: structId,
        orgId: orgId,
        projectId: projectId,
        models: models,
        dashboards: dashboards,
        envId: envId,
        timezone: defaultTimezone
      });

    let { apiCharts, chartMconfigs, chartQueries } = barWrapper.wrapCharts({
      structId: structId,
      orgId: orgId,
      projectId: projectId,
      models: models,
      charts: charts,
      envId: envId,
      timezone: defaultTimezone
    });

    let queries = [...dashQueries, ...chartQueries];
    let mconfigs = [...dashMconfigs, ...chartMconfigs];

    let payload: apiToBlockml.ToBlockmlRebuildStructResponsePayload = {
      errors: apiErrors,
      udfsDict: udfsDict,
      views: apiViews,
      models: apiModels,
      dashboards: apiDashboards,
      stores: apiStores,
      reports: apiReports,
      charts: apiCharts,
      metrics: metrics,
      mconfigs: mconfigs,
      queries: queries,
      mproveDirValue: mproveDirValue,
      weekStart: weekStart,
      allowTimezones: allowTimezones,
      defaultTimezone: defaultTimezone,
      formatNumber: formatNumber,
      currencyPrefix: currencyPrefix,
      currencySuffix: currencySuffix,
      caseSensitiveStringFilters: caseSensitiveStringFilters,
      simplifySafeAggregates: simplifySafeAggregates
    };

    return payload;
  }

  async rebuildStruct(item: {
    traceId: string;
    dir: string;
    structId: string;
    envId: string;
    evs: common.Ev[];
    connections: common.ProjectConnection[];
    overrideTimezone: string;
  }) {
    let configPath = item.dir + '/' + common.MPROVE_CONFIG_FILENAME;

    let mproveDir = await nodeCommon.getMproveDir({
      dir: item.dir,
      configPath: configPath
    });

    let files: common.BmlFile[] = [];

    if (common.isDefined(mproveDir)) {
      files = await barYaml.collectFiles(
        {
          dir: mproveDir,
          structId: item.structId,
          caller: common.CallerEnum.RebuildStruct
        },
        this.cs
      );
    }

    files = files.filter(x => x.name !== common.MPROVE_CONFIG_FILENAME);

    let mproveConfigFile = await getMproveConfigFile(configPath);

    if (common.isDefined(mproveConfigFile)) {
      files.push(mproveConfigFile);
    }

    return await this.rebuildStructStateless({
      traceId: item.traceId,
      files: files,
      structId: item.structId,
      envId: item.envId,
      evs: item.evs,
      connections: item.connections,
      mproveDir: mproveDir,
      overrideTimezone: item.overrideTimezone
    });
  }

  async rebuildStructStateless(item: {
    traceId: string;
    files: common.BmlFile[];
    structId: string;
    envId: string;
    evs: common.Ev[];
    connections: common.ProjectConnection[];
    mproveDir: string;
    overrideTimezone: string;
  }) {
    //
    let errors: BmError[] = [];

    let views: common.FileView[];
    let models: common.FileModel[];
    let stores: common.FileStore[];
    let reports: common.FileReport[];
    let dashboards: common.FileDashboard[];
    let charts: common.FileChart[];
    let udfs: common.FileUdf[];
    let projectConfig: common.FileProjectConf;

    let metrics: common.FileMetric[] = [];

    let yamlBuildItem = barBuilder.buildYaml(
      {
        files: item.files,
        connections: item.connections,
        mproveDir: item.mproveDir,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildYaml
      },
      this.cs
    );
    stores = yamlBuildItem.stores;
    dashboards = yamlBuildItem.dashboards;
    models = yamlBuildItem.models;
    reports = yamlBuildItem.reports;
    udfs = yamlBuildItem.udfs;
    views = yamlBuildItem.views;
    charts = yamlBuildItem.charts;
    projectConfig = yamlBuildItem.projectConfig;

    if (common.isUndefined(projectConfig)) {
      return {
        errors: errors,
        views: [],
        models: [],
        stores: [],
        reports: [],
        dashboards: [],
        charts: [],
        udfsDict: {},
        mproveDirValue: undefined,
        weekStart: constants.PROJECT_CONFIG_WEEK_START,
        allowTimezones: helper.toBooleanFromLowercaseString(
          constants.PROJECT_CONFIG_ALLOW_TIMEZONES
        ),
        defaultTimezone: constants.PROJECT_CONFIG_DEFAULT_TIMEZONE,
        currencyPrefix: constants.PROJECT_CONFIG_CURRENCY_PREFIX,
        currencySuffix: constants.PROJECT_CONFIG_CURRENCY_SUFFIX,
        formatNumber: constants.PROJECT_CONFIG_FORMAT_NUMBER,
        caseSensitiveStringFilters: helper.toBooleanFromLowercaseString(
          constants.PROJECT_CONFIG_CASE_SENSITIVE_STRING_FILTERS
        ),
        simplifySafeAggregates: helper.toBooleanFromLowercaseString(
          constants.PROJECT_CONFIG_SIMPLIFY_SAFE_AGGREGATES
        ),
        metrics: []
      };
    }

    if (common.isDefined(item.overrideTimezone)) {
      projectConfig.default_timezone = item.overrideTimezone;
    }

    views = barBuilder.buildField(
      {
        entities: views,
        projectConfig: projectConfig,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildViewField
      },
      this.cs
    );

    let udfsDict: common.UdfsDict = barBuilder.buildUdf(
      {
        udfs: udfs,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildUdf
      },
      this.cs
    );

    views = barBuilder.buildView(
      {
        views: views,
        udfs: udfs,
        udfsDict: udfsDict,
        weekStart: projectConfig.week_start,
        structId: item.structId,
        caseSensitiveStringFilters: helper.toBooleanFromLowercaseString(
          projectConfig.case_sensitive_string_filters
        ),
        envId: item.envId,
        evs: item.evs,
        errors: errors,
        caller: common.CallerEnum.BuildView
      },
      this.cs
    );

    stores = barBuilder.buildStoreStart(
      {
        stores: stores,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildStoreStart
      },
      this.cs
    );

    stores = barBuilder.buildField(
      {
        entities: stores,
        projectConfig: projectConfig,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildStoreField
      },
      this.cs
    );

    stores = barBuilder.buildStoreNext(
      {
        stores: stores,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildStoreNext
      },
      this.cs
    );

    models = barSpecial.checkModelName(
      {
        models: models,
        errors: errors,
        structId: item.structId,
        caller: common.CallerEnum.BuildCheckModelName
      },
      this.cs
    );

    models.forEach(x => {
      x.isViewModel = false;
    });

    let viewModels = barSpecial.buildViewModel(
      {
        views: views,
        errors: errors,
        structId: item.structId,
        caller: common.CallerEnum.BuildViewModel
      },
      this.cs
    );

    models = [...models, ...viewModels];

    models = barBuilder.buildField(
      {
        entities: models,
        projectConfig: projectConfig,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildModelField
      },
      this.cs
    );

    dashboards = barBuilder.buildField(
      {
        entities: dashboards,
        projectConfig: projectConfig,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildDashboardField
      },
      this.cs
    );

    models = barBuilder.buildModel(
      {
        models: models,
        views: views,
        udfs: udfs,
        structId: item.structId,
        caseSensitiveStringFilters: helper.toBooleanFromLowercaseString(
          projectConfig.case_sensitive_string_filters
        ),
        errors: errors,
        caller: common.CallerEnum.BuildModel
      },
      this.cs
    );

    models = barBuilder.buildJoin(
      {
        models: models,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildJoin
      },
      this.cs
    );

    models = barBuilder.buildJoinSqlOn(
      {
        models: models,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildJoinSqlOn
      },
      this.cs
    );

    models = barBuilder.buildJoinSqlWhere(
      {
        models: models,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildJoinSqlWhere
      },
      this.cs
    );

    models = barBuilder.buildSortJoins(
      {
        models: models,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildSortJoins
      },
      this.cs
    );

    models = barBuilder.buildSqlAlwaysWhere(
      {
        models: models,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildSqlAlwaysWhere
      },
      this.cs
    );

    models = barBuilder.buildSqlAlwaysWhereCalc(
      {
        models: models,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildSqlAlwaysWhereCalc
      },
      this.cs
    );

    let buildModelMetricResult = barBuilder.buildModelMetric(
      {
        metrics: metrics,
        models: models,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildModelMetric
      },
      this.cs
    );

    models = buildModelMetricResult.models;
    let commonMetrics = buildModelMetricResult.metrics;

    dashboards = barBuilder.buildDashboard(
      {
        dashboards: dashboards,
        structId: item.structId,
        caseSensitiveStringFilters: helper.toBooleanFromLowercaseString(
          projectConfig.case_sensitive_string_filters
        ),
        errors: errors,
        caller: common.CallerEnum.BuildDashboard
      },
      this.cs
    );

    charts = barBuilder.buildChart(
      {
        charts: charts,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildChart
      },
      this.cs
    );

    dashboards = await barBuilder.buildTile(
      {
        traceId: item.traceId,
        entities: dashboards,
        models: models,
        udfsDict: udfsDict,
        weekStart: projectConfig.week_start,
        timezone: projectConfig.default_timezone,
        caseSensitiveStringFilters: helper.toBooleanFromLowercaseString(
          projectConfig.case_sensitive_string_filters
        ),
        simplifySafeAggregates: helper.toBooleanFromLowercaseString(
          projectConfig.simplify_safe_aggregates
        ),
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildDashboardTile
      },
      this.cs,
      this.rabbitService
    );

    charts = await barBuilder.buildTile(
      {
        traceId: item.traceId,
        entities: charts,
        models: models,
        udfsDict: udfsDict,
        weekStart: projectConfig.week_start,
        timezone: projectConfig.default_timezone,
        caseSensitiveStringFilters: helper.toBooleanFromLowercaseString(
          projectConfig.case_sensitive_string_filters
        ),
        simplifySafeAggregates: helper.toBooleanFromLowercaseString(
          projectConfig.simplify_safe_aggregates
        ),
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildChartTile
      },
      this.cs,
      this.rabbitService
    );

    dashboards = barBuilder.buildMconfigChart(
      {
        entities: dashboards,
        models: models,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildDashboardTileCharts
      },
      this.cs
    );

    charts = barBuilder.buildMconfigChart(
      {
        entities: charts,
        models: models,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildChartTileCharts
      },
      this.cs
    );

    reports.forEach(x => {
      x.tiles = [
        {
          options: x.options
        }
      ];
    });

    reports = barBuilder.buildMconfigChart(
      {
        entities: reports,
        models: models,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildReportCharts
      },
      this.cs
    );

    reports = barBuilder.buildField(
      {
        entities: reports,
        projectConfig: projectConfig,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildReportField
      },
      this.cs
    );

    reports = barBuilder.buildReport(
      {
        reports: reports,
        metrics: commonMetrics,
        models: models,
        structId: item.structId,
        caseSensitiveStringFilters: helper.toBooleanFromLowercaseString(
          projectConfig.case_sensitive_string_filters
        ),
        errors: errors,
        caller: common.CallerEnum.BuildReport
      },
      this.cs
    );

    barSpecial.checkVmdrSuggestModelDimension(
      {
        entities: [...views, ...models, ...dashboards, ...reports],
        models: models,
        errors: errors,
        structId: item.structId,
        caller: common.CallerEnum.BuildCheckVmdSuggestModelDimension
      },
      this.cs
    );

    barSpecial.logStruct(
      {
        errors: errors,
        udfsDict: udfsDict,
        stores: stores,
        views: views,
        models: models,
        metrics: commonMetrics,
        dashboards: dashboards,
        reports: reports,
        charts: charts,
        structId: item.structId,
        caller: common.CallerEnum.RebuildStruct
      },
      this.cs
    );

    return {
      errors: errors,
      stores: stores,
      dashboards: dashboards,
      metrics: commonMetrics,
      models: models,
      udfsDict: udfsDict,
      reports: reports,
      views: views,
      charts: charts,
      mproveDirValue: projectConfig.mprove_dir,
      weekStart: projectConfig.week_start,
      allowTimezones: helper.toBooleanFromLowercaseString(
        projectConfig.allow_timezones
      ),
      defaultTimezone: projectConfig.default_timezone,
      formatNumber: projectConfig.format_number,
      currencyPrefix: projectConfig.currency_prefix,
      currencySuffix: projectConfig.currency_suffix,
      caseSensitiveStringFilters: helper.toBooleanFromLowercaseString(
        projectConfig.case_sensitive_string_filters
      ),
      simplifySafeAggregates: helper.toBooleanFromLowercaseString(
        projectConfig.simplify_safe_aggregates
      )
    };
  }
}
