import { ConfigService } from '@nestjs/config';
import { barYaml } from '~blockml/barrels/bar-yaml';
import { BmError } from '~blockml/models/bm-error';

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

  let file2s: File2[] = barYaml.removeWrongExt(
    {
      files: item.files,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  let file3s: File3[] = barYaml.deduplicateFileNames(
    {
      file2s: file2s,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  let filesAny: any[] = barYaml.yamlToObjects(
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

  filesAny = barYaml.makeLineNumbers(
    {
      filesAny: filesAny,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  filesAny = barYaml.checkTopUnknownParameters(
    {
      filesAny: filesAny,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  filesAny = barYaml.checkTopValues(
    {
      filesAny: filesAny,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  filesAny = barYaml.checkConnections(
    {
      filesAny: filesAny,
      connections: item.connections,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  let splitFilesResult = barYaml.splitFiles(
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

  let projectConfig = barYaml.checkProjectConfig(
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
