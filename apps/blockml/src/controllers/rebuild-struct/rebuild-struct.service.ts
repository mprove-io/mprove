import * as path from 'path';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fse from 'fs-extra';
import { forEachSeries } from 'p-iteration';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { buildChart } from '~blockml/functions/build-chart/_build-chart';
import { buildDashboard } from '~blockml/functions/build-dashboard/_build-dashboard';
import { buildField } from '~blockml/functions/build-field/_build-field';
import { buildMconfigChart } from '~blockml/functions/build-mconfig-chart/_build-mconfig-chart';
import { buildMetricsNext } from '~blockml/functions/build-metrics-next/_build-metrics-next';
import { buildModStart } from '~blockml/functions/build-mod-start/_build-mod-start';
import { buildReport } from '~blockml/functions/build-report/_build-report';
import { buildStoreNext } from '~blockml/functions/build-store-next/_build-store-next';
import { buildStoreStart } from '~blockml/functions/build-store-start/_build-store-start';
import { buildTile } from '~blockml/functions/build-tile/_build-tile';
import { buildYaml } from '~blockml/functions/build-yaml/_build-yaml';
import { checkSuggestModelDimension } from '~blockml/functions/extra/check-suggest-model-dimension';
import { collectFiles } from '~blockml/functions/extra/collect-files';
import { getMproveConfigFile } from '~blockml/functions/extra/get-mprove-config-file';
import { logStruct } from '~blockml/functions/extra/log-struct';
import { logToConsoleBlockml } from '~blockml/functions/extra/log-to-console-blockml';
import { wrapCharts } from '~blockml/functions/wrap/wrap-charts';
import { wrapDashboards } from '~blockml/functions/wrap/wrap-dashboards';
import { wrapErrors } from '~blockml/functions/wrap/wrap-errors';
import { wrapModels } from '~blockml/functions/wrap/wrap-models';
import { wrapReports } from '~blockml/functions/wrap/wrap-reports';
import { BmError } from '~blockml/models/bm-error';
import { BlockmlTabService } from '~blockml/services/blockml-tab.service';
import { PresetsService } from '~blockml/services/presets.service';
import {
  MPROVE_CONFIG_FILENAME,
  PROJECT_CONFIG_ALLOW_TIMEZONES,
  PROJECT_CONFIG_CASE_SENSITIVE_STRING_FILTERS,
  PROJECT_CONFIG_CURRENCY_PREFIX,
  PROJECT_CONFIG_CURRENCY_SUFFIX,
  PROJECT_CONFIG_DEFAULT_TIMEZONE,
  PROJECT_CONFIG_FORMAT_NUMBER,
  PROJECT_CONFIG_THOUSANDS_SEPARATOR,
  PROJECT_CONFIG_WEEK_START
} from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { FileExtensionEnum } from '~common/enums/file-extension.enum';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { ToBlockmlRequestInfoNameEnum } from '~common/enums/to/to-blockml-request-info-name.enum';
import { capitalizeFirstLetter } from '~common/functions/capitalize-first-letter';
import { decodeFilePath } from '~common/functions/decode-file-path';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { makeId } from '~common/functions/make-id';
import { toBooleanFromLowercaseString } from '~common/functions/to-boolean-from-lowercase-string';
import { Ev } from '~common/interfaces/backend/ev';
import { MproveConfig } from '~common/interfaces/backend/mprove-config';
import { ProjectConnection } from '~common/interfaces/backend/project-connection';
import { BmlFile } from '~common/interfaces/blockml/bml-file';
import { FileChart } from '~common/interfaces/blockml/internal/file-chart';
import { FileDashboard } from '~common/interfaces/blockml/internal/file-dashboard';
import { FileMod } from '~common/interfaces/blockml/internal/file-mod';
import { FileProjectConf } from '~common/interfaces/blockml/internal/file-project-conf';
import { FileReport } from '~common/interfaces/blockml/internal/file-report';
import { FileStore } from '~common/interfaces/blockml/internal/file-store';
import { Model } from '~common/interfaces/blockml/model';
import { ModelMetric } from '~common/interfaces/blockml/model-metric';
import { Preset } from '~common/interfaces/blockml/preset';
import { ConnectionSt } from '~common/interfaces/st-lt';
import {
  ToBlockmlRebuildStructRequest,
  ToBlockmlRebuildStructResponsePayload
} from '~common/interfaces/to-blockml/api/to-blockml-rebuild-struct';
import { MyRegex } from '~common/models/my-regex';
import { ServerError } from '~common/models/server-error';
import { getMproveDir } from '~node-common/functions/get-mprove-dir';
import {
  MalloyConnection,
  makeMalloyConnections
} from '~node-common/functions/make-malloy-connections';
import { transformValidSync } from '~node-common/functions/transform-valid-sync';

interface RebuildStructPrep {
  errors: BmError[];
  stores: FileStore[];
  dashboards: FileDashboard[];
  metrics: ModelMetric[];
  presets: Preset[];
  apiModels: Model[];
  reports: FileReport[];
  charts: FileChart[];
  mproveConfig: MproveConfig;
}

@Injectable()
export class RebuildStructService {
  constructor(
    private blockmlTabService: BlockmlTabService,
    private presetsService: PresetsService,
    private cs: ConfigService<BlockmlConfig>,
    private logger: Logger
  ) {}

  async rebuild(request: any) {
    if (
      request.info?.name !== ToBlockmlRequestInfoNameEnum.ToBlockmlRebuildStruct
    ) {
      throw new ServerError({
        message: ErEnum.BLOCKML_WRONG_REQUEST_INFO_NAME
      });
    }

    let reqValid = transformValidSync({
      classType: ToBlockmlRebuildStructRequest,
      object: request,
      errorMessage: ErEnum.BLOCKML_WRONG_REQUEST_PARAMS,
      logIsJson:
        this.cs.get<BlockmlConfig['blockmlLogIsJson']>('blockmlLogIsJson'),
      logger: this.logger
    });

    let {
      structId,
      projectId,
      files,
      baseConnections,
      envId,
      evs,
      mproveDir,
      overrideTimezone,
      isUseCache,
      cachedMproveConfig,
      cachedModels,
      cachedMetrics
    } = reqValid.payload;

    let projectConnections: ProjectConnection[] = baseConnections.map(
      baseConnection => {
        let connectionSt = this.blockmlTabService.decrypt<ConnectionSt>({
          encryptedString: baseConnection.st
        });

        let projectConnection: ProjectConnection = {
          projectId: baseConnection.projectId,
          connectionId: baseConnection.connectionId,
          envId: baseConnection.envId,
          type: baseConnection.type,
          options: connectionSt.options
        };

        return projectConnection;
      }
    );

    let prep: RebuildStructPrep = await this.rebuildStructStateless({
      traceId: reqValid.info.traceId,
      files: files,
      structId: structId,
      envId: envId,
      evs: evs,
      projectConnections: projectConnections,
      mproveDir: mproveDir,
      overrideTimezone: overrideTimezone,
      projectId: projectId,
      isUseCache: isUseCache,
      cachedMproveConfig: cachedMproveConfig,
      cachedModels: cachedModels,
      cachedMetrics: cachedMetrics,
      isTest: false
    });

    let apiErrors = wrapErrors({ errors: prep.errors });

    let apiReports = wrapReports({
      projectId: projectId,
      structId: structId,
      reports: prep.reports,
      metrics: prep.metrics,
      models: prep.apiModels,
      formatNumber: prep.mproveConfig.formatNumber,
      currencyPrefix: prep.mproveConfig.currencyPrefix,
      currencySuffix: prep.mproveConfig.currencySuffix
    });

    let { apiDashboards, dashMconfigs, dashQueries } = wrapDashboards({
      structId: structId,
      projectId: projectId,
      apiModels: prep.apiModels,
      stores: prep.stores,
      dashboards: prep.dashboards,
      envId: envId,
      timezone: prep.mproveConfig.defaultTimezone
    });

    let { apiCharts, chartMconfigs, chartQueries } = wrapCharts({
      structId: structId,
      projectId: projectId,
      apiModels: prep.apiModels,
      stores: prep.stores,
      charts: prep.charts,
      envId: envId,
      timezone: prep.mproveConfig.defaultTimezone
    });

    let queries = [...dashQueries, ...chartQueries];
    let mconfigs = [...dashMconfigs, ...chartMconfigs];

    let payload: ToBlockmlRebuildStructResponsePayload = {
      errors: apiErrors,
      models: prep.apiModels,
      dashboards: apiDashboards,
      reports: apiReports,
      charts: apiCharts,
      metrics: prep.metrics,
      presets: prep.presets,
      mconfigs: mconfigs,
      queries: queries,
      mproveConfig: prep.mproveConfig
    };

    return payload;
  }

  async rebuildStruct(item: {
    traceId: string;
    dir: string;
    structId: string;
    envId: string;
    evs: Ev[];
    projectConnections: ProjectConnection[];
    overrideTimezone: string;
  }): Promise<RebuildStructPrep> {
    let configPath = item.dir + '/' + MPROVE_CONFIG_FILENAME;

    let mproveDir = await getMproveDir({
      dir: item.dir,
      configPath: configPath
    });

    let files: BmlFile[] = [];

    // console.log('mproveDir');
    // console.log(mproveDir);

    if (isDefined(mproveDir)) {
      files = await collectFiles(
        {
          dir: mproveDir,
          repoDir: item.dir,
          structId: item.structId,
          caller: CallerEnum.RebuildStruct,
          skipLog: false
        },
        this.cs
      );
    }

    files = files.filter(x => x.name !== MPROVE_CONFIG_FILENAME);

    let mproveConfigFile = await getMproveConfigFile(configPath);

    if (isDefined(mproveConfigFile)) {
      files.push(mproveConfigFile);
    }

    let prep: RebuildStructPrep = await this.rebuildStructStateless({
      traceId: item.traceId,
      files: files,
      structId: item.structId,
      envId: item.envId,
      evs: item.evs,
      projectConnections: item.projectConnections,
      mproveDir: mproveDir,
      overrideTimezone: item.overrideTimezone,
      projectId: undefined,
      isUseCache: false,
      cachedMproveConfig: undefined,
      cachedModels: [],
      cachedMetrics: [],
      isTest: true
    });

    return prep;
  }

  async rebuildStructStateless(item: {
    traceId: string;
    files: BmlFile[];
    structId: string;
    envId: string;
    evs: Ev[];
    projectConnections: ProjectConnection[];
    mproveDir: string;
    overrideTimezone: string;
    projectId: string;
    isUseCache: boolean;
    cachedMproveConfig: MproveConfig;
    cachedModels: Model[];
    cachedMetrics: ModelMetric[];
    isTest: boolean;
  }): Promise<RebuildStructPrep> {
    //
    let presets: Preset[] = this.presetsService.getPresets();

    let errors: BmError[] = [];

    let mods: FileMod[] = [];

    let stores: FileStore[];
    let reports: FileReport[];
    let dashboards: FileDashboard[];
    let charts: FileChart[];
    let projectConfig: FileProjectConf;

    let yamlBuildItem = buildYaml(
      {
        files: item.files,
        connections: item.projectConnections,
        mproveDir: item.mproveDir,
        structId: item.structId,
        errors: errors,
        isUseCache: item.isUseCache,
        caller: CallerEnum.BuildYaml
      },
      this.cs
    );

    stores =
      item.isUseCache === true
        ? item.cachedModels
            .filter(model => model.type === ModelTypeEnum.Store)
            .map(model => model.storeContent)
        : yamlBuildItem.stores;
    dashboards = yamlBuildItem.dashboards;
    reports = yamlBuildItem.reports;
    charts = yamlBuildItem.charts;
    projectConfig =
      item.isUseCache === true
        ? <FileProjectConf>{
            mprove_dir: item.cachedMproveConfig.mproveDirValue,
            case_sensitive_string_filters:
              item.cachedMproveConfig.caseSensitiveStringFilters
                ?.toString()
                .toLowerCase() ?? PROJECT_CONFIG_CASE_SENSITIVE_STRING_FILTERS,
            week_start:
              item.cachedMproveConfig.weekStart ?? PROJECT_CONFIG_WEEK_START,
            default_timezone:
              item.cachedMproveConfig.defaultTimezone ??
              PROJECT_CONFIG_DEFAULT_TIMEZONE,
            allow_timezones:
              item.cachedMproveConfig.allowTimezones
                ?.toString()
                .toLowerCase() ?? PROJECT_CONFIG_ALLOW_TIMEZONES,
            format_number:
              item.cachedMproveConfig.formatNumber ??
              PROJECT_CONFIG_FORMAT_NUMBER,
            currency_prefix:
              item.cachedMproveConfig.currencyPrefix ??
              PROJECT_CONFIG_CURRENCY_PREFIX,
            currency_suffix:
              item.cachedMproveConfig.currencySuffix ??
              PROJECT_CONFIG_CURRENCY_SUFFIX,
            thousands_separator:
              item.cachedMproveConfig.thousandsSeparator ??
              PROJECT_CONFIG_THOUSANDS_SEPARATOR
          }
        : yamlBuildItem.projectConfig;

    if (isUndefined(projectConfig)) {
      return {
        errors: errors,
        apiModels: [],
        metrics: [],
        presets: [],
        stores: [],
        reports: [],
        dashboards: [],
        charts: [],
        mproveConfig: {
          mproveDirValue: undefined,
          weekStart: PROJECT_CONFIG_WEEK_START,
          allowTimezones: toBooleanFromLowercaseString(
            PROJECT_CONFIG_ALLOW_TIMEZONES
          ),
          defaultTimezone: PROJECT_CONFIG_DEFAULT_TIMEZONE,
          currencyPrefix: PROJECT_CONFIG_CURRENCY_PREFIX,
          currencySuffix: PROJECT_CONFIG_CURRENCY_SUFFIX,
          thousandsSeparator: PROJECT_CONFIG_THOUSANDS_SEPARATOR,
          formatNumber: PROJECT_CONFIG_FORMAT_NUMBER,
          caseSensitiveStringFilters: toBooleanFromLowercaseString(
            PROJECT_CONFIG_CASE_SENSITIVE_STRING_FILTERS
          )
        }
      };
    }

    if (isDefined(item.overrideTimezone)) {
      projectConfig.default_timezone = item.overrideTimezone;
    }

    let blockmlDataPath =
      this.cs.get<BlockmlConfig['blockmlData']>('blockmlData');

    let tempDir = `${blockmlDataPath}/${Date.now()}-${makeId()}`;

    let malloyFiles =
      item.isUseCache === true
        ? []
        : item.files.filter(y => y.name.endsWith('.malloy'));

    // console.log('malloyFiles');
    // console.log(malloyFiles);

    let paths: string[] = [];

    await forEachSeries(malloyFiles, async file => {
      let relativePath = isDefined(file.pathRelativeToRepo)
        ? file.pathRelativeToRepo
        : decodeFilePath({ filePath: file.path });

      file.blockmlPath = `${tempDir}/${relativePath}`;

      paths.push(relativePath);

      await fse.ensureDir(path.dirname(file.blockmlPath));
      await fse.writeFile(file.blockmlPath, file.content);

      let reg = MyRegex.CAPTURE_MPROVE_MODELS();
      let r;

      let captures: string[] = [];

      while ((r = reg.exec(file.content))) {
        captures.push(r[1]);
      }

      captures.forEach(sourceName => {
        let ar = file.name.split('.');
        let ext = ar[ar.length - 1];

        let mod: FileMod = {
          fileName: file.name,
          fileExt: `.${ext}` as FileExtensionEnum, // malloy
          filePath: relativePath,
          name: sourceName,
          // mod: sourceName,
          location: relativePath,
          blockmlPath: file.blockmlPath,
          source: sourceName,
          label: sourceName
            .split('_')
            .map(k => capitalizeFirstLetter(k))
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

    let malloyConnections: MalloyConnection[] = makeMalloyConnections({
      connections: item.projectConnections
    });

    // let startBuildModStart = Date.now();

    // console.log('mods');
    // console.log(mods);

    mods =
      item.isUseCache === true
        ? []
        : (
            await buildModStart(
              {
                files: item.files,
                malloyConnections: malloyConnections,
                connections: item.projectConnections,
                mods: mods,
                tempDir: tempDir,
                projectId: item.projectId,
                errors: errors,
                structId: item.structId,
                caller: CallerEnum.BuildModStart
              },
              this.cs
            )
          ).mods;

    // console.log('diffBuildModStart');
    // console.log(Date.now() - startBuildModStart);

    if (item.isUseCache === false) {
      stores = buildStoreStart(
        {
          stores: stores,
          presets: presets,
          structId: item.structId,
          errors: errors,
          caller: CallerEnum.BuildStoreStart
        },
        this.cs
      );

      stores = buildField(
        {
          entities: stores,
          projectConfig: projectConfig,
          structId: item.structId,
          errors: errors,
          caller: CallerEnum.BuildStoreField
        },
        this.cs
      );

      stores = buildStoreNext(
        {
          stores: stores,
          structId: item.structId,
          errors: errors,
          caller: CallerEnum.BuildStoreNext
        },
        this.cs
      );
    }

    let apiModels =
      item.isUseCache === true
        ? item.cachedModels
        : wrapModels({
            projectId: item.projectId,
            structId: item.structId,
            stores: stores,
            mods: mods,
            files: item.files
          });

    let metrics =
      item.isUseCache === true
        ? item.cachedMetrics
        : buildMetricsNext(
            {
              apiModels: apiModels,
              stores: stores,
              structId: item.structId,
              errors: errors,
              caller: CallerEnum.BuildModelMetric
            },
            this.cs
          ).metrics;

    dashboards = buildField(
      {
        entities: dashboards,
        projectConfig: projectConfig,
        structId: item.structId,
        errors: errors,
        caller: CallerEnum.BuildDashboardField
      },
      this.cs
    );

    dashboards = buildDashboard(
      {
        dashboards: dashboards,
        stores: stores,
        structId: item.structId,
        caseSensitiveStringFilters: toBooleanFromLowercaseString(
          projectConfig.case_sensitive_string_filters
        ),
        errors: errors,
        caller: CallerEnum.BuildDashboard
      },
      this.cs
    );

    charts = buildChart(
      {
        charts: charts,
        structId: item.structId,
        errors: errors,
        caller: CallerEnum.BuildChart
      },
      this.cs
    );

    dashboards = await buildTile(
      {
        traceId: item.traceId,
        projectId: item.projectId,
        envId: item.envId,
        entities: dashboards,
        // mods: mods,
        apiModels: apiModels,
        malloyConnections: malloyConnections,
        projectConnections: item.projectConnections,
        // malloyFiles: malloyFiles,
        stores: stores,
        weekStart: projectConfig.week_start,
        timezone: projectConfig.default_timezone,
        caseSensitiveStringFilters: toBooleanFromLowercaseString(
          projectConfig.case_sensitive_string_filters
        ),
        structId: item.structId,
        errors: errors,
        caller: CallerEnum.BuildDashboardTile
      },
      this.cs
    );

    charts = await buildTile(
      {
        traceId: item.traceId,
        projectId: item.projectId,
        envId: item.envId,
        entities: charts,
        // mods: mods,
        apiModels: apiModels,
        malloyConnections: malloyConnections,
        projectConnections: item.projectConnections,
        stores: stores,
        // malloyFiles: malloyFiles,
        weekStart: projectConfig.week_start,
        timezone: projectConfig.default_timezone,
        caseSensitiveStringFilters: toBooleanFromLowercaseString(
          projectConfig.case_sensitive_string_filters
        ),
        structId: item.structId,
        errors: errors,
        caller: CallerEnum.BuildChartTile
      },
      this.cs
    );

    dashboards = buildMconfigChart(
      {
        entities: dashboards,
        apiModels: apiModels,
        stores: stores,
        structId: item.structId,
        errors: errors,
        caller: CallerEnum.BuildDashboardTileCharts
      },
      this.cs
    );

    charts = buildMconfigChart(
      {
        entities: charts,
        apiModels: apiModels,
        stores: stores,
        structId: item.structId,
        errors: errors,
        caller: CallerEnum.BuildChartTileCharts
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

    reports = buildMconfigChart(
      {
        entities: reports,
        apiModels: apiModels,
        stores: stores,
        structId: item.structId,
        errors: errors,
        caller: CallerEnum.BuildReportCharts
      },
      this.cs
    );

    reports = buildField(
      {
        entities: reports,
        projectConfig: projectConfig,
        structId: item.structId,
        errors: errors,
        caller: CallerEnum.BuildReportField
      },
      this.cs
    );

    reports = buildReport(
      {
        reports: reports,
        metrics: metrics,
        apiModels: apiModels,
        stores: stores,
        structId: item.structId,
        caseSensitiveStringFilters: toBooleanFromLowercaseString(
          projectConfig.case_sensitive_string_filters
        ),
        errors: errors,
        caller: CallerEnum.BuildReport
      },
      this.cs
    );

    checkSuggestModelDimension(
      {
        entities: [...dashboards, ...reports],
        apiModels: apiModels,
        errors: errors,
        structId: item.structId,
        caller: CallerEnum.BuildCheckVmdSuggestModelDimension
      },
      this.cs
    );

    logStruct(
      {
        errors: errors,
        stores: stores,
        metrics: metrics,
        dashboards: dashboards,
        reports: reports,
        charts: charts,
        structId: item.structId,
        caller: CallerEnum.RebuildStruct
      },
      this.cs
    );

    if (item.isTest === true) {
      await fse.remove(tempDir);
    } else {
      fse.remove(tempDir);
    }

    malloyConnections.forEach(connection =>
      connection.close().catch(er => {
        logToConsoleBlockml({
          log: new ServerError({
            message: ErEnum.BLOCKML_MALLOY_CONNECTION_CLOSE_ERROR,
            originalError: er
          }),
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });
      })
    );

    let prep: RebuildStructPrep = {
      errors: errors,
      stores: stores,
      apiModels: apiModels,
      metrics: metrics,
      presets: presets.map(preset => {
        let presetPart: Preset = {
          presetId: preset.presetId,
          label: preset.label,
          path: preset.path,
          parsedContent: undefined
        };
        return presetPart;
      }),
      dashboards: dashboards,
      reports: reports,
      charts: charts,
      mproveConfig: {
        mproveDirValue: projectConfig.mprove_dir,
        weekStart: projectConfig.week_start,
        allowTimezones: toBooleanFromLowercaseString(
          projectConfig.allow_timezones
        ),
        defaultTimezone: projectConfig.default_timezone,
        formatNumber: projectConfig.format_number,
        currencyPrefix: projectConfig.currency_prefix,
        currencySuffix: projectConfig.currency_suffix,
        thousandsSeparator: projectConfig.thousands_separator,
        caseSensitiveStringFilters: toBooleanFromLowercaseString(
          projectConfig.case_sensitive_string_filters
        )
      }
    };

    return prep;
  }
}
