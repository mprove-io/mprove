import { ConfigService } from '@nestjs/config';
import { BmError } from '~blockml/models/bm-error';
import { FileExtensionEnum } from '~common/enums/file-extension.enum';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { BlockmlConfig } from '~common/interfaces/blockml/blockml-config';
import { BmlFile } from '~common/interfaces/blockml/bml-file';
import { File2 } from '~common/interfaces/blockml/internal/file-2';
import { File3 } from '~common/interfaces/blockml/internal/file-3';
import { FileChart } from '~common/interfaces/blockml/internal/file-chart';
import { FileDashboard } from '~common/interfaces/blockml/internal/file-dashboard';
import { FileMod } from '~common/interfaces/blockml/internal/file-mod';
import { FileProjectConf } from '~common/interfaces/blockml/internal/file-project-conf';
import { FileReport } from '~common/interfaces/blockml/internal/file-report';
import { FileStore } from '~common/interfaces/blockml/internal/file-store';
import { ProjectConnection } from '~common/interfaces/blockml/project-connection';
import { checkConnections } from './check-connections';
import { checkProjectConfig } from './check-project-config';
import { checkTopUnknownParameters } from './check-top-unknown-parameters';
import { checkTopValues } from './check-top-values';
import { deduplicateFileNames } from './deduplicate-file-names';
import { makeLineNumbers } from './make-line-numbers';
import { removeWrongExt } from './remove-wrong-ext';
import { splitFiles } from './split-files';
import { yamlToObjects } from './yaml-to-objects';

export function buildYaml(
  item: {
    errors: BmError[];
    files: BmlFile[];
    structId: string;
    connections: ProjectConnection[];
    mproveDir: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let mods: FileMod[];
  let stores: FileStore[];
  let reports: FileReport[];
  let dashboards: FileDashboard[];
  let charts: FileChart[];
  let confs: FileProjectConf[];

  let file2s: File2[] = removeWrongExt(
    {
      files: item.files,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  let file3s: File3[] = deduplicateFileNames(
    {
      file2s: file2s,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  let filesAny: any[] = yamlToObjects(
    {
      file3s: file3s.filter(
        x =>
          [
            FileExtensionEnum.Store,
            FileExtensionEnum.Report,
            FileExtensionEnum.Dashboard,
            FileExtensionEnum.Chart,
            FileExtensionEnum.Yml
          ].indexOf(x.ext) > -1
      ),
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  filesAny = makeLineNumbers(
    {
      filesAny: filesAny,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  filesAny = checkTopUnknownParameters(
    {
      filesAny: filesAny,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  filesAny = checkTopValues(
    {
      filesAny: filesAny,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  filesAny = checkConnections(
    {
      filesAny: filesAny,
      connections: item.connections,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  let splitFilesResult = splitFiles(
    {
      filesAny: filesAny,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  mods = splitFilesResult.mods;
  stores = splitFilesResult.stores;
  confs = splitFilesResult.confs;
  dashboards = splitFilesResult.dashboards;
  reports = splitFilesResult.reports;
  charts = splitFilesResult.charts;

  let projectConfig = checkProjectConfig(
    {
      confs: confs,
      structId: item.structId,
      mproveDir: item.mproveDir,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  return {
    mods: mods,
    stores: stores,
    reports: reports,
    dashboards: dashboards,
    charts: charts,
    projectConfig: projectConfig
  };
}
