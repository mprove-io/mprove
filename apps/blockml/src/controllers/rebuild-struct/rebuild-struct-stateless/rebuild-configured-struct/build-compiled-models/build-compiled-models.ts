import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { buildField } from '#blockml/functions/build-field/_build-field';
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
import { buildMetricsNext } from './build-metrics-next/build-metrics-next';
import { buildModStart } from './build-mod-start/build-mod-start';
import { buildStoreNext } from './build-store-next/build-store-next';
import { buildStoreStart } from './build-store-start/build-store-start';
import { wrapModels } from './wrap-models/wrap-models';

export type BuildCompiledModelsOutput = {
  mods: FileMod[];
  stores: FileStore[];
  apiModels: Model[];
  metrics: ModelMetric[];
};

export function buildCompiledModels(item: {
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
  return Result.pipe(
    Result.succeed(item),
    Result.bind(
      'compiledMods',
      async (v): Result.ResultAsync<FileMod[], never> =>
        v.isUseCache === true
          ? Result.succeed([])
          : buildModStart({
              files: v.files,
              malloyConnections: v.malloyConnections,
              connections: v.projectConnections,
              mods: v.mods,
              spaces: v.spaces,
              tempDir: v.tempDir,
              projectId: v.projectId,
              errors: v.errors,
              structId: v.structId,
              caller: CallerEnum.BuildModStart,
              cs: v.cs
            })
    ),
    Result.bind(
      'startedStores',
      (v): Result.Result<FileStore[], never> =>
        v.isUseCache === true
          ? Result.succeed(v.stores)
          : buildStoreStart({
              stores: v.stores,
              presets: v.presets,
              structId: v.structId,
              errors: v.errors,
              caller: CallerEnum.BuildStoreStart,
              cs: v.cs
            })
    ),
    Result.bind(
      'fieldStores',
      (v): Result.Result<FileStore[], never> =>
        v.isUseCache === true
          ? Result.succeed(v.startedStores)
          : buildField({
              entities: v.startedStores,
              projectConfig: v.projectConfig,
              structId: v.structId,
              errors: v.errors,
              caller: CallerEnum.BuildStoreField,
              cs: v.cs
            })
    ),
    Result.bind(
      'compiledStores',
      (v): Result.Result<FileStore[], never> =>
        v.isUseCache === true
          ? Result.succeed(v.fieldStores)
          : buildStoreNext({
              stores: v.fieldStores,
              spaces: v.spaces,
              structId: v.structId,
              errors: v.errors,
              caller: CallerEnum.BuildStoreNext,
              cs: v.cs
            })
    ),
    Result.bind(
      'apiModels',
      (v): Result.Result<Model[], never> =>
        v.isUseCache === true
          ? Result.succeed(v.cachedModels)
          : wrapModels({
              projectId: v.projectId,
              structId: v.structId,
              stores: v.compiledStores,
              mods: v.compiledMods,
              spaces: v.spaces,
              files: v.files
            })
    ),
    Result.bind(
      'compiledMetrics',
      (v): Result.Result<ModelMetric[], never> =>
        v.isUseCache === true
          ? Result.succeed(v.cachedMetrics)
          : buildMetricsNext({
              apiModels: v.apiModels,
              stores: v.compiledStores,
              structId: v.structId,
              errors: v.errors,
              caller: CallerEnum.BuildModelMetric,
              cs: v.cs
            })
    ),
    Result.map(
      (v): BuildCompiledModelsOutput => ({
        mods: v.compiledMods,
        stores: v.compiledStores,
        apiModels: v.apiModels,
        metrics: v.compiledMetrics
      })
    )
  );
}
