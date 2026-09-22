import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { checkSuggestModelDimension } from '#blockml/functions/extra/check-suggest-model-dimension';
import { logStruct } from '#blockml/functions/extra/log-struct';
import { logToConsoleBlockml } from '#blockml/functions/log-to-console-blockml';
import type { RebuildStructPrep } from '#blockml/types/rebuild-struct-prep';
import { ServerError } from '#common/classes/server-error';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { isDefined } from '#common/functions/is-defined';
import { toBooleanFromLowercaseString } from '#common/functions/to-boolean-from-lowercase-string';
import type {
  ExtraSchema,
  ExtraSchemaColumn,
  ExtraSchemaRelationship,
  ExtraSchemaTable
} from '#common/zod/backend/connection-schemas/extra-schema';
import { MproveConfig } from '#common/zod/backend/mprove-config';
import type { FileChart } from '#common/zod/blockml/internal/file-chart';
import type { FileDashboard } from '#common/zod/blockml/internal/file-dashboard';
import type { FilePartSpace } from '#common/zod/blockml/internal/file-part-space';
import type { FileProjectConf } from '#common/zod/blockml/internal/file-project-conf';
import type { FileReport } from '#common/zod/blockml/internal/file-report';
import type { FileSchema } from '#common/zod/blockml/internal/file-schema';
import type { FileStore } from '#common/zod/blockml/internal/file-store';
import type { Model } from '#common/zod/blockml/model';
import type { ModelMetric } from '#common/zod/blockml/model-metric';
import type { Preset } from '#common/zod/blockml/preset';
import type { Space } from '#common/zod/blockml/space';
import type { MalloyConnection } from '#node-common/functions/make-malloy-connections';
import { removeRebuildStructTempDir } from './remove-rebuild-struct-temp-dir/remove-rebuild-struct-temp-dir';

export async function finalizeRebuildStruct(item: {
  errors: BmError[];
  stores: FileStore[];
  metrics: ModelMetric[];
  dashboards: FileDashboard[];
  reports: FileReport[];
  charts: FileChart[];
  structId: string;
  cs: ConfigService<BlockmlConfig>;
  isTest: boolean;
  tempDir: string;
  malloyConnections: MalloyConnection[];
  logger: Logger;
  presets: Preset[];
  spaces: FilePartSpace[];
  schemas: FileSchema[];
  projectConfig: FileProjectConf;
  mproveExplorer?: string;
  apiModels: Model[];
}): Result.ResultAsync<RebuildStructPrep, never> {
  checkSuggestModelDimension(
    {
      entities: [...item.dashboards, ...item.reports],
      apiModels: item.apiModels,
      errors: item.errors,
      structId: item.structId,
      caller: CallerEnum.BuildCheckVmdSuggestModelDimension
    },
    item.cs
  );

  logStruct(
    {
      errors: item.errors,
      stores: item.stores,
      metrics: item.metrics,
      dashboards: item.dashboards,
      reports: item.reports,
      charts: item.charts,
      structId: item.structId,
      caller: CallerEnum.RebuildStruct
    },
    item.cs
  );

  let removeResult = await removeRebuildStructTempDir({
    tempDir: item.tempDir,
    isTest: item.isTest
  });

  Result.unwrap(removeResult);

  item.malloyConnections.forEach(connection =>
    connection.close().catch(error => {
      logToConsoleBlockml({
        log: new ServerError({
          message: ErEnum.BLOCKML_MALLOY_CONNECTION_CLOSE_ERROR,
          originalError: error
        }),
        logLevel: LogLevelEnum.Error,
        logger: item.logger,
        cs: item.cs
      });
    })
  );

  let presets: Preset[] = item.presets.map(
    (preset): Preset => ({
      presetId: preset.presetId,
      label: preset.label,
      path: preset.path,
      parsedContent: undefined
    })
  );

  let spaces: Space[] = item.spaces.map(space => ({
    space: space.space,
    title: space.title,
    fullTitle: space.fullTitle,
    filePath: space.filePath,
    accessRoles: space.access_roles ?? [],
    accessRolesCombined: space.accessRolesCombined ?? []
  }));

  let extraSchemas: ExtraSchema[] = item.schemas.map(schema => ({
    schema: schema.schema,
    description: schema.description,
    tables: (schema.tables ?? []).map(table => {
      let extraTable: ExtraSchemaTable = {
        table: table.table,
        description: table.description,
        columns: (table.columns ?? []).map(column => {
          let extraColumn: ExtraSchemaColumn = {
            column: column.column,
            example: column.example,
            description: column.description,
            cacheUniqueValues: isDefined(column.cache_unique_values)
              ? toBooleanFromLowercaseString(column.cache_unique_values)
              : undefined,
            relationships: (column.relationships ?? []).map(relationship => {
              let extraRelationship: ExtraSchemaRelationship = {
                to: relationship.to,
                toSchema: relationship.to_schema,
                type: relationship.type
              };

              return extraRelationship;
            })
          };

          return extraColumn;
        })
      };

      return extraTable;
    })
  }));

  let mproveConfig: MproveConfig = {
    mproveDirValue: item.projectConfig.mprove_dir,
    weekStart: item.projectConfig.week_start,
    allowTimezones: toBooleanFromLowercaseString(
      item.projectConfig.allow_timezones
    ),
    defaultTimezone: item.projectConfig.default_timezone,
    formatNumber: item.projectConfig.format_number,
    currencyPrefix: item.projectConfig.currency_prefix,
    currencySuffix: item.projectConfig.currency_suffix,
    thousandsSeparator: item.projectConfig.thousands_separator,
    caseSensitiveStringFilters: toBooleanFromLowercaseString(
      item.projectConfig.case_sensitive_string_filters
    )
  };

  let prep: RebuildStructPrep = {
    errors: item.errors,
    stores: item.stores,
    apiModels: item.apiModels,
    metrics: item.metrics,
    presets: presets,
    dashboards: item.dashboards,
    reports: item.reports,
    charts: item.charts,
    spaces: spaces,
    extraSchemas: extraSchemas,
    mproveExplorer: item.mproveExplorer,
    mproveConfig: mproveConfig
  };

  return Result.succeed(prep);
}
