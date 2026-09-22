import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { buildField } from '#blockml/functions/build-field/_build-field';
import { buildMetricsNext } from '#blockml/functions/build-metrics-next/_build-metrics-next';
import { buildModStart } from '#blockml/functions/build-mod-start/_build-mod-start';
import { buildStoreNext } from '#blockml/functions/build-store-next/_build-store-next';
import { buildStoreStart } from '#blockml/functions/build-store-start/_build-store-start';
import { wrapModels } from '#blockml/functions/wrap/wrap-models';
import { CallerEnum } from '#common/enums/special/caller.enum';
import type { ProjectConnection } from '#common/zod/backend/project-connection';
import type { BmlFile } from '#common/zod/blockml/bml-file';
import type { FileMod } from '#common/zod/blockml/internal/file-mod';
import type { FilePartSpace } from '#common/zod/blockml/internal/file-part-space';
import type { FileProjectConf } from '#common/zod/blockml/internal/file-project-conf';
import type { FileStore } from '#common/zod/blockml/internal/file-store';
import type { Model } from '#common/zod/blockml/model';
import type { ModelMetric } from '#common/zod/blockml/model-metric';
import type { Preset } from '#common/zod/blockml/preset';
import type { MalloyConnection } from '#node-common/functions/make-malloy-connections';

export type BuildCompiledModelsOutput = {
  mods: FileMod[];
  stores: FileStore[];
  apiModels: Model[];
  metrics: ModelMetric[];
};

export async function buildCompiledModels(item: {
  files: BmlFile[];
  malloyConnections: MalloyConnection[];
  projectConnections: ProjectConnection[];
  mods: FileMod[];
  spaces: FilePartSpace[];
  tempDir: string;
  projectId: string;
  errors: BmError[];
  structId: string;
  cs: ConfigService<BlockmlConfig>;
  isUseCache: boolean;
  stores: FileStore[];
  presets: Preset[];
  projectConfig: FileProjectConf;
  cachedModels: Model[];
  cachedMetrics: ModelMetric[];
}): Result.ResultAsync<BuildCompiledModelsOutput, never> {
  let mods: FileMod[] =
    item.isUseCache === true
      ? []
      : (
          await buildModStart(
            {
              files: item.files,
              malloyConnections: item.malloyConnections,
              connections: item.projectConnections,
              mods: item.mods,
              spaces: item.spaces,
              tempDir: item.tempDir,
              projectId: item.projectId,
              errors: item.errors,
              structId: item.structId,
              caller: CallerEnum.BuildModStart
            },
            item.cs
          )
        ).mods;

  let stores: FileStore[] = item.stores;

  if (item.isUseCache === false) {
    stores = buildStoreStart(
      {
        stores: stores,
        presets: item.presets,
        structId: item.structId,
        errors: item.errors,
        caller: CallerEnum.BuildStoreStart
      },
      item.cs
    );

    stores = buildField(
      {
        entities: stores,
        projectConfig: item.projectConfig,
        structId: item.structId,
        errors: item.errors,
        caller: CallerEnum.BuildStoreField
      },
      item.cs
    );

    stores = buildStoreNext(
      {
        stores: stores,
        spaces: item.spaces,
        structId: item.structId,
        errors: item.errors,
        caller: CallerEnum.BuildStoreNext
      },
      item.cs
    );
  }

  let apiModels: Model[] =
    item.isUseCache === true
      ? item.cachedModels
      : wrapModels({
          projectId: item.projectId,
          structId: item.structId,
          stores: stores,
          mods: mods,
          spaces: item.spaces,
          files: item.files
        });

  let metrics: ModelMetric[] =
    item.isUseCache === true
      ? item.cachedMetrics
      : buildMetricsNext(
          {
            apiModels: apiModels,
            stores: stores,
            structId: item.structId,
            errors: item.errors,
            caller: CallerEnum.BuildModelMetric
          },
          item.cs
        ).metrics;

  let output: BuildCompiledModelsOutput = {
    mods: mods,
    stores: stores,
    apiModels: apiModels,
    metrics: metrics
  };

  return Result.succeed(output);
}
