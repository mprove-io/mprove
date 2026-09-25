import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import type { RebuildStructPrep } from '#blockml/types/rebuild-struct-prep';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Ev } from '#common/zod/backend/ev';
import type { MproveConfig } from '#common/zod/backend/mprove-config';
import type { ProjectConnection } from '#common/zod/backend/project-connection';
import type { SelectedGiven } from '#common/zod/backend/selected-given';
import type { BmlFile } from '#common/zod/blockml/bml-file';
import type { FilePartSpace } from '#common/zod/blockml/internal/file-part-space';
import type { FileProjectConf } from '#common/zod/blockml/internal/file-project-conf';
import type { FileStore } from '#common/zod/blockml/internal/file-store';
import type { Model } from '#common/zod/blockml/model';
import type { ModelMetric } from '#common/zod/blockml/model-metric';
import type { Preset } from '#common/zod/blockml/preset';
import { buildSpace } from './build-space/build-space';
import { type BuildYamlOutput, buildYaml } from './build-yaml/build-yaml';
import { getProjectConfig } from './get-project-config/get-project-config';
import { makeEmptyRebuildStructPrep } from './make-empty-rebuild-struct-prep/make-empty-rebuild-struct-prep';
import { rebuildConfiguredStruct } from './rebuild-configured-struct/rebuild-configured-struct';
export function rebuildStructStateless(item: {
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
  presets: Preset[];
  cs: ConfigService<BlockmlConfig>;
  logger: Logger;
}): Result.ResultAsync<RebuildStructPrep, never> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind(
      'errors',
      (v): Result.Result<BmError[], never> => Result.succeed([])
    ),
    Result.bind(
      'yamlBuildItem',
      (v): Result.Result<BuildYamlOutput, never> =>
        buildYaml({
          files: v.files,
          connections: v.projectConnections,
          mproveDir: v.mproveDir,
          structId: v.structId,
          errors: v.errors,
          isUseCache: v.isUseCache,
          caller: CallerEnum.BuildYaml,
          cs: v.cs
        })
    ),
    Result.bind('stores', (v): Result.Result<FileStore[], never> => {
      let stores: FileStore[] =
        v.isUseCache === true
          ? v.cachedModels
              .filter(model => model.type === ModelTypeEnum.Store)
              .map(model => model.storeContent)
          : v.yamlBuildItem.stores;

      return Result.succeed(stores);
    }),
    Result.bind(
      'spaces',
      (v): Result.Result<FilePartSpace[], never> =>
        buildSpace({
          spaces: v.yamlBuildItem.spaces,
          errors: v.errors,
          structId: v.structId,
          caller: CallerEnum.BuildSpace,
          cs: v.cs
        })
    ),
    Result.bind(
      'projectConfig',
      (v): Result.Result<FileProjectConf, never> =>
        getProjectConfig({
          isUseCache: v.isUseCache,
          cachedMproveConfig: v.cachedMproveConfig,
          yamlProjectConfig: v.yamlBuildItem.projectConfig
        })
    ),
    Result.andThen(
      async (v): Result.ResultAsync<RebuildStructPrep, never> =>
        isUndefined(v.projectConfig)
          ? makeEmptyRebuildStructPrep({ errors: v.errors })
          : rebuildConfiguredStruct({
              files: v.files,
              structId: v.structId,
              envId: v.envId,
              projectConnections: v.projectConnections,
              selectedGivens: v.selectedGivens,
              projectId: v.projectId,
              isUseCache: v.isUseCache,
              cachedModels: v.cachedModels,
              cachedMetrics: v.cachedMetrics,
              isTest: v.isTest,
              cs: v.cs,
              logger: v.logger,
              presets: v.presets,
              errors: v.errors,
              stores: v.stores,
              schemas: v.yamlBuildItem.schemas,
              reports: v.yamlBuildItem.reports,
              dashboards: v.yamlBuildItem.dashboards,
              charts: v.yamlBuildItem.charts,
              spaces: v.spaces,
              projectConfig: v.projectConfig,
              overrideTimezone: v.overrideTimezone
            })
    )
  );
}
