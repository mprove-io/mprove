import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import type { CallerEnum } from '#common/enums/special/caller.enum';
import type { ProjectConnection } from '#common/zod/backend/project-connection';
import type { BmlFile } from '#common/zod/blockml/bml-file';
import type { FileMod } from '#common/zod/blockml/internal/file-mod';
import type { FilePartSpace } from '#common/zod/blockml/internal/file-part-space';
import type { MalloyConnection } from '#node-common/functions/malloy/make-malloy-connections/make-malloy-connections';
import { buildFlatMalloyFieldItems } from './build-flat-malloy-field-items/build-flat-malloy-field-items';
import { buildMods } from './build-mods/build-mods';
import { checkBuildMetricsFieldGroups } from './check-build-metrics-field-groups/check-build-metrics-field-groups';
import { checkModSpaces } from './check-mod-spaces/check-mod-spaces';
import { checkTimeframes } from './check-timeframes/check-timeframes';

export function buildModStart(item: {
  files: BmlFile[];
  malloyConnections: MalloyConnection[];
  connections: ProjectConnection[];
  mods: FileMod[];
  spaces: FilePartSpace[];
  tempDir: string;
  projectId: string;
  errors: BmError[];
  structId: string;
  caller: CallerEnum;
  cs: ConfigService<BlockmlConfig>;
}): Result.ResultAsync<FileMod[], never> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind(
      'compiledMods',
      (v): Result.ResultAsync<FileMod[], never> =>
        buildMods({
          mods: v.mods,
          malloyConnections: v.malloyConnections,
          connections: v.connections,
          tempDir: v.tempDir,
          projectId: v.projectId,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'flatMods',
      (v): Result.Result<FileMod[], never> =>
        buildFlatMalloyFieldItems({
          mods: v.compiledMods,
          projectId: v.projectId,
          errors: v.errors,
          structId: v.structId,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'spaceMods',
      (v): Result.Result<FileMod[], never> =>
        checkModSpaces({
          mods: v.flatMods,
          spaces: v.spaces,
          errors: v.errors,
          structId: v.structId,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'timeframeMods',
      (v): Result.Result<FileMod[], never> =>
        checkTimeframes({
          mods: v.spaceMods,
          errors: v.errors,
          structId: v.structId,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.andThen(
      (v): Result.Result<FileMod[], never> =>
        checkBuildMetricsFieldGroups({
          mods: v.timeframeMods,
          errors: v.errors,
          structId: v.structId,
          caller: v.caller,
          cs: v.cs
        })
    )
  );
}
