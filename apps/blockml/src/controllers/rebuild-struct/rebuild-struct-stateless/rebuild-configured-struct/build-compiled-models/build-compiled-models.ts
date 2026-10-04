import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { buildField } from '#blockml/functions/build-field/build-field';

import type { ProjectConnection } from '#common/types/backend/parts/project-connection';
import type { BmlFile } from '#common/types/blockml/parts/file/bml-file';
import type { FileMod } from '#common/types/blockml/parts/internal/file-mod';
import type { FilePartSpace } from '#common/types/blockml/parts/internal/file-part-space';
import type { FileProjectConf } from '#common/types/blockml/parts/internal/file-project-conf';
import type { FileStore } from '#common/types/blockml/parts/internal/file-store';
import type { Model } from '#common/types/blockml/parts/model/model';
import type { ModelMetric } from '#common/types/blockml/parts/model/model-metric';
import type { Preset } from '#common/types/blockml/parts/preset';
import type { MalloyConnection } from '#node-common/functions/malloy/make-malloy-connections/make-malloy-connections';
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
              caller: 'BuildModStart',
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
              caller: 'BuildStoreStart',
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
              caller: 'BuildStoreField',
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
              caller: 'BuildStoreNext',
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
              caller: 'BuildModelMetric',
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
