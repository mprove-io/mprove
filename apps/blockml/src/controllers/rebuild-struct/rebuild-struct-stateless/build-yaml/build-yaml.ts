import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { makeLineNumbers } from '#blockml/functions/make-line-numbers/make-line-numbers';
import { yamlToObjects } from '#blockml/functions/yaml-to-objects/yaml-to-objects';
import { FileExtensionEnum } from '#common/enums/file-extension.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import type { ProjectConnection } from '#common/zod/backend/project-connection';
import type { BmlFile } from '#common/zod/blockml/bml-file';
import type { File2 } from '#common/zod/blockml/internal/file-2';
import type { File3 } from '#common/zod/blockml/internal/file-3';
import type { FileChart } from '#common/zod/blockml/internal/file-chart';
import type { FileDashboard } from '#common/zod/blockml/internal/file-dashboard';
import type { FileMod } from '#common/zod/blockml/internal/file-mod';
import type { FileProjectConf } from '#common/zod/blockml/internal/file-project-conf';
import type { FileReport } from '#common/zod/blockml/internal/file-report';
import type { FileSchema } from '#common/zod/blockml/internal/file-schema';
import type { FileSpace } from '#common/zod/blockml/internal/file-space';
import type { FileStore } from '#common/zod/blockml/internal/file-store';
import { checkConnections } from './check-connections/check-connections';
import { checkProjectConfig } from './check-project-config/check-project-config';
import { checkSchema } from './check-schema/check-schema';
import { checkTopUnknownParameters } from './check-top-unknown-parameters/check-top-unknown-parameters';
import { checkTopValues } from './check-top-values/check-top-values';
import { deduplicateFileNames } from './deduplicate-file-names/deduplicate-file-names';
import { removeWrongExt } from './remove-wrong-ext/remove-wrong-ext';
import { type SplitFilesOutput, splitFiles } from './split-files/split-files';

export type BuildYamlOutput = {
  mods: FileMod[];
  stores: FileStore[];
  schemas: FileSchema[];
  reports: FileReport[];
  dashboards: FileDashboard[];
  charts: FileChart[];
  spaces: FileSpace[];
  projectConfig?: FileProjectConf;
};

export function buildYaml(item: {
  errors: BmError[];
  files: BmlFile[];
  structId: string;
  connections: ProjectConnection[];
  mproveDir: string;
  isUseCache: boolean;
  caller: CallerEnum;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<BuildYamlOutput, never> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind(
      'file2s',
      (v): Result.Result<File2[], never> =>
        removeWrongExt({
          files: v.files,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'file3s',
      (v): Result.Result<File3[], never> =>
        deduplicateFileNames({
          file2s: v.file2s,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'filesAny',
      (v): Result.Result<any[], never> =>
        yamlToObjects({
          file3s: v.file3s.filter(
            x =>
              [
                FileExtensionEnum.Store,
                FileExtensionEnum.Schema,
                FileExtensionEnum.Report,
                FileExtensionEnum.Dashboard,
                FileExtensionEnum.Chart,
                FileExtensionEnum.Space,
                FileExtensionEnum.Yml
              ].indexOf(x.ext) > -1
          ),
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'numberedFiles',
      (v): Result.Result<any[], never> =>
        makeLineNumbers({
          filesAny: v.filesAny,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'knownFiles',
      (v): Result.Result<any[], never> =>
        checkTopUnknownParameters({
          filesAny: v.numberedFiles,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'validFiles',
      (v): Result.Result<any[], never> =>
        checkTopValues({
          filesAny: v.knownFiles,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'connectedFiles',
      (v): Result.Result<any[], never> =>
        checkConnections({
          filesAny: v.validFiles,
          connections: v.connections,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'split',
      (v): Result.Result<SplitFilesOutput, never> =>
        splitFiles({
          filesAny: v.connectedFiles,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'projectConfig',
      (v): Result.Result<FileProjectConf | undefined, never> =>
        v.isUseCache
          ? Result.succeed(undefined)
          : checkProjectConfig({
              confs: v.split.confs,
              structId: v.structId,
              mproveDir: v.mproveDir,
              errors: v.errors,
              caller: v.caller,
              cs: v.cs
            })
    ),
    Result.andThrough(v =>
      v.isUseCache
        ? Result.succeed()
        : checkSchema({
            schemas: v.split.schemas,
            errors: v.errors,
            structId: v.structId,
            caller: v.caller,
            cs: v.cs
          })
    ),
    Result.map(
      (v): BuildYamlOutput => ({
        mods: v.split.mods,
        stores: v.split.stores,
        schemas: v.split.schemas,
        reports: v.split.reports,
        dashboards: v.split.dashboards,
        charts: v.split.charts,
        spaces: v.split.spaces,
        projectConfig: v.projectConfig
      })
    )
  );
}
