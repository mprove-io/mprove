import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { buildExplorer } from '#blockml/functions/extra/build-explorer';
import type { RebuildStructPrep } from '#blockml/types/rebuild-struct-prep';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { isDefined } from '#common/functions/is-defined';
import type { ProjectConnection } from '#common/zod/backend/project-connection';
import type { SelectedGiven } from '#common/zod/backend/selected-given';
import type { BmlFile } from '#common/zod/blockml/bml-file';
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
import type { BuildCompiledModelsOutput } from './build-compiled-models/build-compiled-models';
import { buildCompiledModels } from './build-compiled-models/build-compiled-models';
import type { BuildVisualizationsOutput } from './build-visualizations/build-visualizations';
import { buildVisualizations } from './build-visualizations/build-visualizations';
import { finalizeRebuildStruct } from './finalize-rebuild-struct/finalize-rebuild-struct';
import type { MalloyPayload } from './prepare-malloy-payload/prepare-malloy-payload';
import { prepareMalloyPayload } from './prepare-malloy-payload/prepare-malloy-payload';

export function rebuildConfiguredStruct(item: {
  files: BmlFile[];
  structId: string;
  envId: string;
  projectConnections: ProjectConnection[];
  selectedGivens: SelectedGiven[];
  projectId: string;
  isUseCache: boolean;
  cachedModels: Model[];
  cachedMetrics: ModelMetric[];
  isTest: boolean;
  cs: ConfigService<BlockmlConfig>;
  logger: Logger;
  presets: Preset[];
  errors: BmError[];
  stores: FileStore[];
  schemas: FileSchema[];
  reports: FileReport[];
  dashboards: FileDashboard[];
  charts: FileChart[];
  spaces: FilePartSpace[];
  projectConfig: FileProjectConf;
  overrideTimezone: string;
}): Result.ResultAsync<RebuildStructPrep, never> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('mproveExplorer', (v): Result.Result<string, never> => {
      let { mproveExplorer } = buildExplorer(
        {
          files: v.files,
          errors: v.errors,
          structId: v.structId,
          caller: CallerEnum.RebuildStruct
        },
        v.cs
      );

      return Result.succeed(mproveExplorer);
    }),
    Result.andThrough(v => {
      if (isDefined(v.overrideTimezone)) {
        v.projectConfig.default_timezone = v.overrideTimezone;
      }

      return Result.succeed();
    }),
    Result.bind(
      'malloyPayload',
      (v): Result.ResultAsync<MalloyPayload, never> =>
        prepareMalloyPayload({
          files: v.files,
          isUseCache: v.isUseCache,
          projectConnections: v.projectConnections,
          cs: v.cs
        })
    ),
    Result.bind(
      'compiledModels',
      (v): Result.ResultAsync<BuildCompiledModelsOutput, never> =>
        buildCompiledModels({
          files: v.files,
          malloyConnections: v.malloyPayload.malloyConnections,
          projectConnections: v.projectConnections,
          mods: v.malloyPayload.mods,
          spaces: v.spaces,
          tempDir: v.malloyPayload.tempDir,
          projectId: v.projectId,
          errors: v.errors,
          structId: v.structId,
          cs: v.cs,
          isUseCache: v.isUseCache,
          stores: v.stores,
          presets: v.presets,
          projectConfig: v.projectConfig,
          cachedModels: v.cachedModels,
          cachedMetrics: v.cachedMetrics
        })
    ),
    Result.bind(
      'visualizations',
      (v): Result.ResultAsync<BuildVisualizationsOutput, never> =>
        buildVisualizations({
          projectConfig: v.projectConfig,
          dashboards: v.dashboards,
          charts: v.charts,
          reports: v.reports,
          spaces: v.spaces,
          stores: v.compiledModels.stores,
          structId: v.structId,
          errors: v.errors,
          cs: v.cs,
          projectId: v.projectId,
          envId: v.envId,
          apiModels: v.compiledModels.apiModels,
          malloyConnections: v.malloyPayload.malloyConnections,
          projectConnections: v.projectConnections,
          selectedGivens: v.selectedGivens,
          metrics: v.compiledModels.metrics
        })
    ),
    Result.andThen(
      (v): Result.ResultAsync<RebuildStructPrep, never> =>
        finalizeRebuildStruct({
          errors: v.errors,
          stores: v.compiledModels.stores,
          metrics: v.compiledModels.metrics,
          dashboards: v.visualizations.dashboards,
          reports: v.visualizations.reports,
          charts: v.visualizations.charts,
          structId: v.structId,
          cs: v.cs,
          isTest: v.isTest,
          tempDir: v.malloyPayload.tempDir,
          malloyConnections: v.malloyPayload.malloyConnections,
          logger: v.logger,
          presets: v.presets,
          spaces: v.spaces,
          schemas: v.schemas,
          projectConfig: v.projectConfig,
          mproveExplorer: v.mproveExplorer,
          apiModels: v.compiledModels.apiModels
        })
    )
  );
}
