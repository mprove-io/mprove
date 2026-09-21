import path from 'node:path';
import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import fse from 'fs-extra';
import pIteration from 'p-iteration';
import type { BmError } from '#blockml/classes/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { buildChart } from '#blockml/functions/build-chart/_build-chart';
import { makeChartAccessRolesCombined } from '#blockml/functions/build-chart/make-chart-access-roles-combined';
import { buildDashboard } from '#blockml/functions/build-dashboard/_build-dashboard';
import { buildField } from '#blockml/functions/build-field/_build-field';
import { buildMconfigChart } from '#blockml/functions/build-mconfig-chart/_build-mconfig-chart';
import { buildMetricsNext } from '#blockml/functions/build-metrics-next/_build-metrics-next';
import { buildModStart } from '#blockml/functions/build-mod-start/_build-mod-start';
import { buildReport } from '#blockml/functions/build-report/_build-report';
import { buildSpace } from '#blockml/functions/build-spaces/_build-spaces';
import { buildStoreNext } from '#blockml/functions/build-store-next/_build-store-next';
import { buildStoreStart } from '#blockml/functions/build-store-start/_build-store-start';
import { buildTile } from '#blockml/functions/build-tile/_build-tile';
import { buildYaml } from '#blockml/functions/build-yaml/_build-yaml';
import { buildExplorer } from '#blockml/functions/extra/build-explorer';
import { checkSuggestModelDimension } from '#blockml/functions/extra/check-suggest-model-dimension';
import { logStruct } from '#blockml/functions/extra/log-struct';
import { logToConsoleBlockml } from '#blockml/functions/log-to-console-blockml';
import { prePopulateMalloySchemaCache } from '#blockml/functions/schema-parse/pre-populate-malloy-schema-cache';
import { wrapModels } from '#blockml/functions/wrap/wrap-models';
import type { PresetsService } from '#blockml/services/presets.service';
import { MyRegex } from '#common/classes/my-regex';
import { ServerError } from '#common/classes/server-error';
import {
  PROJECT_CONFIG_ALLOW_TIMEZONES,
  PROJECT_CONFIG_CASE_SENSITIVE_STRING_FILTERS,
  PROJECT_CONFIG_CURRENCY_PREFIX,
  PROJECT_CONFIG_CURRENCY_SUFFIX,
  PROJECT_CONFIG_DEFAULT_TIMEZONE,
  PROJECT_CONFIG_FORMAT_NUMBER,
  PROJECT_CONFIG_THOUSANDS_SEPARATOR,
  PROJECT_CONFIG_WEEK_START
} from '#common/constants/top';
import { ErEnum } from '#common/enums/er.enum';
import type { FileExtensionEnum } from '#common/enums/file-extension.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { MconfigParentTypeEnum } from '#common/enums/mconfig-parent-type.enum';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { capitalizeFirstLetter } from '#common/functions/capitalize-first-letter';
import { decodeFilePath } from '#common/functions/decode-file-path';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { makeId } from '#common/functions/make-id';
import { toBooleanFromLowercaseString } from '#common/functions/to-boolean-from-lowercase-string';
import type {
  ExtraSchema,
  ExtraSchemaColumn,
  ExtraSchemaRelationship,
  ExtraSchemaTable
} from '#common/zod/backend/connection-schemas/extra-schema';
import type { Ev } from '#common/zod/backend/ev';
import type { MproveConfig } from '#common/zod/backend/mprove-config';
import type { ProjectConnection } from '#common/zod/backend/project-connection';
import type { SelectedGiven } from '#common/zod/backend/selected-given';
import type { BmlFile } from '#common/zod/blockml/bml-file';
import type { FileChart } from '#common/zod/blockml/internal/file-chart';
import type { FileDashboard } from '#common/zod/blockml/internal/file-dashboard';
import type { FileMod } from '#common/zod/blockml/internal/file-mod';
import type { FilePartSpace } from '#common/zod/blockml/internal/file-part-space';
import type { FileProjectConf } from '#common/zod/blockml/internal/file-project-conf';
import type { FileReport } from '#common/zod/blockml/internal/file-report';
import type { FileSchema } from '#common/zod/blockml/internal/file-schema';
import type { FileSpace } from '#common/zod/blockml/internal/file-space';
import type { FileStore } from '#common/zod/blockml/internal/file-store';
import type { Model } from '#common/zod/blockml/model';
import type { ModelMetric } from '#common/zod/blockml/model-metric';
import type { Preset } from '#common/zod/blockml/preset';
import type { Space } from '#common/zod/blockml/space';
import {
  type MalloyConnection,
  makeMalloyConnections
} from '#node-common/functions/make-malloy-connections';

const { forEachSeries } = pIteration;

export type RebuildStructPrep = {
  errors: BmError[];
  stores: FileStore[];
  dashboards: FileDashboard[];
  metrics: ModelMetric[];
  presets: Preset[];
  apiModels: Model[];
  reports: FileReport[];
  charts: FileChart[];
  spaces: Space[];
  extraSchemas: ExtraSchema[];
  mproveConfig: MproveConfig;
  mproveExplorer: string;
};

export async function rebuildStructStateless(item: {
  files: BmlFile[];
  structId: string;
  envId: string;
  evs: Ev[];
  projectConnections: ProjectConnection[];
  selectedGivens: SelectedGiven[];
  mproveDir: string;
  overrideTimezone: string;
  projectId: string;
  isUseCache: boolean;
  cachedMproveConfig: MproveConfig;
  cachedModels: Model[];
  cachedMetrics: ModelMetric[];
  isTest: boolean;
  presetsService: PresetsService;
  cs: ConfigService<BlockmlConfig>;
  logger: Logger;
}): Promise<RebuildStructPrep> {
  let {
    files,
    structId,
    envId,
    projectConnections,
    selectedGivens,
    mproveDir,
    overrideTimezone,
    projectId,
    isUseCache,
    cachedMproveConfig,
    cachedModels,
    cachedMetrics,
    isTest,
    presetsService,
    cs,
    logger
  } = item;

  //
  let presets: Preset[] = presetsService.getPresets();

  let errors: BmError[] = [];

  let mods: FileMod[] = [];

  let stores: FileStore[];
  let schemas: FileSchema[];
  let reports: FileReport[];
  let dashboards: FileDashboard[];
  let charts: FileChart[];
  let fileSpaces: FileSpace[];
  let spaces: FilePartSpace[];
  let projectConfig: FileProjectConf;

  let yamlBuildItem = buildYaml(
    {
      files: files,
      connections: projectConnections,
      mproveDir: mproveDir,
      structId: structId,
      errors: errors,
      isUseCache: isUseCache,
      caller: CallerEnum.BuildYaml
    },
    cs
  );

  stores =
    isUseCache === true
      ? cachedModels
          .filter(model => model.type === ModelTypeEnum.Store)
          .map(model => model.storeContent)
      : yamlBuildItem.stores;
  schemas = yamlBuildItem.schemas;
  dashboards = yamlBuildItem.dashboards;
  reports = yamlBuildItem.reports;
  charts = yamlBuildItem.charts;
  fileSpaces = yamlBuildItem.spaces;

  spaces = buildSpace(
    {
      spaces: fileSpaces,
      errors: errors,
      structId: structId,
      caller: CallerEnum.BuildSpace
    },
    cs
  );

  projectConfig =
    isUseCache === true
      ? <FileProjectConf>{
          mprove_dir: cachedMproveConfig.mproveDirValue,
          case_sensitive_string_filters:
            cachedMproveConfig.caseSensitiveStringFilters
              ?.toString()
              .toLowerCase() ?? PROJECT_CONFIG_CASE_SENSITIVE_STRING_FILTERS,
          week_start: cachedMproveConfig.weekStart ?? PROJECT_CONFIG_WEEK_START,
          default_timezone:
            cachedMproveConfig.defaultTimezone ??
            PROJECT_CONFIG_DEFAULT_TIMEZONE,
          allow_timezones:
            cachedMproveConfig.allowTimezones?.toString().toLowerCase() ??
            PROJECT_CONFIG_ALLOW_TIMEZONES,
          format_number:
            cachedMproveConfig.formatNumber ?? PROJECT_CONFIG_FORMAT_NUMBER,
          currency_prefix:
            cachedMproveConfig.currencyPrefix ?? PROJECT_CONFIG_CURRENCY_PREFIX,
          currency_suffix:
            cachedMproveConfig.currencySuffix ?? PROJECT_CONFIG_CURRENCY_SUFFIX,
          thousands_separator:
            cachedMproveConfig.thousandsSeparator ??
            PROJECT_CONFIG_THOUSANDS_SEPARATOR
        }
      : yamlBuildItem.projectConfig;

  if (isUndefined(projectConfig)) {
    return {
      errors: errors,
      apiModels: [],
      metrics: [],
      presets: [],
      spaces: [],
      stores: [],
      reports: [],
      dashboards: [],
      charts: [],
      extraSchemas: [],
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
      },
      mproveExplorer: undefined
    };
  }

  let { mproveExplorer } = buildExplorer(
    {
      files: files,
      errors: errors,
      structId: structId,
      caller: CallerEnum.RebuildStruct
    },
    cs
  );

  if (isDefined(overrideTimezone)) {
    projectConfig.default_timezone = overrideTimezone;
  }

  let blockmlDataPath = cs.get<BlockmlConfig['blockmlData']>('blockmlData');

  let tempDir: string = `${blockmlDataPath}/${Date.now()}-${makeId()}`;

  let malloyFiles: BmlFile[] =
    isUseCache === true ? [] : files.filter(y => y.name.endsWith('.malloy'));

  let paths: string[] = [];

  await forEachSeries(malloyFiles, async file => {
    let relativePath: string = isDefined(file.pathRelativeToRepo)
      ? file.pathRelativeToRepo
      : decodeFilePath({ filePath: file.path });

    file.blockmlPath = `${tempDir}/${relativePath}`;

    paths.push(relativePath);

    await fse.ensureDir(path.dirname(file.blockmlPath));
    await fse.writeFile(file.blockmlPath, file.content);

    let reg: RegExp = MyRegex.CAPTURE_MPROVE_MODELS();

    let capture: RegExpExecArray;

    let captures: string[] = [];

    while ((capture = reg.exec(file.content))) {
      captures.push(capture[1]);
    }

    captures.forEach(sourceName => {
      let ar: string[] = file.name.split('.');

      let ext: string = ar[ar.length - 1];

      let mod: FileMod = {
        fileName: file.name,
        fileExt: `.${ext}` as FileExtensionEnum, // malloy
        filePath: relativePath,
        name: sourceName,
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

  let malloyConnections: MalloyConnection[] = makeMalloyConnections({
    connections: projectConnections
  });

  prePopulateMalloySchemaCache({
    malloyConnections: malloyConnections,
    projectConnections: projectConnections
  });

  mods =
    isUseCache === true
      ? []
      : (
          await buildModStart(
            {
              files: files,
              malloyConnections: malloyConnections,
              connections: projectConnections,
              mods: mods,
              spaces: spaces,
              tempDir: tempDir,
              projectId: projectId,
              errors: errors,
              structId: structId,
              caller: CallerEnum.BuildModStart
            },
            cs
          )
        ).mods;

  if (isUseCache === false) {
    stores = buildStoreStart(
      {
        stores: stores,
        presets: presets,
        structId: structId,
        errors: errors,
        caller: CallerEnum.BuildStoreStart
      },
      cs
    );

    stores = buildField(
      {
        entities: stores,
        projectConfig: projectConfig,
        structId: structId,
        errors: errors,
        caller: CallerEnum.BuildStoreField
      },
      cs
    );

    stores = buildStoreNext(
      {
        stores: stores,
        spaces: spaces,
        structId: structId,
        errors: errors,
        caller: CallerEnum.BuildStoreNext
      },
      cs
    );
  }

  let apiModels: Model[] =
    isUseCache === true
      ? cachedModels
      : wrapModels({
          projectId: projectId,
          structId: structId,
          stores: stores,
          mods: mods,
          spaces: spaces,
          files: files
        });

  let metrics: ModelMetric[] =
    isUseCache === true
      ? cachedMetrics
      : buildMetricsNext(
          {
            apiModels: apiModels,
            stores: stores,
            structId: structId,
            errors: errors,
            caller: CallerEnum.BuildModelMetric
          },
          cs
        ).metrics;

  dashboards = buildField(
    {
      entities: dashboards,
      projectConfig: projectConfig,
      structId: structId,
      errors: errors,
      caller: CallerEnum.BuildDashboardField
    },
    cs
  );

  dashboards = buildDashboard(
    {
      dashboards: dashboards,
      spaces: spaces,
      stores: stores,
      structId: structId,
      caseSensitiveStringFilters: toBooleanFromLowercaseString(
        projectConfig.case_sensitive_string_filters
      ),
      errors: errors,
      caller: CallerEnum.BuildDashboard
    },
    cs
  );

  charts = buildChart(
    {
      charts: charts,
      structId: structId,
      errors: errors,
      caller: CallerEnum.BuildChart
    },
    cs
  );

  dashboards = await buildTile(
    {
      projectId: projectId,
      envId: envId,
      entities: dashboards,
      mconfigParentType: MconfigParentTypeEnum.Dashboard,
      apiModels: apiModels,
      malloyConnections: malloyConnections,
      projectConnections: projectConnections,
      stores: stores,
      weekStart: projectConfig.week_start,
      timezone: projectConfig.default_timezone,
      caseSensitiveStringFilters: toBooleanFromLowercaseString(
        projectConfig.case_sensitive_string_filters
      ),
      selectedGivens: selectedGivens,
      structId: structId,
      errors: errors,
      caller: CallerEnum.BuildDashboardTile
    },
    cs
  );

  charts = await buildTile(
    {
      projectId: projectId,
      envId: envId,
      entities: charts,
      mconfigParentType: MconfigParentTypeEnum.Chart,
      apiModels: apiModels,
      malloyConnections: malloyConnections,
      projectConnections: projectConnections,
      stores: stores,
      weekStart: projectConfig.week_start,
      timezone: projectConfig.default_timezone,
      caseSensitiveStringFilters: toBooleanFromLowercaseString(
        projectConfig.case_sensitive_string_filters
      ),
      selectedGivens: selectedGivens,
      structId: structId,
      errors: errors,
      caller: CallerEnum.BuildChartTile
    },
    cs
  );

  charts = makeChartAccessRolesCombined(
    {
      charts: charts,
      spaces: spaces,
      structId: structId,
      errors: errors,
      caller: CallerEnum.BuildChart
    },
    cs
  );

  dashboards = buildMconfigChart(
    {
      entities: dashboards,
      apiModels: apiModels,
      stores: stores,
      structId: structId,
      errors: errors,
      caller: CallerEnum.BuildDashboardTileCharts
    },
    cs
  );

  charts = buildMconfigChart(
    {
      entities: charts,
      apiModels: apiModels,
      stores: stores,
      structId: structId,
      errors: errors,
      caller: CallerEnum.BuildChartTileCharts
    },
    cs
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
      structId: structId,
      errors: errors,
      caller: CallerEnum.BuildReportCharts
    },
    cs
  );

  reports = buildField(
    {
      entities: reports,
      projectConfig: projectConfig,
      structId: structId,
      errors: errors,
      caller: CallerEnum.BuildReportField
    },
    cs
  );

  reports = buildReport(
    {
      reports: reports,
      spaces: spaces,
      metrics: metrics,
      apiModels: apiModels,
      stores: stores,
      structId: structId,
      caseSensitiveStringFilters: toBooleanFromLowercaseString(
        projectConfig.case_sensitive_string_filters
      ),
      errors: errors,
      caller: CallerEnum.BuildReport
    },
    cs
  );

  checkSuggestModelDimension(
    {
      entities: [...dashboards, ...reports],
      apiModels: apiModels,
      errors: errors,
      structId: structId,
      caller: CallerEnum.BuildCheckVmdSuggestModelDimension
    },
    cs
  );

  logStruct(
    {
      errors: errors,
      stores: stores,
      metrics: metrics,
      dashboards: dashboards,
      reports: reports,
      charts: charts,
      structId: structId,
      caller: CallerEnum.RebuildStruct
    },
    cs
  );

  if (isTest === true) {
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
        logger: logger,
        cs: cs
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
    spaces: spaces.map(space => {
      let apiSpace: Space = {
        space: space.space,
        title: space.title,
        fullTitle: space.fullTitle,
        filePath: space.filePath,
        accessRoles: space.access_roles ?? [],
        accessRolesCombined: space.accessRolesCombined ?? []
      };
      return apiSpace;
    }),
    extraSchemas: (schemas ?? []).map(sch => {
      let extraSchema: ExtraSchema = {
        schema: sch.schema,
        description: sch.description,
        tables: (sch.tables ?? []).map(tbl => {
          let extraTable: ExtraSchemaTable = {
            table: tbl.table,
            description: tbl.description,
            columns: (tbl.columns ?? []).map(col => {
              let extraColumn: ExtraSchemaColumn = {
                column: col.column,
                example: col.example,
                description: col.description,
                cacheUniqueValues: isDefined(col.cache_unique_values)
                  ? toBooleanFromLowercaseString(col.cache_unique_values)
                  : undefined,
                relationships: (col.relationships ?? []).map(rel => {
                  let extraRel: ExtraSchemaRelationship = {
                    to: rel.to,
                    toSchema: rel.to_schema,
                    type: rel.type
                  };
                  return extraRel;
                })
              };
              return extraColumn;
            })
          };
          return extraTable;
        })
      };
      return extraSchema;
    }),
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
    },
    mproveExplorer: mproveExplorer
  };

  return prep;
}
