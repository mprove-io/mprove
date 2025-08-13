import * as path from 'path';
import { PostgresConnection } from '@malloydata/db-postgres';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fse from 'fs-extra';
import { forEachSeries } from 'p-iteration';
import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { barBuilder } from '~blockml/barrels/bar-builder';
import { barSpecial } from '~blockml/barrels/bar-special';
import { barWrapper } from '~blockml/barrels/bar-wrapper';
import { barYaml } from '~blockml/barrels/bar-yaml';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { nodeCommon } from '~blockml/barrels/node-common';
import { getMproveConfigFile } from '~blockml/functions/get-mprove-config-file';
import { BmError } from '~blockml/models/bm-error';
import { PresetsService } from '~blockml/services/presets.service';
import { RabbitService } from '~blockml/services/rabbit.service';

interface RebuildStructPrep {
  errors: BmError[];
  stores: common.FileStore[];
  dashboards: common.FileDashboard[];
  metrics: common.ModelMetric[];
  presets: common.Preset[];
  models: common.FileModel[];
  apiModels: common.Model[];
  mods: common.FileModel[];
  udfsDict: common.UdfsDict;
  reports: common.FileReport[];
  views: common.FileView[];
  charts: common.FileChart[];
  mproveDirValue: string;
  weekStart: common.ProjectWeekStartEnum;
  allowTimezones: boolean;
  defaultTimezone: string;
  formatNumber: string;
  currencyPrefix: string;
  currencySuffix: string;
  thousandsSeparator: string;
  caseSensitiveStringFilters: boolean;
  simplifySafeAggregates: boolean;
}

@Injectable()
export class RebuildStructService {
  constructor(
    private rabbitService: RabbitService,
    private presetsService: PresetsService,
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
      projectId,
      files,
      connections,
      envId,
      evs,
      mproveDir,
      overrideTimezone
    } = reqValid.payload;

    let prep: RebuildStructPrep = await this.rebuildStructStateless({
      traceId: reqValid.info.traceId,
      files: files,
      structId: structId,
      envId: envId,
      evs: evs,
      connections: connections,
      mproveDir: mproveDir,
      overrideTimezone: overrideTimezone,
      projectId: projectId,
      isTest: false
    });

    let apiErrors = barWrapper.wrapErrors({ errors: prep.errors });

    let apiViews = barWrapper.wrapViews({ views: prep.views });

    let apiReports = barWrapper.wrapReports({
      projectId: projectId,
      structId: structId,
      reports: prep.reports,
      metrics: prep.metrics,
      models: prep.apiModels,
      formatNumber: prep.formatNumber,
      currencyPrefix: prep.currencyPrefix,
      currencySuffix: prep.currencySuffix
    });

    let { apiDashboards, dashMconfigs, dashQueries } =
      barWrapper.wrapDashboards({
        structId: structId,
        projectId: projectId,
        models: prep.models,
        mods: prep.mods,
        stores: prep.stores,
        dashboards: prep.dashboards,
        envId: envId,
        timezone: prep.defaultTimezone
      });

    let { apiCharts, chartMconfigs, chartQueries } = barWrapper.wrapCharts({
      structId: structId,
      projectId: projectId,
      models: prep.models,
      mods: prep.mods,
      stores: prep.stores,
      charts: prep.charts,
      envId: envId,
      timezone: prep.defaultTimezone
    });

    let queries = [...dashQueries, ...chartQueries];
    let mconfigs = [...dashMconfigs, ...chartMconfigs];

    let payload: apiToBlockml.ToBlockmlRebuildStructResponsePayload = {
      errors: apiErrors,
      udfsDict: prep.udfsDict,
      views: apiViews,
      models: prep.apiModels,
      dashboards: apiDashboards,
      reports: apiReports,
      charts: apiCharts,
      metrics: prep.metrics,
      presets: prep.presets,
      mconfigs: mconfigs,
      queries: queries,
      mproveDirValue: prep.mproveDirValue,
      weekStart: prep.weekStart,
      allowTimezones: prep.allowTimezones,
      defaultTimezone: prep.defaultTimezone,
      formatNumber: prep.formatNumber,
      currencyPrefix: prep.currencyPrefix,
      currencySuffix: prep.currencySuffix,
      thousandsSeparator: prep.thousandsSeparator,
      caseSensitiveStringFilters: prep.caseSensitiveStringFilters,
      simplifySafeAggregates: prep.simplifySafeAggregates
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
  }): Promise<RebuildStructPrep> {
    let configPath = item.dir + '/' + common.MPROVE_CONFIG_FILENAME;

    let mproveDir = await nodeCommon.getMproveDir({
      dir: item.dir,
      configPath: configPath
    });

    let files: common.BmlFile[] = [];

    // console.log('mproveDir');
    // console.log(mproveDir);

    if (common.isDefined(mproveDir)) {
      files = await barYaml.collectFiles(
        {
          dir: mproveDir,
          repoDir: item.dir,
          structId: item.structId,
          caller: common.CallerEnum.RebuildStruct,
          skipLog: false
        },
        this.cs
      );
    }

    files = files.filter(x => x.name !== common.MPROVE_CONFIG_FILENAME);

    let mproveConfigFile = await getMproveConfigFile(configPath);

    if (common.isDefined(mproveConfigFile)) {
      files.push(mproveConfigFile);
    }

    let prep: RebuildStructPrep = await this.rebuildStructStateless({
      traceId: item.traceId,
      files: files,
      structId: item.structId,
      envId: item.envId,
      evs: item.evs,
      connections: item.connections,
      mproveDir: mproveDir,
      overrideTimezone: item.overrideTimezone,
      projectId: undefined,
      isTest: true
    });

    return prep;
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
    projectId: string;
    isTest: boolean;
  }): Promise<RebuildStructPrep> {
    //
    let presets: common.Preset[] = this.presetsService.getPresets();

    let errors: BmError[] = [];

    let mods: common.FileMod[] = [];

    let views: common.FileView[];
    let models: common.FileModel[];
    let stores: common.FileStore[];
    let reports: common.FileReport[];
    let dashboards: common.FileDashboard[];
    let charts: common.FileChart[];
    let udfs: common.FileUdf[];
    let projectConfig: common.FileProjectConf;

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

    models = yamlBuildItem.models;
    stores = yamlBuildItem.stores;
    dashboards = yamlBuildItem.dashboards;
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
        apiModels: [],
        mods: [],
        metrics: [],
        presets: [],
        stores: [],
        reports: [],
        dashboards: [],
        charts: [],
        udfsDict: {},
        mproveDirValue: undefined,
        weekStart: common.PROJECT_CONFIG_WEEK_START,
        allowTimezones: common.toBooleanFromLowercaseString(
          common.PROJECT_CONFIG_ALLOW_TIMEZONES
        ),
        defaultTimezone: common.PROJECT_CONFIG_DEFAULT_TIMEZONE,
        currencyPrefix: common.PROJECT_CONFIG_CURRENCY_PREFIX,
        currencySuffix: common.PROJECT_CONFIG_CURRENCY_SUFFIX,
        thousandsSeparator: common.PROJECT_CONFIG_THOUSANDS_SEPARATOR,
        formatNumber: common.PROJECT_CONFIG_FORMAT_NUMBER,
        caseSensitiveStringFilters: common.toBooleanFromLowercaseString(
          common.PROJECT_CONFIG_CASE_SENSITIVE_STRING_FILTERS
        ),
        simplifySafeAggregates: common.toBooleanFromLowercaseString(
          common.PROJECT_CONFIG_SIMPLIFY_SAFE_AGGREGATES
        )
      };
    }

    if (common.isDefined(item.overrideTimezone)) {
      projectConfig.default_timezone = item.overrideTimezone;
    }

    let blockmlDataPath =
      this.cs.get<interfaces.Config['blockmlData']>('blockmlData');

    let tempDir = `${blockmlDataPath}/${Date.now()}-${common.makeId()}`;

    let malloyFiles = item.files.filter(y => y.name.endsWith('.malloy'));

    // console.log('malloyFiles');
    // console.log(malloyFiles);

    let paths: string[] = [];

    await forEachSeries(malloyFiles, async file => {
      let relativePath = common.isDefined(file.pathRelativeToRepo)
        ? file.pathRelativeToRepo
        : common.decodeFilePath({ filePath: file.path });

      file.blockmlPath = `${tempDir}/${relativePath}`;

      paths.push(relativePath);

      await fse.ensureDir(path.dirname(file.blockmlPath));
      await fse.writeFile(file.blockmlPath, file.content);

      let reg = common.MyRegex.CAPTURE_MPROVE_MODELS();
      let r;

      let captures: string[] = [];

      while ((r = reg.exec(file.content))) {
        captures.push(r[1]);
      }

      captures.forEach(sourceName => {
        let ar = file.name.split('.');
        let ext = ar[ar.length - 1];

        let mod: common.FileMod = {
          fileName: file.name,
          fileExt: `.${ext}` as common.FileExtensionEnum, // malloy
          filePath: relativePath,
          name: sourceName,
          // mod: sourceName,
          location: relativePath,
          blockmlPath: file.blockmlPath,
          source: sourceName,
          label: sourceName
            .split('_')
            .map(k => common.capitalizeFirstLetter(k))
            .join(' ')
        };

        mods.push(mod);
      });
    });

    // let mainContent = paths.map(path => `import './${path}';`).join('\n');
    // let mainContent = [
    //   `import './mods/c2/ec1_m2.malloy'`,
    //   `import './mods/c3/ec1_m3.malloy'`
    //   // `import './charts/a5a.malloy'`,
    //   // `import './charts/a5b.malloy'`,
    //   // `import './charts/a5c.malloy'`,
    //   // `import './charts/a5d.malloy'`,
    //   // `import './charts/a5.malloy'`,
    //   // `import './charts/a6.malloy'`,
    // ].join('\n');

    // let mainPath = `${tempDir}/mprove-main.malloy`;

    // await fse.writeFile(mainPath, mainContent);

    let malloyConnections: PostgresConnection[] =
      nodeCommon.makeMalloyConnections({
        connections: item.connections
      });

    // let startBuildModStart = Date.now();

    // console.log('mods');
    // console.log(mods);

    let buildModStartResult = await barBuilder.buildModStart(
      {
        files: item.files,
        malloyConnections: malloyConnections,
        connections: item.connections,
        mods: mods,
        tempDir: tempDir,
        projectId: item.projectId,
        errors: errors,
        structId: item.structId,
        caller: common.CallerEnum.BuildModStart
      },
      this.cs
    );

    // console.log('diffBuildModStart');
    // console.log(Date.now() - startBuildModStart);

    mods = buildModStartResult.mods;

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
        caseSensitiveStringFilters: common.toBooleanFromLowercaseString(
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
        presets: presets,
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
        caseSensitiveStringFilters: common.toBooleanFromLowercaseString(
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

    barSpecial.checkVmdrSuggestModelDimension(
      {
        entities: [...views, ...models],
        models: models,
        errors: errors,
        structId: item.structId,
        caller: common.CallerEnum.BuildCheckVmdSuggestModelDimension
      },
      this.cs
    );

    let buildMetricsStartResult = barBuilder.buildMetricsStart(
      {
        models: models,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildModelMetric
      },
      this.cs
    );

    models = buildMetricsStartResult.models;

    let apiModels = barWrapper.wrapModels({
      projectId: item.projectId,
      structId: item.structId,
      models: models,
      stores: stores,
      mods: mods,
      files: item.files
    });

    let buildMetricsNextResult = barBuilder.buildMetricsNext(
      {
        models: models,
        apiModels: apiModels,
        stores: stores,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildModelMetric
      },
      this.cs
    );

    let metrics = buildMetricsNextResult.metrics;

    dashboards = barBuilder.buildDashboard(
      {
        dashboards: dashboards,
        stores: stores,
        structId: item.structId,
        caseSensitiveStringFilters: common.toBooleanFromLowercaseString(
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
        mods: mods,
        apiModels: apiModels,
        malloyConnections: malloyConnections,
        malloyFiles: malloyFiles,
        stores: stores,
        udfsDict: udfsDict,
        weekStart: projectConfig.week_start,
        timezone: projectConfig.default_timezone,
        caseSensitiveStringFilters: common.toBooleanFromLowercaseString(
          projectConfig.case_sensitive_string_filters
        ),
        simplifySafeAggregates: common.toBooleanFromLowercaseString(
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
        mods: mods,
        apiModels: apiModels,
        malloyConnections: malloyConnections,
        stores: stores,
        malloyFiles: malloyFiles,
        udfsDict: udfsDict,
        weekStart: projectConfig.week_start,
        timezone: projectConfig.default_timezone,
        caseSensitiveStringFilters: common.toBooleanFromLowercaseString(
          projectConfig.case_sensitive_string_filters
        ),
        simplifySafeAggregates: common.toBooleanFromLowercaseString(
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
        stores: stores,
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
        stores: stores,
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
        stores: stores,
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
        metrics: metrics,
        models: models,
        apiModels: apiModels,
        stores: stores,
        structId: item.structId,
        caseSensitiveStringFilters: common.toBooleanFromLowercaseString(
          projectConfig.case_sensitive_string_filters
        ),
        errors: errors,
        caller: common.CallerEnum.BuildReport
      },
      this.cs
    );

    barSpecial.checkVmdrSuggestModelDimension(
      {
        entities: [...dashboards, ...reports],
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
        metrics: metrics,
        dashboards: dashboards,
        reports: reports,
        charts: charts,
        structId: item.structId,
        caller: common.CallerEnum.RebuildStruct
      },
      this.cs
    );

    if (item.isTest === true) {
      await fse.remove(tempDir);
    } else {
      fse.remove(tempDir);
    }

    let prep: RebuildStructPrep = {
      errors: errors,
      stores: stores,
      dashboards: dashboards,
      metrics: metrics,
      presets: presets.map(preset => {
        let presetPart: common.Preset = {
          presetId: preset.presetId,
          label: preset.label,
          path: preset.path,
          parsedContent: undefined
        };
        return presetPart;
      }),
      models: models,
      apiModels: apiModels,
      mods: mods,
      udfsDict: udfsDict,
      reports: reports,
      views: views,
      charts: charts,
      mproveDirValue: projectConfig.mprove_dir,
      weekStart: projectConfig.week_start,
      allowTimezones: common.toBooleanFromLowercaseString(
        projectConfig.allow_timezones
      ),
      defaultTimezone: projectConfig.default_timezone,
      formatNumber: projectConfig.format_number,
      currencyPrefix: projectConfig.currency_prefix,
      currencySuffix: projectConfig.currency_suffix,
      thousandsSeparator: projectConfig.thousands_separator,
      caseSensitiveStringFilters: common.toBooleanFromLowercaseString(
        projectConfig.case_sensitive_string_filters
      ),
      simplifySafeAggregates: common.toBooleanFromLowercaseString(
        projectConfig.simplify_safe_aggregates
      )
    };

    return prep;
  }
}
